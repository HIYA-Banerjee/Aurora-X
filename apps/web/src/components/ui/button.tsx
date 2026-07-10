'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={twMerge('animate-spin h-4 w-4 text-current', className)}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer';

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800',
      outline: 'border border-border bg-transparent text-foreground hover:bg-muted hover:border-zinc-400 dark:hover:border-zinc-600',
      subtle: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-100 dark:hover:bg-zinc-800',
      ghost: 'bg-transparent text-foreground hover:bg-muted',
      danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-900/80 dark:text-red-100 dark:hover:bg-red-900 shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading && <Spinner />}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      disabled,
      icon,
      'aria-label': ariaLabel,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer';

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800',
      outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
      subtle: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-100 dark:hover:bg-zinc-800',
      ghost: 'bg-transparent text-foreground hover:bg-muted',
      danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-900/80 dark:text-red-100 dark:hover:bg-red-900 shadow-sm',
    };

    const sizes = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? <Spinner /> : icon}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

export const LoadingOverlay = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-8 w-8 text-primary" />
        <span className="text-sm font-medium text-muted-foreground animate-pulse">Loading Aurora-X...</span>
      </div>
    </div>
  );
};
