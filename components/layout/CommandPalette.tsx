"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFleet } from "@/lib/context/FleetContext";
import {
  Search,
  Map,
  Radio,
  AlertTriangle,
  GitBranch,
  History,
  Users2,
  BarChart3,
  Settings,
  Siren,
  X,
  ArrowRight,
} from "lucide-react";

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { buses, incidents, routes, selectBus, selectIncident, triggerSimulatedSos } = useFleet();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Toggle open
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase();

  const matchingBuses = buses
    .filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.registration.toLowerCase().includes(q) ||
        b.driverName.toLowerCase().includes(q)
    )
    .slice(0, 4);

  const matchingIncidents = incidents
    .filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.busId.toLowerCase().includes(q)
    )
    .slice(0, 3);

  const quickLinks = [
    { label: "Overview Command Center", href: "/", icon: Radio },
    { label: "Live Fleet Leaflet Map", href: "/map", icon: Map },
    { label: "Fleet Vehicles & Live Status", href: "/fleet", icon: Radio },
    { label: "Incident Command Desk", href: "/incidents", icon: AlertTriangle },
    { label: "Route Intelligence & Geofences", href: "/routes", icon: GitBranch },
    { label: "Trip History & Playback", href: "/trips", icon: History },
    { label: "Driver Shift Roster & Vehicles", href: "/drivers", icon: Users2 },
    { label: "Safety Analytics & SLA Trends", href: "/analytics", icon: BarChart3 },
    { label: "Organisation Compliance Settings", href: "/settings", icon: Settings },
  ].filter((item) => item.label.toLowerCase().includes(q));

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleSelectBus = (busId: string) => {
    selectBus(busId);
    router.push("/fleet");
    onClose();
  };

  const handleSelectIncident = (incId: string) => {
    selectIncident(incId);
    router.push("/incidents");
    onClose();
  };

  const handleTriggerSos = () => {
    triggerSimulatedSos();
    router.push("/incidents");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-bg-surface border border-nexus-cyan/40 rounded-xl shadow-2xl overflow-hidden flex flex-col tech-card">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-border flex items-center gap-3 bg-bg-elevated/70">
          <Search className="w-4 h-4 text-nexus-cyan shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search telemetry, vehicles (KNP-101), alerts, drivers, or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-tx-primary placeholder:text-tx-muted focus:outline-none font-sans"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-bg-surface border border-border text-[10px] font-mono text-tx-muted">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded text-tx-muted hover:text-tx-primary sm:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto text-xs">
          {/* Quick SOS Action */}
          <div
            onClick={handleTriggerSos}
            className="p-2.5 rounded-lg bg-nexus-critical/10 hover:bg-nexus-critical/20 border border-nexus-critical/30 cursor-pointer flex items-center justify-between text-nexus-critical transition-all font-mono"
          >
            <div className="flex items-center gap-2">
              <Siren className="w-4 h-4" />
              <span className="font-bold">Simulate Driver Emergency SOS (Instant Trigger)</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Matching Buses */}
          {matchingBuses.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-tx-muted uppercase tracking-wider mb-1.5 px-1 font-semibold">
                Fleet Vehicles &bull; Live Telemetry
              </div>
              <div className="space-y-1">
                {matchingBuses.map((bus) => (
                  <div
                    key={bus.id}
                    onClick={() => handleSelectBus(bus.id)}
                    className="p-2 rounded-lg bg-bg-elevated/60 hover:bg-bg-elevated border border-border/70 hover:border-nexus-cyan/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-tx-primary mr-2">
                        {bus.id}
                      </span>
                      <span className="text-[11px] text-tx-muted">{bus.registration}</span>
                      <div className="text-[11px] text-tx-secondary">
                        {bus.driverName} &bull; {bus.routeName}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-nexus-cyan font-bold">
                      {bus.speedKmh} km/h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Incidents */}
          {matchingIncidents.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-tx-muted uppercase tracking-wider mb-1.5 px-1 font-semibold">
                Safety Alerts &bull; Incident Triage
              </div>
              <div className="space-y-1">
                {matchingIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => handleSelectIncident(inc.id)}
                    className="p-2 rounded-lg bg-bg-elevated/60 hover:bg-bg-elevated border border-border/70 hover:border-nexus-cyan/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-tx-primary mr-2">
                        {inc.id}
                      </span>
                      <span className="text-[11px] font-semibold text-tx-primary">
                        {inc.title}
                      </span>
                      <div className="text-[11px] text-tx-secondary">
                        Bus: {inc.busId} ({inc.driverName})
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-nexus-critical/20 text-nexus-critical border border-nexus-critical/40 font-bold">
                      {inc.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Nav Links */}
          {quickLinks.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-tx-muted uppercase tracking-wider mb-1.5 px-1 font-semibold">
                Navigation Shortcuts
              </div>
              <div className="space-y-1">
                {quickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.href}
                      onClick={() => handleNavigate(item.href)}
                      className="p-2 rounded-lg hover:bg-bg-elevated cursor-pointer flex items-center justify-between text-tx-secondary hover:text-tx-primary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-nexus-cyan" />
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-tx-muted" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-bg-elevated/70 border-t border-border flex items-center justify-between text-[10px] font-mono text-tx-muted">
          <span>PRESS &uarr; &darr; TO NAVIGATE &bull; ENTER TO SELECT</span>
          <span className="text-nexus-cyan">NEXUS SPOTLIGHT</span>
        </div>
      </div>
    </div>
  );
}
