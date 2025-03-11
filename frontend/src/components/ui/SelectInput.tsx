import { ChangeEvent, SelectHTMLAttributes, forwardRef } from 'react';

import { ChevronDown } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectInputProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    options: SelectOption[];
    onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
    (
        {
            options = [],
            value,
            onChange,
            name,
            id,
            className = '',
            disabled = false,
            required = false,
            ...props
        },
        ref
    ) => {
        return (
            <div className="relative w-full">
                <select
                    ref={ref}
                    name={name}
                    id={id || name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    className={`w-full appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-10 
                text-black focus:outline-none focus:ring-2 focus:ring-gray-300 
                transition-colors cursor-pointer
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}`}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown size={20} className="text-gray-500" />
                </div>
            </div>
        );
    }
);

SelectInput.displayName = 'SelectInput';

export default SelectInput;
