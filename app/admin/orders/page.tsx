import Link from "next/link";
import { Metadata } from "next";

import { auth } from "@/auth";
import { deleteOrder, getAllOrders } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/shared/delete-dialog/DeleteDialog";

export const metadata: Metadata = {
  title: "Admin Orders",
};

const AdminOrderPage = async (props: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  const { page = "1", query = "" } = await props.searchParams;

  const session = await auth();

  if (session?.user?.role !== "admin")
    throw new Error("User is not authorized");

  const orders = await getAllOrders({ limit: 5, page: Number(page), query });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h1 className="h2-bold">Orders</h1>
        {query ? (
          <div>
            Filtered by <i>&quot;{query}&quot;</i>{" "}
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">
                Clear
              </Button>
            </Link>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>BUYER</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>PAID</TableHead>
              <TableHead>DELIVERED</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{formatId(order.id)}</TableCell>
                <TableCell>
                  {formatDateTime(order.createdAt).dateTime}
                </TableCell>
                <TableCell>{order.user.name}</TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  {order.isPaid && order.paidAt
                    ? formatDateTime(order.paidAt).dateTime
                    : "Not paid"}
                </TableCell>
                <TableCell>
                  {order.isDelivered && order.deliveredAt
                    ? formatDateTime(order.deliveredAt).dateTime
                    : "Not delivered"}
                </TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm" className="mr-2">
                    <Link href={`/order/${order.id}`}>Details</Link>
                  </Button>
                  <DeleteDialog id={order.id} action={deleteOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders?.totalPages > 1 ? (
          <Pagination page={Number(page)} totalPages={orders?.totalPages} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
export default AdminOrderPage;
