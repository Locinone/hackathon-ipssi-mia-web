import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Mail, User } from 'lucide-react';

import { login, register, setError } from '../redux/slices/userSlice';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuth, error, status } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuth) {
            navigate('/');
        }
    }, [isAuth, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(setError(''));

        if (isLogin) {
            if (!formData.email || !formData.password) {
                dispatch(setError('Veuillez remplir tous les champs'));
                return;
            }
            dispatch(login({ email: formData.email, password: formData.password }));
        } else {
            if (!formData.username || !formData.email || !formData.password) {
                dispatch(setError('Veuillez remplir tous les champs'));
                return;
            }
            dispatch(
                register({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                })
            );
        }
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
        dispatch(setError(''));
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-purple-800 via-blue-700 to-indigo-900 flex justify-center items-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-black/30 backdrop-blur-md rounded-2xl p-6 md:p-8 w-full max-w-md"
            >
                <h1 className="text-white text-3xl md:text-4xl font-bold mb-6 text-center">
                    {isLogin ? 'Connexion' : 'Inscription'}
                </h1>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500 text-white p-3 rounded-lg mb-4"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="relative">
                            <User
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                                size={20}
                            />
                            <input
                                type="text"
                                name="username"
                                placeholder="Nom d'utilisateur"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-white/10 text-white border border-white/20 rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                            size={20}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-white/10 text-white border border-white/20 rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-white/10 text-white border border-white/20 rounded-lg py-3 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                    </div>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                {isLogin ? 'Se connecter' : "S'inscrire"}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-white/80">
                        {isLogin ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?'}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleForm}
                            className="ml-2 text-blue-400 font-medium hover:underline"
                        >
                            {isLogin ? "S'inscrire" : 'Se connecter'}
                        </motion.button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
