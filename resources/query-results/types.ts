import z from "zod/v4";

export const propSchema = z.object({
  query: z.string().default("").describe("The SQL query that was executed"),
  results: z.array(z.record(z.string(), z.any())).default([]).describe("Query results as array of objects"),
  projectRef: z.string().default("").describe("Project reference ID"),
  projectName: z.string().default("").describe("Project name"),
  rowCount: z.number().default(0).describe("Number of rows returned"),
  tableName: z.string().optional().describe("Table name if previewing a table"),
});

export type QueryResultsProps = z.infer<typeof propSchema>;

