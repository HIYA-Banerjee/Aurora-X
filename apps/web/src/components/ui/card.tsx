import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(
        'rounded-xl border border-border bg-card text-card-foreground shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge('flex flex-col gap-1.5 p-6 border-b border-border/40', className)} {...props} />
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={twMerge('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={twMerge('text-sm text-muted-foreground', className)} {...props} />
);
CardDescription.displayName = 'CardDescription';

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge('p-6', className)} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge('flex items-center p-6 border-t border-border/40 bg-zinc-50/50 dark:bg-zinc-950/20', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';
