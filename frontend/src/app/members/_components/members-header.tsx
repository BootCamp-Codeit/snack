"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MembersHeaderProps {
  keyword: string;
  onChangeKeyword: (value: string) => void;
  onInvite: () => void;
}

export function MembersHeader({
  keyword,
  onChangeKeyword,
  onInvite,
}: MembersHeaderProps) {
  return (
    <header>
      <div className="flex min-h-[96px] items-center justify-between gap-4 py-4 min-[745px]:justify-start">
        <h1 className="black_black_400_t text_3xl_semibold max-[744px]:text-[36px] max-[744px]:leading-[1.3] max-[375px]:text-[32px]">
          회원 관리
        </h1>
        <Button
          type="button"
          onClick={onInvite}
          variant="invite"
          size="invite"
          className="inline-flex min-w-[88px] justify-end min-[745px]:hidden"
        >
          + 회원 초대
        </Button>
      </div>
      <div className="flex flex-col gap-3 min-[745px]:flex-row min-[745px]:items-center min-[745px]:justify-end">
        <label className="relative block w-full min-[745px]:w-[402px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[var(--gray-gray-400)] min-[745px]:left-6" />
          <input
            type="search"
            value={keyword}
            onChange={(event) => onChangeKeyword(event.target.value)}
            placeholder="이름으로 검색하세요"
            className="h-[54px] w-full rounded-[16px] border border-[var(--gray-gray-200)] bg-white py-[14px] pl-11 pr-4 text-sm text-[var(--black-black-400)] placeholder:text-[var(--gray-gray-400)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-[var(--primary-orange-300)] min-[745px]:h-16 min-[745px]:py-[14px] min-[745px]:pl-[56px] min-[745px]:pr-6 min-[745px]:text-base"
          />
        </label>
        <Button
          type="button"
          onClick={onInvite}
          variant="solid"
          className="hidden h-16 w-[213px] rounded-[16px] px-4 py-4 text-base min-[745px]:inline-flex"
        >
          회원 초대하기
        </Button>
      </div>
    </header>
  );
}
