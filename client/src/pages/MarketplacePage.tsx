import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Drawer, Segmented } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppSelector } from '../store/hooks';
import PageContainer from '../components/Layout/PageContainer';
import GigForm from '../components/Marketplace/GigForm';
import GigFeed from '../components/Marketplace/GigFeed';
import MatchList from '../components/Marketplace/MatchList';

type MarketplaceTab = 'gigs' | 'matches';

const MarketplacePage = () => {
  const { t } = useTranslation();
  const role = useAppSelector((state) => state.auth.role);
  const [tab, setTab] = useState<MarketplaceTab>('gigs');
  const [postingGig, setPostingGig] = useState(false);

  return (
    <PageContainer
      title={t('sidebar.marketplace')}
      extra={
        role === 'client' && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setPostingGig(true)}>
            Post a gig
          </Button>
        )
      }
    >
      <Segmented
        value={tab}
        onChange={(v) => setTab(v as MarketplaceTab)}
        style={{ marginBottom: 20 }}
        options={[
          { label: role === 'client' ? 'Your gigs' : 'Open gigs', value: 'gigs' },
          { label: 'Your matches', value: 'matches' },
        ]}
      />

      {tab === 'gigs' ? <GigFeed /> : <MatchList />}

      <Drawer
        title="Post a gig"
        width={480}
        open={postingGig}
        onClose={() => setPostingGig(false)}
        destroyOnHidden
      >
        <GigForm onPosted={() => setPostingGig(false)} />
      </Drawer>
    </PageContainer>
  );
};

export default MarketplacePage;
