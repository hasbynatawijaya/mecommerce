"use client";

import { Button } from "@/components/ui/button";
import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const Pagination = ({
  page,
  totalPages,
  urlParamName,
}: {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onChangePage = (type: "prev" | "next") => {
    const newPage = type === "next" ? Number(page) + 1 : Number(page) - 1;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || "page",
      value: newPage.toString(),
    });

    router.push(newUrl);
  };

  return (
    <div className="flex gap-2">
      <Button
        size="lg"
        variant="outline"
        className="w-12"
        disabled={Number(page) <= 1}
        onClick={() => onChangePage("prev")}
      >
        Previous
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="w-12"
        disabled={Number(page) >= totalPages}
        onClick={() => onChangePage("next")}
      >
        Next
      </Button>
    </div>
  );
};
export default Pagination;
