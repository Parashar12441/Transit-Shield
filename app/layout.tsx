import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { FleetProvider } from "@/lib/context/FleetContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "NEXUS TRANSIT — Intelligent Fleet Safety & Incident Response",
  description: "Next-generation bus telemetry, proactive safety monitoring, and mission-critical incident dispatch system for Indian public transport and passenger fleets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-tx-primary min-h-screen flex antialiased font-sans">
        <AuthProvider>
          <FleetProvider>
            <AppShell>{children}</AppShell>
          </FleetProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
