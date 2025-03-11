import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { LoginFormData, loginSchema } from '../../schemas/authSchemas';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface LoginFormProps {
    onSubmit: (data: LoginFormData) => void;
    error: string | null;
}

const LoginForm = ({ onSubmit, error }: LoginFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="mb-4">
                <Input {...register('email')} placeholder="Email" error={errors.email?.message} />
            </div>

            <div className="relative mb-4">
                <Input
                    {...register('password')}
                    placeholder="Mot de passe"
                    error={errors.password?.message}
                    type={'password'}
                />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={status === 'loading'}
            >
                {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                    'Se connecter'
                )}
            </Button>
        </form>
    );
};

export default LoginForm;
