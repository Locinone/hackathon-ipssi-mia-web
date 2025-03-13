import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'default' | 'primary' | 'secondary' | 'danger' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    className?: string;
}

const Button = ({
    children,
    onClick,
    type = 'button',
    className = '',
    disabled = false,
    variant = 'default',
    ...props
}: ButtonProps) => {
    const baseStyles =
        'font-medium rounded-lg py-2 px-4 transition-colors flex items-center justify-center gap-2';

    const variantStyles: Record<ButtonVariant, string> = {
        default: 'bg-white text-black hover:bg-gray-200',
        primary: 'bg-black text-white hover:bg-zinc-800',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'bg-transparent border border-white text-white hover:bg-white/10',
    };

    const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${className}`;

    return (
        <button
            type={type}
            onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
            disabled={disabled}
            className={`${buttonStyles} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
