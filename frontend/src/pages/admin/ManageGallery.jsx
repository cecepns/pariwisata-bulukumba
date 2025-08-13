import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api.js';
import { DataTable, Button, Modal } from '../../components';

export default function ManageGallery() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredWisata, setFilteredWisata] = useState(null);

  function load() {
    setLoading(true);
    api.get('/admin/galleries').then((res) => setData(res.data)).finally(() => setLoading(false));
  }

  useEffect(() => { 
    const wisataId = searchParams.get('wisata');
    if (wisataId) {
      setFilteredWisata(wisataId);
    }
    load(); 
  }, [searchParams]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  async function handleDelete(id) {
    await api.delete(`/admin/galleries/${id}`);
    load();
    setShowDeleteModal(false);
    setSelectedItem(null);
  }

  function handleEdit(item) {
    navigate(`/admin/galleries/${item.id_galeri}/edit`);
  }

  const columns = [
    { key: 'id_galeri', title: 'ID' },
    { 
      key: 'gambar', 
      title: 'Gambar',
      render: (value) => (
        <img 
          src={value} 
          alt="Galeri" 
          className="w-16 h-16 object-cover rounded"
        />
      )
    },
    { key: 'keterangan', title: 'Keterangan' },
    { key: 'id_wisata', title: 'ID Wisata' },
    { key: 'nama_wisata', title: 'Nama Wisata' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Kelola Galeri
          {filteredWisata && (
            <span className="text-sm font-normal text-base-content/60 ml-2">
              (Filter: Wisata ID {filteredWisata})
            </span>
          )}
        </h1>
        <div className="flex space-x-2">
          {filteredWisata && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setFilteredWisata(null);
                navigate('/admin/galleries');
              }}
            >
              Hapus Filter
            </Button>
          )}
          <Link to={filteredWisata ? `/admin/galleries/new?wisata=${filteredWisata}` : "/admin/galleries/new"}>
            <Button variant="soft">Tambah</Button>
          </Link>
        </div>
      </div>

      <DataTable
        data={filteredWisata ? data.filter(item => item.id_wisata == filteredWisata) : data}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={(item) => {
          setSelectedItem(item);
          setShowDeleteModal(true);
        }}
      />

      <Modal.Confirm
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        onConfirm={() => handleDelete(selectedItem?.id_galeri)}
        title="Hapus Galeri"
        message={`Apakah Anda yakin ingin menghapus galeri ini?`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="error"
      />
    </div>
  );
}
