import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { QueryProvider } from '@/lib/query-client';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { I18nProvider } from '@/lib/i18n';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OpenClaw Manager',
  description: 'Web-based management platform for OpenClaw AI Gateway and Agent system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <I18nProvider>
            <QueryProvider>
              <div className="min-h-screen">
                <Header />
                <main className="container py-6">
                  {children}
                </main>
              </div>
              <Toaster />
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
