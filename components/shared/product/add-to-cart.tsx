"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";

import { Cart, CartItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { ToastAction } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

const AddToCart = ({ item, cart }: { item: CartItem; cart?: Cart }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const existItem = cart?.items.find(
    (cartItem) => item.productId === cartItem.productId
  );

  const onAddToCart = () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

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

  const onRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      toast({
        variant: res.success ? "default" : "destructive",
        description: res.message,
      });

      return;
    });
  };

  if (existItem)
    return (
      <div>
        <Button
          disabled={isPending}
          type="button"
          variant="outline"
          onClick={onRemoveFromCart}
        >
          {isPending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Minus className="h-4 w-4" />
          )}
        </Button>
        <span className="px-2">{existItem?.qty}</span>
        <Button
          disabled={isPending}
          type="button"
          variant="outline"
          onClick={onAddToCart}
        >
          {isPending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
    );

  return (
    <Button
      disabled={isPending}
      className="w-full"
      type="button"
      onClick={onAddToCart}
    >
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Plus /> Add to cart
        </>
      )}
    </Button>
  );
};
export default AddToCart;
