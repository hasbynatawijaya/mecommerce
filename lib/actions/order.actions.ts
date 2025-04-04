"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertPrismaToPlainObject, formatError } from "@/lib/utils";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { orderSchema } from "@/lib/validator";
import { paypal } from "@/lib/paypal";
import { PaymentResult } from "@/types";
import { PAGE_SIZE } from "@/lib/constants";
import { Prisma } from "@prisma/client";

export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    const cart = await getMyCart();

    const userId = session?.user?.id;
    if (!userId) throw new Error("User not found");

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }

    if (!user?.address) {
      return {
        success: false,
        message: "No shipping address found",
        redirectTo: "/shipping-address",
      };
    }

    if (!user?.paymentMethod) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/payment-method",
      };
    }

    const order = orderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    const newOrderId = await prisma.$transaction(async (trx) => {
      const newOrder = await trx.order.create({
        data: order,
      });

      for (const item of cart.items) {
        await trx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: newOrder.id,
          },
        });
      }

      await trx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });

      return newOrder.id;
    });

    if (!newOrderId) throw new Error("Failed to create order");

    return {
      success: true,
      message: "Order created",
      redirectTo: `/order/${newOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
      user: {
        select: { name: true, email: true },
      },
    },
  });

  return convertPrismaToPlainObject(data);
}

export async function createPaypalOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (order) {
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: "",
            status: "",
            pricePaid: 0,
          },
        },
      });

      return {
        success: true,
        message: "Paypal order created successfully",
        data: paypalOrder.id,
      };
    } else {
      throw new Error("Order not found");
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function approvePaypalOrder(
  orderId: string,
  data: { paypalOrderId: string }
) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error("Order not found");

    const captureData = await paypal.capturePayment(data.paypalOrderId);

    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== "COMPLETED"
    ) {
      throw new Error("Paypal payment error");
    }

    await updateOrderTopaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        price_paid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "Your order has been paid",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function updateOrderTopaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) throw new Error("Order not found");
    if (order.isPaid) throw new Error("Order already paid");

    await prisma.$transaction(async (trx) => {
      for (const item of order.orderItems) {
        await trx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              increment: -item.qty,
            },
          },
        });
      }

      await trx.order.update({
        where: {
          id: orderId,
        },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paymentResult,
        },
      });
    });

    const updatedOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
      include: {
        orderItems: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!updatedOrder) throw new Error("Order not found");
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  page: number;
  limit?: number;
}) {
  const session = await auth();

  if (!session) throw new Error("User not authorized");

  const data = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where: {
      userId: session.user.id,
    },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function getOrderSummary() {
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  const totalSales = prisma.order.aggregate({
    _sum: { totalPrice: true },
  });

  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData = salesDataRaw.map((data) => ({
    month: data.month,
    totalSales: Number(data.totalSales),
  }));

  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    latestSales,
    salesData,
  };
}

export async function getAllOrders({
  limit = 5,
  page,
  query,
}: {
  limit: number;
  page: number;
  query: string;
}) {
  const queryFilter: Prisma.OrderWhereInput =
    query && query !== "all"
      ? {
          user: {
            name: {
              contains: query,
              mode: "insensitive",
            } as Prisma.StringFilter,
          },
        }
      : {};

  const data = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    where: { ...queryFilter },
  });

  const dataCount = await prisma.order.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({
      where: { id },
    });

    revalidatePath("/admin/orders");

    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function updateOrderToPaidCOD(orderId: string) {
  try {
    await updateOrderTopaid({ orderId });

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: "Order marked as paid" };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error("Order not found");
    if (!order.isPaid) throw new Error("Order is not paid");

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: "Order marked as delivered" };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
