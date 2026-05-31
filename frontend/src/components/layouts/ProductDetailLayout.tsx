import * as React from "react";

interface ProductDetailLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  categoryTabs?: React.ReactNode;
  subCategoryTabs?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

export function ProductDetailLayout({ 
  children, 
  header,
  categoryTabs,
  subCategoryTabs,
  breadcrumb,
}: ProductDetailLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full h-[60px] bg-[var(--primary-orange-400)] flex items-center justify-center">
        {header || <span className="text-white font-bold text-xl">Header</span>}
      </header>
      
      {/* Category Tabs */}
      <div className="w-full border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 h-[50px] flex items-center">
          {categoryTabs || <span className="text-gray-400">Category Tabs</span>}
        </div>
      </div>
      
      {/* Sub Category Tabs */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 h-[40px] flex items-center">
          {subCategoryTabs || <span className="text-gray-400 text-sm">Sub Category Tabs</span>}
        </div>
      </div>
      
      {/* Breadcrumb */}
      <div className="w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          {breadcrumb || <span className="text-gray-400 text-sm">Breadcrumb</span>}
        </div>
      </div>
      
      {/* Content */}
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6 pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
