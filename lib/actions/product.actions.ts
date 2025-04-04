"use server";

import { z } from "zod";

import { prisma } from "@/db/prisma";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants";
import { convertPrismaToPlainObject, formatError } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { productSchema, updateProductSchema } from "@/lib/validator";
import { Prisma } from "@prisma/client";

export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertPrismaToPlainObject(data);
}

export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({ where: { slug } });
}

export async function getProductById(id: string) {
  const data = await prisma.product.findFirst({ where: { id } });

  return convertPrismaToPlainObject(data);
}

export async function getAllProducts({
  limit,
  page,
  query,
  category,
  price,
  rating,
  sort,
}: {
  query: string;
  limit: number;
  page: number;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          },
        }
      : {};

  const categoryFilter: Prisma.ProductWhereInput =
    category && category !== "all"
      ? {
          category: {
            contains: category,
            mode: "insensitive",
          },
        }
      : {};

  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]),
          },
        }
      : {};

  const ratingFilter =
    rating && rating !== "all"
      ? {
          rating: {
            gte: Number(rating),
          },
        }
      : {};

  const data = await prisma.product.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy:
      sort === "lowest"
        ? { price: "asc" }
        : sort === "highest"
        ? { price: "desc" }
        : sort === "rating"
        ? { rating: "desc" }
        : { createdAt: "desc" },
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
  });

  const dataCount = await prisma.product.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function deleteProduct(id: string) {
  try {
    const productExist = await prisma.product.findFirst({
      where: { id },
    });

    if (!productExist) throw new Error("product not found");

    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");

    return { success: true, message: "Product deleted" };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function createProduct(data: z.infer<typeof productSchema>) {
  try {
    const product = productSchema.parse(data);
    await prisma.product.create({ data: product });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: product.id,
      },
    });

    if (!existingProduct) throw new Error("Product not found");

    await prisma.product.update({
      where: { id: product.id },
      data: product,
    });

    revalidatePath(`/admin/products/${existingProduct.id}`);

    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ["category"],
    _count: true,
  });

  return data;
}

export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: {
      isFeatured: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  return convertPrismaToPlainObject(data);
}
