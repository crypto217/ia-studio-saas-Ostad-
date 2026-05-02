import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const font = Nunito({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] });

export const metadata: Metadata = {
  title: 'LUDICLASS - Teacher Operating System',
  description: 'A modern SaaS platform for teachers',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ludiclass',
    startupImage: [
      {
        url: '/icon-512x512.png',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { AuthProvider } from '@/components/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClientLayout } from '@/components/layout/ClientLayout';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={font.className}>
      <body className="relative min-h-screen bg-slate-100/80 text-slate-900 antialiased selection:bg-sky-100 selection:text-sky-900 max-w-full w-full overflow-x-hidden" suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
