// pages/admin/index.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Table, Card, Row, Col } from 'react-bootstrap';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { auth, db } from '../../firebaseConfig';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPositions, setTotalPositions] = useState(0);
  const [totalAttendances, setTotalAttendances] = useState(0);
  const [latestAttendances, setLatestAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          fetchDashboardData();
        } else {
          router.push('/admin/login');
        }
      } else {
        router.push('/admin/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      // Ambil data karyawan (hanya untuk total)
      const employeesCollection = collection(db, "employees");
      const employeeSnapshot = await getDocs(employeesCollection);
      setTotalEmployees(employeeSnapshot.size);

      // Ambil data posisi
      const positionsCollection = collection(db, "positions");
      const positionsSnapshot = await getDocs(positionsCollection);
      setTotalPositions(positionsSnapshot.size);
      
      // Ambil data kehadiran (absensi)
      const attendancesCollection = collection(db, "attendances");
      const attendancesSnapshot = await getDocs(attendancesCollection);
      setTotalAttendances(attendancesSnapshot.size);

      // Ambil 10 data absensi terbaru
      const latestAttendanceQuery = query(
        attendancesCollection,
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const latestAttendanceSnapshot = await getDocs(latestAttendanceQuery);
      const latestAttendanceList = latestAttendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLatestAttendances(latestAttendanceList);

    } catch (error) {
      console.error("Error fetching dashboard data: ", error);
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
      <h2>Dashboard Admin</h2>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center p-3">
            <Card.Body>
              <Card.Title>Total Karyawan</Card.Title>
              <h1 className="display-4 text-primary">{totalEmployees}</h1>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center p-3">
            <Card.Body>
              <Card.Title>Total Jabatan</Card.Title>
              <h1 className="display-4 text-success">{totalPositions}</h1>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center p-3">
            <Card.Body>
              <Card.Title>Total Kehadiran</Card.Title>
              <h1 className="display-4 text-warning">{totalAttendances}</h1>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>10 Kehadiran Terbaru</Card.Title>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nama Karyawan</th>
                <th>Tipe</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {latestAttendances.map(abs => (
                <tr key={abs.id}>
                  <td>{abs.employeeName}</td>
                  <td>{abs.type}</td>
                  <td>{abs.timestamp?.toDate().toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;