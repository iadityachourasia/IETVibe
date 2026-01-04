import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { RouteGuard } from "@/components/providers/RouteGuard";
import { Header } from "@/components/layout/Header";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hackvento - Gamified Learning",
  description: "A gamified ecosystem that transforms group learning into an immersive adventure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <AuthProvider>
          <RouteGuard>
            <Header />
            <main className="pt-16">
              {children}
            </main>
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: '#1e293b', color: '#f8fafc' },
                success: { style: { background: '#10b981' } },
                error: { style: { background: '#ef4444' } }
              }}
            />
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
