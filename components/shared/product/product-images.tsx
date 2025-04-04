"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

const ProductImages = ({ images }: { images: string[] }) => {
  const [currentImage, setCurrentImage] = useState<number>(0);

  return (
    <div className="space-y-4">
      <Image
        src={images[currentImage]}
        alt="product image"
        width={1000}
        height={1000}
        className="min-h-[300px] object-cover object-center"
      />
      <div className="flex">
        {images.map((image, i) => (
          <div
            key={image}
            onClick={() => setCurrentImage(i)}
            className={cn(
              "border mr-2 cursor-pointer hover:border-orange-600",
              {
                "border-orange-500": currentImage === i,
              }
            )}
          >
            <Image src={image} alt="image" width={100} height={100} />
          </div>
        ))}
      </div>
    </div>
  );
};
export default ProductImages;
