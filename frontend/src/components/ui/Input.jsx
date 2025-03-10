import { forwardRef } from 'react';

const Input = forwardRef(
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
        },
        ref
    ) => {
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
                <input
                    ref={ref}
                    type={type}
                    name={name}
                    id={id || name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    autoComplete={autoComplete}
                    className={`w-full bg-white border border-gray-200 rounded-lg py-2 px-3 
                ${icon ? 'pl-10' : 'pl-3'} 
                text-black focus:outline-none focus:ring-2 focus:ring-gray-300 
                placeholder-gray-500 transition-colors
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}`}
                />
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
