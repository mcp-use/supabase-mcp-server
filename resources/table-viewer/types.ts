import z from "zod/v4";

export const propSchema = z.object({
  tableName: z.string().describe("Name of the table"),
  schema: z.string().default("public").describe("Schema name"),
  rows: z.array(z.record(z.string(), z.any())).describe("Array of row data"),
  columns: z.array(z.string()).describe("Column names"),
  totalRows: z.number().optional().describe("Total number of rows"),
  projectRef: z.string().optional().describe("Supabase project reference ID"),
});

export type TableViewerProps = z.infer<typeof propSchema>;

