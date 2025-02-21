import { Fragment } from "react";

import { cn } from "@/lib/utils";
import { CheckoutStepId } from "@/types";

type CheckoutStepLabel = {
  id: CheckoutStepId;
  label: string;
};

const STEPS: CheckoutStepLabel[] = [
  {
    id: "user-login",
    label: "User Login",
  },
  {
    id: "shipping-address",
    label: "Shipping Address",
  },
  {
    id: "payment-method",
    label: "Payment Method",
  },
  {
    id: "place-order",
    label: "Place Order",
  },
];

const CheckoutSteps = ({ current = 0 }: { current: number }) => {
  return (
    <div className="flex-between flex-col md:flex-row space-x-2 space-y-2 mb-10">
      {STEPS.map((step, index) => (
        <Fragment key={step.id}>
          <div
            className={cn("p-2 w-56 rounded-full text-center text-sm", {
              "bg-secondary": index === current,
            })}
          >
            {step.label}
          </div>
          {step.id !== "place-order" ? (
            <hr className="w-16 border-t border-gray-300 mx-2" />
          ) : (
            <></>
          )}
        </Fragment>
      ))}
    </div>
  );
};
export default CheckoutSteps;
