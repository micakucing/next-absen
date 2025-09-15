// pages/admin/attendances/[id].js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Form, Button } from 'react-bootstrap';
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';

const EditAttendancePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (id) {
        const docRef = doc(db, "attendances", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAttendance({
            ...data,
            // Format timestamp ke string untuk input form
            timestamp: data.timestamp?.toDate().toISOString().slice(0, 16)
          });
        } else {
          console.log("Dokumen absensi tidak ditemukan!");
          router.push('/admin/attendances');
        }
      }
      setLoading(false);
    };
    fetchAttendance();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAttendance(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "attendances", id);
      await updateDoc(docRef, {
        ...attendance,
        timestamp: new Date(attendance.timestamp) // Konversi kembali ke tipe data Date
      });
      alert('Absensi berhasil diperbarui!');
      router.push('/admin/attendances');
    } catch (error) {
      console.error("Error updating document: ", error);
      alert('Gagal memperbarui absensi.');
    }
  };

  if (loading || !attendance) {
    return <AdminLayout><div className="text-center"><h2>Memuat...</h2></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h2>Edit Absensi</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nama Karyawan</Form.Label>
          <Form.Control type="text" value={attendance.employeeName} disabled />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Tipe Absensi</Form.Label>
          <Form.Control as="select" name="type" value={attendance.type} onChange={handleChange}>
            <option value="check-in">Check-in</option>
            <option value="check-out">Check-out</option>
          </Form.Control>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Waktu</Form.Label>
          <Form.Control type="datetime-local" name="timestamp" value={attendance.timestamp} onChange={handleChange} />
        </Form.Group>
        <Button variant="primary" type="submit">
          Simpan Perubahan
        </Button>
      </Form>
    </AdminLayout>
  );
};

export default EditAttendancePage;