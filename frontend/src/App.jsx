import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import SearchPage from './pages/SearchPage';

// Composant pour les routes protégées
const ProtectedRoute = ({ children }) => {
    const { isAuth } = useSelector((state) => state.auth);

    // Vérifier si l'utilisateur est authentifié via le cookie
    const isAuthenticated = true;

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

function App() {
    const dispatch = useDispatch();
    const { isAuth } = useSelector((state) => state.auth);
    const isAuthenticated = true;

    return (
        <Router>
            {isAuthenticated && <Navbar />}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/search"
                    element={
                        <ProtectedRoute>
                            <SearchPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/profile/:username" element={<Profile />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
        </Router>
    );
}

export default App;
