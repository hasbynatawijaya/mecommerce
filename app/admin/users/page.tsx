import { Metadata } from "next";
import Link from "next/link";

import { getAllUsers, deleteUser } from "@/lib/actions/user.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/shared/delete-dialog/DeleteDialog";
import Pagination from "@/components/shared/pagination";
import { formatId } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "User",
};

const AdminUserPage = async (props: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  const { page = "1", query = "" } = await props.searchParams;

  const users = await getAllUsers({ page: Number(page), query });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h1 className="h2-bold">Users</h1>
        {query ? (
          <div>
            Filtered by <i>&quot;{query}&quot;</i>{" "}
            <Link href="/admin/users">
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
              <TableHead>NAME</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>ROlE</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{formatId(user.id)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "user" ? "secondary" : "destructive"}
                    className="uppercase"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm" className="mr-2">
                    <Link href={`/admin/users/${user.id}`}>Edit</Link>
                  </Button>
                  <DeleteDialog id={user.id} action={deleteUser} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users?.totalPages > 1 ? (
          <Pagination page={Number(page)} totalPages={users?.totalPages} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
export default AdminUserPage;
