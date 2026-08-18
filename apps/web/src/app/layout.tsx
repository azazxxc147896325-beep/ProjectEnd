import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { Providers } from '@/lib/providers';

export const metadata: Metadata = {
  title: 'Campus Food - Web App & Vendor Portal',
  description: 'ระบบจัดการร้านอาหารและคิวออเดอร์ในมหาวิทยาลัยแบบ Real-time พร้อม AI Copilot',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Campus Food',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="th" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

