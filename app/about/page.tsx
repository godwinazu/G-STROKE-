const values = [
  'Graphite and charcoal studies rooted in observation and patience.',
  'Portraiture, wildlife, and still life built from careful reference work.',
  'Collector-grade originals and ethically presented digital editions.',
];

export default function AboutPage() {
  return (
    <main className="container-shell py-16 md:py-20">
      <div className="max-w-4xl">
        <p className="label">About the studio</p>
        <h1 className="mt-4 text-4xl md:text-6xl">Drawing life into every quiet detail.</h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Godwin Azu is a fine artist and illustrator working across graphite, charcoal, and tactile observational studies.
          Each composition begins with patient looking: the story in light, the gesture in the body, and the depth in a surface that holds memory.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {values.map((item) => (
          <div key={item} className="panel p-6">
            <p className="text-base leading-7 text-[var(--foreground)]">{item}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-6 md:p-10">
        <p className="label">Process</p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {['Reference gathering', 'Drawing and refinement', 'Final presentation'].map((step, index) => (
            <div key={step} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">0{index + 1}</p>
              <h3 className="mt-3 text-xl font-medium">{step}</h3>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
