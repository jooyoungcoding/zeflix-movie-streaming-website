import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/Providers/Toast-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthRequiredModal from "@/components/AuthRequiredModal";

export const metadata: Metadata = {
  title: "Zeflix - Movie & Series Streaming",
  description: "Watch your favorite movies and TV shows online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground flex flex-col antialiased transition-colors duration-200">
        <ToastProvider />
        <AuthRequiredModal />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
