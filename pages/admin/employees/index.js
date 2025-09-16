// pages/admin/employees/index.js

import { useState, useEffect } from 'react';
import { Card, Table, Alert, Button, Form, Row, Col, Pagination } from 'react-bootstrap';
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';
import Link from 'next/link';

const EmployeesPage = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [selectedPosition, setSelectedPosition] = useState('');

  // State untuk Pagination
  const [itemsPerPage, setItemsPerPage] = useState(10); // Nilai default 10
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchEmployeesAndPositions = async () => {
      setLoading(true);
      try {
        const employeesCollection = collection(db, "employees");
        const employeesSnapshot = await getDocs(employeesCollection);
        const employeesList = employeesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const positionsCollection = collection(db, "positions");
        const positionsSnapshot = await getDocs(positionsCollection);
        const positionsList = positionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setAllEmployees(employeesList);
        setPositions(positionsList);

        if (employeesList.length === 0) {
            setMessage("Tidak ada data karyawan.");
            setMessageType("warning");
        } else {
            setFilteredEmployees(employeesList);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
        setMessage("Gagal memuat data.");
        setMessageType("danger");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeesAndPositions();
  }, []);

  // Logika filter yang akan berjalan saat filter berubah
  useEffect(() => {
    let result = allEmployees;

    if (selectedPosition) {
      result = result.filter(emp => emp.position === selectedPosition);
    }
    
    setFilteredEmployees(result);
    setCurrentPage(1); // Reset halaman ke 1 setiap kali filter berubah

    if (result.length === 0 && selectedPosition) {
        setMessage("Tidak ada karyawan yang cocok dengan filter yang dipilih.");
        setMessageType("info");
    } else {
        setMessage(null);
    }
  }, [selectedPosition, allEmployees]);

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus karyawan ini?")) {
      try {
        await deleteDoc(doc(db, "employees", id));
        setMessage("Karyawan berhasil dihapus!");
        setMessageType("success");
        setAllEmployees(allEmployees.filter(emp => emp.id !== id));
      } catch (error) {
        console.error("Error deleting document: ", error);
        setMessage("Terjadi kesalahan saat menghapus karyawan.");
        setMessageType("danger");
      }
    }
  };

  // Logika Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset halaman ke 1 saat jumlah item per halaman berubah
  };

  const renderPaginationItems = () => {
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
          {number}
        </Pagination.Item>,
      );
    }
    return items;
  };

  if (loading) {
    return <AdminLayout><div className="text-center mt-5"><h2>Memuat...</h2></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h2>Manajemen Karyawan</h2>
      <Link href="/admin/employees/create" passHref>
        <Button variant="primary" className="mb-4">Tambah Karyawan Baru</Button>
      </Link>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Filter Data</Card.Title>
          <Form>
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Filter Jabatan</Form.Label>
                  <Form.Select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
                    <option value="">Semua Jabatan</option>
                    {positions.map(pos => (
                      <option key={pos.id} value={pos.name}>{pos.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Item per Halaman</Form.Label>
                  <Form.Select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12} className="mt-3">
                <Button variant="outline-secondary" className="w-100" onClick={() => { setSelectedPosition(''); setItemsPerPage(10); setCurrentPage(1); }}>
                  Reset Filter
                </Button>
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
                <th>Nama</th>
                <th>Email</th>
                <th>Jabatan</th>
                <th>UID RFID</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.position}</td>
                    <td>{employee.rfidUid}</td>
                    <td>
                      <Link href={`/admin/employees/edit?id=${employee.id}`} passHref>
                        <Button variant="warning" size="sm" className="me-2">Edit</Button>
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(employee.id)}>Hapus</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">Tidak ada data karyawan.</td>
                </tr>
              )}
            </tbody>
          </Table>
          
          {filteredEmployees.length > itemsPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                {renderPaginationItems()}
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};

export default EmployeesPage;