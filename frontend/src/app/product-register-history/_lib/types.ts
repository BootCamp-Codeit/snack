export type ProductSort = "최신순" | "낮은가격순" | "높은가격순";
export type ProductApiSort = "createdAt_desc" | "price_asc" | "price_desc";

export interface ProductRegistration {
  id: number;
  registeredAt: string;
  name: string;
  imageUrl: string;
  category: string;
  price: number;
  productLink: string | null;
}

export interface GetProductRegistrationsParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
  sort?: ProductSort;
}

export interface GetProductRegistrationsResult {
  items: ProductRegistration[];
  totalCount: number;
  totalPages: number;
  page: number;
}

export interface ProductCategoryDto {
  id: number;
  name: string;
}

export interface ProductListItemDto {
  id: number;
  name: string;
  price: string;
  imageKey: string | null;
  productUrl: string | null;
  createdAt: string;
  category: ProductCategoryDto | null;
}

export interface ProductListPayloadDto {
  data: ProductListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}
