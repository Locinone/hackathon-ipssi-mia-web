import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar/Navbar';
import Loader from './components/ui/Loader';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { useAuthStore } from './store/authStore';

// Composant pour les routes protégées
const ProtectedRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:username" element={<Profile />} />
        </Routes>
    );
};

const PublicRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
        </Routes>
    );
};

function App() {
    const { isAuthenticated, loading, autoLogin, user } = useAuthStore();

    useEffect(() => {
        autoLogin();
        console.log(user);
    }, [autoLogin]);

    if (loading) return <Loader />;

    return (
        <Router>
            {isAuthenticated && <Navbar />}
            {isAuthenticated ? <ProtectedRoutes /> : <PublicRoutes />}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Router>
    );
}

export default App;
