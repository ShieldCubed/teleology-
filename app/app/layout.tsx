import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppWalletProvider } from '../components/WalletProvider';
import { Navbar } from '../components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Teleology — MekongDelta',
  description: 'Prediction markets for AGI universes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + ' bg-gray-950 min-h-screen'}>
        <AppWalletProvider>
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        </AppWalletProvider>
      </body>
    </html>
  );
}
