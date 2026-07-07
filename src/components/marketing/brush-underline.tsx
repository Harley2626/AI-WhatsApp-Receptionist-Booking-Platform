export function BrushUnderline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 24"
      fill="none"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path
        d="M3 15.5C48 8 96 6 150 9C204 12 252 18 297 11"
        stroke="#F472B6"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}
