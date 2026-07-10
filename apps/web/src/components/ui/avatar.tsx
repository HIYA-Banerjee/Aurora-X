'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar = ({ className, src, alt = 'Avatar', name, size = 'md', ...props }: AvatarProps) => {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const getInitials = (text?: string) => {
    if (!text) return 'U';
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={twMerge(
        clsx(
          'relative flex shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold items-center justify-center border border-border select-none',
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitials(name || alt)}</span>
      )}
    </div>
  );
};
