import { forwardRef } from 'react';

const Textarea = forwardRef(
    (
        {
            placeholder = '',
            value,
            onChange,
            name,
            id,
            className = '',
            disabled = false,
            required = false,
            rows = 4,
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
                <textarea
                    ref={ref}
                    name={name}
                    id={id || name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    rows={rows}
                    className={`w-full bg-white border border-gray-200 rounded-lg py-2 px-3 
                    text-black focus:outline-none focus:ring-2 focus:ring-gray-300 
                    placeholder-gray-500 transition-colors resize-none
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${className}`}
                />
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
