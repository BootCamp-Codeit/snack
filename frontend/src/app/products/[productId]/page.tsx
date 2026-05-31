import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductRegistrationById } from "@/app/product-register-history/_lib/api";

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { productId } = await params;
  const id = Number(productId);
  if (!Number.isFinite(id)) {
    notFound();
  }

  const product = await getProductRegistrationById(id);
  if (!product) {
    notFound();
  }

  return (
    <main className="px-8 py-10">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/product-register-history"
          className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          ← 목록으로
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          {product.name}
        </h1>
      </section>
    </main>
  );
}
