/** 상품 카테고리 (대분류) */
export interface Category {
  id: number;
  name: string;
}

/** 상품 하위 카테고리 (소분류) */
export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
}
