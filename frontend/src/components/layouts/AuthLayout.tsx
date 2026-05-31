import * as React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

export function AuthLayout({ children, header }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--primary-orange-100)]">
      {/* Header */}
      <header className="w-full h-[60px] bg-[var(--primary-orange-400)] flex items-center justify-center">
        {header || <span className="text-white font-bold text-xl">Header</span>}
      </header>
      
      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[500px]">
          {children}
        </div>
      </main>
    </div>
  );
}
