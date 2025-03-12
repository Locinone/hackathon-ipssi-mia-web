import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { UpdateUserFormData, updateUserSchema } from '../schemas/authSchemas';
import Button from './ui/Button';
import Input from './ui/Input';

const ProfileEditForm = ({
    onSubmit,
    initialData,
}: {
    onSubmit: (data: UpdateUserFormData) => void;
    initialData: UpdateUserFormData;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UpdateUserFormData>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: initialData,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="mb-4">
                <Input label="Nom" {...register('name')} error={errors.name?.message} />
            </div>

            <div className="mb-4">
                <Input
                    label="Nom d'utilisateur"
                    {...register('username')}
                    error={errors.username?.message}
                />
            </div>

            <div className="mb-4">
                <Input
                    label="Biographie"
                    {...register('biography')}
                    error={errors.biography?.message}
                />
            </div>

            <div className="mb-4">
                <Input
                    label="Location"
                    {...register('location')}
                    error={errors.location?.message}
                />
            </div>

            <div className="mb-4">
                <Input label="Lien" {...register('link')} error={errors.link?.message} />
            </div>

            <Button type="submit" variant="primary" className="w-full">
                Enregistrer
            </Button>
        </form>
    );
};

export default ProfileEditForm;
