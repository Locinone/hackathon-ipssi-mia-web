import { ChangeEvent, TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    label?: string;
    highlightHashtags?: boolean;
    error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
            highlightHashtags = false,
            error = '',
            ...props
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
                    className={`w-full text-white border border-gray-200 rounded-lg py-2 px-3 
                    focus:outline-none focus:ring-2 focus:ring-gray-300 
                    placeholder-white transition-colors resize-none
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${className}`}
                    {...props}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
