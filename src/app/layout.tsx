import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import './globals.css';

export const metadata: Metadata = {
  title: `${siteConfig.name} | Terrenos, Propiedades & CRM de Comisiones`,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full bg-slate-50">
      <body className="h-full text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
