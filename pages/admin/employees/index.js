// pages/admin/employees/index.js

import { useState, useEffect } from 'react';
import { Button, Table, Card, Alert } from 'react-bootstrap';
import Link from 'next/link';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';
import { FaEdit, FaTrash } from 'react-icons/fa';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const employeesCollection = collection(db, "employees");
      const employeesSnapshot = await getDocs(employeesCollection);
      const employeesList = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeesList);
    } catch (error) {
      console.error("Error fetching employees: ", error);
      setMessage("Gagal memuat data karyawan.");
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus karyawan ini?")) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "employees", id));
        setMessage("Karyawan berhasil dihapus!");
        setMessageType("success");
        // Perbarui daftar setelah penghapusan
        setEmployees(employees.filter(emp => emp.id !== id));
      } catch (error) {
        console.error("Error deleting employee: ", error);
        setMessage("Gagal menghapus karyawan.");
        setMessageType("danger");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <AdminLayout><div className="text-center mt-5"><h2>Memuat...</h2></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h2>Manajemen Karyawan</h2>
      <div className="d-flex justify-content-end mb-3">
        <Link href="/admin/employees/create" passHref>
          <Button variant="primary">Tambah Karyawan</Button>
        </Link>
      </div>

      {message && <Alert variant={messageType}>{message}</Alert>}

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Jabatan</th>
                <th>Gaji</th>
                <th>UID RFID</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.position}</td>
                    <td>{`Rp${employee.salary?.toLocaleString('id-ID')}`}</td> {/* Tampilkan gaji */}
                    <td>{employee.rfidUid}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link href={`/admin/employees/create?id=${employee.id}`} passHref>
                          <Button variant="warning" size="sm">
                            <FaEdit className="me-1" />Edit
                          </Button>
                        </Link>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(employee.id)}>
                          <FaTrash className="me-1" />Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">Tidak ada data karyawan.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};

export default EmployeesPage;