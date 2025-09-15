// pages/admin/positions/index.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Table, Button } from 'react-bootstrap';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import AdminLayout from '../../../components/AdminLayout';

const PositionsPage = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    const positionsCollection = collection(db, "positions");
    const positionsSnapshot = await getDocs(positionsCollection);
    const positionsList = positionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPositions(positionsList);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus posisi ini?")) {
      await deleteDoc(doc(db, "positions", id));
      fetchPositions(); 
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center mt-5"><h2>Memuat...</h2></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h2>Manajemen Posisi Jabatan</h2>
      <div className="mb-3">
        <Link href="/admin/positions/create" passHref>
          <Button variant="primary">Tambah Posisi Baru</Button>
        </Link>
      </div>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nama Posisi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(pos => (
            <tr key={pos.id}>
              <td>{pos.name}</td>
              <td>
                <Link href={`/admin/positions/${pos.id}`} passHref>
                  <Button variant="info" size="sm" className="me-2">Edit</Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => handleDelete(pos.id)}>Hapus</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </AdminLayout>
  );
};

export default PositionsPage;