'use client';

import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'input-error',
              className
            )}
            style={
              ['date', 'month', 'datetime-local', 'time', 'week'].includes(props.type ?? '')
                ? { colorScheme: 'light', ...props.style }
                : props.style
            }
            {...props}
          />
          {rightIcon && (
            <span className="text-muted-foreground absolute top-1/2 right-3.5 -translate-y-1/2">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="form-error">{error}</p>}
        {!error && hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn('input resize-none', error && 'input-error', className)}
          {...props}
        />
        {error && <p className="form-error">{error}</p>}
        {!error && hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn('input', error && 'input-error', className)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  width?: 'auto' | 'full';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  label,
  error,
  className,
  disabled,
  width = 'full',
}) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn(width === 'auto' ? 'inline-block' : 'w-full', className)}>
      {label && <label className="label">{label}</label>}
      <div className="relative" ref={ref}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'input flex cursor-pointer items-center justify-between text-left',
            error && 'input-error',
            !selected && 'text-foreground-subtle',
            disabled && 'pointer-events-none opacity-50'
          )}
        >
          <span className="min-w-0 flex-1 truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown
            size={14}
            className={cn(
              'text-muted-foreground ml-2 shrink-0 transition-transform duration-150',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <div className="bg-surface border-border animate-scale-in absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded border">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'transition-micro flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm',
                  option.value === value
                    ? 'bg-primary-light text-primary font-medium'
                    : 'text-foreground hover:bg-[hsl(var(--surface-raised))]'
                )}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                <Check
                  size={13}
                  className={cn('shrink-0', option.value === value ? 'opacity-100' : 'opacity-0')}
                />
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};
