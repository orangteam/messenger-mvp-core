import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: number;
  author: "You" | "Alex";
  text: string;
  timestamp: number;
}

const ChatDemo = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, author: "Alex", text: "Hey! Ready to try MVP?", timestamp: Date.now() - 60000 },
  ]);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const content = text.trim();
    if (!content) return;
    const now = Date.now();
    setMessages((prev) => [...prev, { id: now, author: "You", text: content, timestamp: now }]);
    setText("");
    toast({ title: "Message sent", description: "Presenter updated the Model and View" });

    // Simulate presenter listening to model updates and view refresh
    setTimeout(() => {
      const reply = "Presenter saw your action and updated the chat!";
      setMessages((prev) => [...prev, { id: now + 1, author: "Alex", text: reply, timestamp: Date.now() }]);
    }, 700);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <section aria-labelledby="chat-demo">
      <h2 id="chat-demo" className="sr-only">Chat Demo</h2>
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-xl">Messenger (MVP)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div ref={listRef} className="h-56 overflow-y-auto rounded-md border p-3 bg-card card-spotlight" onMouseMove={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              e.currentTarget.style.setProperty("--pointer-x", `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty("--pointer-y", `${e.clientY - rect.top}px`);
            }}>
              {messages.map((m) => (
                <div key={m.id} className="mb-3 flex items-start gap-2">
                  <div className={`mt-1 size-2.5 rounded-full ${m.author === "Alex" ? "bg-[hsl(var(--brand))]" : "bg-ring"}`} aria-hidden />
                  <div>
                    <p className="text-sm"><span className="font-medium">{m.author}</span> <span className="text-muted-foreground">• {new Date(m.timestamp).toLocaleTimeString()}</span></p>
                    <p className="text-sm text-foreground/90">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                aria-label="Type a message"
                placeholder="Type a message and press Enter"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKey}
              />
              <Button variant="hero" onClick={handleSend} aria-label="Send message">Send</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ChatDemo;
