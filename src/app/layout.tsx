import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'bankingcrm',
  description: 'Created with Next.js',
};

import { InsforgeProvider } from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <InsforgeProvider>
          {children}
        </InsforgeProvider>
      </body>
    </html>
  );
}
