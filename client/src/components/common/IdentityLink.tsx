import { Link } from 'react-router-dom';
import Avatar from './Avatar';

interface IdentityLinkProps {
  id: string;
  name: string;
  size?: number;
}

const IdentityLink = ({ id, name, size = 32 }: IdentityLinkProps) => (
  <Link to={`/profile/${id}`} className="identity link-reset">
    <Avatar name={name} size={size} />
    <span className="identity-name">{name}</span>
  </Link>
);

export default IdentityLink;
