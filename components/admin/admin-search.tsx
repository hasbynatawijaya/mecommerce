"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AdminSearch = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
//   const formActionUrl = pathname.includes("/admin/orders")
//     ? "/admin/orders"
//     : pathname.includes("/admin/users")
//     ? "/admin/users"
//     : "/admin/products";

  const [queryValue, setQueryValue] = useState(searchParams.get("query") || "");

  useEffect(() => {
    setQueryValue(searchParams.get("query") || "");
  }, [searchParams]);

  return (
    <form action={pathname} method="GET">
      <Input
        type="search"
        placeholder="Search..."
        name="query"
        value={queryValue}
        className="md:w-[100px] lg:w-[300px]"
        onChange={(e) => setQueryValue(e.target.value)}
      />
      <Button type="submit" className="sr-only">
        Search
      </Button>
    </form>
  );
};
export default AdminSearch;
