"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Member } from "../_lib/types";

interface DeactivateMember {
  id: Member["id"];
  name: string;
  email: string;
}

interface MembersDeleteAccountModalProps {
  open: boolean;
  member: DeactivateMember | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (memberId: Member["id"]) => Promise<void>;
  submitting?: boolean;
}

export function MembersDeleteAccountModal({
  open,
  member,
  onOpenChange,
  onConfirm,
  submitting = false,
}: MembersDeleteAccountModalProps) {
  if (!member) return null;

  const handleConfirm = async () => {
    if (submitting) return;
    try {
      await onConfirm(member.id);
    } catch {
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] text-center">
        <DialogHeader className="sr-only">
          <DialogTitle>계정 탈퇴</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center pt-4">
          <img
            src="/assets/puppyworng.svg"
            alt="계정 탈퇴"
            className="mb-4 h-[120px] w-[120px]"
          />

          <h2 className="mb-3 text-xl font-bold text-gray-900">계정 탈퇴</h2>

          <p className="mb-6 text-sm text-gray-600">
            {member.name}(<span className="text-[#E5762C]">{member.email}</span>)
            님의 계정을 탈퇴시키시겠어요?
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outlined"
              disabled={submitting}
              className="h-[50px] flex-1 rounded-[12px] border-[#FDF0DF] bg-[#FDF0DF] hover:bg-[#fce8cf]"
            >
              아니요
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="solid"
            disabled={submitting}
            className="h-[50px] flex-1 rounded-[12px]"
            onClick={handleConfirm}
          >
            {submitting ? "처리 중..." : "탈퇴시키기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
