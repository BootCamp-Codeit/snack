import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "구매 요청 관리 | Snack",
  description: "구매 요청 관리 페이지입니다.",
};

export default function PurchaseManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
