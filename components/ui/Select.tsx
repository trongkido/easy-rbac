import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, options, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-2">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className="block w-full bg-brand-surface border border-brand-border rounded-md shadow-sm py-2 px-3 text-brand-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;