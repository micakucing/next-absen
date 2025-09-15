// pages/_app.js

import 'bootstrap/dist/css/bootstrap.min.css'; // Tambahkan baris ini
import '../components/AdminLayout.module.css'; 

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;