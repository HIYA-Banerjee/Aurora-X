'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Select Component ---
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, options, ...props }, ref) => {
    const selectId = React.useId();
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={twMerge(
            clsx(
              'flex h-10 w-full rounded-lg border border-input bg-card text-foreground px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 cursor-pointer',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// --- Checkbox Component ---
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    const checkboxId = React.useId();
    return (
      <div className="flex items-center gap-2 select-none cursor-pointer">
        <input
          id={checkboxId}
          ref={ref}
          type="checkbox"
          className={twMerge(
            'h-4 w-4 rounded border-input text-primary bg-transparent focus:ring-2 focus:ring-ring focus:ring-offset-2 accent-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer',
            className
          )}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="text-sm font-medium leading-none cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// --- Radio Component ---
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, ...props }, ref) => {
    const radioId = React.useId();
    return (
      <div className="flex items-center gap-2 select-none cursor-pointer">
        <input
          id={radioId}
          ref={ref}
          type="radio"
          className={twMerge(
            'h-4 w-4 border-input text-primary bg-transparent focus:ring-2 focus:ring-ring focus:ring-offset-2 accent-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer',
            className
          )}
          {...props}
        />
        {label && (
          <label htmlFor={radioId} className="text-sm font-medium leading-none cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Radio.displayName = 'Radio';

// --- Switch (Toggle) Component ---
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, checked, onChange, ...props }, ref) => {
    const switchId = React.useId();
    return (
      <div className="flex items-center gap-3 select-none cursor-pointer">
        <label htmlFor={switchId} className="relative inline-flex items-center cursor-pointer">
          <input
            id={switchId}
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100 dark:after:bg-zinc-950 transition-colors duration-200" />
        </label>
        {label && (
          <label htmlFor={switchId} className="text-sm font-medium leading-none cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Switch.displayName = 'Switch';
