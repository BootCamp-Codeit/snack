import { getMembers } from "./api";

/** 조직 멤버 전체를 한 번에 불러 id → 표시 이름 맵으로 만듭니다. 실패 시 빈 객체. */
export async function fetchMemberNameByIdMap(): Promise<Record<number, string>> {
  try {
    const result = await getMembers({ page: 1, pageSize: 1000 });
    const next: Record<number, string> = {};
    for (const m of result.members) {
      const id = Number(m.id);
      const name = String(m.name ?? "").trim();
      if (Number.isFinite(id) && id > 0 && name) next[id] = name;
    }
    return next;
  } catch {
    return {};
  }
}
