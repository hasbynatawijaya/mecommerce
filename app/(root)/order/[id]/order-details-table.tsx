"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";

import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/types";
import {
  approvePaypalOrder,
  createPaypalOrder,
  deliverOrder,
  updateOrderToPaidCOD,
} from "@/lib/actions/order.actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const OrderDetailsTable = ({
  order,
  paypalClientId,
  isAdmin,
}: {
  order: Order;
  paypalClientId: string;
  isAdmin: boolean;
}) => {
  const { toast } = useToast();

  const {
    id,
    shippingAddress,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    isDelivered,
    paidAt,
    deliveredAt,
  } = order;

  const PaypalLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

    let textContent = "";

    if (isPending) {
      textContent = "Loading....";
    } else if (isRejected) {
      textContent = "Error loading PayPal";
    }

    return textContent;
  };

  const onCreatePaypalOrder = async () => {
    const res = await createPaypalOrder(order.id);

    if (!res.success) {
      toast({
        variant: "destructive",
        description: res.message,
      });
    }

    return res.data;
  };

  const onApprovePaypalOrder = async (data: { orderID: string }) => {
    const res = await approvePaypalOrder(order.id, {
      paypalOrderId: data.orderID,
    });

    toast({
      variant: res.success ? "default" : "destructive",
      description: res.message,
    });
  };

  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const onSubmit = () => {
      startTransition(async () => {
        const res = await updateOrderToPaidCOD(order.id);
        toast({
          variant: res.success ? "default" : "destructive",
          description: res.message,
        });
      });
    };

    return (
      <Button type="button" disabled={isPending} onClick={onSubmit}>
        {isPending ? "Processing...." : "Mark as paid"}
      </Button>
    );
  };

  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const onSubmit = () => {
      startTransition(async () => {
        const res = await deliverOrder(order.id);
        toast({
          variant: res.success ? "default" : "destructive",
          description: res.message,
        });
      });
    };

    return (
      <Button type="button" disabled={isPending} onClick={onSubmit}>
        {isPending ? "Processing...." : "Mark as deliverd"}
      </Button>
    );
  };

  return (
    <>
      <h1 className="py-4 text-2xl">Order {formatId(id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-4-y overflow-x-auto">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-2">Payment Method</h2>
              <p className="mb-2">{paymentMethod}</p>
              {isPaid ? (
                <Badge variant="secondary">
                  Paid at {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not paid</Badge>
              )}
            </CardContent>
          </Card>
          <Card className="my-2">
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-2">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p className="mb-2">
                {shippingAddress.streetAddress}, {shippingAddress.city}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
              {isDelivered ? (
                <Badge variant="secondary">
                  Delivered at {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not delivered</Badge>
              )}
            </CardContent>
          </Card>
          <Card className="my-2">
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.qty}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="px-2">
                          {formatCurrency(item.price)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {/* PayPal payment */}
              {!isPaid && paymentMethod === "PayPal" ? (
                <div>
                  <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                    <PaypalLoadingState />
                    <PayPalButtons
                      createOrder={onCreatePaypalOrder}
                      onApprove={onApprovePaypalOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              ) : (
                <></>
              )}

              {/* Cash on delivery */}
              {isAdmin && !isPaid && paymentMethod === "CashOnDelivery" ? (
                <MarkAsPaidButton />
              ) : (
                <></>
              )}
              {isAdmin && isPaid && !isDelivered ? (
                <MarkAsDeliveredButton />
              ) : (
                <></>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
export default OrderDetailsTable;
