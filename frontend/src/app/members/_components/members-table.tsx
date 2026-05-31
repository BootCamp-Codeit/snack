"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Member } from "../_lib/types";
import { MoreVertical, UserRound } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";

interface MembersTableProps {
  members: Member[];
  loading?: boolean;
  onChangeRole: (member: Member) => void;
  onDeactivate: (member: Member) => void;
}

function roleLabel(role: Member["role"]) {
  return role === "super_admin" || role === "admin" ? "관리자" : "일반";
}

function roleSelected(role: Member["role"]) {
  return role === "super_admin" || role === "admin";
}

function avatarTone(role: Member["role"]) {
  return roleSelected(role)
    ? "border-[#FFD7BE] text-[#F08A3E]"
    : "border-[#E9E9E9] text-[#D9D9D9]";
}

function chipClassName(role: Member["role"], compact = false) {
  const baseClass = roleSelected(role)
    ? "bg-[var(--background-background-500)] text-[var(--primary-orange-400)] hover:bg-[var(--background-background-500)]"
    : "bg-[var(--background-background-300)] text-[var(--gray-gray-400)] hover:bg-[var(--background-background-300)]";

  if (compact) {
    return `${baseClass} h-6 px-2.5 py-0 text-xs font-medium`;
  }

  return `${baseClass} h-[36px] px-[6px] py-0 text-sm font-medium leading-none justify-center`;
}

export function MembersTable({
  members,
  loading = false,
  onChangeRole,
  onDeactivate,
}: MembersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<Member["id"] | null>(null);
  const menuRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  if (!loading && members.length === 0) {
    return (
      <section className="mt-6 flex justify-center">
        <div className="flex flex-col items-center">
          <Image
            src="/assets/snack_member_1.svg"
            alt="회원 없음 안내"
            width={388}
            height={448}
            className="h-[318px] w-[375px] min-[745px]:h-[448px] min-[745px]:w-[388px]"
            priority
          />
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <div className="hidden min-[745px]:block">
        <div className="overflow-hidden rounded-[999px] border border-[var(--line-line-200)] bg-white">
          <div className="grid h-20 grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_140px_180px] items-center px-20 py-6 text-sm font-medium text-[var(--gray-gray-500)]">
            <span>이름</span>
            <span>메일</span>
            <span>권한</span>
            <span>비고</span>
          </div>
        </div>

        {loading ? (
          <p className="px-20 py-8 text-sm text-gray-400">
            회원 정보를 불러오는 중입니다.
          </p>
        ) : (
          <div className="mt-2 divide-y divide-[#F0ECE6]">
            {members.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_140px_180px] items-center px-20 py-7 text-sm"
              >
                <div className="flex min-w-0 items-center gap-3 text-gray-700">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border bg-white ${avatarTone(member.role)}`}
                  >
                    <UserRound className="size-4" strokeWidth={2} />
                  </div>
                  <span className="truncate">{member.name}</span>
                </div>
                <span className="truncate text-gray-500">{member.email}</span>
                <div>
                  <Chip
                    variant="user"
                    selected={roleSelected(member.role)}
                    className={chipClassName(member.role)}
                  >
                    {roleLabel(member.role)}
                  </Chip>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => onDeactivate(member)}
                    variant="etc"
                    size="etc-sm"
                    className="rounded-lg font-normal"
                  >
                    계정 탈퇴
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onChangeRole(member)}
                    variant="solid"
                    size="etc-sm"
                    className="rounded-lg font-normal"
                  >
                    권한 변경
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="min-[745px]:hidden">
        {loading ? (
          <p className="px-5 py-8 text-sm text-gray-400">
            회원 정보를 불러오는 중입니다.
          </p>
        ) : (
          <ul className="divide-y divide-[#F0ECE6]">
            {members.map((member) => {
              const isMenuOpen = openMenuId === member.id;

              return (
                <li
                  key={member.id}
                  className="relative px-4 py-5 min-[376px]:px-6"
                  ref={isMenuOpen ? menuRef : null}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full border bg-white ${avatarTone(member.role)}`}
                      >
                        <UserRound className="size-5" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[15px] font-medium leading-6 text-[#7E7A73]">
                            {member.name}
                          </span>
                          <Chip
                            variant="user"
                            selected={roleSelected(member.role)}
                            className={chipClassName(member.role, true)}
                          >
                            {roleLabel(member.role)}
                          </Chip>
                        </div>
                        <p className="mt-1 truncate text-[14px] leading-5 text-[#A8A29B]">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(isMenuOpen ? null : member.id)
                        }
                        aria-label={`${member.name} 작업 메뉴 열기`}
                        className="flex size-8 items-center justify-center rounded-full text-[#B8B2A9] transition hover:bg-[#F7F3EE]"
                      >
                        <MoreVertical className="size-5" />
                      </button>

                      {isMenuOpen ? (
                        <div className="absolute right-0 top-9 z-10 overflow-hidden rounded-[16px] bg-white shadow-[0_8px_30px_rgba(31,20,11,0.12)]">
                          <button
                            type="button"
                            onClick={() => {
                              onDeactivate(member);
                              setOpenMenuId(null);
                            }}
                            className="flex h-[44px] w-[88px] items-center justify-center rounded-t-[16px] text-[14px] font-medium text-[#6E6963]"
                          >
                            계정 탈퇴
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onChangeRole(member);
                              setOpenMenuId(null);
                            }}
                            className="flex h-[44px] w-[88px] items-center justify-center rounded-b-[16px] border-t border-[#F2EEE8] text-[14px] font-medium text-[#6E6963]"
                          >
                            권한 변경
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
