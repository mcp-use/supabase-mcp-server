import { TableCellsFilled } from "@openai/apps-sdk-ui/components/Icon";
import { McpUseProvider, useWidget, type WidgetMetadata } from "mcp-use/react";
import React from "react";
import { Supabase } from "../components/logo";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import "../styles.css";
import type { SchemaExplorerProps, Table } from "./types";
import { propSchema } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Explore database schema with tables, columns, and data types",
  inputs: propSchema,
  exposeAsTool: false, // Only accessible via tools
};

const TableCard: React.FC<{
  table: Table;
  onSelect: (tableName: string) => void;
}> = ({ table, onSelect }) => {
  const getTypeVariant = (
    type: string
  ): "default" | "primary" | "success" | "warning" => {
    switch (type) {
      case "BASE TABLE":
        return "primary";
      case "VIEW":
        return "success";
      case "FOREIGN TABLE":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Card
      onClick={() => onSelect(table.name)}
      className="p-4 hover:shadow-md hover:border-[hsl(var(--brand))] cursor-pointer transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TableCellsFilled className="w-6 h-6 text-[hsl(var(--brand))]" />
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">
              {table.name}
            </h4>
            {table.table_type && (
              <Badge variant={getTypeVariant(table.table_type)}>
                {table.table_type}
              </Badge>
            )}
          </div>
        </div>
        <span className="text-[hsl(var(--foreground-muted))]">→</span>
      </div>
    </Card>
  );
};

const SchemaExplorerWidget: React.FC = () => {
  const { props, toolInput, output, isPending, sendFollowUpMessage } = useWidget<SchemaExplorerProps>();

  console.log({props, toolInput, output, isPending, openai: window.openai});


  const handleTableSelect = async (tableName: string) => {
    // Call show-table tool to display table data
    try {
      await sendFollowUpMessage(`Show table ${tableName}`);
    } catch (error) {
      console.error("Failed to fetch table data:", error);
    }
  };

  // Show skeleton loading while tool is executing
  if (isPending) {
    return (
      <McpUseProvider viewControls="fullscreen" autoSize>

        <Card className="relative p-6 rounded-3xl">
          <div className="animate-pulse">
            <div className="mb-6">
              <div className="h-4 bg-[hsl(var(--foreground)/0.1)] rounded w-32 mb-2"></div>
              <div className="h-8 bg-[hsl(var(--foreground)/0.1)] rounded w-48"></div>
            </div>
            <div className="space-y-3">
              <div className="h-24 bg-[hsl(var(--foreground)/0.1)] rounded"></div>
              <div className="h-24 bg-[hsl(var(--foreground)/0.1)] rounded"></div>
              <div className="h-24 bg-[hsl(var(--foreground)/0.1)] rounded"></div>
            </div>
          </div>
        </Card>
      </McpUseProvider>
    );
  }

  return (
    <McpUseProvider viewControls="fullscreen" autoSize>

      <Card className="relative p-6 rounded-3xl">
        {/* Header */}
        <div className="mb-6">
          <h5 className="text-[hsl(var(--foreground-muted))] text-sm mb-1">
            {props.projectName}
          </h5>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
              Schema Explorer
            </h2>
            <Supabase className="w-[90px] text-[hsl(var(--brand))]" />
          </div>
        </div>


        {/* Tables List View */}
        {(!props.columns || props.columns.length === 0) && props.tables && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
                Tables in {props.schema}
              </h3>
              <Badge variant="default">
                {props.tables.length} table
                {props.tables.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {props.tables.length === 0 ? (
              <div className="text-center py-12 text-[hsl(var(--foreground-muted))]">
                <p className="mb-2">No tables found</p>
                <p className="text-xs">This schema appears to be empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {props.tables.map((table, idx) => (
                  <TableCard
                    key={idx}
                    table={table}
                    onSelect={handleTableSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!props.tables && !props.columns && (
          <div className="text-center py-12 text-[hsl(var(--foreground-muted))]">
            <p className="mb-2">No schema data available</p>
            <p className="text-xs">
              Use list-tables or get-table-schema tools to explore
            </p>
          </div>
        )}
      </Card>
    </McpUseProvider>
  );
};

export default SchemaExplorerWidget;
