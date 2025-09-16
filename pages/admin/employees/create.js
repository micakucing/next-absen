// pages/admin/employees/create.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import Link from 'next/link';
import { collection, doc, addDoc, getDocs, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';

const AddEditEmployeePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [rfidUid, setRfidUid] = useState('');
  const [salary, setSalary] = useState('');
  const [hireDate, setHireDate] = useState(''); // Tambahkan state untuk tanggal mulai bekerja
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');

  useEffect(() => {
    const fetchPositionsAndEmployee = async () => {
      // Ambil daftar jabatan
      const positionsCollection = collection(db, "positions");
      const positionsSnapshot = await getDocs(positionsCollection);
      const positionsList = positionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPositions(positionsList);

      // Jika dalam mode edit, ambil data karyawan
      if (isEditing) {
        setLoading(true);
        try {
          const employeeDocRef = doc(db, "employees", id);
          const employeeSnap = await getDoc(employeeDocRef);
          if (employeeSnap.exists()) {
            const data = employeeSnap.data();
            setName(data.name);
            setEmail(data.email);
            setPosition(data.position);
            setRfidUid(data.rfidUid);
            setSalary(data.salary);
            setHireDate(data.hireDate); // Set state tanggal mulai bekerja
          } else {
            setMessage("Data karyawan tidak ditemukan.");
            setMessageType("warning");
          }
        } catch (error) {
          console.error("Error fetching employee data: ", error);
          setMessage("Gagal memuat data karyawan.");
          setMessageType("danger");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPositionsAndEmployee();
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validasi form
    if (!name || !email || !position || !rfidUid || !salary || !hireDate) {
      setMessage("Semua field harus diisi.");
      setMessageType("danger");
      setLoading(false);
      return;
    }

    const employeeData = {
      name,
      email,
      position,
      rfidUid,
      salary: parseInt(salary),
      hireDate: hireDate // Simpan tanggal mulai bekerja
    };

    try {
      if (isEditing) {
        await updateDoc(doc(db, "employees", id), employeeData);
        setMessage("Data karyawan berhasil diperbarui!");
        setMessageType("success");
      } else {
        await addDoc(collection(db, "employees"), employeeData);
        setMessage("Karyawan baru berhasil ditambahkan!");
        setMessageType("success");
        setName('');
        setEmail('');
        setPosition('');
        setRfidUid('');
        setSalary('');
        setHireDate(''); // Reset input
      }
    } catch (error) {
      console.error("Error saving employee: ", error);
      setMessage("Terjadi kesalahan saat menyimpan data.");
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h2>{isEditing ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</h2>
      <Link href="/admin/employees" passHref>
        <Button variant="secondary" className="mb-4">Kembali ke Daftar Karyawan</Button>
      </Link>
      
      {message && <Alert variant={messageType}>{message}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nama Lengkap</Form.Label>
              <Form.Control type="text" placeholder="Masukkan nama lengkap" value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Masukkan email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Gaji Pokok</Form.Label>
              <Form.Control type="number" placeholder="Masukkan gaji pokok" value={salary} onChange={(e) => setSalary(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tanggal Mulai Bekerja</Form.Label>
              <Form.Control type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Jabatan</Form.Label>
              <Form.Control as="select" value={position} onChange={(e) => setPosition(e.target.value)} required>
                <option value="">Pilih Jabatan</option>
                {positions.map(pos => (<option key={pos.id} value={pos.name}>{pos.name}</option>))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>UID RFID</Form.Label>
              <Form.Control type="text" placeholder="Masukkan UID RFID" value={rfidUid} onChange={(e) => setRfidUid(e.target.value)} required />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Karyawan')}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};

export default AddEditEmployeePage;