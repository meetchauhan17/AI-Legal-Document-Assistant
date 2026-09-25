import type { Metadata } from 'next';
import './globals.css';
import { DocumentProvider } from '@/context/DocumentContext';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Legal Document Assistant',
  description: 'AI-powered legal document analysis and retrieval assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text-primary antialiased flex flex-col">
        <DocumentProvider>
          <NavBar />
          <div className="flex-1">{children}</div>
        </DocumentProvider>
      </body>
    </html>
  );
}
