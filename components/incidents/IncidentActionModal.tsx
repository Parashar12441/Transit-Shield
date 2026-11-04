"use client";

import React, { useState } from "react";
import { X, CheckCircle2, ArrowUpRight, FileText, AlertTriangle, ShieldCheck } from "lucide-react";
import { Incident } from "@/types";

interface IncidentActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident;
  actionType: "RESOLVE" | "ESCALATE" | "CLOSE" | null;
  onConfirm: (notes: string) => void;
}

export function IncidentActionModal({
  isOpen,
  onClose,
  incident,
  actionType,
  onConfirm,
}: IncidentActionModalProps) {
  const [notes, setNotes] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");

  if (!isOpen || !actionType) return null;

  const getPresets = () => {
    switch (actionType) {
      case "RESOLVE":
        return [
          "Vehicle inspected. Passenger & driver safety verified. Normal service restored.",
          "Driver confirmed road diversion due to civic utility work. Rejoined planned corridor.",
          "Speed advisory acknowledged by driver. Vehicle throttled to corridor limits.",
          "False alarm: Panic button activated accidentally. Driver verified OK.",
        ];
      case "ESCALATE":
        return [
          "No response from vehicle terminal for > 5 minutes. Escalating to Quick Response Unit.",
          "Suspected medical or passenger safety concern reported on board.",
          "Severe telemetry blackout in high-risk transit zone. Senior dispatcher review required.",
        ];
      case "CLOSE":
        return [
          "Post-incident verification complete. Audited by Control Room Shift Supervisor.",
          "Maintenance inspection logged. No mechanical fault detected on bus.",
          "Driver debriefing completed. Incident record archived per statutory DPDP retention policy.",
        ];
    }
  };

  const getTitle = () => {
    switch (actionType) {
      case "RESOLVE":
        return {
          heading: "Mark Incident as Resolved",
          icon: CheckCircle2,
          color: "text-nexus-safe",
          border: "border-nexus-safe/40",
          btnColor: "bg-nexus-safe hover:bg-green-400 text-black",
          btnText: "Confirm Resolution",
        };
      case "ESCALATE":
        return {
          heading: "Escalate Incident Priority",
          icon: ArrowUpRight,
          color: "text-nexus-critical",
          border: "border-nexus-critical/40",
          btnColor: "bg-nexus-critical hover:bg-red-600 text-white shadow-glow-critical",
          btnText: "Confirm Escalation",
        };
      case "CLOSE":
        return {
          heading: "Seal & Close Incident Audit",
          icon: FileText,
          color: "text-nexus-cyan",
          border: "border-nexus-cyan/40",
          btnColor: "bg-nexus-cyan hover:bg-cyan-300 text-black shadow-glow",
          btnText: "Seal & Archive Record",
        };
    }
  };

  const config = getTitle();
  const Icon = config.icon;
  const presets = getPresets();

  const handleSelectPreset = (p: string) => {
    setSelectedPreset(p);
    setNotes(p);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNote = notes.trim() || presets[0];
    onConfirm(finalNote);
    setNotes("");
    setSelectedPreset("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col tech-card">
        {/* Header */}
        <div className={`p-4 border-b border-border bg-bg-elevated flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <Icon className={`w-5 h-5 ${config.color}`} />
            <div>
              <h3 className="font-bold text-sm text-tx-primary tracking-wide">
                {config.heading}
              </h3>
              <div className="text-[11px] font-mono text-tx-secondary">
                INCIDENT {incident.id} &bull; BUS {incident.busId} ({incident.driverName})
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-hover text-tx-muted hover:text-tx-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-mono text-tx-muted block mb-1.5 uppercase tracking-wider font-semibold">
              Select Quick Preset Outcome
            </label>
            <div className="space-y-1.5">
              {presets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                    selectedPreset === preset
                      ? "bg-nexus-cyan/15 border-nexus-cyan/60 text-tx-primary"
                      : "bg-bg-elevated/70 border-border text-tx-secondary hover:border-border-bright hover:text-tx-primary"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-tx-muted block mb-1.5 uppercase tracking-wider font-semibold">
              Operator Log / Audit Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter detailed observation notes..."
              className="w-full bg-bg-elevated border border-border rounded-lg p-3 text-xs text-tx-primary placeholder:text-tx-muted focus:outline-none focus:border-nexus-cyan font-sans"
            />
          </div>

          {/* Audit signature note */}
          <div className="text-[10px] font-mono text-tx-muted flex items-center justify-between pt-1">
            <span>OPERATOR: Op. Neha Sharma</span>
            <span>TIMELOCKED IST</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-bg-elevated hover:bg-bg-hover text-tx-secondary hover:text-tx-primary text-xs font-mono border border-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all font-mono ${config.btnColor}`}
            >
              {config.btnText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
