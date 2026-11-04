"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Siren,
  X,
  AlertOctagon,
  Radio,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Activity,
  MapPin,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useFleet } from "@/lib/context/FleetContext";

const IncidentMiniMap = dynamic(
  () => import("@/components/incidents/IncidentMiniMap").then((m) => m.IncidentMiniMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-36 rounded-lg border border-border bg-bg-surface flex items-center justify-center text-xs text-tx-muted font-mono">
        CALIBRATING TACTICAL EMERGENCY MAP...
      </div>
    ),
  }
);

export function EmergencyModal() {
  const router = useRouter();
  const {
    isEmergencyModalOpen,
    setEmergencyModalOpen,
    buses,
    triggerSimulatedSos,
    criticalIncidentsCount,
    incidents,
    selectIncident,
  } = useFleet();

  const [selectedBusToTrigger, setSelectedBusToTrigger] = useState<string>("");
  const [lastTriggeredId, setLastTriggeredId] = useState<string | null>(null);

  if (!isEmergencyModalOpen) return null;

  const handleTrigger = () => {
    const newId = triggerSimulatedSos(selectedBusToTrigger || undefined);
    setLastTriggeredId(newId);
  };

  const handleOpenIncident = (id: string) => {
    selectIncident(id);
    setEmergencyModalOpen(false);
    router.push("/incidents");
  };

  const activeCritical = incidents.filter(
    (i) => i.severity === "CRITICAL" && !["RESOLVED", "CLOSED"].includes(i.status)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-bg-surface border border-nexus-critical/40 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-nexus-critical/20 via-nexus-critical/10 to-transparent border-b border-nexus-critical/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-nexus-critical/30 border border-nexus-critical/60 flex items-center justify-center text-nexus-critical shadow-glow-critical animate-pulse">
              <Siren className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-tx-primary tracking-wide flex items-center gap-2">
                EMERGENCY DISPATCH &amp; SOS OPERATIONS
              </h2>
              <p className="text-xs text-nexus-critical font-mono">
                CRITICAL FLEET INCIDENT COORDINATION DESK
              </p>
            </div>
          </div>
          <button
            onClick={() => setEmergencyModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-bg-elevated text-tx-muted hover:text-tx-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Compliance Disclaimer Notice */}
          <div className="p-3.5 rounded-lg bg-nexus-warning/10 border border-nexus-warning/40 text-xs text-nexus-warning leading-relaxed flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">SIMULATION COMPLIANCE NOTICE:</span> In India, 112 is the official pan-India emergency helpline. This demonstration console runs inside a verified sandbox environment and will NOT initiate live 112 calls or transmit data to external police/emergency dispatch systems.
            </div>
          </div>

          {/* Trigger Simulated Driver SOS Section */}
          <div className="p-4 rounded-xl bg-bg-elevated border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-tx-primary">
                <Radio className="w-4 h-4 text-nexus-cyan" />
                <span>Simulate In-Vehicle SOS Panic Signal</span>
              </div>
              <span className="text-[10px] font-mono text-tx-muted">DRIVER PHONE / HARDWARE APIS</span>
            </div>

            <p className="text-xs text-tx-secondary">
              Selecting a bus triggers an immediate priority-0 interrupt: locks current GPS coordinates, evaluates emergency geofences, dispatches control-room alerts, and initializes an auditable response lifecycle.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <select
                value={selectedBusToTrigger}
                onChange={(e) => setSelectedBusToTrigger(e.target.value)}
                className="flex-1 bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs text-tx-primary font-mono focus:outline-none focus:border-nexus-critical"
              >
                <option value="">-- Random Active Bus --</option>
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} ({b.registration}) · Driver: {b.driverName} · {b.routeName}
                  </option>
                ))}
              </select>

              <button
                onClick={handleTrigger}
                className="px-5 py-2.5 rounded-lg bg-nexus-critical hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-critical transition-all"
              >
                <Siren className="w-4 h-4 animate-bounce" />
                <span>Broadcast SOS</span>
              </button>
            </div>

            {lastTriggeredId && (
              <div className="p-3 rounded-lg bg-nexus-safe/10 border border-nexus-safe/30 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-nexus-safe">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SOS Incident {lastTriggeredId} created and dispatched!</span>
                </div>
                <button
                  onClick={() => handleOpenIncident(lastTriggeredId)}
                  className="text-xs text-nexus-cyan font-semibold hover:underline flex items-center gap-1"
                >
                  Manage Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Active Critical Incidents List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-nexus-critical" />
                Active Critical Emergency Alerts ({activeCritical.length})
              </h3>
            </div>

            {activeCritical.length === 0 ? (
              <div className="p-6 text-center text-xs text-tx-muted border border-border/50 rounded-lg bg-bg-elevated/30">
                No active critical emergency alerts at this moment. Fleet status normal.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Embedded Free Leaflet Emergency Tactical Map */}
                {(() => {
                  const primaryIncident =
                    activeCritical.find((i) => i.id === lastTriggeredId) || activeCritical[0];
                  if (!primaryIncident) return null;
                  return (
                    <div className="p-3.5 rounded-xl bg-bg-elevated/80 border border-nexus-critical/50 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-nexus-critical font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-nexus-critical animate-ping" />
                          LIVE EMERGENCY SATELLITE FIX: {primaryIncident.busId}
                        </span>
                        <span className="text-tx-secondary text-[11px] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-nexus-cyan" />
                          {primaryIncident.lat.toFixed(4)}, {primaryIncident.lng.toFixed(4)}
                        </span>
                      </div>

                      <IncidentMiniMap
                        lat={primaryIncident.lat}
                        lng={primaryIncident.lng}
                        severity={primaryIncident.severity}
                        busId={primaryIncident.busId}
                      />

                      <div className="flex items-center justify-between text-[10px] font-mono text-tx-muted">
                        <span className="text-nexus-safe font-semibold">FREE LEAFLET MAP &bull; CARTODB DARK MATTER</span>
                        <span>SPEED: {primaryIncident.speedAtIncidentKmh} KM/H &bull; {primaryIncident.driverName}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-2">
                {activeCritical.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3.5 rounded-lg bg-bg-elevated border border-nexus-critical/40 flex items-center justify-between hover:border-nexus-critical transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-nexus-critical/20 text-nexus-critical border border-nexus-critical/50 font-bold">
                          {inc.id}
                        </span>
                        <span className="text-xs font-bold text-tx-primary">{inc.title}</span>
                      </div>
                      <div className="text-[11px] text-tx-secondary mt-1">
                        Vehicle: <span className="font-mono text-tx-primary">{inc.busId}</span> ({inc.driverName}) • {inc.routeName}
                      </div>
                      <div className="text-[10px] text-tx-muted mt-0.5 font-mono">
                        Status: <span className="text-nexus-warning">{inc.status}</span> • Assigned: {inc.assignedOperator || "UNASSIGNED"}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenIncident(inc.id)}
                      className="px-3 py-1.5 rounded-lg bg-bg-surface hover:bg-bg-hover text-nexus-cyan text-xs font-semibold border border-border flex items-center gap-1 transition-colors"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-bg-elevated/60 border-t border-border flex items-center justify-between text-xs text-tx-muted">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <ShieldAlert className="w-4 h-4 text-nexus-cyan" />
            <span>INCIDENT PROTOCOL AIS-140 COMPLIANT V3.2</span>
          </div>
          <button
            onClick={() => {
              setEmergencyModalOpen(false);
              router.push("/incidents");
            }}
            className="text-nexus-cyan hover:underline font-semibold"
          >
            Open Full Incident Command Console &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
