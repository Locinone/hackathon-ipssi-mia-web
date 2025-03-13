import { CommentSchema, commentSchema } from '@/schemas/postSchemas';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import Button from '../ui/Button';
import Textarea from '../ui/Textarea';

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
        defaultValues: {
            postId,
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-2">
            <Textarea
                {...register('content')}
                placeholder="Ajouter un commentaire"
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" className="w-full">
                Envoyer
            </Button>
        </form>
    );
}
