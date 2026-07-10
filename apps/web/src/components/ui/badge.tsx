import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge = ({ className, variant = 'secondary', ...props }: BadgeProps) => {
  const baseStyles =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none';

  const variants = {
    primary: 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900',
    secondary: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-100',
    outline: 'border border-border text-foreground bg-transparent',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/20',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/20',
    danger: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200/20',
    info: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/20',
  };

  return <span className={twMerge(clsx(baseStyles, variants[variant], className))} {...props} />;
};
