"use client";

import { useEffect, useState } from "react";
import { MembersHeader } from "./_components/members-header";
import { MembersDeleteAccountModal } from "./_components/members-delete-account-modal";
import { MembersEditRoleModal } from "./_components/members-edit-role-modal";
import { MembersInviteModal } from "./_components/members-invite-modal";
import { MembersPagination } from "./_components/members-pagination";
import { MembersTable } from "./_components/members-table";
import { useMembers } from "./_hooks/use-members";
import type { Member } from "./_lib/types";

export default function MembersPage() {
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [selectedDeactivateMember, setSelectedDeactivateMember] =
    useState<Member | null>(null);
  const [selectedRoleMember, setSelectedRoleMember] = useState<Member | null>(
    null
  );

  const {
    keyword,
    page,
    members,
    totalPages,
    loading,
    error,
    setKeyword,
    setPage,
    isInviting,
    isChangingRole,
    isDeactivating,
    handleInvite,
    handleChangeRole,
    handleDeactivate,
  } = useMembers();

  const handleChangeKeyword = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2500);

    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  const handleOpenDeactivateModal = (member: Member) => {
    setSelectedDeactivateMember(member);
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = async (memberId: Member["id"]) => {
    try {
      await handleDeactivate(memberId);
      setIsDeactivateModalOpen(false);
      setSelectedDeactivateMember(null);
      showToast("success", "멤버 계정을 비활성화했습니다.");
    } catch (actionError) {
      showToast(
        "error",
        actionError instanceof Error
          ? actionError.message
          : "계정 탈퇴 처리에 실패했습니다.",
      );
    }
  };

  const handleOpenEditRoleModal = (member: Member) => {
    setSelectedRoleMember(member);
    setIsEditRoleModalOpen(true);
  };

  const handleConfirmEditRole = async (
    memberId: Member["id"],
    role: "admin" | "member"
  ) => {
    try {
      await handleChangeRole(memberId, role);
      setIsEditRoleModalOpen(false);
      setSelectedRoleMember(null);
      showToast("success", "멤버 권한을 변경했습니다.");
    } catch (actionError) {
      showToast(
        "error",
        actionError instanceof Error
          ? actionError.message
          : "권한 변경에 실패했습니다.",
      );
    }
  };

  const handleConfirmInvite = async (payload: {
    name: string;
    email: string;
    role: "admin" | "member";
  }) => {
    try {
      await handleInvite(payload);
      setIsInviteModalOpen(false);
      showToast("success", "초대 메일을 전송했습니다.");
    } catch (actionError) {
      showToast(
        "error",
        actionError instanceof Error
          ? actionError.message
          : "회원 초대에 실패했습니다.",
      );
    }
  };

  return (
    <main className="px-4 pt-0 pb-6 min-[745px]:px-8 min-[745px]:pt-0 min-[745px]:pb-10">
      {toast ? (
        <div
          className={`fixed right-4 top-4 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg min-[745px]:right-8 ${
            toast.type === "success" ? "bg-[#18A058]" : "bg-[#E34D59]"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
      <section className="w-full">
        <MembersHeader
          keyword={keyword}
          onChangeKeyword={handleChangeKeyword}
          onInvite={() => setIsInviteModalOpen(true)}
        />
        {error ? (
          <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        ) : (
          <MembersTable
            members={members}
            loading={loading}
            onChangeRole={handleOpenEditRoleModal}
            onDeactivate={handleOpenDeactivateModal}
          />
        )}
        {members.length > 0 ? (
          <MembersPagination
            page={page}
            totalPages={totalPages}
            onChangePage={setPage}
          />
        ) : null}
        <MembersInviteModal
          open={isInviteModalOpen}
          onOpenChange={setIsInviteModalOpen}
          onConfirm={handleConfirmInvite}
          submitting={isInviting}
        />
        <MembersDeleteAccountModal
          open={isDeactivateModalOpen}
          member={selectedDeactivateMember}
          onOpenChange={(open) => {
            setIsDeactivateModalOpen(open);
            if (!open) {
              setSelectedDeactivateMember(null);
            }
          }}
          onConfirm={handleConfirmDeactivate}
          submitting={isDeactivating}
        />
        <MembersEditRoleModal
          open={isEditRoleModalOpen}
          member={selectedRoleMember}
          onOpenChange={(open) => {
            setIsEditRoleModalOpen(open);
            if (!open) {
              setSelectedRoleMember(null);
            }
          }}
          onConfirm={handleConfirmEditRole}
          submitting={isChangingRole}
        />
      </section>
    </main>
  );
}
