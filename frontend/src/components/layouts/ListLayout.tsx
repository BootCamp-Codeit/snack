import * as React from "react";

interface ListLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  title?: React.ReactNode;
  sortDropdown?: React.ReactNode;
  pagination?: React.ReactNode;
}

export function ListLayout({ 
  children, 
  header,
  title,
  sortDropdown,
  pagination,
}: ListLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--primary-orange-100)] flex flex-col">
      {/* Header */}
      <header className="w-full h-[60px] bg-[var(--primary-orange-400)] flex items-center justify-center">
        {header || <span className="text-white font-bold text-xl">Header</span>}
      </header>
      
      {/* Content */}
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          {/* Title + Sort */}
          <div className="flex items-center justify-between mb-6">
            <div>
              {title || <span className="text-gray-400">Title</span>}
            </div>
            <div>
              {sortDropdown || <span className="text-gray-400">Sort</span>}
            </div>
          </div>
          
          {/* List Content */}
          <div className="bg-white rounded-lg">
            {children}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-8">
            {pagination || <span className="text-gray-400">Pagination</span>}
          </div>
        </div>
      </main>
    </div>
  );
}
