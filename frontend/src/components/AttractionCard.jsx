import { Link } from 'react-router-dom';

export default function AttractionCard({ attraction }) {
  const description = attraction.description || '';
  const shortDesc = description.length > 120 ? description.slice(0, 120) + '…' : description;
  return (
    <div className="card bg-base-100 shadow">
      {attraction.cover_image_url ? (
        <figure><img src={attraction.cover_image_url} alt={attraction.name} className="h-48 w-full object-cover" /></figure>
      ) : null}
      <div className="card-body">
        <h2 className="card-title">{attraction.name}</h2>
        <p className="text-sm opacity-80">{shortDesc}</p>
        <div className="card-actions justify-end">
          <Link to={`/attractions/${attraction.id}`} className="btn btn-primary btn-sm">Detail</Link>
        </div>
      </div>
    </div>
  );
}


