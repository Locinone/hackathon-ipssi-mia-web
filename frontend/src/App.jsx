import { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SearchPage from './pages/SearchPage';
import UserService from './services/userService';

// Composant pour les routes protégées
const ProtectedRoute = ({ children }) => {
    const { isAuth } = useSelector((state) => state.auth);
    const userService = new UserService();

    // Vérifier si l'utilisateur est authentifié via le cookie
    const isAuthenticated = isAuth || userService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

function App() {
    const dispatch = useDispatch();

    return (
        <Router>
            <Fragment>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Navbar />
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            <ProtectedRoute>
                                <Navbar />
                                <SearchPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
                <ToastContainer position="top-right" autoClose={3000} />
            </Fragment>
        </Router>
    );
}

export default App;
