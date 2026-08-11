import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { reviewApi } from '../../api/reviewApi';
import TrustScoreRing from './TrustScoreRing';
import Avatar from '../common/Avatar';
import IdentityLink from '../common/IdentityLink';
import SkillThumbnail from '../common/SkillThumbnail';
import type { PublicProfile, Review, UserSkill } from '../../types';

const WorkerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    Promise.all([userApi.getPublicProfile(id), userApi.getUserSkills(id), reviewApi.listReviews(id)])
      .then(([profileData, skillsData, reviewsData]) => {
        setProfile(profileData);
        setSkills(skillsData);
        setReviews(reviewsData);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="muted">Loading profile...</p>;
  }

  if (notFound || !profile) {
    return <p className="form-error">This profile could not be found.</p>;
  }

  return (
    <div>
      <div className="section profile-header">
        <Avatar name={profile.name} size={64} />
        <div>
          <h1 className="profile-name">{profile.name}</h1>
          <span className="badge">{profile.role}</span>
        </div>
        <div className="dashboard-trust">
          <TrustScoreRing trustScore={profile.trustScore} />
        </div>
      </div>

      {profile.bio && (
        <div className="section">
          <h2>About</h2>
          <p>{profile.bio}</p>
        </div>
      )}

      {profile.role === 'worker' && (
        <div className="section">
          <h2>Verified skills</h2>
          {skills.length === 0 ? (
            <p className="muted">No verified skills yet.</p>
          ) : (
            <div className="skill-tag-list">
              {skills.map((us) => (
                <span key={us.id} className="skill-tag">
                  <SkillThumbnail category={us.skill?.category} size={20} />
                  {us.skill?.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="section">
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
        {reviews.map((review) => (
          <div key={review.id} className="review-item">
            <div className="card-row">
              <span className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              <span className="muted">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            {review.comment && <p>{review.comment}</p>}
            {review.author && <IdentityLink id={review.author.id} name={review.author.name} size={24} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerProfile;
