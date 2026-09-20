import React from "react";
import LoginComponent from "@/features/auth/components/LoginComponent";

export const metadata = {
  title: "Login - ZEFLIX",
  description: "Sign in to your ZEFLIX account to watch your favorite movies and series",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4 py-12 bg-black relative overflow-hidden">
      {/* Subtle Glow Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(44,165,102,0.08),transparent_65%)] pointer-events-none" />
      <div className="relative z-10 w-full flex justify-center">
        <LoginComponent />
      </div>
    </main>
  );
}

