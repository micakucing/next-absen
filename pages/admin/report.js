// pages/admin/reports.js

import { useState } from 'react';
import { Form, Button, Card, Table, Alert, Row, Col } from 'react-bootstrap';
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from '../../firebaseConfig';
import AdminLayout from '../../components/AdminLayout';

const ReportsPage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setMessage(null);
    setReportData([]);
    
    if (!startDate || !endDate) {
      setMessage("Harap pilih tanggal mulai dan tanggal selesai.");
      setMessageType("danger");
      return;
    }

    setLoading(true);

    try {
      // Konversi string tanggal ke objek Date dan Timestamp
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0); // Atur waktu ke awal hari

      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999); // Atur waktu ke akhir hari

      const attendanceRef = collection(db, "attendances");
      const q = query(
        attendanceRef,
        where("timestamp", ">=", Timestamp.fromDate(startOfDay)),
        where("timestamp", "<=", Timestamp.fromDate(endOfDay)),
        orderBy("timestamp", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const dataList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (dataList.length === 0) {
        setMessage("Tidak ada data absensi dalam rentang tanggal yang dipilih.");
        setMessageType("warning");
      }

      setReportData(dataList);
      setMessage(`Ditemukan ${dataList.length} data absensi.`);
      setMessageType("success");

    } catch (error) {
      console.error("Error generating report: ", error);
      setMessage("Terjadi kesalahan saat membuat laporan.");
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h2>Laporan Absensi Karyawan</h2>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Pilih Rentang Tanggal</Card.Title>
          <Form onSubmit={handleGenerateReport}>
            <Row className="align-items-end">
              <Col md={5} className="mb-3">
                <Form.Group>
                  <Form.Label>Tanggal Mulai</Form.Label>
                  <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={5} className="mb-3">
                <Form.Group>
                  <Form.Label>Tanggal Selesai</Form.Label>
                  <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={2} className="mb-3">
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Memuat...' : 'Buat Laporan'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {message && <Alert variant={messageType}>{message}</Alert>}

      {reportData.length > 0 && (
        <Card>
          <Card.Body>
            <Card.Title>Detail Laporan</Card.Title>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Karyawan</th>
                  <th>Tipe</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((data, index) => (
                  <tr key={data.id}>
                    <td>{index + 1}</td>
                    <td>{data.employeeName}</td>
                    <td>{data.type}</td>
                    <td>{data.timestamp?.toDate().toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </AdminLayout>
  );
};

export default ReportsPage;