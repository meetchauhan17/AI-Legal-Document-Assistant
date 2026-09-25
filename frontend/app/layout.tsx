import type { Metadata } from 'next';
import { DM_Sans, Nunito } from 'next/font/google';
import './globals.css';
import { DocumentProvider } from '@/context/DocumentContext';
import NavBar from '@/components/NavBar';
import ClayBlobs from '@/components/ClayBlobs';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Legal Document Assistant',
  description: 'High-Fidelity Claymorphic Legal Document Analysis, Q&A, and Comparison Assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${nunito.variable}`}>
      <body className="min-h-screen bg-clay-canvas text-clay-foreground font-sans antialiased flex flex-col relative selection:bg-clay-accent/20 selection:text-clay-accent">
        <ClayBlobs />
        <DocumentProvider>
          <NavBar />
          <div className="flex-1 relative z-10">{children}</div>
        </DocumentProvider>
      </body>
    </html>
  );
}
