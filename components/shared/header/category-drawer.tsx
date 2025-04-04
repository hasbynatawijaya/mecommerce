import { MenuIcon } from "lucide-react";
import Link from "next/link";

import { getAllCategories } from "@/lib/actions/product.actions";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const CategoryDrawer = async () => {
  const categories = await getAllCategories();

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline">
          <MenuIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle>Select a category</DrawerTitle>
          <div className="space-y-1 mt-4">
            {categories.map((category) => (
              <Button
                asChild
                key={category.category}
                variant="ghost"
                className="w-full justify-start"
              >
                <DrawerClose asChild>
                  <Link href={`/search?category=${category.category}`}>
                    {category.category} ({category._count})
                  </Link>
                </DrawerClose>
              </Button>
            ))}
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};
export default CategoryDrawer;
