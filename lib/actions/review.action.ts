"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { reviewSchema } from "@/lib/validator";
import { formatError } from "@/lib/utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";

export async function createReview(data: z.infer<typeof reviewSchema>) {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    const review = reviewSchema.parse({
      ...data,
      userId: session.user.id,
    });

    const product = await prisma.product.findFirst({
      where: {
        id: review.productId,
      },
    });

    if (!product) throw new Error("Product not found");

    const reviewExists = await prisma.review.findFirst({
      where: {
        productId: review.productId,
        userId: review.userId,
      },
    });

    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        await tx.review.update({
          where: { id: reviewExists.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        await tx.review.create({ data: review });
      }

      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: "Review Updated Successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: {
      productId: productId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    data,
  };
}

export async function getReviewByProductId({
  productId,
}: {
  productId: string;
}) {
  const session = await auth();

  if (!session) throw new Error("User is not authenticated");

  return await prisma.review.findFirst({
    where: {
      productId,
      userId: session?.user?.id,
    },
  });
}
