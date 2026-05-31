"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

type DialogContentProps = React.ComponentProps<
  typeof DialogPrimitive.Content
> & {
  /** 2중 모달 등에서 오버레이 z-index를 올릴 때 사용 */
  overlayClassName?: string
}

function DialogContent({
  className,
  children,
  overlayClassName,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 w-full max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[20px] bg-white p-8 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("mb-6", className)}
      {...props}
    />
  )
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex gap-3 mt-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-xl font-bold text-gray-900", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-gray-500 mt-1", className)}
      {...props}
    />
  )
}

function DialogLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="dialog-label"
      className={cn("text-sm font-semibold text-gray-900 mb-2 block", className)}
      {...props}
    />
  )
}

function DialogInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="dialog-input"
      className={cn(
        "w-full h-[50px] px-4 rounded-[12px] border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#E5762C] focus:ring-1 focus:ring-[#E5762C]",
        className
      )}
      {...props}
    />
  )
}

function DialogField({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-field"
      className={cn("flex flex-col", className)}
      {...props}
    />
  )
}

function DialogImageUpload({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-image-upload"
      className={cn(
        "w-[100px] h-[100px] rounded-[12px] border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors",
        className
      )}
      {...props}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  )
}

function DialogTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="dialog-textarea"
      className={cn(
        "w-full min-h-[120px] px-4 py-3 rounded-[12px] border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#E5762C] focus:ring-1 focus:ring-[#E5762C] resize-none",
        className
      )}
      {...props}
    />
  )
}

function DialogReadonlyField({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-readonly-field"
      className={cn(
        "w-full h-[50px] px-4 rounded-[12px] bg-[#FFF8F3] text-sm text-gray-900 flex items-center",
        className
      )}
      {...props}
    />
  )
}

interface RequestItem {
  id: string
  image?: string
  category: string
  name: string
  price: number
  quantity: number
}

interface DialogItemListProps extends React.ComponentProps<"div"> {
  items: RequestItem[]
  maxVisibleItems?: number
}

function DialogItemList({
  className,
  items,
  maxVisibleItems = 2,
  ...props
}: DialogItemListProps) {
  const needsScroll = items.length > maxVisibleItems
  
  return (
    <div
      data-slot="dialog-item-list"
      className={cn(
        "rounded-[12px] border border-gray-200 overflow-hidden",
        needsScroll && "max-h-[240px] overflow-y-auto",
        className
      )}
      {...props}
    >
      {items.map((item, index) => (
        <DialogItemCard key={item.id} item={item} isLast={index === items.length - 1} />
      ))}
    </div>
  )
}

interface DialogItemCardProps {
  item: RequestItem
  isLast?: boolean
}

function DialogItemCard({ item, isLast = false }: DialogItemCardProps) {
  const totalPrice = item.price * item.quantity
  
  return (
    <div
      data-slot="dialog-item-card"
      className={cn(
        "p-4",
        !isLast && "border-b border-gray-100"
      )}
    >
      <div className="flex gap-3">
        <div className="w-[60px] h-[60px] rounded-[8px] bg-gray-100 overflow-hidden flex-shrink-0">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-0.5">{item.category}</p>
          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm text-gray-900">{item.price.toLocaleString()}원</p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-500">수량: {item.quantity}개</p>
        <p className="text-base font-bold text-gray-900">{totalPrice.toLocaleString()}원</p>
      </div>
    </div>
  )
}

interface DialogSummaryProps extends React.ComponentProps<"div"> {
  totalCount: number
  totalPrice: number
}

function DialogSummary({
  className,
  totalCount,
  totalPrice,
  ...props
}: DialogSummaryProps) {
  return (
    <div
      data-slot="dialog-summary"
      className={cn(
        "flex justify-between items-center py-2",
        className
      )}
      {...props}
    >
      <p className="text-base font-bold text-gray-900">총 {totalCount}건</p>
      <p className="text-xl font-bold text-[#E5762C]">{totalPrice.toLocaleString()}원</p>
    </div>
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogField,
  DialogFooter,
  DialogHeader,
  DialogImageUpload,
  DialogInput,
  DialogItemList,
  DialogLabel,
  DialogOverlay,
  DialogPortal,
  DialogReadonlyField,
  DialogSummary,
  DialogTextarea,
  DialogTitle,
  DialogTrigger,
}

export type { RequestItem }
