// pages/admin/employees/tenure.js

import { useState, useEffect } from 'react';
import { Card, Table, Alert, Form, Row, Col, Pagination, Button } from 'react-bootstrap';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';

const EmployeesTenurePage = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedTenureRange, setSelectedTenureRange] = useState('');

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const calculateTenure = (hireDate) => {
    if (!hireDate) {
      return { tenureString: "N/A", years: 0, months: 0, days: 0 };
    }

    let startDate = null;
    // Perbaiki: Periksa apakah hireDate adalah Timestamp atau string
    if (typeof hireDate === 'string') {
        startDate = new Date(hireDate);
    } else {
        startDate = hireDate.toDate();
    }
    
    const now = new Date();
    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();

    if (days < 0) {
      months--;
      const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days = lastDayOfPrevMonth + days;
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years < 0) return { tenureString: "Tanggal tidak valid", years: -1, months: 0, days: 0 };
    return {
      tenureString: `${years} tahun, ${months} bulan, ${days} hari`,
      years,
      months,
      days
    };
  };

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

  useEffect(() => {
    let result = allEmployees;
    if (selectedPosition) {
      result = result.filter(emp => emp.position === selectedPosition);
    }
    if (selectedTenureRange) {
      result = result.filter(emp => {
        const tenure = calculateTenure(emp.hireDate);
        const years = tenure.years;
        if (selectedTenureRange === '0-1') return years < 1;
        if (selectedTenureRange === '1-3') return years >= 1 && years <= 3;
        if (selectedTenureRange === '3-5') return years > 3 && years <= 5;
        if (selectedTenureRange === '5+') return years > 5;
        return true;
      });
    }
    setFilteredEmployees(result);
    setCurrentPage(1);
  }, [selectedPosition, selectedTenureRange, allEmployees]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
      <h2>Laporan Lama Bekerja Karyawan</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Filter Data</Card.Title>
          <Form>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Filter Jabatan</Form.Label>
                  <Form.Select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
                    <option value="">Semua Jabatan</option>
                    {positions.map(pos => (<option key={pos.id} value={pos.name}>{pos.name}</option>))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Filter Lama Bekerja</Form.Label>
                  <Form.Select value={selectedTenureRange} onChange={(e) => setSelectedTenureRange(e.target.value)}>
                    <option value="">Semua</option>
                    <option value="0-1">Kurang dari 1 Tahun</option>
                    <option value="1-3">1 - 3 Tahun</option>
                    <option value="3-5">3 - 5 Tahun</option>
                    <option value="5+">Lebih dari 5 Tahun</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Item per Halaman</Form.Label>
                  <Form.Select value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value))}>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button variant="outline-secondary" className="w-100" onClick={() => { setSelectedPosition(''); setSelectedTenureRange(''); }}>
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
                <th>Jabatan</th>
                <th>Tanggal Mulai</th>
                <th>Lama Bekerja</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.position}</td>
                    <td>
                      {/* Perbaiki: Cek tipe data sebelum menampilkan */}
                      {typeof employee.hireDate === 'string' 
                          ? new Date(employee.hireDate).toLocaleDateString() 
                          : employee.hireDate?.toDate()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td>{calculateTenure(employee.hireDate).tenureString}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">Tidak ada karyawan yang cocok dengan filter.</td>
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

export default EmployeesTenurePage;