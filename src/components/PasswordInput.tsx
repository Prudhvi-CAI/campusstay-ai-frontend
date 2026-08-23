import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  showIcon?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  helperText,
  showIcon = true,
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full space-y-1">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {showIcon && (
          <Lock
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors"
          />
        )}

        <input
          {...props}
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`w-full ${
            showIcon ? 'pl-10' : 'pl-4'
          } pr-11 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border ${
            error
              ? 'border-rose-500/70 focus:ring-rose-500'
              : 'border-slate-200 dark:border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500'
          } text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 transition shadow-sm ${className}`}
        />

        <button
          type="button"
          onClick={toggleShowPassword}
          tabIndex={0}
          title={showPassword ? 'Hide password' : 'Show password'}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {showPassword ? (
            <EyeOff size={16} className="text-indigo-500 dark:text-indigo-400" />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{helperText}</p>
      )}
    </div>
  );
};
