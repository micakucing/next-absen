// pages/admin/payroll/[id].js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Form, Button, Card, Table, Alert } from 'react-bootstrap';
import Link from 'next/link';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';

const EditPayrollPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');

  useEffect(() => {
    const fetchPayroll = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, "payroll", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPayrollData(docSnap.data());
        } else {
          setMessage("Laporan gaji tidak ditemukan.");
          setMessageType("warning");
          setPayrollData(null);
        }
      } catch (error) {
        console.error("Error fetching payroll data: ", error);
        setMessage("Gagal memuat laporan gaji.");
        setMessageType("danger");
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, [id]);

  const handleFinalPayChange = (e, employeeId) => {
    const { value } = e.target;
    setPayrollData(prevData => {
      const updatedSalaries = prevData.employeeSalaries.map(item =>
        item.employeeId === employeeId
          ? { ...item, finalPay: parseInt(value) || 0 }
          : item
      );
      return { ...prevData, employeeSalaries: updatedSalaries };
    });
  };

  const handleSave = async () => {
    if (!payrollData) return;
    setLoading(true);
    setMessage(null);
    try {
      const docRef = doc(db, "payroll", id);
      await updateDoc(docRef, {
        employeeSalaries: payrollData.employeeSalaries,
        updatedAt: new Date(),
      });
      setMessage("Perubahan berhasil disimpan!");
      setMessageType("success");
    } catch (error) {
      console.error("Error updating document: ", error);
      setMessage("Gagal menyimpan perubahan.");
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AdminLayout><div className="text-center mt-5"><h2>Memuat...</h2></div></AdminLayout>;
  }

  if (!payrollData) {
    return <AdminLayout>{message && <Alert variant={messageType}>{message}</Alert>}</AdminLayout>;
  }

  return (
    <AdminLayout>
      <h2>Edit Laporan Gaji</h2>
      <Link href="/admin/payroll/history" passHref>
        <Button variant="secondary" className="mb-4">Kembali ke Riwayat</Button>
      </Link>
      
      {message && <Alert variant={messageType}>{message}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Laporan Gaji Bulan {payrollData.month}, {payrollData.year}</Card.Title>
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
              {payrollData.employeeSalaries.map(item => (
                <tr key={item.employeeId}>
                  <td>{item.employeeName}</td>
                  <td>{`Rp${item.baseSalary.toLocaleString('id-ID')}`}</td>
                  <td>{item.attendedDays} Hari</td>
                  <td>
                    <Form.Control 
                      type="number"
                      value={item.finalPay}
                      onChange={(e) => handleFinalPayChange(e, item.employeeId)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-grid gap-2">
            <Button onClick={handleSave} variant="primary" size="lg" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};

export default EditPayrollPage;