import type { SVGProps } from 'react';

export type IconName =
  | 'home'
  | 'users'
  | 'calendar-check'
  | 'clock'
  | 'camera'
  | 'upload'
  | 'plus'
  | 'pencil'
  | 'trash'
  | 'eye'
  | 'eye-off'
  | 'filter'
  | 'sunrise'
  | 'key'
  | 'logout'
  | 'search'
  | 'check-circle'
  | 'alert-triangle'
  | 'x-circle'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'inbox'
  | 'user-x'
  | 'image-off'
  | 'x'
  | 'sun-moon';

const paths: Record<IconName, string> = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9',
  users:
    'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M8.5 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M14.5 4.68a3 3 0 0 1 0 5.64',
  'calendar-check':
    'M7 3.5V6M17 3.5V6M4 9.5h16M5.5 6h13A1.5 1.5 0 0 1 20 7.5v11A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6ZM8.5 14l2 2 4.5-4.5',
  clock: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 8v4.3l3 1.8',
  camera:
    'M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9ZM12 16.2a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z',
  upload: 'M12 15V4M8 8l4-4 4 4M5 15.5v3a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-3',
  plus: 'M12 5v14M5 12h14',
  pencil:
    'M4 20l.9-3.9L15.6 5.4a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L8 19.1 4 20Z',
  trash: 'M5 7h14M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M7 7l1 12.5A1.5 1.5 0 0 0 9.5 21h5a1.5 1.5 0 0 0 1.5-1.5L17 7',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  'eye-off': 'M3 3l18 18M10.6 5.6A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.8M6.6 6.6C3.9 8.3 2.5 12 2.5 12S6 18.5 12 18.5c1.8 0 3.3-.5 4.6-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2',
  filter: 'M4 5h16l-6.2 7.4V18l-3.6 1.8v-7.4L4 5Z',
  sunrise: 'M12 3v4M5.6 8.6l1.4 1.4M18.4 8.6 17 10M3 17h18M7 17a5 5 0 0 1 10 0M9 21h6',
  key: 'M14.5 3.5a5 5 0 1 0 3 9L20 15l-1.7 1.7L20 18.4 18.4 20l-2-2-1.6 1.6L13 18l1.9-1.9a5 5 0 0 0-.4-12.6Z M9.6 12.4 3 19',
  logout: 'M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9M16 16l4-4-4-4M20 12H9',
  search: 'm20 20-3.5-3.5M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z',
  'check-circle': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12.5l2.5 2.5L16 9',
  'alert-triangle': 'M12 9v4.5M12 16.5h.01M10.6 4.6 2.9 18a1.5 1.5 0 0 0 1.3 2.2h15.6a1.5 1.5 0 0 0 1.3-2.2L13.4 4.6a1.5 1.5 0 0 0-2.8 0Z',
  'x-circle': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.5l5 5m0-5-5 5',
  'chevron-left': 'm14.5 5-7 7 7 7',
  'chevron-right': 'm9.5 5 7 7-7 7',
  'chevron-down': 'm5 8.5 7 7 7-7',
  inbox: 'M4 12.5h4.2l1.2 2.5h5.2l1.2-2.5H20M4.8 7.5 4 12.4v5.1A1.5 1.5 0 0 0 5.5 19h13a1.5 1.5 0 0 0 1.5-1.5v-5.1l-.8-4.9A1.5 1.5 0 0 0 17.7 6H6.3a1.5 1.5 0 0 0-1.5 1.5Z',
  'user-x': 'M13.5 19v-1.5a3.5 3.5 0 0 0-3.5-3.5H6a3.5 3.5 0 0 0-3.5 3.5V19M8 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 9l4 4m0-4-4 4',
  'image-off': 'M4 4l16 16M6.5 6H17a1.5 1.5 0 0 1 1.5 1.5v9c0 .2 0 .4-.1.5M4 8.6v8.9A1.5 1.5 0 0 0 5.5 19H16M9.3 9.3A2 2 0 1 0 8 10',
  x: 'M18 6 6 18M6 6l12 12',
  'sun-moon': 'M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z',
};

export function Icon({ name, size = 18, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
