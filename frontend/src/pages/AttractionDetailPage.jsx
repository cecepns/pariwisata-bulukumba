import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';
import { getImageUrl } from '../utils/imageUrl.js';

export default function AttractionDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    // Fetch attraction data
    api.get(`/attractions/${id}`).then((res) => setData(res.data)).finally(() => setLoading(false));
    
    // Fetch gallery data
    api.get('/gallery').then((res) => {
      // Filter gallery by attraction id
      const attractionGallery = res.data.filter(item => item.id_wisata == id);
      setGallery(attractionGallery);
    }).finally(() => setGalleryLoading(false));
  }, [id]);

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // Restore scroll
    };
  }, [selectedImage]);

  if (loading) return <div className="flex justify-center py-10"><span className="loading loading-spinner" /></div>;
  if (!data) return <div>Data tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{data.nama_wisata}</h1>
        {data.nama_kategori ? <div className="badge badge-outline">{data.nama_kategori}</div> : null}
      </div>

      {data.cover_image_url ? (
        <img 
          src={getImageUrl(data.cover_image_url)} 
          alt={data.nama_wisata} 
          className="w-full max-h-[420px] object-cover rounded"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbWJhciB0aWRhayBkYXBhdCBkaW11YXQ8L3RleHQ+PC9zdmc+';
          }}
        />
      ) : (
        <div className="w-full max-h-[420px] h-64 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-500">Tidak ada gambar</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <p className="leading-relaxed whitespace-pre-line">{data.deskripsi}</p>
          {data.peta_wisata ? (
            <div 
              className="aspect-video w-full"
              dangerouslySetInnerHTML={{ __html: data.peta_wisata }}
            />
          ) : null}
        </div>

        <aside className="space-y-3">
          {data.harga_tiket ? (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-base">Harga Tiket</h3>
                <p>{data.harga_tiket}</p>
              </div>
            </div>
          ) : null}
          {data.jam_operasional ? (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-base">Jam Operasional</h3>
                <p>{data.jam_operasional}</p>
              </div>
            </div>
          ) : null}
          {data.fasilitas ? (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-base">Fasilitas</h3>
                <p className="whitespace-pre-line">{data.fasilitas}</p>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {/* Gallery Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Galeri</h2>
        {galleryLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner"></span>
          </div>
        ) : gallery.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada gambar galeri
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <div 
                key={item.id_galeri} 
                className="group relative cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <div className="aspect-square overflow-hidden rounded-lg border border-base-content/10 bg-base-200">
                  <img
                    src={getImageUrl(item.gambar)}
                    alt={item.keterangan || 'Galeri'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbWJhciB0aWRhayBkYXBhdCBkaW11YXQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  
                  {/* Overlay dengan keterangan */}
                  {item.keterangan && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-sm font-medium line-clamp-2">
                          {item.keterangan}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-xl font-bold"
            >
              ✕ Tutup
            </button>
            
            {/* Image */}
            <img
              src={getImageUrl(selectedImage.gambar)}
              alt={selectedImage.keterangan || 'Galeri'}
              className="max-w-full max-h-full object-contain rounded"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbWJhciB0aWRhayBkYXBhdCBkaW11YXQ8L3RleHQ+PC9zdmc+';
              }}
            />
            
            {/* Caption */}
            {selectedImage.keterangan && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 rounded-b">
                <p className="text-center">{selectedImage.keterangan}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


