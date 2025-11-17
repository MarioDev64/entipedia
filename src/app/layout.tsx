import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { Header } from '@/components/Header';
import { MobileHeader } from '@/components/MobileHeader';
import { Sidebar } from '@/components/Sidebar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { MainContent } from '@/components/MainContent';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Providers } from '@/components/Providers';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Entipedia - Modern SaaS Dashboard',
  description:
    'Manage your projects, clients, and files with Entipedia - a modern SaaS dashboard',
  authors: [{ name: 'Entipedia' }],
  openGraph: {
    title: 'Entipedia - Modern SaaS Dashboard',
    description:
      'Manage your projects, clients, and files with Entipedia - a modern SaaS dashboard',
    type: 'website',
    images: ['https://lovable.dev/opengraph-image-p98pqg.png'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Lovable',
    images: ['https://lovable.dev/opengraph-image-p98pqg.png'],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <div className="bg-background min-h-screen">
              <Header />
              <MobileHeader />
              <Sidebar />
              <MainContent>{children}</MainContent>
              <BottomNavigation />
            </div>
            <Toaster />
            <Sonner />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
