import { InputHTMLAttributes, ReactNode } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helper?: string;
  error?: string;
};

export function Input({
  label,
  helper,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className={`form-input ${className}`}>
      {label && <label>{label}</label>}
      <input {...props} className='input-field' />
      {helper && <span className='input-helper'>{helper}</span>}
      {error && <span className='input-error'>{error}</span>}
    </div>
  );
}
