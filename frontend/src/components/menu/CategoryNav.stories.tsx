import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { CategoryNav } from "./CategoryNav";
import { CATEGORIES, SUB_CATEGORIES } from "@/data/categories";
import type { Category } from "@/types/category";
import type { SubCategory } from "@/types/category";

const meta: Meta<typeof CategoryNav> = {
  title: "Components/Menu/CategoryNav",
  component: CategoryNav,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-[200px] w-full">
    {children}
  </div>
);

/** 기본: 음료 + 청량/탄산음료 선택  */
export const Default: Story = {
  args: {
    categories: CATEGORIES,
    subCategories: SUB_CATEGORIES,
    selectedCategoryId: 2,
    selectedSubCategoryId: 12,
    onCategorySelect: () => {},
    onSubCategorySelect: () => {},
  },
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
};

/** 모바일 뷰포트 */
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  args: {
    categories: CATEGORIES,
    subCategories: SUB_CATEGORIES,
    selectedCategoryId: 2,
    selectedSubCategoryId: 12,
    onCategorySelect: () => {},
    onSubCategorySelect: () => {},
  },
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
};

/** 데스크톱 뷰포트 */
export const Desktop: Story = {
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
  args: {
    categories: CATEGORIES,
    subCategories: SUB_CATEGORIES,
    selectedCategoryId: 2,
    selectedSubCategoryId: 12,
    onCategorySelect: () => {},
    onSubCategorySelect: () => {},
  },
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
};

/** 대분류만 선택, 소분류 미선택 */
export const CategoryOnly: Story = {
  args: {
    categories: CATEGORIES,
    subCategories: SUB_CATEGORIES,
    selectedCategoryId: 2,
    selectedSubCategoryId: null,
    onCategorySelect: () => {},
    onSubCategorySelect: () => {},
  },
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
};

/** 선택 없음 (대분류만 표시) */
export const NoSelection: Story = {
  args: {
    categories: CATEGORIES,
    subCategories: SUB_CATEGORIES,
    selectedCategoryId: null,
    selectedSubCategoryId: null,
    onCategorySelect: () => {},
    onSubCategorySelect: () => {},
  },
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
};

/** 클릭 시 연동 (인터랙티브) */
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [categoryId, setCategoryId] = useState<number | null>(2);
    const [subId, setSubId] = useState<number | null>(12);
    return (
      <Wrapper>
        <CategoryNav
          categories={CATEGORIES}
          subCategories={SUB_CATEGORIES}
          selectedCategoryId={categoryId}
          selectedSubCategoryId={subId}
          onCategorySelect={(c: Category) => {
            setCategoryId(c.id);
            setSubId(null);
          }}
          onSubCategorySelect={(s: SubCategory) => setSubId(s.id)}
        />
        <div className="p-4 text-sm text-[var(--gray-gray-500)]">
          대분류 ID: {categoryId ?? "—"} · 소분류 ID: {subId ?? "—"}
        </div>
      </Wrapper>
    );
  },
};
