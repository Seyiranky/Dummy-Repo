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

export const LogoutIcon = () => (
  <svg {...baseProps}>
    <path d="M8 17.5H4.5A1.5 1.5 0 0 1 3 16V4a1.5 1.5 0 0 1 1.5-1.5H8" />
    <path d="M13 14l4-4-4-4" />
    <path d="M17 10H7.5" />
  </svg>
);
