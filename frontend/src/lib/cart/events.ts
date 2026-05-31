export const CART_LINE_COUNT_UPDATED_EVENT = "snack-cart-line-count-updated"

export function notifyCartLineCountChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(CART_LINE_COUNT_UPDATED_EVENT))
}
