import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";
import { Pencil, ChevronDown, Plus } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#2D2D2D" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "solid",
        "solid-selected",
        "solid-disabled",
        "outlined",
        "outlined-selected",
        "outlined-disabled",
        "etc",
        "invite",
        "social-google",
        "social-google-outlined",
        "social-kakao",
        "social-naver",
        "add",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "lg", "etc-sm", "etc-lg", "invite", "social-sm", "social-lg", "add-sm", "add-lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Solid Button - Small
export const SolidSmall: Story = {
  args: {
    variant: "solid",
    size: "sm",
    children: "Primary CTA 버튼",
  },
};

// Solid Button - Large
export const SolidLarge: Story = {
  args: {
    variant: "solid",
    size: "lg",
    children: "Primary CTA 버튼",
  },
};

// Solid Selected - Small
export const SolidSelectedSmall: Story = {
  args: {
    variant: "solid-selected",
    size: "sm",
    children: "Primary CTA 버튼",
  },
};

// Solid Selected - Large
export const SolidSelectedLarge: Story = {
  args: {
    variant: "solid-selected",
    size: "lg",
    children: "Primary CTA 버튼",
  },
};

// Solid Disabled - Small
export const SolidDisabledSmall: Story = {
  args: {
    variant: "solid-disabled",
    size: "sm",
    children: "Primary CTA 버튼",
  },
};

// Solid Disabled - Large
export const SolidDisabledLarge: Story = {
  args: {
    variant: "solid-disabled",
    size: "lg",
    children: "Primary CTA 버튼",
  },
};

// Solid with Icon - Small
export const SolidWithIconSmall: Story = {
  args: {
    variant: "solid",
    size: "sm",
    children: (
      <>
        Primary CTA 버튼
        <Pencil className="size-4" />
      </>
    ),
  },
};

// Solid with Icon - Large
export const SolidWithIconLarge: Story = {
  args: {
    variant: "solid",
    size: "lg",
    children: (
      <>
        Primary CTA 버튼
        <Pencil className="size-5" />
      </>
    ),
  },
};

// Solid Disabled with Icon - Small
export const SolidDisabledWithIconSmall: Story = {
  args: {
    variant: "solid-disabled",
    size: "sm",
    children: (
      <>
        Primary CTA 버튼
        <Pencil className="size-4" />
      </>
    ),
  },
};

// Solid Disabled with Icon - Large
export const SolidDisabledWithIconLarge: Story = {
  args: {
    variant: "solid-disabled",
    size: "lg",
    children: (
      <>
        Primary CTA 버튼
        <Pencil className="size-5" />
      </>
    ),
  },
};

// 모든 Solid 버튼 한눈에 보기
export const AllSolidVariants: Story = {
  parameters: {
    layout: "padded",
  },
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      {/* Solid */}
      <div className="flex items-start gap-4">
        <Button variant="solid" size="sm">Primary CTA 버튼</Button>
        <Button variant="solid" size="lg">Primary CTA 버튼</Button>
      </div>

      {/* Solid Selected */}
      <div className="flex items-start gap-4">
        <Button variant="solid-selected" size="sm">Primary CTA 버튼</Button>
        <Button variant="solid-selected" size="lg">Primary CTA 버튼</Button>
      </div>

      {/* Solid Disabled */}
      <div className="flex items-start gap-4">
        <Button variant="solid-disabled" size="sm">Primary CTA 버튼</Button>
        <Button variant="solid-disabled" size="lg">Primary CTA 버튼</Button>
      </div>

      {/* Solid with Icon */}
      <div className="flex items-start gap-4">
        <Button variant="solid" size="sm">
          Primary CTA 버튼 <Pencil className="size-4" />
        </Button>
        <Button variant="solid" size="lg">
          Primary CTA 버튼 <Pencil className="size-5" />
        </Button>
      </div>

      {/* Solid Disabled with Icon */}
      <div className="flex items-start gap-4">
        <Button variant="solid-disabled" size="sm">
          Primary CTA 버튼 <Pencil className="size-4" />
        </Button>
        <Button variant="solid-disabled" size="lg">
          Primary CTA 버튼 <Pencil className="size-5" />
        </Button>
      </div>
    </div>
  ),
};

// ========== Outlined 버튼 ==========

// Outlined Button - Small
export const OutlinedSmall: Story = {
  args: {
    variant: "outlined",
    size: "sm",
    children: "Primary CTA 버튼",
  },
};

// Outlined Button - Large
export const OutlinedLarge: Story = {
  args: {
    variant: "outlined",
    size: "lg",
    children: "Primary CTA 버튼",
  },
};

// Outlined Selected - Small
export const OutlinedSelectedSmall: Story = {
  args: {
    variant: "outlined-selected",
    size: "sm",
    children: "Primary CTA 버튼",
  },
};

// Outlined Selected - Large
export const OutlinedSelectedLarge: Story = {
  args: {
    variant: "outlined-selected",
    size: "lg",
    children: "Primary CTA 버튼",
  },
};

// Outlined Disabled - Small
export const OutlinedDisabledSmall: Story = {
  args: {
    variant: "outlined-disabled",
    size: "sm",
    children: "Primary CTA 버튼",
  },
};

// Outlined Disabled - Large
export const OutlinedDisabledLarge: Story = {
  args: {
    variant: "outlined-disabled",
    size: "lg",
    children: "Primary CTA 버튼",
  },
};

// Outlined Dropdown - Small
export const OutlinedDropdownSmall: Story = {
  args: {
    variant: "outlined",
    size: "sm",
    children: (
      <>
        Primary CTA 버튼
        <ChevronDown className="size-4" />
      </>
    ),
  },
};

// Outlined Dropdown - Large
export const OutlinedDropdownLarge: Story = {
  args: {
    variant: "outlined",
    size: "lg",
    children: (
      <>
        Primary CTA 버튼
        <ChevronDown className="size-5" />
      </>
    ),
  },
};

// 모든 Outlined 버튼 한눈에 보기
export const AllOutlinedVariants: Story = {
  parameters: {
    layout: "padded",
  },
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      {/* Outlined */}
      <div className="flex items-start gap-4">
        <Button variant="outlined" size="sm">Primary CTA 버튼</Button>
        <Button variant="outlined" size="lg">Primary CTA 버튼</Button>
      </div>

      {/* Outlined Selected */}
      <div className="flex items-start gap-4">
        <Button variant="outlined-selected" size="sm">Primary CTA 버튼</Button>
        <Button variant="outlined-selected" size="lg">Primary CTA 버튼</Button>
      </div>

      {/* Outlined Disabled */}
      <div className="flex items-start gap-4">
        <Button variant="outlined-disabled" size="sm">Primary CTA 버튼</Button>
        <Button variant="outlined-disabled" size="lg">Primary CTA 버튼</Button>
      </div>

      {/* Outlined Dropdown */}
      <div className="flex items-start gap-4">
        <Button variant="outlined" size="sm">
          Primary CTA 버튼 <ChevronDown className="size-4" />
        </Button>
        <Button variant="outlined" size="lg">
          Primary CTA 버튼 <ChevronDown className="size-5" />
        </Button>
      </div>
    </div>
  ),
};

// ========== Etc 버튼 ==========

// Etc Button - Small (89x30)
export const EtcSmall: Story = {
  args: {
    variant: "etc",
    size: "etc-sm",
    children: "전체 상품 삭제",
  },
};

// Etc Button - Large (139x50)
export const EtcLarge: Story = {
  args: {
    variant: "etc",
    size: "etc-lg",
    children: "전체 상품 삭제",
  },
};

// 모든 Etc 버튼 한눈에 보기
export const AllEtcVariants: Story = {
  parameters: {
    layout: "padded",
  },
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      {/* Etc */}
      <div className="flex items-start gap-4">
        <Button variant="etc" size="etc-sm">전체 상품 삭제</Button>
        <Button variant="etc" size="etc-lg">전체 상품 삭제</Button>
      </div>
    </div>
  ),
};

// ========== Invite 버튼 ==========

// Invite Button
export const InviteButton: Story = {
  args: {
    variant: "invite",
    size: "invite",
    children: (
      <>
        <Plus className="size-5" />
        회원 초대
      </>
    ),
  },
};

// ========== Social Login Icon 버튼 ==========

// Google - Small
export const SocialLoginIconGoogleSmall: Story = {
  args: {
    variant: "social-google",
    size: "social-sm",
    children: <img src="/assets/google.svg" alt="Google" className="w-5 h-5" />,
  },
};

// Google - Large
export const SocialLoginIconGoogleLarge: Story = {
  args: {
    variant: "social-google",
    size: "social-lg",
    children: <img src="/assets/google.svg" alt="Google" className="w-6 h-6" />,
  },
};

// Kakao - Small
export const SocialLoginIconKakaoSmall: Story = {
  args: {
    variant: "social-kakao",
    size: "social-sm",
    children: <img src="/assets/kakao.svg" alt="Kakao" className="w-6 h-5" />,
  },
};

// Kakao - Large
export const SocialLoginIconKakaoLarge: Story = {
  args: {
    variant: "social-kakao",
    size: "social-lg",
    children: <img src="/assets/kakao.svg" alt="Kakao" className="w-8 h-7" />,
  },
};

// Naver - Small
export const SocialLoginIconNaverSmall: Story = {
  args: {
    variant: "social-naver",
    size: "social-sm",
    children: <img src="/assets/naver.svg" alt="Naver" className="w-5 h-5" />,
  },
};

// Naver - Large
export const SocialLoginIconNaverLarge: Story = {
  args: {
    variant: "social-naver",
    size: "social-lg",
    children: <img src="/assets/naver.svg" alt="Naver" className="w-6 h-6" />,
  },
};

// 모든 Social Login Icon 버튼 한눈에 보기
export const AllSocialLoginIconVariants: Story = {
  parameters: {
    layout: "padded",
  },
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      {/* Small */}
      <div className="flex items-center gap-4">
        <Button variant="social-google" size="social-sm">
          <img src="/assets/google.svg" alt="Google" className="w-5 h-5" />
        </Button>
        <Button variant="social-kakao" size="social-sm">
          <img src="/assets/kakao.svg" alt="Kakao" className="w-6 h-5" />
        </Button>
        <Button variant="social-naver" size="social-sm">
          <img src="/assets/naver.svg" alt="Naver" className="w-5 h-5" />
        </Button>
      </div>

      {/* Large */}
      <div className="flex items-center gap-4">
        <Button variant="social-google" size="social-lg">
          <img src="/assets/google.svg" alt="Google" className="w-6 h-6" />
        </Button>
        <Button variant="social-kakao" size="social-lg">
          <img src="/assets/kakao.svg" alt="Kakao" className="w-8 h-7" />
        </Button>
        <Button variant="social-naver" size="social-lg">
          <img src="/assets/naver.svg" alt="Naver" className="w-6 h-6" />
        </Button>
      </div>
    </div>
  ),
};

// ========== Add 버튼 ==========

// Add Button - Small (120x54)
export const AddSmall: Story = {
  args: {
    variant: "add",
    size: "add-sm",
    children: (
      <>
        <Plus className="size-4" strokeWidth={2.5} />
        상품 등록
      </>
    ),
  },
};

// Add Button - Large (163x68)
export const AddLarge: Story = {
  args: {
    variant: "add",
    size: "add-lg",
    children: (
      <>
        <Plus className="size-6" strokeWidth={2.5} />
        상품 등록
      </>
    ),
  },
};

// 모든 Add 버튼 한눈에 보기
export const AllAddVariants: Story = {
  parameters: {
    layout: "padded",
  },
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center gap-4">
        <Button variant="add" size="add-sm">
          <Plus className="size-4" strokeWidth={2.5} />
          상품 등록
        </Button>
        <Button variant="add" size="add-lg">
          <Plus className="size-6" strokeWidth={2.5} />
          상품 등록
        </Button>
      </div>
    </div>
  ),
};
