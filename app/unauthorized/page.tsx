import Link from "next/link";
import { Metadata } from "next";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Unauthorized access",
};

const UnauthorizedPage = () => {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center space-y-4 h-[calc(100vh-200px)]">
      <h1 className="h1-bold text-4xl">Unauthorized access</h1>
      <p className="text-muted-foreground">
        You don't have permission to access this page
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
};
export default UnauthorizedPage;
