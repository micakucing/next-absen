// pages/login.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '../../firebaseConfig';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Periksa status autentikasi saat halaman dimuat
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Pengguna sudah login, periksa perannya
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
          // Jika pengguna adalah admin, arahkan langsung ke dashboard admin
          router.push('/admin');
        } else {
          // Jika bukan admin, arahkan ke halaman utama
          router.push('/');
        }
      } else {
        // Jika belum ada pengguna yang login, biarkan mereka melihat form
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Membersihkan listener saat komponen dilepas
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
        // Redirect admin
        router.push('/admin');
      } else {
        // Redirect pengguna biasa
        router.push('/');
      }
    } catch (err) {
      console.error('Login gagal:', err.message);
      setError('Login gagal. Periksa kembali email dan password Anda.');
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <h2>Memuat...</h2>
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="p-4 border rounded" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Login Admin</h2>
                <p className="text-muted text-center">Kelola data absensi di dashboard admin.</p>

        {error && <Alert variant="danger">{error}</Alert>}
        <hr></hr>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control 
              type="email" 
              placeholder="Masukkan email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Masukkan password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          
          <Button variant="primary" type="submit" className="w-100">
            Login
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default LoginPage;