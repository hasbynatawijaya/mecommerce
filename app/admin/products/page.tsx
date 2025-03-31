import Link from "next/link";
import { Metadata } from "next";

import { deleteProduct, getAllProducts } from "@/lib/actions/product.actions";
import { formatCurrency, formatId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import DeleteDialog from "@/components/shared/delete-dialog/DeleteDialog";

export const metadata: Metadata = {
  title: "Admin Products",
};

const AdminProductsPage = async (props: {
  searchParams: Promise<{ page: string; query: string; category: string }>;
}) => {
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const query = searchParams.query || "";
  const category = searchParams.category || "";

  const products = await getAllProducts({
    limit: 5,
    query,
    page,
    category,
  });

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <h1 className="h2-bold">Products</h1>
          {query ? (
            <div>
              Filtered by <i>&quot;{query}&quot;</i>{" "}
              <Link href="/admin/products">
                <Button variant="outline" size="sm">
                  Clear
                </Button>
              </Link>
            </div>
          ) : (
            <></>
          )}
        </div>
        <Button asChild variant="default">
          <Link href="/admin/products/create">Create Product</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.data.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{formatId(product.id)}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.rating}</TableCell>
              <TableCell className="flex gap-1">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/products/${product.id}`}>Edit</Link>
                </Button>
                <DeleteDialog id={product.id} action={deleteProduct} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {products.totalPages > 1 ? (
        <Pagination page={page} totalPages={products.totalPages} />
      ) : (
        <></>
      )}
    </div>
  );
};

export default AdminProductsPage;
