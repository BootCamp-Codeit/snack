import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "구매 요청 내역 | Snack",
  description: "구매 요청 내역을 조회하고 관리할 수 있습니다.",
};

export default function PurchaseRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
