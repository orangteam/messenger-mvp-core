import SEO from "@/components/SEO";
import MVPDiagram from "@/components/mvp/MVPDiagram";
import ChatDemo from "@/components/mvp/ChatDemo";
import { Button } from "@/components/ui/button";

const Index = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "Model-View-Presenter (MVP) Pattern Explained",
    "about": ["Model", "View", "Presenter", "Design Patterns"],
  };

  return (
    <>
      <SEO
        title="MVP Pattern Explained: Model • View • Presenter"
        description="Understand MVP with a clear diagram and a live Messenger-style demo that shows Model, View, and Presenter working together."
        jsonLd={jsonLd}
      />
      <header className="relative overflow-hidden">
        <div
          className="bg-hero"
          onMouseMove={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.setProperty("--pointer-x", `${e.nativeEvent.offsetX}px`);
            el.style.setProperty("--pointer-y", `${e.nativeEvent.offsetY}px`);
          }}
        >
          <div className="container mx-auto px-4 py-16 md:py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text animate-reveal">
              Model • View • Presenter
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-reveal">
              The Model stores the data, the View renders the UI, and the Presenter connects them.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <a href="#demo"><Button variant="hero">Play the Demo</Button></a>
              <a href="#diagram"><Button variant="outline">See the Diagram</Button></a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="summary" className="container mx-auto px-4 py-12 md:py-16">
          <article className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl md:text-3xl font-semibold">Summary</h2>
            <p className="mt-3 text-muted-foreground">
              The Model stores the messages and users, the View shows the chat and lets you send messages, and the Presenter handles sending messages and updating the chat screen.
            </p>
          </article>
        </section>

        <section id="diagram" className="container mx-auto px-4 py-8 md:py-12">
          <MVPDiagram />
        </section>

        <section id="demo" className="container mx-auto px-4 py-8 md:py-16">
          <ChatDemo />
        </section>
      </main>
    </>
  );
};

export default Index;
