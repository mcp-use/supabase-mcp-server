import { McpUseProvider, useWidget, type WidgetMetadata } from "mcp-use/react";
import React, { useEffect, useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import z from "zod/v4";
import { DataTable } from "../components/DataTable";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import "../styles.css";

const propSchema = z.object({
  query: z.string().default("").describe("The SQL query that was executed"),
  results: z
    .array(z.record(z.string(), z.any()))
    .default([])
    .describe("Query results as array of objects"),
  projectRef: z.string().default("").describe("Project reference ID"),
  projectName: z.string().default("").describe("Project name"),
  rowCount: z.number().default(0).describe("Number of rows returned"),
  tableName: z.string().optional().describe("Table name if previewing a table"),
});

type QueryResultsProps = z.infer<typeof propSchema>;

export const widgetMetadata: WidgetMetadata = {
  description:
    "Display SQL query results in an interactive table with sorting and filtering",
  props: propSchema,
  exposeAsTool: false,
};

const QueryResultsWidget: React.FC = () => {
  const { props, callTool, isPending } = useWidget<QueryResultsProps>();
  const [searchTerm, setSearchTerm] = useState("");
  const [editableQuery, setEditableQuery] = useState(props.query);
  const [isEditing, setIsEditing] = useState(false);
  const [currentResults, setCurrentResults] = useState(props.results || []);
  const [currentRowCount, setCurrentRowCount] = useState(props.rowCount);

  // Update local state when props change
  useEffect(() => {
    setEditableQuery(props.query);
    setCurrentResults(props.results || []);
    setCurrentRowCount(props.rowCount);
  }, [props.query, props.results, props.rowCount]);

  const handleExecuteQuery = async () => {
    if (!editableQuery.trim()) return;

    try {
      await callTool("execute-sql", { query: editableQuery });
      setIsEditing(false);
    } catch (error) {
      console.error("Error executing query:", error);
    }
  };

  const columns = useMemo(() => {
    if (!currentResults || currentResults.length === 0) return [];
    return Object.keys(currentResults[0]);
  }, [currentResults]);

  // Show skeleton loading while tool is executing
  if (isPending) {
    return (
      <McpUseProvider viewControls="fullscreen" autoSize>
        <Card className="relative p-6 rounded-3xl">
          <div className="animate-pulse">
            <div className="mb-6">
              <div className="h-4 bg-[hsl(var(--foreground)/0.1)] rounded w-32 mb-2"></div>
              <div className="h-8 bg-[hsl(var(--foreground)/0.1)] rounded w-40 mb-4"></div>
              <div className="h-32 bg-[hsl(var(--foreground)/0.1)] rounded"></div>
            </div>
            <div className="mb-4">
              <div className="h-10 bg-[hsl(var(--foreground)/0.1)] rounded"></div>
            </div>
            <div className="space-y-2">
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
      <Card className="relative p-6 rounded-3xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h5 className="text-[hsl(var(--foreground-muted))] text-sm mb-1">
                {props.projectName}
              </h5>
              <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
                Query Results
              </h2>
            </div>
            <div className="text-right">
              <Badge variant="default" className="text-sm">
                {currentRowCount} row{currentRowCount !== 1 ? "s" : ""}
              </Badge>
              {props.tableName && (
                <div className="text-xs text-[hsl(var(--foreground-muted))] mt-1">
                  Table: {props.tableName}
                </div>
              )}
            </div>
          </div>

          {/* Query Display */}
          <Card className="mt-4 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-[hsl(var(--foreground-muted))]">
                SQL Query:
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Query
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditableQuery(props.query);
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleExecuteQuery}>
                      Execute
                    </Button>
                  </>
                )}
              </div>
            </div>
            {!isEditing ? (
              <SyntaxHighlighter
                language="sql"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
                wrapLongLines={true}
              >
                {editableQuery}
              </SyntaxHighlighter>
            ) : (
              <textarea
                value={editableQuery}
                onChange={(e) => setEditableQuery(e.target.value)}
                className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm text-[hsl(var(--foreground))] font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]"
                rows={Math.max(3, editableQuery.split("\n").length)}
                placeholder="Enter SQL query..."
              />
            )}
          </Card>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search in results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]"
          />
        </div>

        {/* Results Table */}
        <DataTable
          columns={columns}
          data={currentResults}
          maxHeight="600px"
          enableSort={true}
          enableSearch={true}
          searchTerm={searchTerm}
          emptyMessage={
            searchTerm ? "No matching results found" : "No data to display"
          }
          footer={
            <p className="text-sm text-[hsl(var(--foreground-muted))]">
              {columns.length > 0 && `${columns.length} column(s)`}
            </p>
          }
        />
      </Card>
    </McpUseProvider>
  );
};

export default QueryResultsWidget;
