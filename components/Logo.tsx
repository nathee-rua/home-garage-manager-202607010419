export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="Home Garage Manager"
      role="img"
    >
      {/* roof */}
      <path
        d="M4 13 16 5l12 8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* garage body */}
      <rect
        x="6"
        y="13"
        width="20"
        height="14"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      {/* wrench / gear accent */}
      <circle cx="16" cy="20" r="3.4" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 20h4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
