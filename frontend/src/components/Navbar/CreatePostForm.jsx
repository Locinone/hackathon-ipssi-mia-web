import { useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Image, Send, X } from 'lucide-react';

import { validateFiles, validatePostForm } from '../../schemas/postSchemas';
import postService from '../../services/postService';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';

const CreatePostForm = ({ isOpen, onClose }) => {
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleContentChange = (e) => {
        setContent(e.target.value);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const fileValidation = validateFiles(selectedFiles);

        if (!fileValidation.valid) {
            setError(fileValidation.error);
            return;
        }

        if (selectedFiles.length + files.length > 4) {
            setError('Vous ne pouvez pas télécharger plus de 4 fichiers');
            return;
        }

        setFiles([...files, ...selectedFiles]);
        setError(null);
    };

    const removeFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const validation = validatePostForm({ content, files });

        if (!validation.success) {
            setError(Object.values(validation.error)[0]);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await postService.createPost({ content, files });

            if (response.error) {
                setError(response.error);
            } else {
                setSuccess(true);
                setContent('');
                setFiles([]);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                }, 1500);
            }
        } catch (err) {
            setError('Une erreur est survenue lors de la création du post');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative w-full max-w-2xl bg-black/20 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-800"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-3xl font-bold text-white">Créer un nouveau post</h2>
                            <Button
                                variant="outline"
                                className="p-2 rounded-full"
                                onClick={onClose}
                            >
                                <X size={20} />
                            </Button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg flex items-center gap-2 border border-red-800">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-900/50 text-green-300 rounded-lg border border-green-800">
                                Post créé avec succès!
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <Textarea
                                    placeholder="Qu'avez-vous en tête?"
                                    value={content}
                                    onChange={handleContentChange}
                                    rows={5}
                                    required
                                    highlightHashtags={true}
                                    className="bg-black/50"
                                />
                            </div>

                            {files.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium mb-2 text-gray-300">
                                        Fichiers ({files.length}/4)
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {files.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <div className="h-24 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center">
                                                    {file.type.startsWith('image/') ? (
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`Aperçu ${index}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <video
                                                            src={URL.createObjectURL(file)}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={files.length >= 4 || isSubmitting}
                                >
                                    <Image size={18} />
                                    <span>Ajouter des médias</span>
                                </Button>

                                <Button
                                    type="submit"
                                    variant="default"
                                    disabled={!content.trim() || isSubmitting}
                                >
                                    <Send size={18} />
                                    <span>Publier</span>
                                </Button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
                                    multiple
                                    className="hidden"
                                />
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreatePostForm;
