import * as React from "react";

interface DetailLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  title?: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function DetailLayout({ 
  children, 
  header,
  title,
  sidebar,
}: DetailLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--primary-orange-100)] flex flex-col">
      {/* Header */}
      <header className="w-full h-[60px] bg-[var(--primary-orange-400)] flex items-center justify-center">
        {header || <span className="text-white font-bold text-xl">Header</span>}
      </header>
      
      {/* Content */}
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          {/* Title */}
          <div className="mb-6">
            {title || <span className="text-gray-400">Title</span>}
          </div>
          
          {/* Main Content + Sidebar */}
          <div className="flex gap-8">
            {/* Left: Main Content */}
            <div className="flex-1">
              {children}
            </div>
            
            {/* Right: Sidebar */}
            <div className="w-[320px] flex-shrink-0">
              {sidebar || <span className="text-gray-400">Sidebar</span>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
