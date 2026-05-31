import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ProductCard, ProductCardWithLike } from "./card";

const meta: Meta<typeof ProductCard> = {
  title: "UI/Card",
  component: ProductCard,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    image: {
      control: "text",
      description: "상품 이미지 URL",
    },
    category: {
      control: "text",
      description: "카테고리",
    },
    purchaseCount: {
      control: "number",
      description: "구매 횟수",
    },
    name: {
      control: "text",
      description: "상품명",
    },
    price: {
      control: "number",
      description: "가격",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

export const ProductCardDefault: Story = {
  args: {
    image: "",
    category: "청량 · 탄산음료",
    purchaseCount: 29,
    name: "코카콜라 제로",
    price: 2000,
  },
};

const ProductCardWithLikeWrapper = () => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <ProductCardWithLike
      image=""
      category="청량 · 탄산음료"
      purchaseCount={29}
      name="코카콜라 제로"
      price={2000}
      isLiked={isLiked}
      onLikeToggle={() => setIsLiked(!isLiked)}
    />
  );
};

export const ProductCardWithLikeDefault: Story = {
  render: () => <ProductCardWithLikeWrapper />,
};
