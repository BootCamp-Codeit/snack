"use client";

import Link from "next/link";
import { ExternalLink, Link2 } from "lucide-react";
import type { ProductRegistration } from "../_lib/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";

interface ProductRegisterTableProps {
  items: ProductRegistration[];
  loading?: boolean;
}

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR");
}

function productHref(link: string | null) {
  if (!link?.trim()) return null;
  const raw = link.trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

/** 화면 표시용: 프로토콜 제거 후 앞부분만 두고 … (시안 www.codeit… 형태) */
function shortenProductLinkLabel(link: string | null, headChars = 10): string {
  if (!link?.trim()) return "-";
  const s = link.trim().replace(/^https?:\/\//i, "");
  if (s.length <= headChars) return s;
  return `${s.slice(0, headChars)}...`;
}

function ProductCard({ item }: { item: ProductRegistration }) {
  const href = productHref(item.productLink);

  return (
    <article className="min-w-0">
      <div className="flex gap-3 py-3">
        <Link
          href={`/productlist/${item.id}`}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#E0E0E0] bg-gray-100"
        >
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/productlist/${item.id}`}
            className="text_md_semibold black_black_400_t line-clamp-2 hover:underline"
          >
            {item.name}
          </Link>
          <p className="mt-1 text_sm_medium gray_gray_500_t">{item.category}</p>
        </div>
      </div>
      <div className="h-px w-full bg-[#E0E0E0]" />
      <dl className="min-w-0">
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="shrink-0 text_sm_medium gray_gray_500_t">등록일</dt>
          <dd className="text_sm_medium black_black_300_t">{item.registeredAt}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="shrink-0 text_sm_medium gray_gray_500_t">가격</dt>
          <dd className="text_sm_medium black_black_300_t">{formatPrice(item.price)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="shrink-0 text_sm_medium gray_gray_500_t">제품 링크</dt>
          <dd className="flex min-w-0 flex-1 justify-end">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={item.productLink ?? ""}
                className="inline-flex max-w-full shrink-0 items-center gap-2"
              >
                <span className="text_sm_medium black_black_300_t">
                  {shortenProductLinkLabel(item.productLink)}
                </span>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-orange-400)] text-white">
                  <Link2 className="size-3.5" strokeWidth={2.5} aria-hidden />
                </span>
              </a>
            ) : (
              <span className="text_sm_medium gray_gray_500_t">-</span>
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
}

const emptyMessage = {
  loading: "상품 정보를 불러오는 중입니다.",
  empty: "조회된 상품이 없습니다.",
} as const;

export function ProductRegisterTable({
  items,
  loading = false,
}: ProductRegisterTableProps) {
  const message = loading ? emptyMessage.loading : emptyMessage.empty;

  return (
    <div className="mt-6 min-w-0">
      {/* 태블릿·모바일(≤744px): 컬럼 헤더 대신 페이지 제목·정렬 아래 가로선만 */}
      <div
        className="mb-0 hidden h-px w-full bg-[#E0E0E0] max-[744px]:block min-[745px]:hidden"
        aria-hidden
      />

      {/* 태블릿·모바일: 카드 목록 */}
      <div className="min-[745px]:hidden">
        {loading || items.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">{message}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-[#E0E0E0]">
            {items.map((item) => (
              <li key={item.id} className="py-4 first:pt-0">
                <ProductCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 데스크톱: 테이블 */}
      <div className="hidden min-w-0 overflow-x-auto min-[745px]:block">
        <Table className="min-w-[800px] border-separate border-spacing-0">
          <TableHeader className="table-header-group overflow-hidden rounded-t-[2rem] rounded-b-[2rem] border border-[#E0E0E0] bg-[#FFFFFF]">
            <tr className="text-left text-sm text-gray-500">
              <TableHead className="w-[140px] rounded-l-[2rem] border-t border-l border-b border-[#E0E0E0]">
                등록일
              </TableHead>
              <TableHead className="w-[200px] min-w-0 border-t border-b border-[#E0E0E0]">
                상품명
              </TableHead>
              <TableHead className="w-[160px] border-t border-b border-[#E0E0E0]">
                카테고리
              </TableHead>
              <TableHead className="w-[120px] border-t border-b border-[#E0E0E0]">
                가격
              </TableHead>
              <TableHead className="w-[180px] rounded-r-[2rem] border-t border-r border-b border-[#E0E0E0]">
                제품 링크
              </TableHead>
            </tr>
          </TableHeader>
          <TableBody className="bg-[#FBF8F4]">
            {loading ? (
              <TableEmpty colSpan={5}>{emptyMessage.loading}</TableEmpty>
            ) : items.length === 0 ? (
              <TableEmpty colSpan={5}>{emptyMessage.empty}</TableEmpty>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="border-t border-[#E0E0E0]">
                  <TableCell className="text-gray-700">
                    {item.registeredAt}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/productlist/${item.id}`}
                      className="group flex items-center gap-3"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="truncate text-gray-700 group-hover:text-gray-900 group-hover:underline">
                        {item.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.category}</TableCell>
                  <TableCell className="text-gray-700">
                    {formatPrice(item.price)}
                  </TableCell>
                  <TableCell>
                    {productHref(item.productLink) ? (
                      <a
                        href={productHref(item.productLink) ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={item.productLink ?? ""}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        <span>{shortenProductLinkLabel(item.productLink)}</span>
                        <ExternalLink className="size-4 shrink-0" aria-hidden />
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
