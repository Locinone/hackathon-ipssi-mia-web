import { motion } from 'framer-motion';

interface PostMediaProps {
    files: string[];
}

function PostMedia({ files }: PostMediaProps) {
    return (
        <div className="w-3/4 mx-auto grid grid-cols-2 gap-2 rounded-xl overflow-hidden col-span-1">
            {files.map((item, index) => (
                <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="overflow-hidden aspect-square"
                >
                    {item.endsWith('.jpg') || item.endsWith('.png') || item.endsWith('.jpeg') ? (
                        <img
                            src={'http://localhost:3000' + item}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover"
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
    );
}

export default PostMedia;
