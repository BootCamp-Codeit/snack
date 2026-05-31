"use client";

import { ProductRegisterHeader } from "./_components/product-register-header";
import { ProductRegisterTable } from "./_components/product-register-table";
import { HeaderWithCart } from "@/components/header/header-with-cart";
import Pagination from "@/components/ui/pagination";
import { useAuthHeader } from "@/hooks/use-auth-header";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useProductRegistrations } from "./_hooks/use-product-registrations";

/** 좌우 24px(`px-6`) + `max-w-[1680px]` → 375→327px, 744→696px, 넓은 화면에서 최대 1680px */
const PRODUCT_REGISTER_CONTENT_WIDTH = "mx-auto w-full max-w-[1680px]";

export default function ProductRegisterHistoryPage() {
  const { isLoggedIn, role } = useAuthHeader();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const {
    page,
    sort,
    sortOpen,
    setSortOpen,
    items,
    totalPages,
    loading,
    error,
    setPage,
    handleSortChange,
  } = useProductRegistrations();

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWithCart
        device={isMobile ? "mobile" : "pc"}
        isLoggedIn={isLoggedIn}
        role={role}
      />
      <main className="flex-1 bg-[#FBF8F4] pb-10 pt-6">
        <div className="px-6">
          <div className={PRODUCT_REGISTER_CONTENT_WIDTH}>
            <section>
              <ProductRegisterHeader
                sort={sort}
                onSortChange={handleSortChange}
                isSortOpen={sortOpen}
                onSortOpenChange={setSortOpen}
              />
              {error ? (
                <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              ) : (
                <ProductRegisterTable items={items} loading={loading} />
              )}
              {totalPages > 0 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    size="sm"
                  />
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
