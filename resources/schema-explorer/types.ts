import z from "zod/v4";


const columnSchema = z.object({
  name: z.string(),
  data_type: z.string(),
  format: z.string().optional(),
  default_value: z.string().nullable().optional(),
});

const tableSchema = z.object({
  name: z.string(),
  table_type: z.string().optional(),
  rows: z.number().optional(),
  columns: z.array(columnSchema).optional().default([]).describe("Column definitions for a table"),
  rls_enabled: z.string().optional(),
});



export const propSchema = z.object({
  projectRef: z.string().default("").describe("Project reference ID"),
  projectName: z.string().default("").describe("Project name"),
  schema: z.string().default("public").describe("Database schema name"),
  tables: z.array(tableSchema).optional().default([]).describe("List of tables in schema"),
  tableName: z.string().optional().describe("Specific table name if viewing schema"),
  columns: z.array(columnSchema).optional().default([]).describe("Column definitions for a table"),
  migrations: z.array(z.any()).optional().default([]).describe("List of migrations"),
});

export type SchemaExplorerProps = z.infer<typeof propSchema>;
export type Table = z.infer<typeof tableSchema>;
export type Column = z.infer<typeof columnSchema>;

