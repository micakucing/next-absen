// pages/admin/positions/[id].js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Form, Button, Alert } from 'react-bootstrap';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';

const EditPositionPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [name, setName] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Muat data posisi saat ID tersedia di URL
    const fetchPosition = async () => {
      if (id) {
        const docRef = doc(db, "positions", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setName(docSnap.data().name);
        } else {
          console.log("Dokumen posisi tidak ditemukan!");
          router.push('/admin/positions');
        }
      }
      setLoading(false);
    };
    fetchPosition();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!name) {
      setMessage("Nama posisi tidak boleh kosong.");
      setMessageType("danger");
      return;
    }

    try {
      const docRef = doc(db, "positions", id);
      await updateDoc(docRef, { name });
      setMessage('Posisi berhasil diperbarui!');
      setMessageType('success');
    } catch (error) {
      console.error("Error updating document: ", error);
      setMessage('Gagal memperbarui posisi. Silakan coba lagi.');
      setMessageType('danger');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center"><h2>Memuat...</h2></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h2>Edit Posisi Jabatan</h2>
      <Link href="/admin/positions">
        <Button variant="secondary" className="mb-4">Kembali ke Daftar Posisi</Button>
      </Link>
      
      {message && <Alert variant={messageType}>{message}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nama Posisi</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Masukkan nama posisi" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Simpan Perubahan
        </Button>
      </Form>
    </AdminLayout>
  );
};

export default EditPositionPage;