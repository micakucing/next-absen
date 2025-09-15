// pages/admin/attendances/index.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Table, Button } from 'react-bootstrap';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';

const AttendanceDashboard = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Anda bisa menambahkan proteksi rute di sini seperti di halaman admin/index.js
    fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
    setLoading(true);
    const attendanceCollection = collection(db, "attendances");
    const attendanceSnapshot = await getDocs(attendanceCollection);
    const attendanceList = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAttendances(attendanceList);
    setLoading(false);
  };

  if (loading) {
    return <AdminLayout><div className="text-center"><h2>Memuat...</h2></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h2>Daftar Absensi</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nama Karyawan</th>
            <th>Tipe</th>
            <th>Waktu</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {attendances.map(abs => (
            <tr key={abs.id}>
              <td>{abs.employeeName}</td>
              <td>{abs.type}</td>
              <td>{abs.timestamp?.toDate().toLocaleString()}</td>
              <td>
                <Link href={`/admin/attendances/${abs.id}`} passHref>
                  <Button variant="info" size="sm">Edit</Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </AdminLayout>
  );
};

export default AttendanceDashboard;