// pages/admin/positions/create.js

import { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';

const AddPositionPage = () => {
  const router = useRouter();
  const [positionName, setPositionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!positionName.trim()) {
      setMessage("Nama jabatan tidak boleh kosong.");
      setMessageType("danger");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "positions"), {
        name: positionName
      });
      setMessage("Jabatan baru berhasil ditambahkan!");
      setMessageType("success");
      setPositionName(''); // Reset input setelah sukses
    } catch (error) {
      console.error("Error adding position: ", error);
      setMessage("Terjadi kesalahan saat menambahkan jabatan.");
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h2>Tambah Jabatan Baru</h2>
      <Button 
        variant="secondary" 
        onClick={() => router.push('/admin/positions')} 
        className="mb-4"
      >
        Kembali ke Daftar Jabatan
      </Button>
      
      {message && <Alert variant={messageType}>{message}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nama Jabatan</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Masukkan nama jabatan" 
                value={positionName} 
                onChange={(e) => setPositionName(e.target.value)} 
                required 
              />
            </Form.Group>
            
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Tambah Jabatan'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};

export default AddPositionPage;