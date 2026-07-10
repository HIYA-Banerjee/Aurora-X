'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { useUIStore } from '../../store/ui-store';
import { useTheme } from '../../context/theme-context';
import {
  Brain,
  LayoutDashboard,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Settings,
  User as UserIcon,
  ShieldAlert,
  LogOut,
  Menu,
  ChevronLeft,
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { Breadcrumbs, BreadcrumbItem } from '../ui/navigation';
import { Dropdown } from '../ui/popups';
import { twMerge } from 'tailwind-merge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Memories', href: '/dashboard/memories', icon: Brain },
  { label: 'Stories', href: '/dashboard/stories', icon: BookOpen },
  { label: 'Photos', href: '/dashboard/photos', icon: ImageIcon },
  { label: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
  { label: 'Recommendations', href: '/dashboard/recommendations', icon: Sparkles },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Profile', href: '/dashboard/profile', icon: UserIcon },
  { label: 'Admin Logs', href: '/dashboard/admin', icon: ShieldAlert, adminOnly: true },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { sidebarCollapsed, toggleSidebar, setCommandPaletteOpen } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Dynamic breadcrumbs based on pathname
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }];

    let currentHref = '';
    paths.forEach((p, idx) => {
      if (p === 'dashboard') return;
      currentHref += `/${p}`;
      const label = p.charAt(0).toUpperCase() + p.slice(1);
      items.push({
        label,
        href: `/dashboard${currentHref}`,
        active: idx === paths.length - 1,
      });
    });

    return items;
  };

  const themeOptions = [
    { label: 'Light Theme', icon: <Sun className="h-4 w-4" />, onClick: () => setTheme('light') },
    { label: 'Dark Theme', icon: <Moon className="h-4 w-4" />, onClick: () => setTheme('dark') },
    { label: 'System Defaults', icon: <Laptop className="h-4 w-4" />, onClick: () => setTheme('system') },
  ];

  const profileOptions = [
    { label: 'My Profile', icon: <UserIcon className="h-4 w-4" />, onClick: () => {} },
    { label: 'Preferences', icon: <Settings className="h-4 w-4" />, onClick: () => {} },
    { label: 'Log Out', icon: <LogOut className="h-4 w-4" />, onClick: logout, variant: 'danger' as const },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* --- Sidebar Desktop --- */}
      <aside
        className={twMerge(
          'hidden md:flex flex-col border-r border-border bg-card/50 backdrop-blur-md transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-border/40">
          {!sidebarCollapsed && (
            <span className="font-extrabold tracking-tighter bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              AURORA-X
            </span>
          )}
          {sidebarCollapsed && <Brain className="h-5 w-5 text-primary animate-pulse mx-auto" />}
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
          >
            <ChevronLeft className={twMerge('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== 'ADMIN') return null;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={twMerge(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border/40 flex items-center justify-between">
          <Dropdown
            trigger={
              <button className="flex items-center gap-3 text-left w-full hover:bg-muted/40 p-1.5 rounded-lg transition-colors cursor-pointer">
                <Avatar src={user?.avatar} name={user?.displayName || user?.email} size="sm" />
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate text-foreground">
                      {user?.displayName || user?.email}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase font-semibold">
                      {user?.role}
                    </p>
                  </div>
                )}
              </button>
            }
            items={profileOptions}
          />
        </div>
      </aside>

      {/* --- Sidebar Mobile Drawer --- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          <aside className="relative flex flex-col w-64 h-full bg-card border-r border-border p-4 shadow-xl z-10 glass animate-slide-in">
            <div className="flex h-14 items-center justify-between mb-4 border-b border-border/40">
              <span className="font-extrabold tracking-tighter text-lg">AURORA-X</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 hover:bg-muted text-muted-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                if (item.adminOnly && user?.role !== 'ADMIN') return null;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={twMerge(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border/40 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar src={user?.avatar} name={user?.displayName || user?.email} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{user?.displayName || user?.email}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{user?.role}</p>
                </div>
              </div>
              <button onClick={logout} className="p-1.5 hover:bg-muted rounded-md text-red-500">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* --- Main Content Area --- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-b border-border/40 px-4 bg-card/20 backdrop-blur-md">
          {/* Left Side: Mobile Menu Toggle + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden rounded-md p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <Breadcrumbs items={getBreadcrumbs()} />
            </div>
          </div>

          {/* Right Side: Global Search + Notifications + Theme */}
          <div className="flex items-center gap-3">
            {/* Search Input Trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border/80 px-3 py-1.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors w-40 sm:w-56 text-left cursor-pointer focus:outline-none"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search memories...</span>
              <kbd className="hidden sm:inline-block ml-auto border border-border bg-card px-1.5 py-0.5 rounded text-[10px] font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Theme Swapping Toggler */}
            <Dropdown
              trigger={
                <button className="rounded-lg p-2 hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none">
                  {theme === 'light' && <Sun className="h-4 w-4" />}
                  {theme === 'dark' && <Moon className="h-4 w-4" />}
                  {theme === 'system' && <Laptop className="h-4 w-4" />}
                </button>
              }
              items={themeOptions}
            />

            {/* Notification Alert Toggle */}
            <button className="relative rounded-lg p-2 hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-background animate-pulse" />
            </button>
          </div>
        </header>

        {/* Dashboard Work Panel Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-radial from-zinc-50/50 to-white dark:from-zinc-950/20 dark:to-zinc-900/10">
          <div className="max-w-7xl mx-auto h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
