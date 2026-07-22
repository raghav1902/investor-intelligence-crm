import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';
import { AuthProvider } from '@/components/AuthProvider';
import { TransitionProvider } from '@/components/TransitionProvider';


export const metadata: Metadata = {
  title: 'InvestorIQ CRM Studio | AI-Powered Investor Contact Intelligence',
  description: 'Clean, validate, and deduplicate buy-side analyst and PM contact lists with AI-powered OCR verification and deduplication.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#0a0a0c] text-[#d0d6e0] antialiased selection:bg-emerald-500 selection:text-[#010102] font-sans">
          <AuthProvider>
            <ToastProvider>
              <TransitionProvider>
                {children}
              </TransitionProvider>
            </ToastProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
