import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          {label}
        </label>
        <input
          ref={ref}
          className={`px-3 py-2.5 border rounded-lg outline-none text-sm font-medium transition-colors ${
            error
              ? 'border-red-400 bg-red-50/30 text-text-primary focus:border-red-400 focus:ring-2 focus:ring-red-400/30'
              : 'border-border bg-surface text-text-primary placeholder-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/40'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-[11px] font-semibold text-red-500">{error}</span>}
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';
