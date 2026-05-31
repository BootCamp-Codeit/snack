import { ChevronLeft, ChevronRight } from "lucide-react";
import PaginationButton from "./pagination-button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  size?: "sm" | "lg";
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  size = "sm",
}: PaginationProps) {
  const pages = getPageNumbers(currentPage, totalPages);
  const iconSize = size === "sm" ? 16 : 18;

  return (
    <div className="flex items-center gap-1">
      <PaginationButton
        size={size}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={iconSize} />
      </PaginationButton>

      {pages.map((page, index) =>
        page === "..." ? (
          <PaginationButton key={`ellipsis-${index}`} size={size} disabled>
            ···
          </PaginationButton>
        ) : (
          <PaginationButton
            key={page}
            size={size}
            isActive={page === currentPage}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </PaginationButton>
        )
      )}

      <PaginationButton
        size={size}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={iconSize} />
      </PaginationButton>
    </div>
  );
}