import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Pagination from "./pagination";

const meta: Meta<typeof Pagination> = {
  title: "component/pagination",
  component: Pagination,
  tags: ["autodocs"],
  argTypes: {
    totalPages: { control: { type: "number", min: 1 } },
    size: { control: "radio", options: ["sm", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Sm: Story = {
  name: "sm",
  render: (args) => {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        {...args}
        currentPage={page}
        onPageChange={setPage}
        size="sm"
      />
    );
  },
  args: {
    totalPages: 20,
  },
};

export const Lg: Story = {
  name: "lg",
  render: (args) => {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        {...args}
        currentPage={page}
        onPageChange={setPage}
        size="lg"
      />
    );
  },
  args: {
    totalPages: 20,
  },
};