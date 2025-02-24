"use client";

import { HTMLAttributes } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const menus = [
  {
    title: "Profile",
    href: "/user/profile",
  },
  {
    title: "Orders",
    href: "/user/orders",
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
