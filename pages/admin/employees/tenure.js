// pages/admin/employees/tenure.js

import { useState, useEffect } from 'react';
import { Card, Table, Alert } from 'react-bootstrap';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';

const EmployeesTenurePage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');

  const calculateTenure = (startDate) => {
    if (!startDate) {
      return "Tanggal mulai tidak tersedia";
    }

    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30.44); // Rata-rata hari dalam sebulan
    const years = Math.floor(months / 12);

    const remainingMonths = months % 12;
    const remainingDays = days - Math.floor(months * 30.44);

    return `${years} tahun, ${remainingMonths} bulan, ${remainingDays} hari`;
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const employeesCollection = collection(db, "employees");
        const employeesSnapshot = await getDocs(employeesCollection);
        const employeesList = employeesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEmployees(employeesList);
      } catch (error) {
        console.error("Error fetching employees: ", error);
        setMessage("Gagal memuat data karyawan.");
        setMessageType("danger");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  if (loading) {
    return <AdminLayout><div className="text-center mt-5"><h2>Memuat...</h2></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h2>Lama Bekerja Karyawan</h2>
      
      {message && <Alert variant={messageType}>{message}</Alert>}

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Jabatan</th>
                <th>Tanggal Mulai</th>
                <th>Lama Bekerja</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.position}</td>
                    <td>{employee.hireDate || 'N/A'}</td>
                    <td>{calculateTenure(employee.hireDate)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">Tidak ada data karyawan.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};

export default EmployeesTenurePage;