type SquareLoaderProps = {
  label: string;
  compact?: boolean;
};

export function SquareLoader({ label, compact = false }: SquareLoaderProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`square-loader${compact ? ' square-loader-compact' : ''}`}
    >
      {Array.from({ length: 8 }, (_, index) => (
        <span key={index} aria-hidden="true" className="square-loader-square" />
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
}