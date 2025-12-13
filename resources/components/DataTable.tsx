import dayjs from "dayjs";
import { ArrowDown, ArrowUp } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { TableBody, TableCell, TableHead, TableRow } from "./ui/table";

export interface DataTableColumn {
  key: string;
  label?: string;
}

export interface DataTableProps {
  columns: string[] | DataTableColumn[];
  data: Record<string, any>[];
  maxHeight?: string;
  enableSort?: boolean;
  enableSearch?: boolean;
  searchTerm?: string;
  footer?: React.ReactNode;
  emptyMessage?: string;
}

const isDateValue = (value: any): boolean => {
  if (typeof value !== "string") return false;
  // Check for ISO 8601 format or common date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO 8601
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
  ];
  return datePatterns.some((pattern) => pattern.test(value));
};

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  const stringValue = String(value);

  // Format dates
  if (isDateValue(stringValue)) {
    const date = dayjs(stringValue);
    if (date.isValid()) {
      // If time is 00:00:00, show just the date
      if (date.format("HH:mm:ss") === "00:00:00") {
        return date.format("MMM D, YYYY");
      }
      // Otherwise show date and time
      return date.format("MMM D, YYYY HH:mm");
    }
  }

  return stringValue;
};

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  maxHeight = "600px",
  enableSort = false,
  enableSearch = false,
  searchTerm = "",
  footer,
  emptyMessage = "No data to display",
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Normalize columns
  const normalizedColumns = useMemo(() => {
    return columns.map((col) =>
      typeof col === "string" ? { key: col, label: col } : col
    );
  }, [columns]);

  // Process data (filter and sort)
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter by search term
    if (enableSearch && searchTerm) {
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (enableSort && sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection, enableSearch, enableSort]);

  const handleSort = (columnKey: string) => {
    if (!enableSort) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  if (processedData.length === 0) {
    return (
      <div className="text-center py-8 text-[hsl(var(--foreground-muted))]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <div className="overflow-y-auto relative" style={{ maxHeight }}>
        <table className="group/table w-full caption-bottom text-sm">
          <thead className="sticky top-0 z-10 bg-[hsl(var(--background-surface))] [&_tr]:border-b">
            <TableRow>
              {normalizedColumns.map((column) => (
                <TableHead
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className={`bg-[hsl(var(--background-overlay))] shadow-[0_1px_0_0_hsl(var(--border))] ${
                    enableSort
                      ? "cursor-pointer hover:bg-[hsl(var(--background-overlay))] transition-colors"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label || column.key}</span>
                    {enableSort && sortColumn === column.key && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </thead>
          <TableBody>
            {processedData.map((row, idx) => (
              <TableRow key={idx}>
                {normalizedColumns.map((column) => {
                  const rawValue = row[column.key];
                  const formattedValue = formatCellValue(rawValue);
                  const displayValue =
                    rawValue === null || rawValue === undefined
                      ? "-"
                      : formattedValue;

                  return (
                    <TableCell
                      key={column.key}
                      className="text-foreground-lighter max-w-xs"
                      title={formattedValue}
                    >
                      <div className="truncate font-mono text-xs">
                        {displayValue}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
      {footer && (
        <div className="border-t border-[hsl(var(--border))] p-4 bg-[hsl(var(--background-surface))]">
          {footer}
        </div>
      )}
    </Card>
  );
};
