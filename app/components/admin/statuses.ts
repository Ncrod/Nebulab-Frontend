import type { CustomerStatus, OrderStatus } from "../../lib/cms/types";
import type { ProductStatus } from "../../data/catalog";
import type { Tone } from "./ui";

// Label and colour of every status the CMS shows. One place, so a list, a drawer and the dashboard agree.

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  paid: { label: "Paid", tone: "neutral" },
  shipped: { label: "Shipped", tone: "amber" },
  delivered: { label: "Delivered", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
  refunded: { label: "Refunded", tone: "orange" },
};

export const PRODUCT_STATUS: Record<ProductStatus, { label: string; tone: Tone }> = {
  live: { label: "Live", tone: "blue" },
  disabled: { label: "Disabled", tone: "red" },
};

export const CUSTOMER_STATUS: Record<CustomerStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "green" },
  blocked: { label: "Blocked", tone: "red" },
};
