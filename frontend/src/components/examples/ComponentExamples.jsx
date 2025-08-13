import React, { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  Badge,
  Loading,
  DataTable,
  Form,
  Modal,
  Alert
} from '../index';

export default function ComponentExamples() {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alert, setAlert] = useState(null);

  const tableData = [
    { id: 1, name: 'Pantai Bira', category: 'Pantai', status: 'active' },
    { id: 2, name: 'Gunung Bawakaraeng', category: 'Gunung', status: 'inactive' },
    { id: 3, name: 'Danau Tempe', category: 'Danau', status: 'active' }
  ];

  const tableColumns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Nama' },
    { key: 'category', title: 'Kategori' },
    { key: 'status', title: 'Status', type: 'badge' }
  ];

  const selectOptions = [
    { value: '1', label: 'Pantai' },
    { value: '2', label: 'Gunung' },
    { value: '3', label: 'Danau' },
    { value: '4', label: 'Air Terjun' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Contoh Komponen Atomik & Molekul</h1>

      {/* Alert Examples */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Alert Components</h2>
        </Card.Header>
        <Card.Body className="space-y-4">
          <Alert.Success title="Berhasil!">
            Data berhasil disimpan ke database.
          </Alert.Success>
          
          <Alert.Error title="Error!">
            Terjadi kesalahan saat menyimpan data.
          </Alert.Error>
          
          <Alert.Warning title="Peringatan!">
            Pastikan semua field terisi dengan benar.
          </Alert.Warning>
          
          <Alert.Info title="Informasi">
            Ini adalah pesan informasi untuk pengguna.
          </Alert.Info>

          <Button 
            variant="primary" 
            onClick={() => setAlert({ type: 'success', title: 'Test', message: 'Ini adalah alert test' })}
          >
            Tampilkan Alert
          </Button>
        </Card.Body>
      </Card>

      {/* Button Examples */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Button Components</h2>
        </Card.Header>
        <Card.Body className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="error">Error</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="link">Link</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button size="xs">XS</Button>
            <Button size="sm">SM</Button>
            <Button size="md">MD</Button>
            <Button size="lg">LG</Button>
            <Button size="xl">XL</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button variant="soft" onClick={() => setShowModal(true)}>
              Open Modal
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Form Examples */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Form Components</h2>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={(e) => { e.preventDefault(); console.log('Form submitted'); }}>
            <Form.Section title="Informasi Dasar">
              <Form.Row>
                <Form.Input
                  label="Nama"
                  placeholder="Masukkan nama"
                  required
                />
                <Form.Input
                  label="Email"
                  type="email"
                  placeholder="Masukkan email"
                  required
                />
              </Form.Row>
              
              <Form.Select
                label="Kategori"
                options={selectOptions}
                placeholder="Pilih kategori"
              />
              
              <Form.Textarea
                label="Deskripsi"
                placeholder="Masukkan deskripsi"
                rows={4}
              />
            </Form.Section>
          </Form>
        </Card.Body>
      </Card>

      {/* Input Examples */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Input Components</h2>
        </Card.Header>
        <Card.Body className="space-y-4">
          <Input
            label="Input Dasar"
            placeholder="Masukkan teks"
          />
          
          <Input
            label="Input dengan Error"
            placeholder="Input dengan error"
            error="Field ini wajib diisi"
          />
          
          <Input
            label="Input dengan Helper Text"
            placeholder="Input dengan helper"
            helperText="Ini adalah helper text"
          />
          
          <Input
            label="Input dengan Icon"
            placeholder="Cari sesuatu..."
            leftIcon="🔍"
          />
          
          <Textarea
            label="Textarea"
            placeholder="Masukkan deskripsi panjang"
            rows={4}
          />
          
          <Select
            label="Select Dropdown"
            options={selectOptions}
            placeholder="Pilih opsi"
          />
        </Card.Body>
      </Card>

      {/* Badge Examples */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Badge Components</h2>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="ghost">Ghost</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Card.Body>
      </Card>

      {/* Loading Examples */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Loading Components</h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Loading variant="spinner" />
            <Loading variant="dots" />
            <Loading variant="ring" />
            <Loading variant="ball" />
            <Loading variant="bars" />
            <Loading variant="infinity" />
            <Loading text="Memuat data..." />
            <Loading size="lg" text="Loading besar" />
          </div>
        </Card.Body>
      </Card>

      {/* DataTable Example */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">DataTable Component</h2>
        </Card.Header>
        <Card.Body>
          <DataTable
            data={tableData}
            columns={tableColumns}
            onEdit={(item) => console.log('Edit:', item)}
            onDelete={(item) => {
              setSelectedItem(item);
              setShowConfirmModal(true);
            }}
            onView={(item) => console.log('View:', item)}
          />
        </Card.Body>
      </Card>

      {/* Modal Examples */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Contoh Modal"
        size="lg"
      >
        <div className="space-y-4">
          <p>Ini adalah contoh modal yang menggunakan komponen atomik.</p>
          <p>Modal ini dapat berisi konten apapun yang Anda inginkan.</p>
          
          <Modal.Footer>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button variant="primary">
              Simpan
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      <Modal.Confirm
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          console.log('Confirmed delete');
          setShowConfirmModal(false);
        }}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus item ini?"
        confirmText="Hapus"
        cancelText="Batal"
        variant="error"
      />

      {/* Alert from state */}
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}
    </div>
  );
}
