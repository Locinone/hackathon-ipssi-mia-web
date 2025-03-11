import { ChangeEvent, InputHTMLAttributes, ReactNode, forwardRef, useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    icon?: ReactNode;
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            type = 'text',
            placeholder = '',
            value,
            onChange,
            name,
            id,
            className = '',
            icon,
            disabled = false,
            required = false,
            autoComplete = 'off',
            label = '',
            error = '',
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';

        return (
            <div className="relative w-full">
                {label && (
                    <label
                        htmlFor={id || name}
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {label}
                    </label>
                )}
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                        {icon}
                    </div>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        type={isPassword ? (showPassword ? 'text' : 'password') : type}
                        name={name}
                        id={id || name}
                        placeholder={isPassword ? '********' : placeholder}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        required={required}
                        autoComplete={autoComplete}
                        className={`w-full bg-white border border-gray-200 rounded-lg py-2 px-3 
                    ${icon ? 'pl-10' : 'pl-3'} 
                    ${isPassword ? 'pr-10' : 'pr-3'}
                    text-black focus:outline-none focus:ring-2 focus:ring-gray-300 
                    placeholder-gray-500 transition-colors
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${className}`}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    )}
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
