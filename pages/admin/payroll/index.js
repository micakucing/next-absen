// pages/admin/payroll/index.js

import { useState, useEffect } from 'react';
import { Form, Button, Card, Table, Alert, Row, Col } from 'react-bootstrap';
import { collection, query, where, getDocs, Timestamp, getDoc, doc } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';
import Link from 'next/link';
const PayrollPage = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceCounts, setAttendanceCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const employeesCollection = collection(db, "employees");
      const employeeSnapshot = await getDocs(employeesCollection);
      const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeeList);
    } catch (error) {
      console.error("Error fetching employees: ", error);
      setMessage("Gagal memuat data karyawan.");
      setMessageType("danger");
    }
  };

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    setAttendanceCounts({});

    try {
      const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
      const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0);

      const attendanceRef = collection(db, "attendances");
      const q = query(
        attendanceRef,
        where("timestamp", ">=", Timestamp.fromDate(firstDayOfMonth)),
        where("timestamp", "<=", Timestamp.fromDate(lastDayOfMonth))
      );
      
      const querySnapshot = await getDocs(q);
      const counts = {};

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const employeeId = data.employeeId;
        counts[employeeId] = (counts[employeeId] || 0) + 1;
      }
      setAttendanceCounts(counts);

      setMessage("Laporan gaji berhasil dibuat.");
      setMessageType("success");
    } catch (error) {
      console.error("Error generating payroll report: ", error);
      setMessage("Terjadi kesalahan saat membuat laporan gaji.");
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyPay = (baseSalary, attendedDays) => {
    // Asumsi: 22 hari kerja per bulan
    const workDaysInMonth = 22;
    if (attendedDays === 0) return 0;
    const dailyRate = baseSalary / workDaysInMonth;
    return Math.round(dailyRate * attendedDays);
  };

  return (
    <AdminLayout>
       <h2>Halaman Penggajian</h2>
    <div className="d-flex justify-content-end mb-4">
      <Link href="/admin/payroll/history" passHref>
        <Button variant="secondary">Lihat Riwayat Laporan</Button>
      </Link>
    </div>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Buat Laporan Gaji Bulanan</Card.Title>
          <Form onSubmit={handleGeneratePayroll}>
            <Row className="align-items-end">
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Bulan</Form.Label>
                  <Form.Control as="select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} required>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{new Date(2000, month - 1, 1).toLocaleString('id-ID', { month: 'long' })}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Tahun</Form.Label>
                  <Form.Control as="select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} required>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Membuat...' : 'Buat Laporan Gaji'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {message && <Alert variant={messageType}>{message}</Alert>}

      {employees.length > 0 && (
        <Card>
          <Card.Body>
            <Card.Title>Laporan Gaji Bulan {new Date(2000, selectedMonth - 1, 1).toLocaleString('id-ID', { month: 'long' })} {selectedYear}</Card.Title>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nama Karyawan</th>
                  <th>Gaji Pokok</th>
                  <th>Jumlah Hadir</th>
                  <th>Total Gaji Bulan Ini</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{`Rp${employee.salary.toLocaleString('id-ID')}`}</td>
                    <td>{attendanceCounts[employee.id] || 0} Hari</td>
                    <td>{`Rp${calculateMonthlyPay(employee.salary, attendanceCounts[employee.id] || 0).toLocaleString('id-ID')}`}</td>
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

export default PayrollPage;