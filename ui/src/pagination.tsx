import type { Table } from "@tanstack/react-table";
import { RotateCw } from "lucide-react";

import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "./utils";

interface PaginationProps<T> {
  table: Table<T>;
  className?: string;
  pageSizeOptions?: number[];
  isFetching?: boolean;
}

export const Pagination = <T,>({
  table,
  className,
  pageSizeOptions = [5, 10, 25, 50],
  isFetching = false,
}: PaginationProps<T>) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between space-x-2 py-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Itens por página</span>

        <Select
          defaultValue={table.getState().pagination.pageSize.toString()}
          onValueChange={(e) => {
            table.setPageSize(Number(e));
          }}
        >
          <SelectTrigger className="w-16">
            <SelectValue placeholder="10" />
          </SelectTrigger>

          <SelectContent>
            {pageSizeOptions.map((pageSize) => (
              <SelectItem key={pageSize} value={pageSize.toString()}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isFetching ? <RotateCw className="h-4 w-4 animate-spin" /> : null}

      <div className="space-x-2">
        <Button
          disabled={!table.getCanPreviousPage()}
          onClick={() => {
            table.setPageIndex(0);
          }}
          size="icon"
          variant="outline"
        >
          {"<<"}
        </Button>

        <Button
          disabled={!table.getCanPreviousPage()}
          onClick={() => {
            table.previousPage();
          }}
          size="icon"
          variant="outline"
        >
          {"<"}
        </Button>

        <span className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </span>

        <Button
          disabled={!table.getCanNextPage()}
          onClick={() => {
            table.nextPage();
          }}
          size="icon"
          variant="outline"
        >
          {">"}
        </Button>

        <Button
          disabled={!table.getCanNextPage()}
          onClick={() => {
            table.setPageIndex(table.getPageCount() - 1);
          }}
          size="icon"
          variant="outline"
        >
          {">>"}
        </Button>
      </div>
    </div>
  );
};
