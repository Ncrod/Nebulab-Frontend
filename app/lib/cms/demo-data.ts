import { SEED_PRODUCTS } from "../../data/catalog";
import type { Customer, Order, OrderLine, OrderStatus } from "./types";

// Made-up customers and orders so the dashboard has something to show the first time the CMS opens.
// Deterministic (seeded random), relative to "today". The backend will replace all of it with real rows.

export const TAX_RATE = 0.08;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ["Ivan", "Camila", "Mateo", "Valentina", "Santiago", "Sofia", "Daniel", "Laura", "Andres", "Isabella", "Lucas", "Mariana", "Felipe", "Juliana", "Sebastian", "Natalia", "Tomas", "Paula", "Nicolas", "Daniela", "Emilio", "Carolina", "Diego", "Manuela", "Samuel", "Gabriela"];
const LAST = ["Mateo", "Rojas", "Herrera", "Gomez", "Castro", "Vargas", "Moreno", "Ortiz", "Silva", "Navarro", "Cruz", "Mendez", "Rios", "Salazar", "Pardo", "Duarte"];
const DAY = 86_400_000;
const HOUR = 3_600_000;
const round2 = (n: number) => Math.round(n * 100) / 100;

function pick<T>(random: () => number, list: T[]): T {
  return list[Math.floor(random() * list.length)];
}

let cached: { customers: Customer[]; orders: Order[] } | null = null;

export function getDemoData() {
  if (cached) return cached;
  const random = mulberry32(20260925);
  const now = Date.now();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const start = today.getTime();

  const customers: Customer[] = FIRST.map((first, i) => {
    const last = pick(random, LAST);
    const joined = new Date(start - Math.floor(random() * 110) * DAY + Math.floor(random() * DAY));
    return {
      id: `cus_${String(i + 1).padStart(3, "0")}`,
      name: `${first} ${last}`,
      email: `${first}.${last}${i + 1}@example.com`.toLowerCase(),
      status: i === 7 ? "blocked" : "active",
      notes: "",
      createdAt: joined.toISOString(),
    };
  });

  const orders: Order[] = [];
  const DAYS = 75;
  for (let back = DAYS; back >= 0; back--) {
    // A gentle upward trend, with weekends a little busier.
    const day = new Date(start - back * DAY);
    const weekend = day.getDay() === 0 || day.getDay() === 6 ? 1 : 0;
    const count = Math.floor(random() * (2.6 + ((DAYS - back) / DAYS) * 3.4 + weekend));
    for (let n = 0; n < count; n++) {
      const eligible = customers.filter((c) => new Date(c.createdAt).getTime() <= day.getTime() + DAY);
      if (eligible.length === 0) continue;
      const customer = pick(random, eligible);
      const lines: OrderLine[] = Array.from({ length: 1 + Math.floor(random() * random() * 3) }, () => {
        const product = pick(random, SEED_PRODUCTS);
        return {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          image: product.image,
          price: product.price,
          quantity: random() < 0.85 ? 1 : 2,
          options: product.options.map((option) => ({ name: option.name, value: pick(random, option.values) })),
        };
      });
      const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
      const tax = round2(subtotal * TAX_RATE);
      const roll = random();
      const status: OrderStatus =
        roll < 0.04 ? "cancelled" : roll < 0.07 ? "refunded" : back > 7 ? "delivered" : back > 2 ? "shipped" : "paid";
      // Today's orders cannot be in the future: they land in the hours before "now".
      const createdAt = new Date(Math.min(day.getTime() + 8 * HOUR + Math.floor(random() * 12 * HOUR), now - Math.floor(random() * 3 * HOUR))).toISOString();
      orders.push({
        id: "",
        number: "",
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        lines,
        subtotal,
        taxRate: TAX_RATE,
        tax,
        total: round2(subtotal + tax),
        status,
        cardLast4: String(Math.floor(random() * 9000) + 1000),
        createdAt,
        updatedAt: createdAt,
      });
    }
  }
  // Numbered in the order they were placed, listed newest first (like the CMS does).
  orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  orders.forEach((order, i) => {
    order.id = `ord_${String(i + 1).padStart(4, "0")}`;
    order.number = `NB-${1000 + i + 1}`;
  });
  orders.reverse();
  cached = { customers, orders };
  return cached;
}
