import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Antigravity Review Tool | Investor Contact Cleaner',
  description: 'Clean, validate, and deduplicate buy-side analyst and PM contact lists with OCR verification and LinkedIn tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
