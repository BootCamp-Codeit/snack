import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Header } from "./header";

const meta: Meta<typeof Header> = {
  title: "Components/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    device: {
      control: "radio",
      options: ["pc", "mobile"],
      description: "디바이스",
    },
    isLoggedIn: {
      control: "boolean",
      description: "로그인 여부",
    },
    role: {
      control: "select",
      options: ["member", "admin", "superAdmin"],
      description: "권한 (로그인 시)",
    },
    cartCount: { control: "number", min: 0 },
  },
};

export default meta;

/** 로그인 전: PC (회원가입·로그인) */
export const Guest_PC_Auth: StoryObj<typeof Header> = {
  args: {
    device: "pc",
    isLoggedIn: false,
  },
};

/** 로그인 전: MO (주황 배경, 가운데 로고) */
export const Guest_Mobile: StoryObj<typeof Header> = {
  args: {
    device: "mobile",
    isLoggedIn: false,
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

/** 모바일 · 로그인 후 · 회원 */
export const LoggedIn_Mobile_Member: StoryObj<typeof Header> = {
  args: {
    device: "mobile",
    isLoggedIn: true,
    role: "member",
    cartCount: 2,
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

/** 모바일 · 로그인 후 · 관리자 */
export const LoggedIn_Mobile_Admin: StoryObj<typeof Header> = {
  args: {
    device: "mobile",
    isLoggedIn: true,
    role: "admin",
    cartCount: 2,
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

/** 모바일 · 로그인 후 · 최고관리자 */
export const LoggedIn_Mobile_SuperAdmin: StoryObj<typeof Header> = {
  args: {
    device: "mobile",
    isLoggedIn: true,
    role: "superAdmin",
    cartCount: 2,
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

/** PC · 로그인 후 · 회원 */
export const LoggedIn_PC_Member: StoryObj<typeof Header> = {
  args: {
    device: "pc",
    isLoggedIn: true,
    role: "member",
    cartCount: 2,
  },
};

/** PC · 로그인 후 · 관리자 */
export const LoggedIn_PC_Admin: StoryObj<typeof Header> = {
  args: {
    device: "pc",
    isLoggedIn: true,
    role: "admin",
    cartCount: 2,
  },
};

/** PC · 로그인 후 · 최고관리자 */
export const LoggedIn_PC_SuperAdmin: StoryObj<typeof Header> = {
  args: {
    device: "pc",
    isLoggedIn: true,
    role: "superAdmin",
    cartCount: 2,
  },
};
