"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { CartItem } from "@/types";
import {
  convertPrismaToPlainObject,
  formatError,
  roundTwoDecimalPlaces,
} from "@/lib/utils";
import { cartItemSchema, cartSchema } from "@/lib/validator";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";

const calculateCartPrices = (items: CartItem[]) => {
  const itemsPrice = roundTwoDecimalPlaces(
    items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
  );
  const shippingPrice = roundTwoDecimalPlaces(itemsPrice > 100 ? 0 : 10);
  const taxPrice = roundTwoDecimalPlaces(0.15 * itemsPrice);
  const totalPrice = roundTwoDecimalPlaces(
    itemsPrice + taxPrice + shippingPrice
  );

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("cart session not found");

    const session = await auth();
    const userId = session?.user?.id ? session.user.id : undefined;

    const cart = await getMyCart();

    const item = cartItemSchema.parse(data);

    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    if (!product) throw new Error("Product not found");

    if (!cart) {
      const newCart = cartSchema.parse({
        userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calculateCartPrices([item]),
      });

      await prisma.cart.create({
        data: newCart,
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    } else {
      const existItem = (cart.items as CartItem[]).find(
        (cartItem) => cartItem.productId === item.productId
      );

      if (existItem) {
        if (product.stock < existItem.qty + 1)
          throw new Error("Items out of stock");
        existItem.qty += 1;
      } else {
        if (product.stock < 1) throw new Error("Items out of stock");
        cart.items.push(item);
      }

      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calculateCartPrices(cart.items as CartItem[]),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          existItem ? "Updated in" : "Added to"
        } cart`,
      };
    }
  } catch (error) {
    return {
      success: true,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("cart session not found");

    const session = await auth();
    const userId = session?.user?.id ? session.user.id : undefined;

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId: sessionCartId },
    });

    if (!cart) return undefined;

    return convertPrismaToPlainObject({
      ...cart,
      items: cart.items as CartItem[],
      itemsPrice: cart.itemsPrice.toString(),
      totalPrice: cart.totalPrice.toString(),
      shippingPrice: cart.shippingPrice.toString(),
      taxPrice: cart.taxPrice.toString(),
    });
  } catch (error) {
    console.error(error);
  }
}

export async function removeItemFromCart(productId: string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("cart session not found");

    const product = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!product) throw new Error("Product not found");

    const cart = await getMyCart();

    if (!cart) throw new Error("Cart not found");

    const existItem = (cart.items as CartItem[]).find(
      (cartItem) => cartItem.productId === productId
    );

    if (existItem?.qty === 1) {
      cart.items = (cart.items as CartItem[]).filter(
        (cartItem) => cartItem.productId !== existItem.productId
      );
    } else {
      existItem!.qty -= 1;
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calculateCartPrices(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} removed from cart`,
    };
  } catch (error) {
    return {
      sucess: false,
      message: formatError(error),
    };
  }
}
