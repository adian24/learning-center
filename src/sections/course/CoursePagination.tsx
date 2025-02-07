import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Dispatch, SetStateAction } from "react";

export function generatePaginationItems(
  currentPage: number,
  totalPages: number
) {
  const items = [];

  // Always show first page
  items.push(1);

  if (currentPage > 3) {
    items.push("ellipsis");
  }

  // Show pages around current page
  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    items.push(i);
  }

  if (currentPage < totalPages - 2) {
    items.push("ellipsis");
  }

  // Always show last page if there is more than one page
  if (totalPages > 1) {
    items.push(totalPages);
  }

  return items;
}

interface CoursePaginationProps {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  paginationItems: (string | number)[];
}

const CoursePagination = ({
  page,
  setPage,
  totalPages,
  paginationItems,
}: CoursePaginationProps) => {
  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={
              page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
          />
        </PaginationItem>

        {paginationItems.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                onClick={() => setPage(item as number)}
                isActive={page === item}
                className="cursor-pointer"
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={
              page >= totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CoursePagination;
