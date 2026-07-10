import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '../providers/query-provider';
import { ThemeProvider } from '../context/theme-context';
import { AuthProvider } from '../context/auth-context';
import AuthGuard from '../components/layout/auth-guard';
import { ToastContainer } from '../components/ui/toast-container';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Aurora-X — Memory Experience Platform',
  description: 'AI-guided Memory Journal and digital workspace.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <AuthGuard>
                {children}
                <ToastContainer />
              </AuthGuard>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
