"use client";

import type { PurchaseRequestSort } from "../_types";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: PurchaseRequestSort; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "amountAsc", label: "낮은금액순" },
  { value: "amountDesc", label: "높은금액순" },
];

interface SortDropdownProps {
  value: PurchaseRequestSort;
  onChange: (value: PurchaseRequestSort) => void;
  className?: string;
}

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  const label = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "최신순";

  return (
    <div className={cn("relative inline-block", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PurchaseRequestSort)}
        className="h-10 appearance-none rounded-lg border border-[var(--gray-gray-200)] bg-white pl-3 pr-9 text-sm text-gray-900 shadow-xs outline-none focus:border-[var(--primary-orange-400)] focus:ring-1 focus:ring-[var(--primary-orange-400)]"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-500"
        aria-hidden
      />
    </div>
  );
}
