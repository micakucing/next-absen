// pages/admin/payroll/history.js

import { useState, useEffect } from 'react';
import { Card, Table, Alert, Button } from 'react-bootstrap';
import Link from 'next/link';
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';

const PayrollHistoryPage = () => {
  const [payrollReports, setPayrollReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const payrollCollection = collection(db, "payroll");
        const q = query(payrollCollection, orderBy("generatedAt", "desc"));
        const snapshot = await getDocs(q);
        const reportsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (reportsList.length === 0) {
          setMessage("Belum ada laporan gaji yang disimpan.");
          setMessageType("warning");
        }
        setPayrollReports(reportsList);
      } catch (error) {
        console.error("Error fetching payroll reports: ", error);
        setMessage("Gagal memuat riwayat laporan gaji.");
        setMessageType("danger");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return <AdminLayout><div className="text-center mt-5"><h2>Memuat...</h2></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h2>Riwayat Laporan Penggajian</h2>
      {message && <Alert variant={messageType}>{message}</Alert>}
      
      {payrollReports.length > 0 && (
        <Card>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Periode</th>
                  <th>Tanggal Disimpan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {payrollReports.map(report => (
                  <tr key={report.id}>
                    <td>Bulan {report.month}, {report.year}</td>
                    <td>{report.generatedAt?.toDate().toLocaleString()}</td>
                    <td>
                      <Link href={`/admin/payroll/${report.id}`} passHref>
                        <Button variant="info" size="sm">Edit / Lihat</Button>
                      </Link>
                    </td>
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

export default PayrollHistoryPage;