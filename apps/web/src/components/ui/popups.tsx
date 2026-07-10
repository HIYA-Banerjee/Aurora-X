'use client';

import React, { useState, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

// --- Click Outside Hook ---
const useClickOutside = (ref: React.RefObject<HTMLElement | null>, callback: () => void) => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};

// --- Dropdown Component ---
export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
}

export const Dropdown = ({ trigger, items, className }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={twMerge(
            'absolute right-0 mt-2 w-48 origin-top-right rounded-lg border border-border bg-card shadow-lg ring-1 ring-black/5 focus:outline-none z-30 glass py-1',
            className
          )}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={twMerge(
                'flex w-full items-center gap-2 px-4 py-2 text-sm text-left font-medium transition-colors cursor-pointer',
                item.variant === 'danger'
                  ? 'text-red-600 hover:bg-red-500/10 hover:text-red-500'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Popover Component ---
interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Popover = ({ trigger, children, className }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={twMerge(
            'absolute right-0 mt-2 p-4 rounded-lg border border-border bg-card shadow-lg z-30 glass min-w-[200px]',
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// --- Tooltip Component ---
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = ({ content, children, position = 'top' }: TooltipProps) => {
  const [show, setShow] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          className={twMerge(
            'absolute z-40 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 border border-border font-medium shadow-sm transition-all duration-200 pointer-events-none',
            positionStyles[position]
          )}
        >
          {content}
        </span>
      )}
    </div>
  );
};
