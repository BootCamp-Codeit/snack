"use client"

import type { Category, SubCategory } from "@/types/category"
import { useCallback, useEffect, useMemo, useState } from "react"
import { getCategories, getProducts } from "../_lib/api"
import type { CatalogCategory, Product, SortOption } from "../_lib/types"

const DEFAULT_PAGE_SIZE = 12

function catalogToRoots(rows: CatalogCategory[]): Category[] {
  return rows
    .filter((r) => r.parentId === null)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id)
    .map((r) => ({ id: r.id, name: r.name }))
}

function catalogToSubsForParent(
  rows: CatalogCategory[],
  parentId: number,
): SubCategory[] {
  return rows
    .filter((r) => r.parentId === parentId)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id)
    .map((r) => ({
      id: r.id,
      name: r.name,
      categoryId: parentId,
    }))
}

export function useProducts() {
  const [keyword, setKeyword] = useState("")
  const [debouncedKeyword, setDebouncedKeyword] = useState("")

  const [catalogRows, setCatalogRows] = useState<CatalogCategory[]>([])
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [categoriesRefreshKey, setCategoriesRefreshKey] = useState(0)

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null)
  const [sort, setSort] = useState<SortOption>("latest")
  const [page, setPage] = useState(1)
  const [listVersion, setListVersion] = useState(0)

  const [products, setProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await getCategories()
        if (cancelled) return
        setCatalogRows(rows)
        setCategoriesError(null)
      } catch {
        if (cancelled) return
        setCategoriesError("카테고리를 불러오지 못했습니다.")
        setCatalogRows([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [categoriesRefreshKey])

  const refreshCategories = useCallback(() => {
    setCategoriesRefreshKey((k) => k + 1)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword)
    }, 300)

    return () => clearTimeout(timer)
  }, [keyword])

  const categories = useMemo(
    () => catalogToRoots(catalogRows),
    [catalogRows],
  )

  const subCategories = useMemo(() => {
    if (selectedCategoryId == null) return []
    return catalogToSubsForParent(catalogRows, selectedCategoryId)
  }, [catalogRows, selectedCategoryId])

  useEffect(() => {
    let cancelled = false

    const apiCategoryId =
      selectedSubCategoryId != null
        ? selectedSubCategoryId
        : undefined

    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await getProducts({
          keyword: debouncedKeyword,
          categoryId: apiCategoryId,
          sort,
          page,
          pageSize: DEFAULT_PAGE_SIZE,
        })

        if (cancelled) return
        setProducts(result.products)
        setTotalPages(result.totalPages)
      } catch {
        if (cancelled) return
        setError("상품 목록을 불러오지 못했습니다.")
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    debouncedKeyword,
    selectedSubCategoryId,
    sort,
    page,
    listVersion,
    selectedCategoryId,
  ])

  const sortLabel = useMemo(() => {
    switch (sort) {
      case "latest":
        return "최신순"
      case "priceAsc":
        return "가격 낮은순"
      case "priceDesc":
        return "가격 높은순"
      case "purchaseDesc":
        return "구매 많은순"
      default:
        return "정렬"
    }
  }, [sort])

  const handleChangeKeyword = useCallback((value: string) => {
    setKeyword(value)
    setPage(1)
  }, [])

  const handleSelectCategory = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId)
    setSelectedSubCategoryId(null)
    setPage(1)
  }, [])

  const handleSelectSubCategory = useCallback((subCategoryId: number | null) => {
    setSelectedSubCategoryId(subCategoryId)
    setPage(1)
  }, [])

  const handleSelectSort = useCallback((next: SortOption) => {
    setSort(next)
    setPage(1)
  }, [])

  const sortOptions = useMemo(
    () =>
      [
        { value: "latest", label: "최신순" },
        { value: "priceAsc", label: "가격 낮은순" },
        { value: "priceDesc", label: "가격 높은순" },
        { value: "purchaseDesc", label: "구매 많은순" },
      ] as const,
    [],
  )

  const refreshProductList = useCallback(() => {
    setListVersion((v) => v + 1)
  }, [])

  return {
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
    setKeyword: handleChangeKeyword,
    setCategory: handleSelectCategory,
    setSubCategory: handleSelectSubCategory,
    setSort: handleSelectSort,
    refreshProductList,
    refreshCategories,
  }
}
