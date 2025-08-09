import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Box = ({ title, desc }: { title: string; desc: string }) => (
  <Card className="card-spotlight transition-transform duration-300 hover:-translate-y-1">
    <CardHeader>
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription>{desc}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        {title === "Model" && "Stores data and business rules."}
        {title === "View" && "Renders UI and collects user input."}
        {title === "Presenter" && "Mediates: updates Model and View."}
      </p>
    </CardContent>
  </Card>
);

const MVPDiagram = () => {
  return (
    <section aria-labelledby="mvp-diagram" className="relative">
      <h2 id="mvp-diagram" className="sr-only">MVP Diagram</h2>
      <div className="relative">
        <div className="grid gap-6 md:grid-cols-3">
          <Box title="Model" desc="Data + business logic" />
          <Box title="Presenter" desc="Middleman controller" />
          <Box title="View" desc="What users see and touch" />
        </div>
        {/* Decorative connectors */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-[hsl(var(--brand))]" />
            </marker>
          </defs>
          {/* Presenter to Model */}
          <path d="M 50 35 C 40 35, 30 45, 20 45" className="stroke-[hsl(var(--brand))] opacity-50" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
          {/* Presenter to View */}
          <path d="M 50 35 C 60 35, 70 45, 80 45" className="stroke-[hsl(var(--brand))] opacity-50" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
          {/* View to Presenter (events) */}
          <path d="M 80 55 C 70 55, 60 65, 50 65" className="stroke-[hsl(var(--brand))] opacity-40" strokeDasharray="2 2" strokeWidth="1.2" fill="none" markerEnd="url(#arrow)" />
          {/* Model to Presenter (updates) */}
          <path d="M 20 55 C 30 55, 40 65, 50 65" className="stroke-[hsl(var(--brand))] opacity-40" strokeDasharray="2 2" strokeWidth="1.2" fill="none" markerEnd="url(#arrow)" />
        </svg>
      </div>
    </section>
  );
};

export default MVPDiagram;
