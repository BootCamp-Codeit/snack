"use client"

import { useState } from "react"
import Pagination from "@/components/ui/pagination"
import { useAuthHeader } from "@/hooks/use-auth-header"
import { ProductListAddProductButton } from "./_components/productlist-add-product-button"
import { ProductRegisterModal } from "./_components/product-register-modal"
import { ProductListFilters } from "./_components/productlist-filters"
import { ProductListGrid } from "./_components/productlist-grid"
import { ProductListHeader } from "./_components/productlist-header"
import { ProductListGlobalHeader } from "./_components/productlist-global-header"
import { PRODUCT_LIST_MAIN_PADDING_X } from "./_lib/layout"
import { useProducts } from "./_hooks/use-products"

export default function ProductListPage() {
  const { role } = useAuthHeader()
  const canManage = role === "admin" || role === "superAdmin"

  const {
    keyword,
    categories,
    subCategories,
    catalogRows,
    categoriesError,
    selectedCategoryId,
    selectedSubCategoryId,
    sort,
    sortLabel,
    sortOptions,
    page,
    products,
    totalPages,
    loading,
    error,
    setPage,
    setKeyword,
    setCategory,
    setSubCategory,
    setSort,
    refreshProductList,
    refreshCategories,
  } = useProducts()

  const [registerModalOpen, setRegisterModalOpen] = useState(false)

  const handleOpenRegisterModal = () => {
    setRegisterModalOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF8F4] [scrollbar-gutter:stable]">
      <ProductListGlobalHeader />

      <main className="flex w-full min-w-0 flex-1 flex-col pb-6 md:pb-8 lg:pb-10">
        <ProductListFilters
          categories={categories}
          subCategories={subCategories}
          selectedCategoryId={selectedCategoryId}
          selectedSubCategoryId={selectedSubCategoryId}
          onSelectCategory={setCategory}
          onSelectSubCategory={setSubCategory}
        />

        <div
          className={`w-full min-w-0 flex-1 pt-6 md:pt-8 lg:pt-10 ${PRODUCT_LIST_MAIN_PADDING_X}`}
        >
          <section className="mx-auto w-full min-w-0 max-w-[1680px]">
            {categoriesError ? (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                {categoriesError}
              </p>
            ) : null}

            <ProductListHeader
              keyword={keyword}
              onChangeKeyword={setKeyword}
              sortLabel={sortLabel}
              sortOptions={sortOptions}
              selectedSort={sort}
              onSelectSort={setSort}
            />

            {error ? (
              <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            ) : (
              <ProductListGrid products={products} loading={loading} />
            )}

            <div className="mt-8 flex justify-center">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </section>
        </div>

        {canManage ? (
          <ProductListAddProductButton onClick={handleOpenRegisterModal} />
        ) : null}
      </main>

      {canManage ? (
        <>
          <ProductRegisterModal
            open={registerModalOpen}
            onOpenChange={setRegisterModalOpen}
            catalogRows={catalogRows}
            mode="create"
            onSuccess={refreshProductList}
            onCategoriesRefresh={refreshCategories}
          />
        </>
      ) : null}
    </div>
  )
}
