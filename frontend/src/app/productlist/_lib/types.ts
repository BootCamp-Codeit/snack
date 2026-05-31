export type SortOption = "latest" | "priceAsc" | "priceDesc" | "purchaseDesc"

/** GET /api/categories 행 (OpenAPI CategoryResponseDto) */
export interface CatalogCategory {
  id: number
  name: string
  parentId: number | null
  sortOrder?: number
  isActive?: boolean
  createdAt?: string
}

export interface Product {
  id: number
  image: string
  category: string
  purchaseCount: number
  name: string
  price: number
  categoryId?: number | null
  productUrl?: string | null
  imageKey?: string | null
}

export interface GetProductsParams {
  keyword?: string
  /** 백엔드 `categoryId` 쿼리 (리프 카테고리 선택 시) */
  categoryId?: number
  sort?: SortOption
  page?: number
  /** API `limit`로 전달됨 */
  pageSize?: number
}

export interface GetProductsResult {
  products: Product[]
  totalCount: number
  totalPages: number
  page: number
}

export interface CreateProductInput {
  name: string
  price: number
  categoryId?: number | null
  imageKey?: string | null
  productUrl?: string | null
  isActive?: boolean
}

export type UpdateProductInput = Partial<CreateProductInput>

/** POST /api/categories 요청 (CreateCategoryDto) */
export interface CreateCategoryInput {
  name: string
  /** 소분류일 때만 부모(대분류) id */
  parentId?: number | null
  sortOrder?: number
  isActive?: boolean
}

/** PATCH /api/categories/:id 요청 (UpdateCategoryDto, 필드 생략 시 변경 없음) */
export interface UpdateCategoryInput {
  name?: string
  parentId?: number | null
  sortOrder?: number
  isActive?: boolean
}
