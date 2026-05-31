import { cn } from "@/lib/utils";

type PaginationButtonSize = "sm" | "lg";

interface PaginationButtonProps {
  children: React.ReactNode;
  size?: PaginationButtonSize;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function PaginationButton({
  children,
  size = "sm",
  isActive = false,
  disabled = false,
  onClick,
}: PaginationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center bg-transparent font-medium text-[18px] transition-colors p-[10px]",
        "text-gray-400 hover:text-gray-900",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        // active - 폰트만 진하게
        isActive && "text-gray-900 font-bold",
        // size
        size === "sm" && "w-[34px] h-[34px] rounded-[6px]",
        size === "lg" && "w-[48px] h-[48px] rounded-[8px]"
      )}
    >
      {children}
    </button>
  );
}