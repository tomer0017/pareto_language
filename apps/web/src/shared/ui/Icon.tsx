/**
 * The ONE icon set for READY's interface chrome (navigation, transport, status). Inline SVG so icons
 * inherit `currentColor`, scale with text, work offline and never depend on an emoji font. Content
 * icons (a mission's own emoji) stay content; this is for controls.
 *
 * `flip` marks a DIRECTIONAL icon (forward arrow, chevron): it mirrors automatically under an RTL
 * interface, so "forward" always points along the reading direction. Never bake arrows into copy.
 */
const PATHS = {
  home: { d: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  learn: { d: 'M12 6.5C10.5 5 8 4.5 3 4.5v14c5 0 7.5.5 9 2 1.5-1.5 4-2 9-2v-14c-5 0-7.5.5-9 2zM12 6.5v14' },
  listen: { d: 'M4 14v-2a8 8 0 0 1 16 0v2M4 14h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2zM20 14h-2.5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h.5a2 2 0 0 0 2-2z' },
  profile: { d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5a7.5 7.5 0 0 1 15 0' },
  plane: { d: 'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z', fill: true },
  play: { d: 'M7 4.5v15l12-7.5z', fill: true },
  pause: { d: 'M7 4.5h3.5v15H7zM13.5 4.5H17v15h-3.5z', fill: true },
  skip: { d: 'M6 5l9 7-9 7zM17 5h2v14h-2z', fill: true },
  check: { d: 'M5 12.5l4.5 4.5L19 7.5' },
  arrow: { d: 'M5 12h14M13 6l6 6-6 6' },
  chevron: { d: 'M9 6l6 6-6 6' },
  shuffle: { d: 'M16 4h4v4M4 20 20 4M16 20h4v-4M4 4l5 5M14.5 14.5 20 20' },
  repeat: { d: 'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3' },
  clock: { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2' },
  chat: { d: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z' },
  volume: { d: 'M4 9.5v5h3.5L12 18V6L7.5 9.5zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11' },
  list: { d: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01' },
  flag: { d: 'M5 21V4M5 4h11l-2 4 2 4H5' },
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 22, flip = false, className = '' }: { name: IconName; size?: number; flip?: boolean; className?: string }) {
  const icon = PATHS[name] as { d: string; fill?: boolean };
  return (
    <svg
      className={`icon ${flip ? 'icon-dir' : ''} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={icon.fill ? 'currentColor' : 'none'}
      stroke={icon.fill ? 'none' : 'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      <path d={icon.d} />
    </svg>
  );
}
