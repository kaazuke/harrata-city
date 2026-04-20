export function FeatureIcon({
  name,
  className = "h-5 w-5",
}: {
  name: "shield" | "users" | "economy" | "map" | "discord" | "spark";
  className?: string;
}) {
  const common = { className, fill: "none", viewBox: "0 0 24 24" as const };
  switch (name) {
    case "shield":
      return (
        <svg {...common} aria-hidden>
          <path
            d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M9.2 12.3 11 14l3.8-4.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "users":
      return (
        <svg {...common} aria-hidden>
          <path
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M22 21v-2a4 4 0 0 0-3-3.87"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M16 3.13a4 4 0 0 1 0 7.75"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "economy":
      return (
        <svg {...common} aria-hidden>
          <path
            d="M3 10h18M5 6h14M7 14h10M9 18h6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "map":
      return (
        <svg {...common} aria-hidden>
          <path
            d="M9 20 3 17V6l6 3 6-3 6 3v11l-6-3-6 3Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9 10V20"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M15 7V20"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "discord":
      return (
        <svg {...common} aria-hidden>
          <path
            d="M7 10c2.5-1.2 7.5-1.2 10 0"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M9.5 15.5c.8.7 2.2 1 3.5 1s2.7-.3 3.5-1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M5 8.5c0-1 1-2 2-2h10c1 0 2 1 2 2v9c0 1-1 2-2 2H7c-1 0-2-1-2-2v-9Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <path
            d="M12 3l1.8 5.5H19l-4.5 3.3 1.7 5.2L12 14.9 7.8 17l1.7-5.2L5 8.5h5.2L12 3Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
