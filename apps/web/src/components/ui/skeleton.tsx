import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={twMerge(
        'relative overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>
  );
};

export const SkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex flex-col gap-3 rounded-xl border border-border p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
