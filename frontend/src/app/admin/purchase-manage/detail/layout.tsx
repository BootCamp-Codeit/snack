import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "구매 요청 관리 상세 | Snack",
  description: "구매 요청 관리 상세 정보를 확인할 수 있습니다.",
};

export default function PurchaseManageDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
