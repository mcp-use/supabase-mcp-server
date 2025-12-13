import { MCPClient } from "mcp-use/client";  // No langchain!
import { error, MCPServer, object, text, widget } from "mcp-use/server";
import z from "zod/v4";
// Get Supabase Personal Access Token from environment
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_ACCESS_TOKEN) {
  throw new Error(
    "Missing SUPABASE_ACCESS_TOKEN environment variable.\n" +
    "Generate one at: https://supabase.com/dashboard/account/tokens"
  );
}

// Create MCP client connected to Supabase's official MCP server
const client = new MCPClient({
  mcpServers: {
    supabase: {
      url: `https://mcp.supabase.com/mcp?project_ref=${process.env.MCP_USE_OAUTH_SUPABASE_PROJECT_ID}`,
      headers: {
        Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      },
    }
  }
});

await client.createAllSessions();

const supabaseClient = client.getSession("supabase");

// Note: Supabase client session is ready for tool calls
console.log("Supabase MCP Analytics Server initialized");

// Helper function to extract JSON from Supabase's untrusted-data wrapper
function extractJsonFromResponse(text: string): any[] {
  console.log("Extracting JSON from text, length:", text.length);
  
  try {
    // First try direct JSON parse
    const directParse = JSON.parse(text);
    console.log("Direct parse successful, type:", typeof directParse, "isArray:", Array.isArray(directParse));
    
    // If it's already an array, return it
    if (Array.isArray(directParse)) {
      return directParse;
    }
    
    // If it's a string (double-encoded), we need to extract from wrapper
    if (typeof directParse === 'string') {
      console.log("Result is a string, extracting from wrapper...");
      text = directParse;
      // Fall through to extraction logic below
    } else {
      // It's some other type, just return it wrapped in array
      return [directParse];
    }
  } catch (directError) {
    console.log("Direct parse failed, will try extraction");
  }
  
  // Look for JSON within untrusted-data tags
  console.log("Looking for untrusted-data tags in text...");
  
  // The opening tag appears twice: once in the description and once as actual tag
  // We need to find the LAST occurrence followed by actual content
  // Pattern: find opening tag followed by newline and JSON array
  const dataMatch = text.match(/<untrusted-data-([a-f0-9-]+)>\s*(\[[\s\S]+?)\s*<\/untrusted-data-\1>/);
  
  if (dataMatch && dataMatch[2]) {
    const uuid = dataMatch[1];
    const content = dataMatch[2];
    console.log("Found data with UUID:", uuid);
    console.log("Extracted content length:", content.length);
    console.log("Extracted content preview:", content.substring(0, 100));
    try {
      const parsed = JSON.parse(content);
      console.log("Parsed successfully, items:", Array.isArray(parsed) ? parsed.length : 'not array');
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (parseError) {
      console.log("Failed to parse extracted JSON:", parseError);
      return [];
    }
  }
  
  console.log("No untrusted-data match found");
  return [];
}

const server = new MCPServer({
  name: "Supabase Widgets",
  version: "1.0.0",
  description: "A Supabase MCP server with Apps SDK widgets",
});

// ============================================================================
// DATABASE SCHEMA TOOLS
// ============================================================================

// List all tables
server.tool(
  {
    name: "list-tables",
    description: "List all tables in your Supabase database",
    schema: z.object({
      schemas: z.array(z.string()).optional().describe("Schemas to include (default: all)"),
    }),
    widget: {
      name: "schema-explorer",
      invoking: "Loading database tables...",
      invoked: "Tables loaded successfully",
    },
    annotations: { readOnlyHint: true }
  },
  async ({ schemas }) => {
    try {

      const result = await supabaseClient?.callTool("list_tables", {
        schemas: ["public"]
      });   

      const content = result?.content[0];
      console.log("content", content);
      let tables: any[] = [];
      
      if (content?.type === "text") {
        const data = extractJsonFromResponse(content?.text ?? "");
        tables = Array.isArray(data) ? data : [];
      }

      return widget({
        props: {
          tables,
          schemas: schemas || ["public"],
        },
        output: object({
          tables: tables.map((table) => ({
            name: table.name,
          })),
        })
      });
      } catch (err) {
        return error(`Error listing tables: ${err instanceof Error ? err.message : String(err)}`)
      }
  }
);

// Show table data
server.tool(
  {
    name: "show-table",
    description: "Display data from a specific table",
    schema: z.object({
      tableName: z.string().describe("Name of the table to display"),
      schema: z.string().default("public").describe("Schema name"),
      limit: z.number().default(100).describe("Maximum number of rows to fetch"),
    }),
    widget: {
      name: "table-viewer",
      invoking: "Loading table data...",
      invoked: "Table data loaded",
    },
    annotations: { readOnlyHint: true }
  },
  async ({ tableName, schema, limit }) => {
    try {
      if (!supabaseClient) {
        throw new Error("Supabase client not initialized");
      }

      // Fetch table data using SQL query
      const query = `SELECT * FROM ${schema}.${tableName} LIMIT ${limit}`;
      const result = await supabaseClient.callTool("execute_sql", {
        query,
      });
      console.log("query", Object.keys(result.content[0]));

      console.log("result", result);

      const content = result.content[0];
      let rows: any[] = [];
      
      if (content.type === "text") {
        console.log("Raw content.text preview:", content.text.substring(0, 300));
        const data = extractJsonFromResponse(content.text);
        console.log("data", data);
        rows = Array.isArray(data) ? data : [];
      }

      // Extract column names from first row
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      return widget({
        props: {
          tableName,
          schema,
          rows,
          columns,
          totalRows: rows.length,
          projectRef: process.env.MCP_USE_OAUTH_SUPABASE_PROJECT_ID,
        },
        output: object({
          tableName,
          schema,
          columns,
          totalRows: rows.length,
          projectRef: process.env.MCP_USE_OAUTH_SUPABASE_PROJECT_ID,
        }),
      });
    } catch (err) {
      return error(`Error loading table data: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
);

// Execute SQL query
server.tool(
  {
    name: "execute-sql",
    description: "Execute read-only SQL queries on your Supabase database",
    schema: z.object({
      query: z.string().describe("SQL query to execute"),
    }),
    widget: {
      name: "query-results",
      invoking: "Executing SQL query...",
      invoked: "Query completed",
    },
    annotations: { readOnlyHint: true }
  },
  async ({ query }, context) => {
    try {
      if (!supabaseClient) {
        throw new Error("Supabase client not initialized");
      }

      const result = await supabaseClient.callTool("execute_sql", {
        query,
      });

      const content = result.content[0];
      let results: any[] = [];
      
      if (content.type === "text") {
        const data = extractJsonFromResponse(content.text);
        console.log("data", data);
        results = Array.isArray(data) ? data : [];
      }

      return widget({
        props: {
          query,
          results,
          rowCount: results.length,
        },
        output: object({
          query,
          results,
          rowCount: results.length,
        }),
      });
    } catch (err) {
      return error(`Error executing SQL query: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
);

// ============================================================================
// PROJECT INFORMATION TOOLS
// ============================================================================

// Get project URL
server.resource(
  {
    name: "get-project-url",
    description: "Get the API URL for your Supabase project",
    uri: "supabase://project-url",
  },
  async () => {
    try {
      const result = await supabaseClient?.callTool("get_project_url", {});
      const url = result?.content[0] as { type: "text"; text: string } ?? "";
      return text(url.text);
    } catch (err) {
      return error(`Error getting project URL: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
);


// ============================================================================
// START SERVER
// ============================================================================

server.listen().then(() => {
  console.log(`Supabase Analytics MCP Server running - Read-only with beautiful widgets`);
});

