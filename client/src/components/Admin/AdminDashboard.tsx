import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Col, Row, Skeleton, Statistic } from 'antd';
import { adminApi } from '../../api/adminApi';
import PageContainer from '../Layout/PageContainer';
import AdminNav from './AdminNav';
import type { Gig, User } from '../../types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.listUsers(), adminApi.listGigs()])
      .then(([userData, gigData]) => {
        setUsers(userData);
        setGigs(gigData);
      })
      .finally(() => setLoading(false));
  }, []);

  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const pendingGigCount = gigs.filter((g) => g.status === 'pending_review').length;
  const inProgressGigCount = gigs.filter((g) => g.status === 'open' || g.status === 'matched').length;
  const completedGigCount = gigs.filter((g) => g.status === 'completed').length;

  const tiles = [
    { label: 'Users', value: users.length, to: '/admin/users' },
    { label: 'Suspended accounts', value: suspendedCount, to: '/admin/users' },
    { label: 'Pending gig approvals', value: pendingGigCount, to: '/admin/gigs/pending' },
    { label: 'Gigs in progress', value: inProgressGigCount, to: '/admin/gigs/pending' },
    { label: 'Completed gigs', value: completedGigCount, to: '/admin/gigs/completed' },
  ];

  return (
    <PageContainer title="Admin" subtitle="Platform activity at a glance.">
      <AdminNav />
      {loading ? (
        <Skeleton active />
      ) : (
        <Row gutter={[16, 16]}>
          {tiles.map((tile) => (
            <Col xs={12} md={8} lg={6} key={tile.label}>
              <Card
                size="small"
                hoverable
                onClick={() => navigate(tile.to)}
                style={{ height: '100%' }}
              >
                <Statistic title={tile.label} value={tile.value} />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </PageContainer>
  );
};

export default AdminDashboard;
