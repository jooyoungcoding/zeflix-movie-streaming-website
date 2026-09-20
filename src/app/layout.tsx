import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/Providers/Toast-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "ZEFLIX - Movie & Series Streaming",
  description: "Watch your favorite movies and TV shows online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07090e] text-white flex flex-col antialiased">
        <ToastProvider />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
