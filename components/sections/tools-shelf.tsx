const tools = [
  { name: 'Caran d’Ache Grafwood', note: 'Smooth graphite layering for wattled value transitions.' },
  { name: 'Faber-Castell 9000', note: 'Precision and tonal consistency for contour work.' },
  { name: 'Bristol Smooth paper', note: 'A tooth-balanced surface for delicate rendering.' },
  { name: 'Kneaded eraser', note: 'Lightening and edge refinement without polish.' },
];

export function ToolsShelf() {
  return (
    <section id="about" className="container-shell py-20">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="label">About the artist</p>
          <h2 className="mt-3 text-4xl md:text-5xl">A study in patience and line.</h2>
          <p className="mt-5 text-base leading-7 text-[var(--muted)]">
            Godwin Azu approaches drawing as a way of listening: observing natural form, deciding where silence belongs, and letting the graphite carry the mood of the subject. His work spans portraiture, wildlife observation, still life studies, and detailed digital concept pieces inspired by the same tactile philosophy.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <div key={tool.name} className="panel h-full p-5">
              <div className="mb-4 h-16 w-16 rounded-full border border-[var(--border)] bg-[linear-gradient(135deg,rgba(230,194,128,0.2),rgba(255,255,255,0.08))]" />
              <h3 className="text-xl font-medium">{tool.name}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{tool.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
