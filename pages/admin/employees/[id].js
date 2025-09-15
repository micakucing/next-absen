// pages/admin/[id].js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Form, Button, Alert } from 'react-bootstrap';
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';

const EditEmployeePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [rfidUid, setRfidUid] = useState('');
  const [positions, setPositions] = useState([]); // State untuk daftar posisi
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil data karyawan yang akan diedit
    const fetchEmployee = async () => {
      if (id) {
        const docRef = doc(db, "employees", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name);
          setEmail(data.email);
          setPosition(data.position);
          setRfidUid(data.rfidUid);
        } else {
          console.log("Dokumen tidak ditemukan!");
          router.push('/admin/employees');
        }
      }
      setLoading(false);
    };

    // Ambil daftar posisi untuk dropdown
    const fetchPositions = async () => {
      const positionsCollection = collection(db, "positions");
      const positionsSnapshot = await getDocs(positionsCollection);
      const positionsList = positionsSnapshot.docs.map(doc => doc.data().name);
      setPositions(positionsList);
    };
    
    fetchEmployee();
    fetchPositions();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const docRef = doc(db, "employees", id);
      await updateDoc(docRef, {
        name,
        email,
        position,
        rfidUid
      });
      setMessage('Data karyawan berhasil diperbarui!');
      setMessageType('success');
    } catch (error) {
      console.error("Error updating document: ", error);
      setMessage('Gagal memperbarui data karyawan. Silakan coba lagi.');
      setMessageType('danger');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center mt-5"><h2>Memuat...</h2></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h2>Edit Karyawan</h2>
      <Link href="/admin/employees">
        <Button variant="secondary" className="mb-4">Kembali ke Daftar Karyawan</Button>
      </Link>
      
      {message && <Alert variant={messageType}>{message}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nama</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Masukkan nama lengkap" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control 
            type="email" 
            placeholder="Masukkan alamat email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Posisi</Form.Label>
          <Form.Control 
            as="select" 
            value={position} 
            onChange={(e) => setPosition(e.target.value)} 
            required
          >
            <option value="">Pilih posisi...</option>
            {positions.map((pos, index) => (
              <option key={index} value={pos}>{pos}</option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>UID RFID</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Masukkan UID RFID" 
            value={rfidUid} 
            onChange={(e) => setRfidUid(e.target.value)} 
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

export default EditEmployeePage;