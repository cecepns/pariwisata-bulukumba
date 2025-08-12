import { useEffect, useState } from 'react';
import api from '../services/api.js';
import AttractionCard from '../components/AttractionCard.jsx';

export default function AttractionsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attractions').then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><span className="loading loading-spinner" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Objek Wisata</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((a) => <AttractionCard key={a.id} attraction={a} />)}
      </div>
    </div>
  );
}


