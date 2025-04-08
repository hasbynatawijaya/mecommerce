import { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { getOrderById } from "@/lib/actions/order.actions";
import OrderDetailsTable from "@/app/(root)/order/[id]/order-details-table";
import { ShippingAddress } from "@/types";
import ReviewForm from "@/components/shared/review-form/review-form";

export const metadata: Metadata = {
  title: "Order Details",
};

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;
  const session = await auth();

  const order = await getOrderById(id);

  if (!order) notFound();

  const transformedOrder = {
    ...order,
    shippingAddress: order.shippingAddress as ShippingAddress,
    orderItems: order.orderItems.map((item) => ({
      ...item,
      product: {
        ...item.product,
        review: Array.isArray(item.product.review)
          ? item.product.review[0] // Assuming you need the first review
          : item.product.review,
      },
    })),
  };

  return (
    <OrderDetailsTable
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
      order={transformedOrder}
      isAdmin={session?.user?.role === "admin" || false}
      userId={session?.user?.id as string}
    />
  );
};
export default OrderDetailsPage;
