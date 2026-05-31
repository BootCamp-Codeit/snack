"use client";

import { useEffect, useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogField,
  DialogFooter,
  DialogHeader,
  DialogLabel,
  DialogReadonlyField,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Member, MemberRoleOption } from "../_lib/types";

interface MembersEditRoleModalProps {
  open: boolean;
  member: Member | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (memberId: Member["id"], role: MemberRoleOption) => Promise<void>;
  submitting?: boolean;
}

const roleOptions: { value: MemberRoleOption; label: string }[] = [
  { value: "admin", label: "관리자" },
  { value: "member", label: "일반" },
];

function mapRoleToOption(role: Member["role"]): MemberRoleOption {
  return role === "super_admin" || role === "admin" ? "admin" : "member";
}

export function MembersEditRoleModal({
  open,
  member,
  onOpenChange,
  onConfirm,
  submitting = false,
}: MembersEditRoleModalProps) {
  const roleId = useId();
  const [selectedRole, setSelectedRole] = useState<MemberRoleOption>("member");

  useEffect(() => {
    if (member) {
      setSelectedRole(mapRoleToOption(member.role));
    }
  }, [member]);

  if (!member) return null;

  const handleSubmit = async () => {
    if (submitting) return;
    try {
      await onConfirm(member.id, selectedRole);
    } catch {
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[500px] w-[375px] max-w-[calc(100vw-16px)] rounded-[30px] p-0 min-[745px]:h-[654px] min-[745px]:w-[688px]">
        <div className="flex h-full flex-col px-6 pt-8 pb-10">
          <DialogHeader className="mb-0 border-b border-[#F2E8DE] pb-8">
            <DialogTitle className="text-4 font-semibold leading-[1.4] text-[#1F1A14]">
              회원 권한 변경
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="flex-1 gap-0 pt-8">
            <DialogField className="mb-6">
              <DialogLabel className="mb-4 text-4 font-semibold text-[#1F1A14]">
                이름
              </DialogLabel>
              <DialogReadonlyField className="h-[58px] rounded-[16px] border border-[#FFD7BE] bg-white px-4 py-4 text-xl text-[#1F1A14]">
                {member.name}
              </DialogReadonlyField>
            </DialogField>

            <DialogField className="mb-6">
              <DialogLabel className="mb-4 text-4 font-semibold text-[#1F1A14]">
                이메일
              </DialogLabel>
              <DialogReadonlyField className="h-[58px] rounded-[16px] border border-[#FFD7BE] bg-white px-4 py-4 text-xl text-[#1F1A14]">
                {member.email}
              </DialogReadonlyField>
            </DialogField>

            <DialogField>
              <DialogLabel
                htmlFor={roleId}
                className="mb-4 text-4 font-semibold text-[#1F1A14]"
              >
                권한
              </DialogLabel>
              <div className="relative">
                <select
                  id={roleId}
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(event.target.value as MemberRoleOption)
                  }
                  className="h-[58px] w-full appearance-none rounded-[16px] border border-[#FFD7BE] bg-white px-4 py-4 pr-12 text-xl text-[#1F1A14] outline-none transition focus:border-[#E5762C] focus:ring-1 focus:ring-[#E5762C]"
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-6 -translate-y-1/2 text-[#E5762C]" />
              </div>
            </DialogField>
          </DialogBody>

          <DialogFooter className="mt-8 gap-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outlined"
                disabled={submitting}
                className="h-[58px] flex-1 rounded-[16px] border-[#FFF3E5] bg-[#FFF3E5] text-4 font-semibold text-[#FF7B1A] hover:bg-[#FCE9CE]"
              >
                취소
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="solid"
              disabled={submitting}
              className="h-[58px] flex-1 rounded-[16px] text-4 font-semibold"
              onClick={handleSubmit}
            >
              {submitting ? "처리 중..." : "변경하기"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
