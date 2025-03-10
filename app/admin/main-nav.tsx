"use client";

import { HTMLAttributes } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const menus = [
  {
    title: "Overview",
    href: "/admin/overview",
  },
  {
    title: "Products",
    href: "/admin/products",
  },
  {
    title: "Orders",
    href: "/admin/orders",
  },
  {
    title: "Users",
    href: "/admin/users",
  },
];

const MainNav = ({ className, ...props }: HTMLAttributes<HTMLElement>) => {
  const pathname = usePathname();
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {menus.map((menu) => (
        <Link
          key={menu.href}
          href={menu.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            { "text-muted-foreground": !pathname.includes(menu.href) }
          )}
        >
          {menu.title}
        </Link>
      ))}
    </nav>
  );
};
export default MainNav;
