import { resolveAssetUrl } from '../../utils/assetUrl';
import SkillThumbnail from './SkillThumbnail';
import type { Gig } from '../../types';

interface GigThumbnailProps {
  gig: Pick<Gig, 'imageUrl' | 'skill'>;
  size?: number;
}

const GigThumbnail = ({ gig, size = 40 }: GigThumbnailProps) => {
  if (gig.imageUrl) {
    return (
      <img
        src={resolveAssetUrl(gig.imageUrl)}
        alt=""
        className="skill-thumbnail"
        style={{ width: size, height: size }}
      />
    );
  }
  return <SkillThumbnail category={gig.skill?.category} size={size} />;
};

export default GigThumbnail;
