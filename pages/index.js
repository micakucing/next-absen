// pages/rfid.js

import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebaseConfig';
import Link from 'next/link'; // Import komponen Link
const RFIDScannerPage = () => {
  const [rfidInput, setRfidInput] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info'); // Tipe: 'success', 'danger', 'info'

  const handleScan = async (e) => {
    e.preventDefault();
    setMessage(null);
    setMessageType('info');

    if (!rfidInput) {
      setMessage('UID RFID tidak boleh kosong.');
      setMessageType('danger');
      return;
    }

    try {
      // 1. Cari Karyawan berdasarkan UID RFID
      const employeesRef = collection(db, "employees");
      const q = query(employeesRef, where("rfidUid", "==", rfidInput));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setMessage('UID RFID tidak terdaftar.');
        setMessageType('danger');
        return;
      }

      const employeeDoc = querySnapshot.docs[0];
      const employeeData = employeeDoc.data();

      // 2. Catat Absensi (Check-in)
      const attendanceRef = collection(db, "attendances");
      await addDoc(attendanceRef, {
        employeeId: employeeData.employeeId,
        employeeName: employeeData.name,
        timestamp: serverTimestamp(),
        type: 'check-in', // Bisa ditambahkan logika untuk check-out
      });

      setMessage(`Absensi berhasil untuk ${employeeData.name}!`);
      setMessageType('success');
      setRfidInput(''); // Bersihkan input setelah berhasil
    } catch (error) {
      console.error("Gagal mencatat absensi:", error);
      setMessage('Terjadi kesalahan saat mencatat absensi.');
      setMessageType('danger');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScan(e);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <div className="text-center" style={{ maxWidth: '500px' }}>
        <h2 className="mb-4">Absensi Karyawan</h2>
        <p className="text-muted">Tempelkan kartu RFID Anda untuk absensi.</p>
        
        {message && <Alert variant={messageType}>{message}</Alert>}

        <Form onSubmit={handleScan}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={rfidInput}
              onChange={(e) => setRfidInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Masukkan UID RFID"
              autoFocus
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Scan
          </Button>
             <Link href="/admin" passHref>
            <Button variant="outline-secondary" className="w-100 mt-3">
              Ke Halaman Admin
            </Button>
          </Link>
        </Form>
      </div>
    </Container>
  );
};

export default RFIDScannerPage;