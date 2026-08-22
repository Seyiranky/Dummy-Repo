import type { SVGProps } from 'react';

const baseProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'sidebar-link-icon',
  'aria-hidden': true,
};

export const DashboardIcon = () => (
  <svg {...baseProps}>
    <rect x="2.5" y="2.5" width="6" height="6" rx="1.2" />
    <rect x="11.5" y="2.5" width="6" height="6" rx="1.2" />
    <rect x="2.5" y="11.5" width="6" height="6" rx="1.2" />
    <rect x="11.5" y="11.5" width="6" height="6" rx="1.2" />
  </svg>
);

export const MarketplaceIcon = () => (
  <svg {...baseProps}>
    <path d="M5 6.5h10l-.8 9.2a1.5 1.5 0 0 1-1.5 1.3H7.3a1.5 1.5 0 0 1-1.5-1.3L5 6.5Z" />
    <path d="M7.2 6.5V5a2.8 2.8 0 0 1 5.6 0v1.5" />
  </svg>
);

export const NotificationsIcon = () => (
  <svg {...baseProps}>
    <path d="M5 8a5 5 0 0 1 10 0c0 3.2 1 4.4 1.5 5H3.5C4 12.4 5 11.2 5 8Z" />
    <path d="M8.2 15.5a1.8 1.8 0 0 0 3.6 0" />
  </svg>
);

export const AdminIcon = () => (
  <svg {...baseProps}>
    <path d="M10 2.5 16 4.5v4.3c0 4-2.6 6.9-6 8.2-3.4-1.3-6-4.2-6-8.2V4.5L10 2.5Z" />
    <path d="M7.3 9.8l1.9 1.9 3.5-3.9" />
  </svg>
);

export const WalletIcon = () => (
  <svg {...baseProps}>
    <rect x="2.5" y="5" width="15" height="11" rx="2" />
    <path d="M2.5 8.5h15" />
    <path d="M13 12.2h2.2" />
  </svg>
);

export const SettingsIcon = () => (
  <svg {...baseProps}>
    <circle cx="10" cy="10" r="2.6" />
    <path d="M10 3.5v2M10 14.5v2M16.5 10h-2M5.5 10h-2M14.8 5.2l-1.4 1.4M6.6 13.4l-1.4 1.4M14.8 14.8l-1.4-1.4M6.6 6.6 5.2 5.2" />
  </svg>
);

export const GlobeIcon = () => (
  <svg {...baseProps}>
    <circle cx="10" cy="10" r="7.5" />
    <path d="M2.5 10h15" />
    <path d="M10 2.5c2.1 2.1 3.3 4.8 3.3 7.5s-1.2 5.4-3.3 7.5c-2.1-2.1-3.3-4.8-3.3-7.5S7.9 4.6 10 2.5Z" />
  </svg>
);

export const LogoutIcon = () => (
  <svg {...baseProps}>
    <path d="M8 17.5H4.5A1.5 1.5 0 0 1 3 16V4a1.5 1.5 0 0 1 1.5-1.5H8" />
    <path d="M13 14l4-4-4-4" />
    <path d="M17 10H7.5" />
  </svg>
);

const actionBaseProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const SuspendIcon = () => (
  <svg {...actionBaseProps}>
    <circle cx="10" cy="10" r="7" />
    <path d="M5.4 5.4l9.2 9.2" />
  </svg>
);

export const ReactivateIcon = () => (
  <svg {...actionBaseProps}>
    <path d="M15.5 6.5A6 6 0 1 0 16.5 10.5" />
    <path d="M15.5 3v3.8h-3.8" />
  </svg>
);

export const DeleteIcon = () => (
  <svg {...actionBaseProps}>
    <path d="M4.5 6h11" />
    <path d="M8 6V4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V6" />
    <path d="M6 6l.6 9.2a1.5 1.5 0 0 0 1.5 1.4h3.8a1.5 1.5 0 0 0 1.5-1.4L14 6" />
    <path d="M8.3 9v4.5M11.7 9v4.5" />
  </svg>
);
