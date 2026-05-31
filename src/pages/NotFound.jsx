import { Shell, Tagline } from '../components/Brand.jsx';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Shell>
      <div className="mt-20 text-center">
        <h1 className="gryt-heading text-7xl text-gryt-light">404</h1>
        <p className="mt-4 text-gryt-mute">This rep doesn't exist.</p>
        <Link to="/" className="gryt-btn-primary mt-8">
          Back to base
        </Link>
        <div className="mt-12">
          <Tagline className="text-[10px]" />
        </div>
      </div>
    </Shell>
  );
}
