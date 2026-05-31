import { notFound } from "next/navigation"
import { ProductDetailClient } from "../_components/product-detail-client"

interface ProductDetailPageProps {
  params: Promise<{
    productId: string
  }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId: rawProductId } = await params
  const productId = Number(rawProductId)
  if (!Number.isFinite(productId) || productId <= 0) {
    notFound()
  }

  return <ProductDetailClient productId={productId} />
}
