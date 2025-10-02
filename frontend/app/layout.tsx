import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Layout from '@/components/Layout/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Strive - Platform Belajar Karier',
  description: 'Platform belajar untuk mengembangkan karier dengan roadmap, tantangan, dan komunitas yang mendukung.',
  keywords: 'belajar, karier, programming, data science, frontend, backend, skill development',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
