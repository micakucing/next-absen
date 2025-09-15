// components/AdminLayout.js

import { useState } from 'react';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { auth } from '../firebaseConfig';
import styles from './AdminLayout.module.css'; // Import file CSS baru

const AdminLayout = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/admin/login');
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className={styles.adminLayout}>
      {/* Tombol Toggle untuk Mobile */}
      <Button 
        variant="primary" 
        onClick={toggleSidebar} 
        className={`${styles.sidebarToggle} d-lg-none`}
      >
        ☰
      </Button>

      {/* Overlay (Hanya muncul saat sidebar aktif di mobile) */}
      {showSidebar && <div className={styles.overlay} onClick={toggleSidebar}></div>}

      <Container fluid>
        <Row>
          {/* Sidebar */}
          <Col 
            xs={10} 
            lg={2} 
            className={`${styles.sidebarWrapper} ${showSidebar ? styles.sidebarVisible : ''} bg-dark text-white p-4`} 
          >
            <h4 className="mb-4">Dashboard Admin</h4>
            <Nav className="flex-column">
              <Nav.Link href="/admin" className="text-white">Dashboard</Nav.Link>
              <Nav.Link href="/admin/employees" className="text-white">Manajemen Karyawan</Nav.Link>
              <Nav.Link href="/admin/positions" className="text-white">Manajemen Jabatan</Nav.Link>
              <Nav.Link href="/admin/attendances" className="text-white">Daftar Absensi</Nav.Link>
                            <Nav.Link href="/admin/report" className="text-white">Laporan Absensi</Nav.Link> {/* Tambahkan ini */}
                                          <Nav.Link href="/admin/payroll" className="text-white">payroll</Nav.Link>

              <Nav.Link href="/" className="text-white">Absensi RFID</Nav.Link>
            </Nav>
            <div className="mt-auto pt-5">
              <Button variant="outline-light" onClick={handleLogout} className="w-100">
                Logout
              </Button>
            </div>
          </Col>

          {/* Konten Utama */}
          <Col xs={12} lg={10} className={styles.contentWrapper}>
            {children}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLayout;