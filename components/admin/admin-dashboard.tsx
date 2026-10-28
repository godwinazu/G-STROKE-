export function AdminDashboard() {
  return (
    <main className="container-shell py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="label">Admin area</p>
          <h1 className="mt-3 text-4xl">Studio operations</h1>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {[
          { label: 'Revenue', value: '$18,420' },
          { label: 'Orders', value: '143' },
          { label: 'Downloads', value: '2,094' },
        ].map((item) => (
          <div key={item.label} className="panel p-6">
            <p className="label">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-6">
          <p className="label">Recent orders</p>
          <ul className="mt-5 space-y-4 text-sm text-[var(--muted)]">
            <li className="flex justify-between border-b border-[var(--border)] pb-3">
              <span>Portrait Print</span>
              <span className="text-[var(--foreground)]">PAID</span>
            </li>
            <li className="flex justify-between border-b border-[var(--border)] pb-3">
              <span>Wildlife Study Bundle</span>
              <span className="text-[var(--foreground)]">FULFILLED</span>
            </li>
            <li className="flex justify-between pb-3">
              <span>Commission inquiry</span>
              <span className="text-[var(--foreground)]">PENDING</span>
            </li>
          </ul>
        </div>

        <div className="panel p-6">
          <p className="label">Direct R2 upload</p>
          <button className="mt-6 w-full rounded-full border border-[var(--border)] bg-transparent px-4 py-3 text-sm font-medium text-[var(--foreground)]">
            Upload artwork scan
          </button>
        </div>
      </div>
    </main>
  );
}
