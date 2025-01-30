import Link from "next/link";
import Image from "next/image";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ProductPrice from "@/components/shared/product/product-price";
import { Product } from "@/types";

const ProductCard = ({ product }: { product: Product }) => {
  const productDetailURL = `/product/${product.slug}`;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="p-0 items-center">
        <Link href={productDetailURL}>
          <Image
            src={product.images[0]}
            alt={product.name}
            width={300}
            height={300}
            priority
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 grid gap-4">
        <span className="text-xs">{product.brand}</span>
        <Link href={productDetailURL}>
          <h2 className="text-sm font-medium line-clamp-1">{product.name}</h2>
        </Link>
        <div className="flex-between gap-4">
          <p>{product.rating} stars</p>
          {product.stock > 0 ? (
            <ProductPrice value={Number(product.price)} />
          ) : (
            <p className="text-destructive">out of stock</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export default ProductCard;
