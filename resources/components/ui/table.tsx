import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("group/table w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "[&_tr]:border-b [&>tr]:bg-[hsl(var(--background-overlay))]",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t font-medium", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-[hsl(var(--border))] [&>td]:transition-colors [&>td]:hover:bg-[hsl(var(--background-overlay))] data-[state=selected]:bg-[hsl(var(--background-muted))]",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-4 text-left align-middle font-medium text-xs whitespace-nowrap text-[hsl(var(--foreground-lighter))] [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

interface TableHeadSortProps<TColumn extends string = string> {
  column: TColumn;
  currentSort: string;
  onSortChange: (column: TColumn) => void;
  children: React.ReactNode;
  className?: string;
}

function TableHeadSort<TColumn extends string = string>({
  column,
  currentSort,
  onSortChange,
  children,
  className,
}: TableHeadSortProps<TColumn>) {
  const [currentCol, currentOrder] = currentSort.split(":");
  const isActive = currentCol === column;
  const isAsc = isActive && currentOrder === "asc";
  const isDesc = isActive && currentOrder === "desc";

  const getSortIcon = () => {
    const baseIconClass = "w-3 h-3 absolute inset-0";

    return (
      <>
        <ArrowUp
          className={cn(
            baseIconClass,
            "transition-transform",
            isAsc ? "translate-y-0" : "translate-y-full"
          )}
        />
        <ArrowDown
          className={cn(
            baseIconClass,
            "transition-transform",
            isDesc ? "translate-y-0" : "-translate-y-full"
          )}
        />
        <ChevronsUpDown
          className={cn(
            baseIconClass,
            "transition-opacity opacity-80 md:opacity-40",
            !isActive ? "group-hover/table-head-sort:opacity-80" : "!opacity-0"
          )}
        />
      </>
    );
  };

  return (
    <button
      type="button"
      className={cn(
        "group/table-head-sort font-medium text-xs whitespace-nowrap flex items-center gap-1 cursor-pointer select-none !bg-transparent border-none p-0 w-full text-left text-[hsl(var(--foreground-lighter))]",
        className
      )}
      onClick={() => onSortChange(column)}
    >
      {children}
      <div className="w-3 h-3 relative overflow-hidden">{getSortIcon()}</div>
    </button>
  );
}
TableHeadSort.displayName = "TableHeadSort";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle text-[hsl(var(--foreground-light))] [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      "border-t p-4 text-sm text-[hsl(var(--foreground-muted))]",
      className
    )}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableHeadSort,
  TableRow,
};
