import { useId } from "react";

import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  variant?: "default" | "square";
};

export function LogoMark({ className, variant = "default" }: LogoMarkProps) {
  const gradientId = useId();
  const baseClasses =
    "[--logo-outer-start:#f7d8ff] [--logo-outer-mid:#e38cf8] [--logo-outer-end:#c257f0] [--logo-inner-start:#ffffff] [--logo-inner-mid:#f7d6ff] [--logo-inner-end:#e58bf9] [--logo-glow:#ffe0ff] dark:[--logo-outer-start:#2b0b40] dark:[--logo-outer-mid:#7a1fa2] dark:[--logo-outer-end:#f030a8] dark:[--logo-inner-start:#2d193f] dark:[--logo-inner-mid:#602b83] dark:[--logo-inner-end:#f45bbb] dark:[--logo-glow:#5d1e70]";

  return (
    <svg
      aria-hidden="true"
      role="img"
      viewBox="0 0 80 80"
      className={cn("h-8 w-8 drop-shadow-sm", baseClasses, className)}
    >
      <defs>
        <linearGradient id={`${gradientId}-outer`} x1="10" x2="70" y1="10" y2="70">
          <stop offset="0%" stopColor="var(--logo-outer-start)" />
          <stop offset="50%" stopColor="var(--logo-outer-mid)" />
          <stop offset="100%" stopColor="var(--logo-outer-end)" />
        </linearGradient>
        <linearGradient id={`${gradientId}-inner`} x1="15" x2="65" y1="20" y2="60">
          <stop offset="0%" stopColor="var(--logo-inner-start)" />
          <stop offset="55%" stopColor="var(--logo-inner-mid)" />
          <stop offset="100%" stopColor="var(--logo-inner-end)" />
        </linearGradient>
      </defs>

      <rect
        x="8"
        y="8"
        width="64"
        height="64"
        rx={variant === "square" ? 14 : 18}
        fill={`url(#${gradientId}-outer)`}
      />
      <path
        d="M18 42.5c0-9.4 7.6-17 17-17h10c11 0 19 8 19 19 0 2.9-.6 5.6-1.7 8l-9.3-7.2c-.7-.5-1.6-.5-2.3 0l-7.1 5.6a5 5 0 0 1-6.3-.2L30.8 43a4 4 0 0 0-5.3.4l-7.5 7.1c-.8-2.2-1-4.8-1-8z"
        fill={`url(#${gradientId}-inner)`}
      />
      <path
        d="M28 55c1.6 2.9 6 5 12 5 7.5 0 13.8-3.7 16.5-9.2.6-1.2-.8-2.3-1.9-1.6-5.1 3.3-11.7 4.7-16.6 4.7-3.8 0-7.7-.9-10.7-2.8-.9-.5-1.8.7-1.3 1.8z"
        fill="var(--logo-glow)"
        opacity="0.7"
      />
      <circle cx="28" cy="30" r="5.5" fill="#ffffff" fillOpacity="0.75" />
      <circle cx="50" cy="26" r="4.5" fill="#ffe5ff" fillOpacity="0.75" />
      <circle cx="56" cy="36" r="3" fill="#ffffff" fillOpacity="0.65" />
    </svg>
  );
}
