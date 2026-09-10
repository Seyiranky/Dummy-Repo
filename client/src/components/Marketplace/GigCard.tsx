import { useNavigate } from 'react-router-dom';
import { Card, Flex, Typography } from 'antd';
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
      style={{ height: '100%' }}
      cover={
        <div
          style={{
            aspectRatio: '16 / 10',
            overflow: 'hidden',
            background: 'var(--ant-color-fill-tertiary, #f1f1f2)',
            borderBottom: '1px solid var(--ant-color-border-secondary, #e4e4e7)',
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
      <Typography.Text
        type="secondary"
        style={{
          display: 'block',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
        ellipsis
      >
        {gig.skill?.name}
      </Typography.Text>

      <Typography.Text
        strong
        ellipsis={{ tooltip: gig.title }}
        style={{ display: 'block', fontSize: 14, lineHeight: 1.35, marginTop: 4 }}
      >
        {gig.title}
      </Typography.Text>

      <Typography.Paragraph
        type="secondary"
        ellipsis={{ rows: 2 }}
        style={{ margin: '4px 0 0', fontSize: 12.5, minHeight: 34 }}
      >
        {gig.description}
      </Typography.Paragraph>

      <Flex
        justify="space-between"
        align="baseline"
        style={{ marginTop: 10, borderTop: '1px solid var(--ant-color-border-secondary,#e4e4e7)', paddingTop: 10 }}
      >
        <Typography.Text strong style={{ fontSize: 15 }}>
          {Number(gig.budget).toLocaleString()}
          <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
            {' '}
            RWF
          </Typography.Text>
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }} ellipsis>
          {footNote ?? loc}
        </Typography.Text>
      </Flex>
    </Card>
  );
};

export default GigCard;
