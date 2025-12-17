import { ExternalLink } from "lucide-react";
import { McpUseProvider, useWidget, type WidgetMetadata } from "mcp-use/react";
import React from "react";
import z from "zod/v4";
import { DataTable } from "../components/DataTable";
import { Supabase } from "../components/logo";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import "../styles.css";

const propSchema = z.object({
  tableName: z.string().describe("Name of the table"),
  schema: z.string().default("public").describe("Schema name"),
  rows: z.array(z.record(z.string(), z.any())).describe("Array of row data"),
  columns: z.array(z.string()).describe("Column names"),
  totalRows: z.number().optional().describe("Total number of rows"),
  projectRef: z.string().optional().describe("Supabase project reference ID"),
});

export const widgetMetadata: WidgetMetadata = {
  description: "Display table data in a formatted table view",
  props: propSchema,
  exposeAsTool: false,
};

const TableViewerWidget: React.FC = () => {
  const { props, isPending } = useWidget<z.infer<typeof propSchema>>();

  const supabaseTableUrl = props.projectRef
    ? `https://supabase.com/dashboard/project/${props.projectRef}/editor/${props.tableName}`
    : null;

  // Show skeleton loading while tool is executing
  if (isPending) {
    return (
      <McpUseProvider debugger viewControls autoSize>
        <Card className="relative p-6 rounded-3xl w-full">
          <div className="animate-pulse">
            <div className="mb-6">
              <div className="h-4 bg-[hsl(var(--foreground)/0.1)] rounded w-24 mb-2"></div>
              <div className="h-8 bg-[hsl(var(--foreground)/0.1)] rounded w-48"></div>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-[hsl(var(--foreground)/0.1)] rounded"></div>
              <div className="h-12 bg-[hsl(var(--foreground)/0.1)] rounded"></div>
              <div className="h-12 bg-[hsl(var(--foreground)/0.1)] rounded"></div>
              <div className="h-12 bg-[hsl(var(--foreground)/0.1)] rounded"></div>
              <div className="h-12 bg-[hsl(var(--foreground)/0.1)] rounded"></div>
            </div>
          </div>
        </Card>
      </McpUseProvider>
    );
  }

  return (
    <McpUseProvider viewControls="fullscreen" autoSize>
      <Card className="relative p-6 rounded-3xl w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h5 className="text-[hsl(var(--foreground-muted))] text-sm mb-1">
                {props.schema} schema
              </h5>
              <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
                {props.tableName}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Supabase className="w-[90px] h-8 text-[hsl(var(--brand))]" />
              {supabaseTableUrl && (
                <div className="">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => window.open(supabaseTableUrl, "_blank")}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Supabase
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Data */}
        <DataTable
          columns={props.columns || []}
          data={props.rows || []}
          maxHeight="600px"
          emptyMessage="No data available"
          footer={
            props.totalRows !== undefined ? (
              <p className="text-sm text-[hsl(var(--foreground-muted))]">
                Showing {props.rows?.length || 0} of {props.totalRows} row
                {props.totalRows !== 1 ? "s" : ""}
              </p>
            ) : props.rows && props.rows.length > 0 ? (
              <p className="text-sm text-[hsl(var(--foreground-muted))]">
                {props.rows.length} row{props.rows.length !== 1 ? "s" : ""}
              </p>
            ) : undefined
          }
        />
      </Card>
    </McpUseProvider>
  );
};

export default TableViewerWidget;
