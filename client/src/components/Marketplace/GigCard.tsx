import { useNavigate } from 'react-router-dom';
import { Card, Flex, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import StatusTag from '../common/StatusTag';
import { gigImageSrc } from '../../utils/gigImage';
import { locationName } from '../../utils/locationName';
import type { Gig } from '../../types';

interface GigCardProps {
  gig: Gig;
  footNote?: string;
}

const GigCard = ({ gig, footNote }: GigCardProps) => {
  const navigate = useNavigate();
  const src = gigImageSrc(gig);
  const loc = locationName(gig.locationLat, gig.locationLng);

  return (
    <Card
      hoverable
      onClick={() => navigate(`/gigs/${gig.id}`)}
      styles={{ body: { padding: 14 } }}
      cover={
        <div
          style={{
            aspectRatio: '4 / 3',
            overflow: 'hidden',
            background: 'var(--ant-color-fill-tertiary, #f4f4f5)',
            borderBottom: '1px solid var(--ant-color-border-secondary, #e6e6e8)',
          }}
        >
          {src && (
            <img
              src={src}
              alt=""
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </div>
      }
    >
      <Flex justify="space-between" align="flex-start" gap={8}>
        <Typography.Text
          strong
          ellipsis={{ tooltip: gig.title }}
          style={{ fontSize: 14, lineHeight: 1.35 }}
        >
          {gig.title}
        </Typography.Text>
        <StatusTag status={gig.status} />
      </Flex>

      <Typography.Paragraph
        type="secondary"
        ellipsis={{ rows: 2 }}
        style={{ margin: '6px 0 0', fontSize: 12.5, minHeight: 34 }}
      >
        {gig.description}
      </Typography.Paragraph>

      <Flex
        align="center"
        gap={6}
        style={{
          marginTop: 8,
          color: '#71717a',
          fontSize: 12,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{gig.skill?.name}</span>
        {loc && (
          <>
            <span aria-hidden>·</span>
            <EnvironmentOutlined />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{loc}</span>
          </>
        )}
      </Flex>

      <Typography.Title level={4} style={{ margin: '10px 0 0' }}>
        {Number(gig.budget).toLocaleString()}
        <Typography.Text type="secondary" style={{ fontSize: 13, fontWeight: 400 }}>
          {' '}
          RWF
        </Typography.Text>
      </Typography.Title>

      {footNote && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {footNote}
        </Typography.Text>
      )}
    </Card>
  );
};

export default GigCard;
