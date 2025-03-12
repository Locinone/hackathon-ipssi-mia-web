import { LoginFormData } from '@/schemas/authSchemas';
import { useLoginUser, useRegisterUser } from '@/services/queries/userQueries';

import { useState } from 'react';

import MockImage from '../assets/mock.jpg';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';

const Login = () => {
    const {
        mutate: registerUser,
        isPending: isRegisterPending,
        isError: isRegisterError,
    } = useRegisterUser();

    const { mutate: loginUser, isPending: isLoginPending, isError: isLoginError } = useLoginUser();

    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = (data: LoginFormData) => {
        setError(null);
        loginUser(data);
    };

    const handleRegister = (data: FormData) => {
        setError(null);
        registerUser(data, {
            onSuccess: () => {
                setIsLogin(true);
            },
            onError: (error) => {
                setError(error.message);
            },
        });
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

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

                    {isRegisterError ? (
                        <p className="text-red-500 text-center">Erreur lors de l'inscription</p>
                    ) : null}
                    {isLoginError ? (
                        <p className="text-red-500 text-center">Erreur lors de la connexion</p>
                    ) : null}
                    {isLogin ? (
                        <LoginForm onSubmit={handleLogin} error={error} />
                    ) : (
                        <RegisterForm onSubmit={handleRegister} error={error} />
                    )}

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
