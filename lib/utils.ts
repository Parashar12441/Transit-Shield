import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { IncidentSeverity, IncidentStatus, TrackingStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAgo(timestampMs: number): string {
  const diffSec = Math.max(0, Math.round((Date.now() - timestampMs) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.round(diffMin / 60);
  return `${diffHours}h ago`;
}

export function formatTimeIST(timestampMs: number): string {
  return new Date(timestampMs).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function formatDateIST(timestampMs: number): string {
  return new Date(timestampMs).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getSeverityBadgeClass(sev: IncidentSeverity): string {
  switch (sev) {
    case "CRITICAL":
      return "bg-nexus-critical/20 text-nexus-critical border-nexus-critical/60 shadow-glow-critical";
    case "HIGH":
      return "bg-nexus-warning/20 text-nexus-warning border-nexus-warning/60 shadow-glow-warning";
    case "MEDIUM":
      return "bg-nexus-cyan/20 text-nexus-cyan border-nexus-cyan/60";
    case "LOW":
      return "bg-border-bright text-tx-secondary border-border-bright";
  }
}

export function getStatusBadgeClass(status: IncidentStatus): string {
  switch (status) {
    case "NEW":
      return "bg-nexus-critical/20 text-nexus-critical border-nexus-critical/40";
    case "ACKNOWLEDGED":
      return "bg-nexus-warning/20 text-nexus-warning border-nexus-warning/40";
    case "RESPONDING":
      return "bg-nexus-blue/20 text-nexus-blue border-nexus-blue/40";
    case "RESOLVED":
      return "bg-nexus-safe/20 text-nexus-safe border-nexus-safe/40";
    case "CLOSED":
      return "bg-bg-elevated text-tx-muted border-border";
  }
}

export function getTrackingStatusBadgeClass(status: TrackingStatus): { dot: string; text: string } {
  switch (status) {
    case "LIVE":
      return { dot: "bg-nexus-safe shadow-glow-safe", text: "text-nexus-safe" };
    case "STALE":
      return { dot: "bg-nexus-warning shadow-glow-warning", text: "text-nexus-warning" };
    case "INCIDENT":
      return { dot: "bg-nexus-critical shadow-glow-critical animate-pulse", text: "text-nexus-critical" };
    case "DISCONNECTED":
      return { dot: "bg-tx-muted", text: "text-tx-muted" };
  }
}
