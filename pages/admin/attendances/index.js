// pages/admin/attendances/index.js

import { useState, useEffect } from 'react';
import { Card, Table, Alert, Form, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';

const AttendancePage = () => {
  const [allAttendances, setAllAttendances] = useState([]);
  const [filteredAttendances, setFilteredAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  
  // Mengubah state untuk filter nama
  const [employeeNameFilter, setEmployeeNameFilter] = useState('');
  
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const attendancesCollection = collection(db, "attendances");
        const employeesCollection = collection(db, "employees");

        const [attendancesSnapshot, employeesSnapshot] = await Promise.all([
          getDocs(attendancesCollection),
          getDocs(employeesCollection)
        ]);

        const attendancesList = attendancesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate(),
        }));

        const employeesList = employeesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAllAttendances(attendancesList);
        setEmployees(employeesList);
        setFilteredAttendances(attendancesList);

        if (attendancesList.length === 0) {
          setMessage("Tidak ada data absensi.");
          setMessageType("warning");
        } else {
          setMessage(null);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
        setMessage("Gagal memuat data.");
        setMessageType("danger");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = allAttendances;

    // Filter berdasarkan nama karyawan (input teks)
    if (employeeNameFilter) {
      const lowercasedFilter = employeeNameFilter.toLowerCase();
      result = result.filter(att => att.employeeName.toLowerCase().includes(lowercasedFilter));
    }

    // Filter berdasarkan bulan
    if (selectedMonth) {
      const monthIndex = months.indexOf(selectedMonth);
      result = result.filter(att => att.timestamp.getMonth() === monthIndex);
    }

    // Filter berdasarkan hari
    if (selectedDay) {
      result = result.filter(att => att.timestamp.getDate() === parseInt(selectedDay));
    }
    
    setFilteredAttendances(result);
    
    if (result.length === 0 && (employeeNameFilter || selectedDay || selectedMonth)) {
      setMessage("Tidak ada data yang cocok dengan filter yang dipilih.");
      setMessageType("info");
    } else {
      setMessage(null);
    }
  }, [employeeNameFilter, selectedDay, selectedMonth, allAttendances]);

  const getDaysInMonth = (month) => {
    if (!month) return [];
    const monthIndex = months.indexOf(month);
    const date = new Date(new Date().getFullYear(), monthIndex + 1, 0);
    const days = [];
    for (let i = 1; i <= date.getDate(); i++) {
      days.push(i);
    }
    return days;
  };

  if (loading) {
    return <AdminLayout><div className="text-center mt-5"><h2>Memuat...</h2></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h2>Data Absensi</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Filter Data</Card.Title>
          <Form>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Nama Karyawan</Form.Label>
                  <FormControl 
                    type="text"
                    placeholder="Ketik nama..."
                    value={employeeNameFilter} 
                    onChange={(e) => setEmployeeNameFilter(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Bulan</Form.Label>
                  <Form.Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                    <option value="">Semua Bulan</option>
                    {months.map((month, index) => (
                      <option key={index} value={month}>{month}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Hari</Form.Label>
                  <Form.Select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} disabled={!selectedMonth}>
                    <option value="">Semua Hari</option>
                    {getDaysInMonth(selectedMonth).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {message && <Alert variant={messageType}>{message}</Alert>}
      
      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nama Karyawan</th>
                <th>Tipe</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendances.length > 0 ? (
                filteredAttendances.map(attendance => (
                  <tr key={attendance.id}>
                    <td>{attendance.employeeName}</td>
                    <td>{attendance.type}</td>
                    <td>{attendance.timestamp.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">Tidak ada data absensi yang cocok dengan filter.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};

export default AttendancePage;