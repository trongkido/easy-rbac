import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-2">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="block w-full bg-brand-surface border border-brand-border rounded-md shadow-sm py-2 px-3 text-brand-text-primary placeholder-brand-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-colors"
      />
    </div>
  );
};

export default Input;