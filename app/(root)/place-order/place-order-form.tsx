"use client";

import { FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Check, Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/actions/order.actions";

const PlaceOrderForm = () => {
  const router = useRouter();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const res = await createOrder();

    if (res.redirectTo) router.push(res.redirectTo);
  };

  const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button disabled={pending} className="w-full">
        {pending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}{" "}
        Place Order
      </Button>
    );
  };

  return (
    <form className="w-full" onSubmit={onSubmit}>
      <SubmitButton />
    </form>
  );
};
export default PlaceOrderForm;
