import { motion } from 'framer-motion';

const Button = ({
    children,
    onClick,
    type = 'button',
    className = '',
    disabled = false,
    variant = 'default',
}) => {
    const baseStyles =
        'font-medium rounded-lg py-2 px-4 transition-colors flex items-center justify-center gap-2';

    const variantStyles = {
        default: 'bg-white text-black hover:bg-gray-100',
        primary: 'bg-black text-white hover:bg-zinc-800',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'bg-transparent border border-white text-white hover:bg-white/10',
    };

    const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${className}`;

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={`${buttonStyles} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </motion.button>
    );
};

export default Button;
