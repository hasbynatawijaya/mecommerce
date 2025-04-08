import { z } from "zod";

import {
  productSchema,
  cartSchema,
  cartItemSchema,
  shippingAddressSchema,
  paymentMethodSchema,
  orderSchema,
  orderItemSchema,
  paymentResultSchema,
  reviewSchema,
} from "@/lib/validator";

export type CheckoutStepId =
  | "user-login"
  | "shipping-address"
  | "payment-method"
  | "place-order";
export type Product = z.infer<typeof productSchema> & {
  id: string;
  rating: string;
  createdAt: Date;
  review?: Review;
  numReviews: number;
};
export type Cart = z.infer<typeof cartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type OrderItem = z.infer<typeof orderItemSchema> & {
  product: Product;
};
export type Order = z.infer<typeof orderSchema> & {
  id: string;
  createdAt: Date | null;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderItems: OrderItem[];
  user: { name: string; email: string };
};
export type PaymentResult = z.infer<typeof paymentResultSchema>;
export type Review = z.infer<typeof reviewSchema> & {
  id: string;
  createdAt: Date;
  user?: { name: string };
};
