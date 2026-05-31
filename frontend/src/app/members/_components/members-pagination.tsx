"use client";

import Pagination from "@/components/ui/pagination";

interface MembersPaginationProps {
  page: number;
  totalPages: number;
  onChangePage: (nextPage: number) => void;
}

export function MembersPagination({
  page,
  totalPages,
  onChangePage,
}: MembersPaginationProps) {
  if (totalPages <= 0) return null;

  return (
    <div className="mt-6 flex justify-center">
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onChangePage}
        size="sm"
      />
    </div>
  );
}
