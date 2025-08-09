-- Profiles table and auth trigger
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  status_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Timestamp trigger function (shared)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for profiles
create or replace trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Handle new user signup to create profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'New User'), null)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Ensure trigger exists on auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Profiles policies
create policy if not exists "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy if not exists "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id);

create policy if not exists "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

-- Conversations and participants
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  is_group boolean not null default false,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_conversations_updated_at
before update on public.conversations
for each row execute function public.update_updated_at_column();

alter table public.conversations enable row level security;

create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (conversation_id, user_id)
);

alter table public.conversation_participants enable row level security;

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text,
  attachment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_messages_updated_at
before update on public.messages
for each row execute function public.update_updated_at_column();

alter table public.messages enable row level security;

-- Message reads (read receipts)
create table if not exists public.message_reads (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique (message_id, user_id)
);

alter table public.message_reads enable row level security;

-- Message reactions
create table if not exists public.message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default now(),
  unique (message_id, user_id, reaction)
);

alter table public.message_reactions enable row level security;

-- RLS helper: check membership in a conversation
create or replace function public.is_conversation_member(_conversation_id uuid, _user_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = _conversation_id and cp.user_id = _user_id
  );
$$;

-- Conversations policies
create policy if not exists "Members can view conversations"
  on public.conversations for select to authenticated
  using (public.is_conversation_member(id, auth.uid()));

create policy if not exists "Users can create conversations"
  on public.conversations for insert to authenticated
  with check (created_by = auth.uid());

create policy if not exists "Creators can update conversations"
  on public.conversations for update to authenticated
  using (created_by = auth.uid());

-- Participants policies
create policy if not exists "Members can view participants"
  on public.conversation_participants for select to authenticated
  using (public.is_conversation_member(conversation_id, auth.uid()));

create policy if not exists "Creator can add participants"
  on public.conversation_participants for insert to authenticated
  with check (
    (auth.uid() = user_id) OR 
    exists(select 1 from public.conversations c where c.id = conversation_id and c.created_by = auth.uid())
  );

create policy if not exists "Members can remove themselves or creator can manage"
  on public.conversation_participants for delete to authenticated
  using (
    user_id = auth.uid() OR 
    exists(select 1 from public.conversations c where c.id = conversation_id and c.created_by = auth.uid())
  );

-- Messages policies
create policy if not exists "Members can view messages"
  on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id, auth.uid()));

create policy if not exists "Members can send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid() and public.is_conversation_member(conversation_id, auth.uid())
  );

-- Message reads policies
create policy if not exists "Members can view reads"
  on public.message_reads for select to authenticated
  using (public.is_conversation_member((select m.conversation_id from public.messages m where m.id = message_id), auth.uid()));

create policy if not exists "Members can mark as read"
  on public.message_reads for insert to authenticated
  with check (
    user_id = auth.uid() and 
    public.is_conversation_member((select m.conversation_id from public.messages m where m.id = message_id), auth.uid())
  );

-- Message reactions policies
create policy if not exists "Members can view reactions"
  on public.message_reactions for select to authenticated
  using (public.is_conversation_member((select m.conversation_id from public.messages m where m.id = message_id), auth.uid()));

create policy if not exists "Members can react"
  on public.message_reactions for insert to authenticated
  with check (
    user_id = auth.uid() and 
    public.is_conversation_member((select m.conversation_id from public.messages m where m.id = message_id), auth.uid())
  );

-- Realtime optimizations
alter table public.messages replica identity full;
-- Add table to realtime publication (safe if already added)
do $$ begin
  perform 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages';
  if not found then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;
end $$;

-- Storage buckets and policies for avatars and attachments
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

-- Avatars policies (public read, user-folder write)
create policy if not exists "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy if not exists "Users can upload their avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can update their avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Attachments policies (private per user folder)
create policy if not exists "Users can read own attachments"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can upload attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can update own attachments"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]
  );