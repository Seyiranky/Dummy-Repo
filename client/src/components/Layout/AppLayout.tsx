import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Grid, Layout } from 'antd';
import SideNav from './SideNav';
import SideFooter from './SideFooter';
import AppHeader from './AppHeader';
import { useThemeMode } from '../../theme/ThemeProvider';
import logo from '../../assets/logo.png';

const { Sider, Header, Content } = Layout;

const AppLayout = () => {
  const screens = Grid.useBreakpoint();
  const { isDark } = useThemeMode();
  const isMobile = !screens.lg;
  const [collapsed, setCollapsed] = useState(false);
  const sidebarCollapsed = isMobile ? true : collapsed;

  const hairline = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,24,27,0.08)';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme={isDark ? 'dark' : 'light'}
        width={236}
        collapsible
        collapsed={sidebarCollapsed}
        collapsedWidth={isMobile ? 0 : 76}
        trigger={null}
        breakpoint="lg"
        style={{
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 20,
          borderInlineEnd: `1px solid ${hairline}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              height: 60,
              flexShrink: 0,
              padding: sidebarCollapsed ? 0 : '0 18px',
              borderBottom: `1px solid ${hairline}`,
            }}
          >
            <img
              src={logo}
              alt="Isoko Talents"
              style={{
                height: sidebarCollapsed ? 26 : 32,
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Link>
          <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
            <SideNav dark={isDark} onNavigate={() => isMobile && setCollapsed(true)} />
          </div>
          <SideFooter collapsed={sidebarCollapsed} dark={isDark} />
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            borderBottom: `1px solid ${hairline}`,
          }}
        >
          <AppHeader collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </Header>
        <Content style={{ padding: screens.xs ? 16 : 28 }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
