import {
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Wrench,
} from "lucide-react";
import { McpUseProvider, useWidget, type WidgetMetadata } from "mcp-use/react";
import React, { useEffect, useState } from "react";
import z from "zod/v4";
import { Supabase } from "./components/logo";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import "./styles.css";

const propSchema = z.object({
  daysBack: z
    .number()
    .default(7)
    .describe("Number of days back to show incidents"),
});

export const widgetMetadata: WidgetMetadata = {
  description:
    "Display Supabase service status and recent incidents from the status page",
  props: propSchema,
  exposeAsTool: true,
  annotations: { readOnlyHint: true },
  appsSdkMetadata: {
    "openai/widgetCSP": {
      connect_domains: ["https://status.supabase.com"],
      resource_domains: ["https://*.supabase.com"],
    },
  },
};

interface Incident {
  title: string;
  description: string;
  pubDate: string;
  link: string;
  status:
    | "Resolved"
    | "Monitoring"
    | "Identified"
    | "Investigating"
    | "Update"
    | "Completed"
    | "Scheduled";
}

const parseRSSFeed = (xmlText: string): Incident[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const items = xmlDoc.querySelectorAll("item");

  const incidents: Incident[] = [];

  items.forEach((item) => {
    const title = item.querySelector("title")?.textContent || "";
    const description = item.querySelector("description")?.textContent || "";
    const pubDate = item.querySelector("pubDate")?.textContent || "";
    const link = item.querySelector("link")?.textContent || "";

    // Extract status from description (last status update)
    let status: Incident["status"] = "Investigating";
    const statusMatch = description.match(
      /<strong>(Resolved|Monitoring|Identified|Investigating|Update|Completed|Scheduled)<\/strong>/
    );
    if (statusMatch) {
      status = statusMatch[1] as Incident["status"];
    }

    incidents.push({ title, description, pubDate, link, status });
  });

  return incidents;
};

const getStatusColor = (status: Incident["status"]) => {
  switch (status) {
    case "Resolved":
    case "Completed":
      return "success";
    case "Monitoring":
      return "warning";
    case "Identified":
    case "Update":
      return "default";
    case "Investigating":
      return "destructive";
    case "Scheduled":
      return "outline";
    default:
      return "default";
  }
};

const getStatusIcon = (status: Incident["status"]) => {
  switch (status) {
    case "Resolved":
    case "Completed":
      return <CheckCircle className="w-4 h-4" />;
    case "Monitoring":
      return <Clock className="w-4 h-4" />;
    case "Scheduled":
      return <Wrench className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const SupabaseStatusWidget: React.FC = () => {
  const { props, isPending } = useWidget<z.infer<typeof propSchema>>();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://status.supabase.com/history.rss");
        const xmlText = await response.text();
        const parsedIncidents = parseRSSFeed(xmlText);

        // Filter by date range
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - props.daysBack);

        const filteredIncidents = parsedIncidents.filter((incident) => {
          const incidentDate = new Date(incident.pubDate);
          return incidentDate >= cutoffDate;
        });

        setIncidents(filteredIncidents);
        setError(null);
      } catch (err) {
        setError("Failed to fetch Supabase status");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [props.daysBack]);

  // Show skeleton loading while fetching
  if (isPending || loading) {
    return (
      <McpUseProvider debugger viewControls autoSize>
        <Card className="relative p-6 rounded-3xl w-full">
          <div className="animate-pulse">
            <div className="mb-6">
              <div className="h-8 bg-[hsl(var(--foreground)/0.1)] rounded w-48 mb-2"></div>
              <div className="h-4 bg-[hsl(var(--foreground)/0.1)] rounded w-32"></div>
            </div>
            <div className="space-y-4">
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
      <Card className="relative p-6 rounded-3xl w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-1">
                Supabase Status
              </h2>
              <p className="text-sm text-[hsl(var(--foreground-muted))]">
                Last {props.daysBack} days
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Supabase className="w-[90px] h-8 text-[hsl(var(--brand))]" />
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  window.open("https://status.supabase.com", "_blank")
                }
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Status Page
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-8 text-[hsl(var(--destructive))]">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        )}

        {/* Incidents List */}
        {!error && incidents.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-[hsl(var(--success))]" />
            <p className="text-[hsl(var(--foreground-muted))]">
              No incidents in the last {props.daysBack} days. All systems
              operational!
            </p>
          </div>
        )}

        {!error && incidents.length > 0 && (
          <div className="space-y-4">
            {incidents.map((incident, index) => (
              <div
                key={index}
                className="border border-[hsl(var(--border))] rounded-lg p-4 hover:border-[hsl(var(--brand))] transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={getStatusColor(incident.status)}
                        className="gap-1"
                      >
                        {getStatusIcon(incident.status)}
                        {incident.status}
                      </Badge>
                      <span className="text-xs text-[hsl(var(--foreground-muted))]">
                        {formatDate(incident.pubDate)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
                      {incident.title}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(incident.link, "_blank")}
                    className="gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Details
                  </Button>
                </div>
                <div
                  className="text-sm text-[hsl(var(--foreground-muted))] prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: incident.description
                      .replace(/&lt;/g, "<")
                      .replace(/&gt;/g, ">")
                      .replace(/&apos;/g, "'"),
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </McpUseProvider>
  );
};

export default SupabaseStatusWidget;
