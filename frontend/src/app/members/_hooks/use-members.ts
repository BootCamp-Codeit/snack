"use client";

import { useCallback, useEffect, useState } from "react";
import {
  changeMemberRole,
  deactivateMember,
  getMembers,
  inviteMember,
} from "../_lib/api";
import type { Member, MemberRoleOption } from "../_lib/types";

interface InvitePayload {
  name: string;
  email: string;
  role: MemberRoleOption;
}

export function useMembers() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMembers({ keyword, page });
      setMembers(result.members);
      setTotalPages(result.totalPages);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "회원 정보를 불러오지 못했습니다.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      await loadMembers();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadMembers]);

  const handleInvite = useCallback(
    async (payload: InvitePayload) => {
      try {
        setIsInviting(true);
        setError(null);
        await inviteMember(payload);
        await loadMembers();
      } catch (inviteError) {
        const message =
          inviteError instanceof Error
            ? inviteError.message
            : "회원 초대에 실패했습니다.";
        setError(message);
        throw inviteError;
      } finally {
        setIsInviting(false);
      }
    },
    [loadMembers],
  );

  const handleChangeRole = useCallback(
    async (memberId: Member["id"], role: MemberRoleOption) => {
      try {
        setIsChangingRole(true);
        setError(null);
        await changeMemberRole({ memberId, role });
        await loadMembers();
      } catch (roleError) {
        const message =
          roleError instanceof Error
            ? roleError.message
            : "권한 변경에 실패했습니다.";
        setError(message);
        throw roleError;
      } finally {
        setIsChangingRole(false);
      }
    },
    [loadMembers],
  );

  const handleDeactivate = useCallback(
    async (memberId: Member["id"]) => {
      try {
        setIsDeactivating(true);
        setError(null);
        await deactivateMember(memberId);
        await loadMembers();
      } catch (deactivateError) {
        const message =
          deactivateError instanceof Error
            ? deactivateError.message
            : "계정 탈퇴 처리에 실패했습니다.";
        setError(message);
        throw deactivateError;
      } finally {
        setIsDeactivating(false);
      }
    },
    [loadMembers],
  );

  return {
    keyword,
    page,
    members,
    totalPages,
    loading,
    error,
    isInviting,
    isChangingRole,
    isDeactivating,
    setKeyword,
    setPage,
    handleInvite,
    handleChangeRole,
    handleDeactivate,
  };
}
