"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogField,
  DialogFooter,
  DialogHeader,
  DialogInput,
  DialogLabel,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MemberRoleOption } from "../_lib/types";

interface MembersInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: {
    name: string;
    email: string;
    role: MemberRoleOption;
  }) => Promise<void>;
  submitting?: boolean;
}

const roles: { value: MemberRoleOption; label: string }[] = [
  { value: "admin", label: "관리자" },
  { value: "member", label: "일반" },
];

export function MembersInviteModal({
  open,
  onOpenChange,
  onConfirm,
  submitting = false,
}: MembersInviteModalProps) {
  const nameId = useId();
  const emailId = useId();
  const roleId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<MemberRoleOption>("admin");

  const isFormValid = name.trim() !== "" && email.trim() !== "";

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;

    try {
      await onConfirm({
        name: name.trim(),
        email: email.trim(),
        role: selectedRole,
      });
    } catch {
      return;
    }

    setName("");
    setEmail("");
    setSelectedRole("admin");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[500px] w-[375px] max-w-[calc(100vw-16px)] rounded-[30px] p-0 min-[745px]:h-[654px] min-[745px]:w-[688px]">
        <div className="flex h-full flex-col px-6 pt-8 pb-10">
          <DialogHeader className="mb-0 border-b border-[#F2E8DE] pb-8">
            <DialogTitle className="text-4 font-semibold leading-[1.4] text-[#1F1A14]">
              회원 초대
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="flex-1 gap-0 pt-8">
            <DialogField className="mb-6">
              <DialogLabel
                htmlFor={nameId}
                className="mb-4 text-4 font-semibold text-[#1F1A14]"
              >
                이름
              </DialogLabel>
              <DialogInput
                id={nameId}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="이름을 입력해주세요"
                className="h-[58px] rounded-[16px] border-[#FFD7BE] px-4 py-4 text-xl text-[#1F1A14] placeholder:text-[#B6B6B6]"
              />
            </DialogField>

            <DialogField className="mb-6">
              <DialogLabel
                htmlFor={emailId}
                className="mb-4 text-4 font-semibold text-[#1F1A14]"
              >
                이메일
              </DialogLabel>
              <DialogInput
                id={emailId}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="이메일을 입력해주세요"
                className="h-[58px] rounded-[16px] border-[#FFD7BE] px-4 py-4 text-xl text-[#1F1A14] placeholder:text-[#B6B6B6]"
              />
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
                  {roles.map((role) => (
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
              disabled={!isFormValid || submitting}
              className="h-[58px] flex-1 rounded-[16px] text-4 font-semibold"
              onClick={handleSubmit}
            >
              {submitting ? "처리 중..." : "등록하기"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
