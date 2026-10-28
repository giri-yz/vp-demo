import type { ReactNode } from 'react';

interface IconProps { size?: number; className?: string }

function Line({ size = 32, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

export const ParcelIcon = (p: IconProps) => (
  <Line size={34} {...p}>
    <path d="M16 4 5 9.5v13L16 28l11-5.5v-13L16 4Z" />
    <path d="M5 9.5 16 15l11-5.5M16 15v13M10.5 6.8l11 5.5" />
  </Line>
);

export const CratesIcon = (p: IconProps) => (
  <Line size={34} {...p}>
    <path d="M4 14h11v13H4zM17 14h11v13H17zM10.5 3h11v11h-11z" />
    <path d="M7.5 18.5h4M20.5 18.5h4M14 7.5h4" />
  </Line>
);

/* The two people sway out of step with each other — classes come from the page stylesheet. */
export function PeopleIcon({ groupA, groupB, ...p }: IconProps & { groupA?: string; groupB?: string }) {
  return (
    <Line size={46} {...p}>
      <g className={groupA}><circle cx="11" cy="10" r="3.6" /><path d="M4 25c0-4.4 3.1-7.5 7-7.5s7 3.1 7 7.5" /></g>
      <g className={groupB}><circle cx="22" cy="11.5" r="3" /><path d="M19.5 18.3c.8-.3 1.6-.4 2.5-.4 3.3 0 6 2.6 6 6.1" /></g>
    </Line>
  );
}

export const GlobeIcon = (p: IconProps) => (
  <Line {...p}><circle cx="16" cy="16" r="12" /><path d="M4 16h24M16 4c-7 7-7 17 0 24M16 4c7 7 7 17 0 24" /></Line>
);

export const StoreIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M5 13h22l-2-7H7L5 13ZM7 13v14h18V13M12 27v-9h8v9" />
    <path d="M5 13c3 5 6 5 9 0 3 5 6 5 9 0" />
  </Line>
);

export const PartnerIcon = (p: IconProps) => (
  <Line {...p}><path d="M5 17l7-7 5 5 4-4 6 6M5 25h22M8 6h16" /><circle cx="12" cy="10" r="2" /></Line>
);

export const PhoneIcon = (p: IconProps) => (
  <Line {...p}><rect x="9" y="3" width="14" height="26" rx="3.5" /><path d="M14 25h4" /></Line>
);

export const BasketIcon = (p: IconProps) => (
  <Line {...p}><path d="M4 12h24l-2.5 14h-19L4 12ZM10 12l5-8M22 12l-5-8M12 17v5M20 17v5" /></Line>
);

export const PLANE_PATH_D = 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z';
export const SHIP_PATH_D = 'M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.14.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z';
