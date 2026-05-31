import type { Category, SubCategory } from "@/types/category";

/** 상품 카테고리 시드 데이터 */
export const CATEGORIES: Category[] = [
  { id: 1, name: "스낵" },
  { id: 2, name: "음료" },
  { id: 3, name: "생수" },
  { id: 4, name: "간편식" },
  { id: 5, name: "신선식품" },
  { id: 6, name: "비품" },
];

/** 상품 하위 카테고리 시드 데이터 */
export const SUB_CATEGORIES: SubCategory[] = [
  { id: 1, name: "과자", categoryId: 1 },
  { id: 2, name: "쿠키", categoryId: 1 },
  { id: 3, name: "파이", categoryId: 1 },
  { id: 4, name: "초콜릿류", categoryId: 1 },
  { id: 5, name: "캔디류", categoryId: 1 },
  { id: 6, name: "껌류", categoryId: 1 },
  { id: 7, name: "비스켓류", categoryId: 1 },
  { id: 8, name: "씨리얼바", categoryId: 1 },
  { id: 9, name: "젤리류", categoryId: 1 },
  { id: 10, name: "견과류", categoryId: 1 },
  { id: 11, name: "워터젤리", categoryId: 1 },
  { id: 12, name: "청량/탄산음료", categoryId: 2 },
  { id: 13, name: "과즙음료", categoryId: 2 },
  { id: 14, name: "에너지음료", categoryId: 2 },
  { id: 15, name: "이온음료", categoryId: 2 },
  { id: 16, name: "유산균음료", categoryId: 2 },
  { id: 17, name: "건강음료", categoryId: 2 },
  { id: 18, name: "차류", categoryId: 2 },
  { id: 19, name: "두유/우유", categoryId: 2 },
  { id: 20, name: "커피", categoryId: 2 },
  { id: 21, name: "생수", categoryId: 3 },
  { id: 22, name: "스파클링", categoryId: 3 },
  { id: 23, name: "봉지라면", categoryId: 4 },
  { id: 24, name: "과일", categoryId: 4 },
  { id: 25, name: "컵라면", categoryId: 4 },
  { id: 26, name: "핫도그 및 소시지", categoryId: 4 },
  { id: 27, name: "계란", categoryId: 4 },
  { id: 28, name: "죽/스프류", categoryId: 4 },
  { id: 29, name: "컵밥류", categoryId: 4 },
  { id: 30, name: "시리얼", categoryId: 4 },
  { id: 31, name: "반찬류", categoryId: 4 },
  { id: 32, name: "면류", categoryId: 4 },
  { id: 33, name: "요거트류", categoryId: 4 },
  { id: 34, name: "가공안주류", categoryId: 4 },
  { id: 35, name: "유제품", categoryId: 4 },
  { id: 36, name: "샐러드", categoryId: 5 },
  { id: 37, name: "빵", categoryId: 5 },
  { id: 38, name: "햄버거/샌드위치", categoryId: 5 },
  { id: 39, name: "주먹밥/김밥", categoryId: 5 },
  { id: 40, name: "도시락", categoryId: 5 },
  { id: 41, name: "커피/차류", categoryId: 6 },
  { id: 42, name: "생활용품", categoryId: 6 },
  { id: 43, name: "일회용품", categoryId: 6 },
  { id: 44, name: "사무용품", categoryId: 6 },
];

export function getSubCategoriesByCategoryId(categoryId: number): SubCategory[] {
  return SUB_CATEGORIES.filter((s) => s.categoryId === categoryId);
}
