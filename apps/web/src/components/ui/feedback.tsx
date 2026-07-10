import React from 'react';
import { Button } from './button';
import { Inbox, AlertTriangle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = <Inbox className="h-10 w-10 text-muted-foreground" />,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-border bg-zinc-50/50 dark:bg-zinc-950/10 min-h-[300px]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-border mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'There was a connection or server error. Please try again.',
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border border-red-200/20 bg-red-50/10 dark:bg-red-950/5 min-h-[300px]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100/50 dark:bg-red-950/20 border border-red-200/20 mb-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="border-red-200/30 hover:bg-red-500/10 hover:text-red-500">
          Try Again
        </Button>
      )}
    </div>
  );
};
