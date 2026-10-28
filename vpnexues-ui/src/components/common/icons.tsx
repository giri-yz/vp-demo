import type { SVGProps } from 'react';

/* Small hand-rolled stroke-icon set (feather-style: 24x24, currentColor, 2px stroke)
   used across Header/hero/mobile-nav so we don't pull in a full icon library
   for ~a dozen glyphs. */

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconMail(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 4h3.2l1.6 4.4-2 1.6a12.5 12.5 0 0 0 5.7 5.7l1.6-2 4.4 1.6v3.2c0 1-.8 1.8-1.8 1.7A17 17 0 0 1 2.8 5.8C2.7 4.8 3.5 4 4.5 4Z" />
    </svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </svg>
  );
}

export function IconCart(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2l2.3 11.4a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 2-1.6L20.5 7H6" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconLeaf(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 19.5C4 12 9 4.5 19.5 4.5 20 12 15 19.5 4.5 19.5Z" />
      <path d="M5 19 15 9" />
    </svg>
  );
}

export function IconHeart(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconPackage(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m3.5 7.5 8.5-4 8.5 4-8.5 4-8.5-4Z" />
      <path d="M3.5 7.5v9l8.5 4 8.5-4v-9" />
      <path d="M12 11.5v9" />
    </svg>
  );
}

export function IconThumbsUp(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 11v9H4.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1H7Zm0 0 4.2-7.3a1.6 1.6 0 0 1 2.9 1l-.9 4.8H18a2 2 0 0 1 1.95 2.45l-1.3 5.5A2 2 0 0 1 16.7 20H9a2 2 0 0 1-2-2v-7Z" />
    </svg>
  );
}

export function IconMapPin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s-7-6.4-7-11.5a7 7 0 0 1 14 0C19 14.6 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  );
}

export function IconChevronsRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m7 6 6 6-6 6" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.5-6.5a1 1 0 0 0 0-1.7l-10.5-6.5A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function IconShieldCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 19 6.5v5c0 5-3 8.2-7 10-4-1.8-7-5-7-10v-5l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconBasket(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 10h14l-1.5 9.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 10Z" />
      <path d="M3.5 10h17M9 10 8 5M15 10l1-5M9.5 14v3M14.5 14v3" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4.3-4.3" />
    </svg>
  );
}

export function IconSliders(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h13M21 18h-1" />
      <circle cx="16" cy="6" r="2" fill="currentColor" />
      <circle cx="9" cy="12" r="2" fill="currentColor" />
      <circle cx="18" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}

export function IconMinus(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function IconGrid(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconFacebook(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <g transform="translate(4.65 0.45) scale(0.731)">
        <path d="M14.5 8.5H17V5.3c-.4-.05-1.8-.17-3.4-.17-3.4 0-5.6 2-5.6 5.7v2.9H4.7v3.6H8v9.15h3.7V17.3h3.2l.5-3.6h-3.7v-2.5c0-1.05.3-1.7 1.8-1.7Z" />
      </g>
    </svg>
  );
}

export function IconLinkedin(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <g transform="translate(0 1.2)">
        <path d="M5.5 8.3h3.4v10.4H5.5zM7.2 6.9a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm3.9 1.4h3.3v1.4h.05c.46-.85 1.6-1.75 3.3-1.75 3.5 0 4.15 2.2 4.15 5.15v6h-3.4v-5.3c0-1.3-.02-2.9-1.75-2.9-1.75 0-2.02 1.35-2.02 2.8v5.4h-3.4V8.3Z" />
      </g>
    </svg>
  );
}

export function IconCrown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m3 8 4 3 5-6 5 6 4-3-1.5 10h-15L3 8Z" />
      <path d="M5.5 18h13" />
    </svg>
  );
}

export function IconCode(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m9 8-4.5 4L9 16" />
      <path d="m15 8 4.5 4L15 16" />
    </svg>
  );
}

export function IconGlobe(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5S14.4 18.2 12 20.5C9.6 18.2 8.4 15.3 8.4 12S9.6 5.8 12 3.5Z" />
    </svg>
  );
}

export function IconRobot(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="9.5" width="15" height="10" rx="2.5" />
      <path d="M12 9.5V6M9 6h6" />
      <circle cx="9" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M2.5 13v3M21.5 13v3" />
    </svg>
  );
}

export function IconPalette(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.2-1.2 0-.8.6-1.4 1.4-1.4h1.7c2.2 0 3.9-1.8 3.9-4A8.7 8.7 0 0 0 12 3.5Z" />
      <circle cx="7.3" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="17.3" cy="11.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconUserTie(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="7" r="3.4" />
      <path d="M5 20.5c1.2-3.7 3.9-5.7 7-5.7s5.8 2 7 5.7" />
      <path d="m10.5 14.8 1.5 2 1.5-2M12 16.8v3.2" />
    </svg>
  );
}

export function IconUserRoundCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m15 11 2 2 4-4" />
    </svg>
  );
}

export function IconSmartphone(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

export function IconInstagram(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.75" />
      <circle cx="16.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTruck(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 4v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

export function IconFresh(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M12 22c-4-3-8-6-8-11a8 8 0 0 1 16 0c0 5-4 8-8 11z" />
      <path d="M12 12V8" />
      <path d="M9 10l3-2 3 2" />
    </svg>
  );
}

export function IconApple(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 8.5c-1.4-1.8-3.7-2.4-5.6-1.2C4 8.7 3.5 11.8 4.4 14.8c.9 3 3.1 5.2 4.9 4.8.9-.2 1.6-.6 2.3-.6s1.4.4 2.3.6c1.8.4 4-1.8 4.9-4.8.9-3 .4-6.1-2-7.5-1.9-1.2-4.2-.6-5.6 1.2Z" />
      <path d="M12 8.5c0-1.6.6-3.1 2.2-4.1" />
      <path d="M12 8.5V6" />
    </svg>
  );
}

export function IconBoxes(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="12.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="12.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="8.25" y="3.5" width="7.5" height="7.5" rx="1.5" />
    </svg>
  );
}

export function IconBigBox(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      {/* pallet deck + feet */}
      <rect x="2.5" y="19.1" width="19" height="1.7" rx="0.6" fill="#C89459" />
      <rect x="4.8" y="20.5" width="3" height="1.7" rx="0.5" fill="#96683B" />
      <rect x="10.5" y="20.5" width="3" height="1.7" rx="0.5" fill="#96683B" />
      <rect x="16.2" y="20.5" width="3" height="1.7" rx="0.5" fill="#96683B" />
      {/* produce mound */}
      <path d="M4.8 11c-1-2.4 0-5.1 2.5-6.1C8.6 3 11.4 2.2 13.6 3.6c2.5-.4 4.8 1.3 5.3 3.8 1.5 1 2 2.6 1.4 3.6H4.8Z" fill="#8CC63F" />
      <circle cx="8" cy="8.4" r="2.5" fill="#5FAE3B" />
      <circle cx="12.4" cy="7.4" r="2.9" fill="#4C9A2A" />
      <circle cx="16.6" cy="8.8" r="2.3" fill="#5FAE3B" />
      {/* color accents — carrot tip, tomato, pepper, radish */}
      <path d="M5.4 7.2 3.7 4.6c-.3-.5.2-1.1.7-.8l2.6 1.4c.4.2.4.8 0 1l-.9.6c-.2.1-.5.1-.7-.2Z" fill="#F08A24" />
      <circle cx="17.6" cy="10.3" r="1.35" fill="#E23B2E" />
      <circle cx="14" cy="10.4" r="1.2" fill="#F5C33B" />
      <circle cx="9.6" cy="10.5" r="1.1" fill="#E23B2E" />
      {/* carton */}
      <rect x="4.5" y="11" width="15" height="6.9" rx="1" fill="#D9A96E" stroke="#9C6B39" strokeWidth="1" />
      <path d="M4.5 13.1h15" stroke="#9C6B39" strokeWidth="1" />
      <rect x="6.3" y="14.7" width="2.7" height="1.1" rx="0.55" fill="#8F6236" />
      {/* leaf-sprout logo */}
      <path d="M13.6 17.4v-2.7" stroke="#2F6B33" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13.6 15.4c-1.7.2-3-.9-3.1-2.5 1.7-.1 3 .9 3.1 2.5Z" fill="#3E8E41" />
      <path d="M13.6 15.4c.2-1.7 1.7-2.6 3.3-2.3-.2 1.7-1.7 2.6-3.3 2.3Z" fill="#2F6B33" />
    </svg>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="3.5" width="15" height="17" rx="1.5" />
      <path d="M9 8h2M13 8h2M9 12h2M13 12h2" />
      <path d="M10 20.5v-4h4v4" />
    </svg>
  );
}


export function IconInfo(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11.5v5" />
      <path d="M12 7.6h.01" />
    </svg>
  );
}

export function IconHeadset(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 14.5v-2.5a7.5 7.5 0 0 1 15 0v2.5" />
      <path d="M4.5 14h2.2A1.3 1.3 0 0 1 8 15.3v3.4A1.3 1.3 0 0 1 6.7 20H5.8A1.3 1.3 0 0 1 4.5 18.7V14Z" />
      <path d="M19.5 14h-2.2a1.3 1.3 0 0 0-1.3 1.3v3.4a1.3 1.3 0 0 0 1.3 1.3h.9a1.3 1.3 0 0 0 1.3-1.3V14Z" />
    </svg>
  );
}

export function IconBriefcase(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2" />
      <path d="M8.5 7.5V6.2A2.2 2.2 0 0 1 10.7 4h2.6a2.2 2.2 0 0 1 2.2 2.2v1.3" />
      <path d="M3 12.6h18" />
    </svg>
  );
}
