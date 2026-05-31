"use client";

import { useCallback, useEffect, useState } from "react";
import { getProductRegistrations } from "../_lib/api";
import type {
  ProductRegistration,
  ProductSort,
} from "../_lib/types";

export function useProductRegistrations() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ProductSort>("최신순");
  const [sortOpen, setSortOpen] = useState(false);
  const [items, setItems] = useState<ProductRegistration[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getProductRegistrations({
          page,
          sort,
          pageSize: 6,
        });

        if (cancelled) return;
        setItems(result.items);
        setTotalPages(result.totalPages);
      } catch (error) {
        if (cancelled) return;
        setError(
          error instanceof Error
            ? error.message
            : "상품 정보를 불러오지 못했습니다."
        );
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [page, sort]);

  const handleSortChange = useCallback((nextSort: ProductSort) => {
    setSort(nextSort);
    setPage(1);
  }, []);

  return {
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
  };
}
