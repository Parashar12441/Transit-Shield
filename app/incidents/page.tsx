"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useFleet } from "@/lib/context/FleetContext";
import { IncidentSeverity, IncidentStatus } from "@/types";
import {
  formatAgo,
  formatTimeIST,
  formatDateIST,
  getSeverityBadgeClass,
  getStatusBadgeClass,
} from "@/lib/utils";
import {
  AlertTriangle,
  Search,
  Siren,
  ShieldAlert,
  Clock,
  CheckCircle2,
  UserCheck,
  ArrowUpRight,
  Send,
  MapPin,
  Radio,
  FileText,
  AlertOctagon,
  ChevronRight,
  Filter,
} from "lucide-react";
import { IncidentActionModal } from "@/components/incidents/IncidentActionModal";

// Dynamically import mini-map without SSR
const IncidentMiniMap = dynamic(
  () => import("@/components/incidents/IncidentMiniMap").then((m) => m.IncidentMiniMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-44 rounded-lg border border-border bg-bg-surface flex items-center justify-center text-xs text-tx-muted font-mono">
        LOADING SATELLITE COORDINATES...
      </div>
    ),
  }
);

export default function IncidentCommandPage() {
  const {
    incidents,
    selectedIncidentId,
    selectIncident,
    acknowledgeIncident,
    startResponding,
    assignResponder,
    escalateIncident,
    addIncidentNote,
    resolveIncident,
    closeIncident,
    triggerSimulatedSos,
  } = useFleet();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [newNoteText, setNewNoteText] = useState<string>("");
  const [selectedResponder, setSelectedResponder] = useState<string>("Op. Neha Sharma");
  const [modalAction, setModalAction] = useState<"RESOLVE" | "ESCALATE" | "CLOSE" | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Determine current active incident
  const activeIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0] || null;

  // Filter incidents list
  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter !== "ALL" && inc.status !== statusFilter) return false;
    if (severityFilter !== "ALL" && inc.severity !== severityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.busId.toLowerCase().includes(q) ||
        inc.driverName.toLowerCase().includes(q) ||
        inc.routeName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIncident || !newNoteText.trim()) return;
    addIncidentNote(activeIncident.id, newNoteText);
    setNewNoteText("");
    showToast("Audit note appended to timeline.");
  };

  const handleAcknowledge = () => {
    if (!activeIncident) return;
    acknowledgeIncident(activeIncident.id, "Op. Neha Sharma");
    showToast(`Incident ${activeIncident.id} acknowledged by Op. Neha Sharma.`);
  };

  const handleStartResponding = () => {
    if (!activeIncident) return;
    startResponding(activeIncident.id, "Op. Neha Sharma");
    showToast(`Response operations underway for ${activeIncident.id}.`);
  };

  const handleModalConfirm = (notes: string) => {
    if (!activeIncident || !modalAction) return;

    if (modalAction === "RESOLVE") {
      resolveIncident(activeIncident.id, notes);
      showToast(`Incident ${activeIncident.id} marked as RESOLVED.`);
    } else if (modalAction === "ESCALATE") {
      escalateIncident(activeIncident.id);
      addIncidentNote(activeIncident.id, `Escalation Reason: ${notes}`);
      showToast(`Incident ${activeIncident.id} escalated.`);
    } else if (modalAction === "CLOSE") {
      closeIncident(activeIncident.id, notes);
      showToast(`Incident ${activeIncident.id} sealed and archived.`);
    }
  };

  const handleAssign = () => {
    if (!activeIncident || !selectedResponder) return;
    assignResponder(activeIncident.id, selectedResponder);
    showToast(`Assigned ${selectedResponder} to incident ${activeIncident.id}.`);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="p-3 rounded-lg bg-nexus-cyan/15 border border-nexus-cyan/50 text-xs text-nexus-cyan flex items-center justify-between shadow-glow font-mono animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage("")} className="hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Top Banner & Quick Trigger */}
      <div className="p-4 rounded-xl border border-border bg-bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-nexus-cyan" />
            <h2 className="text-base font-bold text-tx-primary font-mono tracking-wide">
              INCIDENT RESPONSE OPERATIONS DESK
            </h2>
          </div>
          <p className="text-xs text-tx-secondary mt-0.5">
            Mission-critical safety escalation, driver distress triage, and auditable event logging.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => triggerSimulatedSos()}
            className="px-4 py-2 rounded-lg bg-nexus-critical hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-glow-critical transition-all font-mono"
          >
            <Siren className="w-4 h-4 animate-bounce" />
            <span>Simulate Driver SOS</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Incidents List (Left) & Incident Operations Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Filterable List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-3 shadow-lg">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
              <input
                type="text"
                placeholder="Search by ID, bus, driver, or alert..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-bg-elevated border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-tx-primary placeholder:text-tx-muted focus:outline-none focus:border-nexus-cyan font-sans"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <label className="text-[10px] text-tx-muted block mb-1">STATUS</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-2.5 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-nexus-cyan"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">NEW</option>
                  <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                  <option value="RESPONDING">RESPONDING</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-tx-muted block mb-1">SEVERITY</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-2.5 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-nexus-cyan"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            {/* Incident Cards Queue */}
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1 pt-1">
              {filteredIncidents.length === 0 ? (
                <div className="py-14 text-center text-xs text-tx-muted">
                  No incidents matching criteria.
                </div>
              ) : (
                filteredIncidents.map((inc) => {
                  const isSelected = activeIncident?.id === inc.id;

                  return (
                    <div
                      key={inc.id}
                      onClick={() => selectIncident(inc.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "bg-nexus-cyan/15 border-nexus-cyan shadow-glow"
                          : "bg-bg-elevated/70 border-border hover:border-border-bright hover:bg-bg-elevated"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${getSeverityBadgeClass(
                            inc.severity
                          )}`}
                        >
                          {inc.severity}
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${getStatusBadgeClass(
                              inc.status
                            )}`}
                          >
                            {inc.status}
                          </span>
                          <span className="text-[10px] text-tx-muted font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatAgo(inc.triggeredAt)}
                          </span>
                        </div>
                      </div>

                      <div className="font-bold text-xs text-tx-primary mb-1">
                        {inc.title}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-tx-secondary font-mono">
                        <span>
                          {inc.id} &bull; <span className="text-nexus-cyan font-bold">{inc.busId}</span>
                        </span>
                        <span>{inc.assignedOperator || "UNASSIGNED"}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Operations Console */}
        <div className="lg:col-span-7">
          {activeIncident ? (
            <div className="p-5 rounded-xl border border-border bg-bg-surface space-y-5 shadow-2xl tech-card">
              {/* Incident Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-base font-bold text-tx-primary">
                      {activeIncident.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${getSeverityBadgeClass(
                        activeIncident.severity
                      )}`}
                    >
                      {activeIncident.severity}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded border font-semibold ${getStatusBadgeClass(
                        activeIncident.status
                      )}`}
                    >
                      {activeIncident.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-tx-primary mt-1">
                    {activeIncident.title}
                  </h3>
                </div>

                <div className="text-right font-mono text-xs text-tx-secondary">
                  <div>{formatTimeIST(activeIncident.triggeredAt)}</div>
                  <div className="text-[10px] text-tx-muted">
                    {formatDateIST(activeIncident.triggeredAt)}
                  </div>
                </div>
              </div>

              {/* Action Buttons Toolbar with Glass Modal Integration */}
              <div className="p-3.5 rounded-xl bg-bg-elevated border border-border flex flex-wrap items-center gap-2.5">
                {activeIncident.status === "NEW" && (
                  <button
                    onClick={handleAcknowledge}
                    className="px-4 py-2 rounded-lg bg-nexus-cyan text-black font-bold text-xs uppercase tracking-wider shadow-glow hover:bg-cyan-300 transition-colors flex items-center gap-1.5 font-mono"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Acknowledge Incident</span>
                  </button>
                )}

                {activeIncident.status === "ACKNOWLEDGED" && (
                  <button
                    onClick={handleStartResponding}
                    className="px-4 py-2 rounded-lg bg-nexus-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-600 transition-colors flex items-center gap-1.5 font-mono"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Start Response Operations</span>
                  </button>
                )}

                {["ACKNOWLEDGED", "RESPONDING"].includes(activeIncident.status) && (
                  <button
                    onClick={() => setModalAction("RESOLVE")}
                    className="px-4 py-2 rounded-lg bg-nexus-safe text-black font-bold text-xs uppercase tracking-wider hover:bg-green-400 transition-colors flex items-center gap-1.5 font-mono"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Resolved</span>
                  </button>
                )}

                {activeIncident.status === "RESOLVED" && (
                  <button
                    onClick={() => setModalAction("CLOSE")}
                    className="px-4 py-2 rounded-lg bg-bg-hover text-tx-primary border border-border hover:border-tx-muted font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 font-mono"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Seal &amp; Close Incident</span>
                  </button>
                )}

                {activeIncident.status !== "CLOSED" && (
                  <button
                    onClick={() => setModalAction("ESCALATE")}
                    className="px-3.5 py-2 rounded-lg bg-nexus-critical/20 hover:bg-nexus-critical/30 text-nexus-critical border border-nexus-critical/40 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 font-mono"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Escalate</span>
                  </button>
                )}

                {/* Responder Assignment Selector */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <select
                    value={selectedResponder}
                    onChange={(e) => setSelectedResponder(e.target.value)}
                    className="bg-bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-nexus-cyan font-mono"
                  >
                    <option value="Op. Neha Sharma">Op. Neha Sharma</option>
                    <option value="Op. Arjun Dixit">Op. Arjun Dixit</option>
                    <option value="Quick Response Team QRU-4">QRU-4 Mobile Team</option>
                    <option value="Depot Supervisor Tiwari">Supervisor Tiwari</option>
                  </select>

                  <button
                    onClick={handleAssign}
                    className="px-3 py-1.5 rounded-lg bg-bg-hover hover:bg-border-bright text-nexus-cyan border border-border text-xs font-mono transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>

              {/* Incident Details Grid & Locked GPS Location Map */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meta details */}
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-lg bg-bg-elevated/70 border border-border/70 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-tx-muted font-mono">VEHICLE</span>
                      <span className="font-mono font-bold text-tx-primary">
                        {activeIncident.busId} ({activeIncident.busReg})
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-tx-muted font-mono">ASSIGNED DRIVER</span>
                      <span className="text-tx-primary font-semibold">
                        {activeIncident.driverName}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-tx-muted font-mono">ROUTE CORRIDOR</span>
                      <span className="text-nexus-cyan font-mono truncate max-w-[200px]">
                        {activeIncident.routeName}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-tx-muted font-mono">SPEED AT TRIGGER</span>
                      <span className="font-mono text-tx-primary font-bold">
                        {activeIncident.speedAtIncidentKmh} km/h
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-tx-muted font-mono">INCIDENT ORIGIN</span>
                      <span className="font-mono text-nexus-warning">
                        {activeIncident.origin}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-tx-muted font-mono">ASSIGNED RESPONDER</span>
                      <span className="font-mono text-nexus-safe font-semibold">
                        {activeIncident.assignedOperator || "UNASSIGNED"}
                      </span>
                    </div>
                  </div>

                  {/* Trigger rule note */}
                  <div className="p-3.5 rounded-lg bg-bg-elevated/40 border border-border text-[11px] text-tx-secondary leading-relaxed font-sans">
                    <span className="font-bold text-tx-primary block mb-0.5">
                      Trigger Intelligence:
                    </span>
                    {activeIncident.ruleTriggerDetails}
                  </div>
                </div>

                {/* Locked GPS Fix Map */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-tx-secondary">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-nexus-cyan" />
                      Locked Incident Coordinates
                    </span>
                    <span className="text-nexus-cyan">
                      {activeIncident.lat.toFixed(4)}, {activeIncident.lng.toFixed(4)}
                    </span>
                  </div>

                  <IncidentMiniMap
                    lat={activeIncident.lat}
                    lng={activeIncident.lng}
                    severity={activeIncident.severity}
                    busId={activeIncident.busId}
                  />

                  <div className="text-[10px] text-tx-muted font-mono text-right">
                    GPS LOCK ACCURACY &plusmn;8.5m &bull; AIS-140 COMPLIANT BEACON
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono flex items-center gap-2">
                  <Clock className="w-4 h-4 text-nexus-cyan" />
                  Audit Trail &amp; Response Timeline ({activeIncident.events.length} Events)
                </h4>

                <div className="border-l-2 border-border-bright pl-4 space-y-3.5 my-2">
                  {activeIncident.events
                    .slice()
                    .reverse()
                    .map((ev) => (
                      <div key={ev.id} className="relative text-xs">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-nexus-cyan border-2 border-bg-surface" />
                        <div className="flex items-center justify-between text-[11px] font-mono mb-0.5">
                          <span className="font-bold text-tx-primary">
                            {ev.actor} {ev.actorRole ? `(${ev.actorRole})` : ""}
                          </span>
                          <span className="text-tx-muted">
                            {formatTimeIST(ev.timestamp)}
                          </span>
                        </div>
                        <div className="text-tx-secondary text-[12px] leading-relaxed">
                          {ev.description}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Enter dispatch observation or telephone log note..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-xs text-tx-primary placeholder:text-tx-muted focus:outline-none focus:border-nexus-cyan font-sans"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-bg-hover hover:bg-border-bright text-nexus-cyan border border-border text-xs font-bold flex items-center gap-1.5 transition-colors font-mono"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Add Note</span>
                  </button>
                </form>
              </div>

              {/* Action Modal */}
              <IncidentActionModal
                isOpen={modalAction !== null}
                onClose={() => setModalAction(null)}
                incident={activeIncident}
                actionType={modalAction}
                onConfirm={handleModalConfirm}
              />
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-tx-muted border border-border rounded-xl bg-bg-surface">
              Select an incident from the queue to view full command console.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
