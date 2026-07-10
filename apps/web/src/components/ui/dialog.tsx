'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './button';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PortalProps {
  children: React.ReactNode;
}

const Portal = ({ children }: PortalProps) => {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className={twMerge(
                'relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xl glass',
                className
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
                {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
                <button
                  onClick={onClose}
                  className="rounded-md text-muted-foreground hover:text-foreground hover:bg-muted p-1 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Content */}
              <div className="max-h-[70vh] overflow-y-auto pr-1">{children}</div>
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  );
};

export const Dialog = Modal;

interface SheetProps extends ModalProps {
  side?: 'left' | 'right';
}

export const Sheet = ({ isOpen, onClose, title, children, side = 'right', className }: SheetProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const slideVariants = {
    left: { x: '-100%' },
    right: { x: '100%' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />
            {/* Slide Sheet */}
            <motion.div
              initial={slideVariants[side]}
              animate={{ x: 0 }}
              exit={slideVariants[side]}
              transition={{ type: 'tween', duration: 0.25 }}
              className={twMerge(
                clsx(
                  'relative z-10 flex flex-col h-full w-full max-w-sm border-y-0 bg-card p-6 shadow-xl glass',
                  side === 'left' ? 'border-r border-border left-0 mr-auto' : 'border-l border-border right-0 ml-auto'
                ),
                className
              )}
            >
              <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
                {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
                <button
                  onClick={onClose}
                  className="rounded-md text-muted-foreground hover:text-foreground hover:bg-muted p-1 transition-colors cursor-pointer"
                  aria-label="Close sheet"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  );
};

export const Drawer = Sheet;

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  isLoading?: boolean;
}

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}: ConfirmationDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
