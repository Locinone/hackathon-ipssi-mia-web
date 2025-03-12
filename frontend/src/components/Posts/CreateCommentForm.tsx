import { CommentSchema, commentSchema } from '@/schemas/postSchemas';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

interface CreateCommentFormProps {
    postId: string;
    onSubmit: (data: CommentSchema) => void;
}

export default function CreateCommentForm({ postId, onSubmit }: CreateCommentFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CommentSchema>({
        resolver: zodResolver(commentSchema),
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row items-center gap-2">
            <input
                {...register('content')}
                placeholder="Ajouter un commentaire"
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
                Envoyer
            </button>
        </form>
    );
}
