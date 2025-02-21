"use client";

import { useTransition } from "react";
import { Loader, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Cart, CartItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const onAddToCart = (cartItem: CartItem) => {
    startTransition(async () => {
      const res = await addItemToCart(cartItem);

      if (!res?.success) {
        toast({ variant: "destructive", description: res?.message });
        return;
      }

      toast({
        variant: res.success ? "default" : "destructive",
        description: res.message,
      });
    });
  };

  const onRemoveFromCart = async (productId: string) => {
    startTransition(async () => {
      const res = await removeItemFromCart(productId);

      toast({
        variant: res.success ? "default" : "destructive",
        description: res.message,
      });

      return;
    });
  };

  return (
    <>
      <h1 className="py-1 h2-bold">Shopping Cart</h1>

      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty.{" "}
          <Link href="/" className="text-blue-500">
            Go Shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((cartItem) => (
                  <TableRow key={cartItem.slug}>
                    <TableCell className="p-4">
                      <Link
                        href={`/product/${cartItem.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={cartItem.image}
                          alt={cartItem.name}
                          width={50}
                          height={50}
                        />
                        <span className="px-2">{cartItem.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="flex-center gap-2 p-4">
                      <Button
                        disabled={isPending}
                        variant="outline"
                        type="button"
                        onClick={() => onRemoveFromCart(cartItem.productId)}
                      >
                        {isPending ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                      </Button>
                      <span>{cartItem.qty}</span>
                      <Button
                        disabled={isPending}
                        variant="outline"
                        type="button"
                        onClick={() => onAddToCart(cartItem)}
                      >
                        {isPending ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right align-middle p-4">
                      {formatCurrency(cart.itemsPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Card>
            <CardContent className="p-4 gap-4">
              <div className="pb-3 text-xl">
                Subtotal ({cart.items.reduce((a, c) => a + c.qty, 0)}):{" "}
                <span className="font-bold">
                  {formatCurrency(cart.itemsPrice)}
                </span>
              </div>
              <Button
                className="w-full"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => router.push("/shipping-address"))
                }
              >
                {isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Proceed to checkout"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
export default CartTable;
