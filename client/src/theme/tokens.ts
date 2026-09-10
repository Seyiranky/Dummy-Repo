import type { ThemeConfig } from 'antd';

// Monochrome system — white, grey, black. One near-black "ink" as the primary
// action colour; greys for surfaces, borders and text. The sider follows the
// theme (white in light mode, near-black in dark mode).

export const BRAND = {
  ink: '#18181b',
  inkHover: '#000000',
  siderDark: '#0b0b0d',
  contentLight: '#f6f6f7',
  contentDark: '#0f0f10',
  surfaceDark: '#18181b',
  borderLight: '#e6e6e8',
  hairline: 'rgba(24,24,27,0.08)',
} as const;

// Greyscale ramp for categorical charts (darkest first).
export const CHART_COLORS = ['#18181b', '#52525b', '#8b8b93', '#b8b8bf', '#d8d8dd'];

const shared: ThemeConfig['token'] = {
  colorPrimary: BRAND.ink,
  colorInfo: BRAND.ink,
  colorLink: BRAND.ink,
  colorLinkHover: '#52525b',
  borderRadius: 8,
  borderRadiusLG: 12,
  controlHeight: 38,
  fontSize: 14,
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  wireframe: false,
};

const cardCfg = { borderRadiusLG: 12, headerFontSize: 15, headerHeight: 52 } as const;

export const lightTheme: ThemeConfig = {
  token: {
    ...shared,
    colorBgLayout: BRAND.contentLight,
    colorBorderSecondary: BRAND.borderLight,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 60,
      headerPadding: '0 20px',
      siderBg: '#ffffff',
      bodyBg: BRAND.contentLight,
    },
    Menu: {
      itemHeight: 42,
      itemSelectedBg: '#f4f4f5',
      itemSelectedColor: BRAND.ink,
      itemColor: '#52525b',
      itemHoverBg: '#fafafa',
    },
    Card: cardCfg,
    Table: { headerBg: '#fafafa', headerColor: '#3f3f46', borderColor: BRAND.borderLight },
    Statistic: { contentFontSize: 26 },
    Segmented: { itemSelectedColor: BRAND.ink },
  },
};

export const darkTheme: ThemeConfig = {
  token: {
    ...shared,
    colorPrimary: '#fafafa',
    colorInfo: '#fafafa',
    colorLink: '#fafafa',
    colorLinkHover: '#d4d4d8',
    colorBgLayout: BRAND.contentDark,
  },
  components: {
    Layout: {
      headerBg: BRAND.surfaceDark,
      headerHeight: 60,
      headerPadding: '0 20px',
      siderBg: BRAND.siderDark,
      bodyBg: BRAND.contentDark,
    },
    Menu: {
      darkItemBg: BRAND.siderDark,
      darkSubMenuItemBg: BRAND.siderDark,
      darkItemSelectedBg: 'rgba(255,255,255,0.1)',
      darkItemHoverBg: 'rgba(255,255,255,0.06)',
      itemHeight: 42,
    },
    Card: cardCfg,
    Statistic: { contentFontSize: 26 },
  },
};
