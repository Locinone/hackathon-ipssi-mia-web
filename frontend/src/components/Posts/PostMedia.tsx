import { useState } from 'react';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface PostMediaProps {
    files: string[];
}

function PostMedia({ files }: PostMediaProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const openFullscreen = (imagePath: string) => {
        setSelectedImage(imagePath);
    };

    const closeFullscreen = () => {
        setSelectedImage(null);
    };

    return (
        <>
            <div className="w-3/4 mx-auto grid grid-cols-2 gap-2 rounded-xl overflow-hidden col-span-1">
                {files.map((item, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="overflow-hidden aspect-square"
                    >
                        {item.endsWith('.jpg') ||
                        item.endsWith('.png') ||
                        item.endsWith('.jpeg') ? (
                            <img
                                src={'http://localhost:3000' + item}
                                alt={`Media ${index + 1}`}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => openFullscreen('http://localhost:3000' + item)}
                            />
                        ) : item.endsWith('.mp4') ? (
                            <video
                                src={'http://localhost:3000' + item}
                                controls
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <p>Format non pris en charge</p>
                        )}
                    </motion.div>
                ))}
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                    onClick={closeFullscreen}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative max-w-[90%] max-h-[90vh]"
                    >
                        <img
                            src={selectedImage}
                            alt="Image en plein écran"
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                        <button
                            className="absolute top-4 right-4 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-100 transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                closeFullscreen();
                            }}
                        >
                            <X size={24} className="text-black" />
                        </button>
                    </motion.div>
                </div>
            )}
        </>
    );
}

export default PostMedia;
