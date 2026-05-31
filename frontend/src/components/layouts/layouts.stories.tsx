import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthLayout } from "./AuthLayout";
import { ProductDetailLayout } from "./ProductDetailLayout";
import { ListLayout } from "./ListLayout";
import { DetailLayout } from "./DetailLayout";

const meta: Meta = {
  title: "Layouts",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj;

export const Auth: Story = {
  render: () => (
    <AuthLayout>
      <div className="flex items-center justify-center text-gray-400 py-20">
        콘텐츠
      </div>
    </AuthLayout>
  ),
};

export const ProductDetail: Story = {
  render: () => (
    <ProductDetailLayout>
      <div className="flex gap-12">
        {/* 좌측: 상품 이미지 영역 */}
        <div className="w-[500px] h-[500px] bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400">
          상품 이미지
        </div>
        
        {/* 우측: 상품 정보 영역 */}
        <div className="flex-1 flex items-center justify-center text-gray-400">
          상품 정보
        </div>
      </div>
    </ProductDetailLayout>
  ),
};

export const List: Story = {
  render: () => (
    <ListLayout>
      <div className="flex items-center justify-center text-gray-400 py-20">
        리스트 콘텐츠
      </div>
    </ListLayout>
  ),
};

export const Detail: Story = {
  render: () => (
    <DetailLayout
      sidebar={
        <div className="flex items-center justify-center text-gray-400 py-20 bg-white rounded-lg">
          사이드바
        </div>
      }
    >
      <div className="flex items-center justify-center text-gray-400 py-20 bg-white rounded-lg">
        메인 콘텐츠
      </div>
    </DetailLayout>
  ),
};
