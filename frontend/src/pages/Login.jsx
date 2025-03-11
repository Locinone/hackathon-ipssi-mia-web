import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Eye, EyeOff, Upload } from 'lucide-react';

import MockImage from '../assets/mock.jpg';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { login, register, setError } from '../redux/slices/userSlice';
import { loginSchema, registerSchema, validateForm } from '../schemas/authSchemas';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        image: null,
        banner: null,
        acceptNotification: false,
        acceptTerms: false,
        acceptCamera: false,
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [previewBanner, setPreviewBanner] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuth, error, status } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuth) {
            navigate('/');
        }
    }, [isAuth, navigate]);

    useEffect(() => {
        // Nettoyer les URLs des aperçus lors du démontage
        return () => {
            if (previewImage) URL.revokeObjectURL(previewImage);
            if (previewBanner) URL.revokeObjectURL(previewBanner);
        };
    }, [previewImage, previewBanner]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            const file = files[0];
            if (file) {
                setFormData({
                    ...formData,
                    [name]: file,
                });

                // Créer un aperçu pour l'image
                const previewUrl = URL.createObjectURL(file);
                if (name === 'image') {
                    if (previewImage) URL.revokeObjectURL(previewImage);
                    setPreviewImage(previewUrl);
                } else if (name === 'banner') {
                    if (previewBanner) URL.revokeObjectURL(previewBanner);
                    setPreviewBanner(previewUrl);
                }
            }
        } else if (type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }

        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null,
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(setError(''));
        setFormErrors({});

        if (isLogin) {
            const loginData = {
                email: formData.email,
                password: formData.password,
            };

            const validationResult = validateForm(loginSchema, loginData);

            if (!validationResult.success) {
                setFormErrors(validationResult.error);
                return;
            }

            dispatch(login(loginData));
        } else {
            const registerData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                image: formData.image,
                banner: formData.banner,
                acceptNotification: formData.acceptNotification,
                acceptTerms: formData.acceptTerms,
                acceptCamera: formData.acceptCamera,
            };

            const validationResult = validateForm(registerSchema, registerData);

            if (!validationResult.success) {
                setFormErrors(validationResult.error);
                return;
            }

            dispatch(register(registerData));
        }
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
        dispatch(setError(''));
        setFormErrors({});
        // Nettoyer les aperçus lors du changement de formulaire
        if (previewImage) URL.revokeObjectURL(previewImage);
        if (previewBanner) URL.revokeObjectURL(previewBanner);
        setPreviewImage(null);
        setPreviewBanner(null);
        setFormData({
            username: '',
            email: '',
            password: '',
            image: null,
            banner: null,
            acceptNotification: false,
            acceptTerms: false,
            acceptCamera: false,
        });
    };

    const renderFileInput = (name, label, preview, accept = 'image/*') => (
        <div className="relative w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex flex-col items-center justify-center w-full">
                <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative">
                    {preview ? (
                        <img src={preview} alt={label} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Upload size={24} className="text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Cliquez pour sélectionner</p>
                        </div>
                    )}
                    <input
                        type="file"
                        name={name}
                        accept={accept}
                        onChange={handleChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </div>
            {formErrors[name] && <p className="text-red-500 text-xs mt-1">{formErrors[name]}</p>}
        </div>
    );

    const renderCheckbox = (name, label) => (
        <div className="flex items-center cursor-pointer">
            <input
                type="checkbox"
                id={name}
                name={name}
                checked={formData[name]}
                onChange={handleChange}
                className="h-4 w-4 text-black focus:ring-black rounded cursor-pointer"
            />
            <label htmlFor={name} className="ml-2 block text-sm text-gray-700 cursor-pointer">
                {label}
            </label>
            {formErrors[name] && <p className="text-red-500 text-xs ml-2">{formErrors[name]}</p>}
        </div>
    );

    const renderLoginForm = () => (
        <>
            <Input
                type="email"
                label="Email"
                name="email"
                placeholder="super@email.com"
                value={formData.email}
                onChange={handleChange}
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}

            <div className="relative">
                <Input
                    type={showPassword ? 'text' : 'password'}
                    label="Mot de passe"
                    name="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-9 text-gray-500"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
            )}
        </>
    );

    const renderRegisterForm = () => (
        <>
            <div className="relative mb-10">
                {/* Bannière */}
                <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image de bannière
                    </label>
                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative">
                        {previewBanner ? (
                            <img
                                src={previewBanner}
                                alt="Bannière"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Upload size={24} className="text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">
                                    Cliquez pour sélectionner une bannière
                                </p>
                            </div>
                        )}
                        <input
                            type="file"
                            name="banner"
                            accept="image/*"
                            onChange={handleChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    {formErrors.banner && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.banner}</p>
                    )}
                </div>

                {/* Photo de profil positionnée sur la bannière */}
                <div className="absolute right-4 -bottom-10">
                    <div className="w-20 h-20 border-2 border-white bg-white rounded-full overflow-hidden shadow-lg relative">
                        {previewImage ? (
                            <img
                                src={previewImage}
                                alt="Photo de profil"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Upload size={16} className="text-gray-400" />
                            </div>
                        )}
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Photo de profil
                        </label>
                    </div>
                    {formErrors.image && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>
                    )}
                </div>
            </div>

            <Input
                type="text"
                label="Nom d'utilisateur"
                name="username"
                placeholder="Super Pseudo Giga Cool"
                value={formData.username}
                onChange={handleChange}
            />
            {formErrors.username && (
                <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
            )}

            {renderLoginForm()}

            <div className="space-y-2">
                {renderCheckbox('acceptNotification', 'Accepter les notifications')}
                {renderCheckbox('acceptCamera', "Autoriser l'accès à la caméra")}
                {renderCheckbox('acceptTerms', "J'accepte les conditions d'utilisation")}
            </div>
        </>
    );

    return (
        <div className="w-full min-h-screen bg-black grid grid-cols-4">
            <div className="relative h-full hidden sm:block col-span-1 xl:col-span-2 2xl:col-span-3">
                <img
                    src={MockImage}
                    alt="Mock"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
            </div>
            <div className="flex items-center justify-center p-8 bg-white col-span-4 sm:col-span-3 xl:col-span-2 2xl:col-span-1">
                <div className="bg-white p-8 rounded-lg w-full max-w-md">
                    <p className="text-6xl font-bold text-center">TakeIt.</p>
                    <p className="text-xl font-semibold mb-4 text-center">
                        {isLogin ? 'Connexion' : 'Inscription'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isLogin ? renderLoginForm() : renderRegisterForm()}

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                            ) : isLogin ? (
                                'Se connecter'
                            ) : (
                                "S'inscrire"
                            )}
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm">
                        {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
                        <button
                            type="button"
                            onClick={toggleForm}
                            className="ml-1 text-black font-bold hover:underline cursor-pointer"
                        >
                            {isLogin ? "S'inscrire" : 'Se connecter'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
