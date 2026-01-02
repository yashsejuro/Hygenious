import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Hygenious - AI-Powered Cleanliness Inspection',
  description:
    'Transform any smartphone into an instant, unbiased hygiene auditor with AI-powered analysis',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
