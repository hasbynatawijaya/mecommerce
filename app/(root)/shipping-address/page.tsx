import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ShippingAddress } from "@/types";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import ShippingAddressForm from "@/app/(root)/shipping-address/shipping-address-form";
import CheckoutSteps from "@/components/shared/checkout-steps";

export const metadata: Metadata = {
  title: "Shipping Address",
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect("/cart");

  const session = await auth();

  const userId = session?.user?.id;

  if (!userId) throw new Error("User not found");

  const user = await getUserById(userId);

  return (
    <>
      <CheckoutSteps current={1} />
      <ShippingAddressForm address={user?.address as ShippingAddress} />
    </>
  );
};
export default ShippingAddressPage;
