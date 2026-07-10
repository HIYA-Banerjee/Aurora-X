'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Brain, Sun, Moon, Laptop, User, LogOut, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../store/ui-store';
import { useTheme } from '../../context/theme-context';
import { useAuth } from '../../context/auth-context';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CommandAction {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  perform: () => void;
  shortcut?: string[];
}

export default function CommandPalette() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when palette opens
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setSearch('');
    }
  }, [commandPaletteOpen]);

  // Capture Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const actions: CommandAction[] = [
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      category: 'Navigation',
      icon: <Brain className="h-4 w-4" />,
      perform: () => router.push('/dashboard'),
    },
    {
      id: 'create-memory',
      label: 'Create New Memory',
      category: 'Memories',
      icon: <Brain className="h-4 w-4 text-emerald-500" />,
      perform: () => router.push('/dashboard/memories/new'),
    },
    {
      id: 'theme-light',
      label: 'Set Light Theme',
      category: 'Appearance',
      icon: <Sun className="h-4 w-4 text-amber-500" />,
      perform: () => setTheme('light'),
    },
    {
      id: 'theme-dark',
      label: 'Set Dark Theme',
      category: 'Appearance',
      icon: <Moon className="h-4 w-4 text-indigo-500" />,
      perform: () => setTheme('dark'),
    },
    {
      id: 'theme-system',
      label: 'Set System Theme',
      category: 'Appearance',
      icon: <Laptop className="h-4 w-4" />,
      perform: () => setTheme('system'),
    },
    {
      id: 'profile',
      label: 'View Profile',
      category: 'Account',
      icon: <User className="h-4 w-4" />,
      perform: () => router.push('/dashboard/profile'),
    },
    {
      id: 'logout',
      label: 'Log Out Session',
      category: 'Account',
      icon: <LogOut className="h-4 w-4 text-red-500" />,
      perform: logout,
    },
  ];

  // Filter actions
  const filtered = actions.filter((act) =>
    act.label.toLowerCase().includes(search.toLowerCase()) ||
    act.category.toLowerCase().includes(search.toLowerCase())
  );

  // Navigate using keys
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].perform();
        setCommandPaletteOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs"
          />

          {/* Palette body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl glass flex flex-col"
          >
            {/* Search Input */}
            <div className="relative flex items-center border-b border-border/40 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or action..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="text-[10px] font-semibold border border-border px-1.5 py-0.5 rounded bg-muted/40 cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Actions List */}
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
              {filtered.length > 0 ? (
                filtered.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.perform();
                        setCommandPaletteOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={twMerge(
                        clsx(
                          'flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer',
                          isSelected
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground font-semibold'
                            : 'text-muted-foreground'
                        )
                      )}
                    >
                      {item.icon}
                      <span className="flex-1 truncate">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded font-semibold">
                        {item.category}
                      </span>
                      {isSelected && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                  );
                })
              ) : (
                <div className="text-center text-sm text-muted-foreground py-6">
                  No matching commands found.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
