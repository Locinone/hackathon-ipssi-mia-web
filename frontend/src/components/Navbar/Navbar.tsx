import { useAuthStore } from '@/store/authStore';

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import { Bookmark, Flame, Home, LogOut, Plus, Search, User } from 'lucide-react';

interface NavbarProps {
    onPageChange?: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onPageChange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [activePath, setActivePath] = useState('');
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();

    useEffect(() => {
        setActivePath(location.pathname);
    }, [location.pathname]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = async () => {};

    const navigateTo = (path: string) => {
        navigate(path);
        if (onPageChange) {
            onPageChange(path.replace('/', '') || 'home');
        }
    };

    return (
        <>
            {/* Navbar desktop */}
            <nav className="absolute top-0 left-0 w-full hidden md:flex justify-between items-center p-6 md:p-8 z-10">
                <div className="navbar-brand">
                    <motion.h1
                        whileHover={{ scale: 1.05 }}
                        className="text-white text-xl md:text-4xl font-bold m-0 cursor-pointer"
                        onClick={() => navigateTo('/')}
                    >
                        TakeIt
                    </motion.h1>
                </div>
                <div className="flex flex-row justify-between gap-10">
                    <motion.form
                        onSubmit={handleSearchSubmit}
                        whileHover={{ scale: 1.02 }}
                        className="flex flex-row justify-between items-center gap-2 py-2 px-4 rounded-full text-white border-white border-2 text-lg md:text-2xl"
                    >
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="bg-transparent outline-none border-none"
                        />
                        <button type="submit">
                            <Search size={24} />
                        </button>
                    </motion.form>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="flex flex-row justify-between items-center gap-2 py-2 px-4 rounded-full text-white border-white border-2 text-lg md:text-2xl"
                        onClick={() => setIsCreatePostOpen(true)}
                    >
                        <Plus size={24} />
                    </motion.button>
                </div>
                <div className="flex flex-row justify-between items-center gap-10">
                    <div className="flex flex-row justify-between items-center gap-10 py-2 px-4 rounded-full text-white text-lg md:text-2xl">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`${activePath === '/' ? 'text-cyan-600 bg-cyan-100 rounded-full p-2' : 'text-white'}`}
                        >
                            <Link to="/home">
                                <Home size={24} className="cursor-pointer" />
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`${activePath === '/trends' ? 'text-pink-500 bg-pink-200 rounded-full p-2' : 'text-white'}`}
                        >
                            <Link to="/trending">
                                <Flame size={24} className="cursor-pointer" />
                            </Link>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`${activePath === '/bookmarks' ? 'text-yellow-600 bg-yellow-100 rounded-full p-2' : 'text-white'}`}
                        >
                            <Link to="/bookmarks">
                                <Bookmark size={24} className="cursor-pointer" />
                            </Link>
                        </motion.div>
                    </div>
                    <div className="relative">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-12 h-12 p-2 rounded-full overflow-hidden cursor-pointer bg-white/20 flex items-center justify-center"
                        >
                            <User className="text-white" size={48} />
                        </motion.div>

                        {showUserMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md rounded-lg shadow-lg py-2 z-20"
                            >
                                <motion.button
                                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                    onClick={() => navigateTo(`/profile/${user?.username}`)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-white text-left"
                                >
                                    <User size={18} />
                                    <span>Mon Profil</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-white text-left"
                                >
                                    <LogOut size={18} />
                                    <span>Déconnexion</span>
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Navbar mobile (en bas) */}
            <nav className="fixed bottom-0 left-0 w-full md:hidden flex justify-around items-center p-3 bg-black/30 backdrop-blur-md z-10">
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center"
                    onClick={() => navigateTo('/')}
                >
                    <Link to="/home">
                        <Home size={24} className="text-white" />
                    </Link>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center"
                    onClick={() => {
                        setSearchQuery('');
                        navigateTo('/search');
                    }}
                >
                    <Link to="/search">
                        <Search size={24} className="text-white" />
                    </Link>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center"
                >
                    <Link to="/bookmarks">
                        <Bookmark size={24} className="text-white" />
                    </Link>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center"
                    onClick={() => handleLogout()}
                >
                    <Link to="/login">
                        <LogOut size={24} className="text-white" />
                    </Link>
                </motion.div>
            </nav>
        </>
    );
};

export default Navbar;
