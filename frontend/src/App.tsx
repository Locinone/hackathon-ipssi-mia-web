import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar/Navbar';
import Loader from './components/ui/Loader';
import { WebSocketProvider } from './context/WebSocketContext';
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
    const { isAuthenticated, loading, autoLogin } = useAuthStore();

    useEffect(() => {
        autoLogin();
    }, [autoLogin]);

    // Afficher un toast pour indiquer l'état de la connexion WebSocket (pour le débogage)
    useEffect(() => {
        if (isAuthenticated) {
            toast.info('Connexion aux notifications en cours...', {
                autoClose: 2000,
                position: 'bottom-right',
            });
        }
    }, [isAuthenticated]);

    if (loading) return <Loader />;

    return (
        <Router>
            {isAuthenticated ? (
                <WebSocketProvider>
                    <Navbar />
                    <ProtectedRoutes />
                </WebSocketProvider>
            ) : (
                <PublicRoutes />
            )}
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
