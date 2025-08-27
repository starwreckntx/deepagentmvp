
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '@/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DeepAgent MVP - AI Governance Verification Protocol',
  description: 'Professional verification system for AI governance insights using 3-phase workflow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
              {children}
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
