"use client";

import React, { useState } from "react";
import { useFleet } from "@/lib/context/FleetContext";
import { formatAgo } from "@/lib/utils";
import {
  Users2,
  Bus,
  Search,
  UserCheck,
  UserX,
  ShieldCheck,
  Wrench,
  Smartphone,
  Phone,
  CheckCircle2,
  AlertCircle,
  Radio,
} from "lucide-react";
import dynamic from "next/dynamic";

const FleetMap = dynamic(() => import("@/components/dashboard/FleetMap"), {
  ssr: false,
  loading: ({ error }) => (
    <div className="h-[440px] w-full rounded-xl border border-border bg-bg-surface flex flex-col items-center justify-center text-xs text-tx-muted font-mono animate-pulse gap-2">
      <span>CALIBRATING DRIVER &amp; VEHICLE GEOLOCATIONS...</span>
      {error && (
        <span className="text-nexus-critical text-[10px] max-w-md text-center">
          Map load error: {String(error)}
        </span>
      )}
    </div>
  ),
});

export default function DriversAndVehiclesPage() {
  const {
    vehicles,
    drivers,
    buses,
    assignDriverToVehicle,
    unassignDriver,
    selectedBusId,
    selectBus,
  } = useFleet();

  const [search, setSearch] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [assignmentMessage, setAssignmentMessage] = useState("");

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId || !selectedVehicleId) {
      setAssignmentMessage("Please select both an available driver and a target vehicle.");
      return;
    }
    assignDriverToVehicle(selectedDriverId, selectedVehicleId);
    setAssignmentMessage(`Assigned driver to ${selectedVehicleId} successfully.`);
    setSelectedDriverId("");
    setSelectedVehicleId("");
    setTimeout(() => setAssignmentMessage(""), 4000);
  };

  const handleUnassign = (vehId: string) => {
    if (confirm(`Unassign current driver from ${vehId}?`)) {
      unassignDriver(vehId);
    }
  };

  const unassignedVehicles = vehicles.filter((v) => !v.assignedDriverId);
  const availableDrivers = drivers.filter((d) => d.dutyStatus === "AVAILABLE");

  const filteredVehicles = vehicles.filter((v) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        v.id.toLowerCase().includes(q) ||
        v.registrationNumber.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredDrivers = drivers.filter((d) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.id.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.licenseNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-border bg-bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-nexus-cyan" />
            <h2 className="text-base font-bold text-tx-primary font-mono tracking-wide">
              FLEET ROSTER &amp; DRIVER TELEMETRY TERMINALS
            </h2>
          </div>
          <p className="text-xs text-tx-secondary mt-0.5">
            Manage certified drivers, in-vehicle smartphone beacons, and route shift assignments.
          </p>
        </div>

        {/* Global filter */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
          <input
            type="text"
            placeholder="Search driver, license, or bus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-elevated border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-tx-primary placeholder:text-tx-muted focus:outline-none focus:border-nexus-cyan font-sans"
          />
        </div>
      </div>

      {/* Driver Assignment Form */}
      <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-3 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-nexus-cyan" />
          Assign Available Driver to Fleet Vehicle
        </h3>

        <form onSubmit={handleAssign} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="text-[10px] text-tx-muted block mb-1 font-mono">
              AVAILABLE DRIVER
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-xs text-tx-primary focus:outline-none focus:border-nexus-cyan"
            >
              <option value="">-- Choose Free Driver --</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.id}) &bull; Rating {d.rating} &bull; {d.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 w-full">
            <label className="text-[10px] text-tx-muted block mb-1 font-mono">
              TARGET VEHICLE
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-xs text-tx-primary focus:outline-none focus:border-nexus-cyan font-mono"
            >
              <option value="">-- Choose Unassigned Vehicle --</option>
              {unassignedVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} ({v.registrationNumber}) &bull; {v.model}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-nexus-cyan text-black font-bold text-xs uppercase tracking-wider shadow-glow hover:bg-cyan-300 transition-colors shrink-0"
          >
            Assign Duty
          </button>
        </form>

        {assignmentMessage && (
          <div className="p-2.5 rounded-lg bg-nexus-safe/10 border border-nexus-safe/30 text-xs text-nexus-safe flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{assignmentMessage}</span>
          </div>
        )}
      </div>

      {/* Live Vehicle & Driver Telemetry Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-nexus-cyan" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono">
              Live Vehicle &amp; Driver Fleet Map ({buses.length} Active Beacons)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-nexus-safe flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-nexus-safe animate-pulse" />
            FREE LEAFLET ENGINE &bull; NO API KEY REQUIRED
          </span>
        </div>
        <FleetMap height="440px" />
      </div>

      {/* Tables Grid: Vehicles & Drivers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Vehicles Table */}
        <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono flex items-center gap-1.5">
              <Bus className="w-4 h-4 text-nexus-cyan" />
              Fleet Vehicles Inventory ({filteredVehicles.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-mono text-tx-muted">
                  <th className="pb-2">FLEET ID</th>
                  <th className="pb-2">MODEL</th>
                  <th className="pb-2">ASSIGNED DRIVER</th>
                  <th className="pb-2">TRACKING</th>
                  <th className="pb-2">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredVehicles.map((veh) => {
                  const driver = drivers.find((d) => d.id === veh.assignedDriverId);
                  const busTelemetry = buses.find((b) => b.id === veh.id);

                  return (
                    <tr
                      key={veh.id}
                      onClick={() => selectBus(veh.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedBusId === veh.id
                          ? "bg-nexus-cyan/15 border-l-2 border-nexus-cyan"
                          : "hover:bg-bg-elevated/40"
                      }`}
                    >
                      <td className="py-2.5 font-mono font-bold text-tx-primary">
                        {veh.id}
                        <span className="block text-[10px] text-tx-muted font-normal">
                          {veh.registrationNumber}
                        </span>
                      </td>

                      <td className="py-2.5 text-tx-secondary text-[11px]">
                        {veh.model}
                        <span className="block text-[10px] text-tx-muted font-mono">
                          Cap: {veh.capacity} seats
                        </span>
                      </td>

                      <td className="py-2.5">
                        {driver ? (
                          <div>
                            <span className="text-tx-primary font-semibold">{driver.name}</span>
                            <span className="block text-[10px] text-tx-muted font-mono">
                              {driver.id}
                            </span>
                          </div>
                        ) : (
                          <span className="text-nexus-warning text-[11px] font-mono font-semibold">
                            UNASSIGNED
                          </span>
                        )}
                      </td>

                      <td className="py-2.5">
                        {busTelemetry ? (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              busTelemetry.trackingStatus === "LIVE"
                                ? "bg-nexus-safe/20 text-nexus-safe"
                                : "bg-nexus-warning/20 text-nexus-warning"
                            }`}
                          >
                            {busTelemetry.trackingStatus}
                          </span>
                        ) : (
                          <span className="text-tx-muted text-[10px]">IDLE</span>
                        )}
                      </td>

                      <td className="py-2.5">
                        {veh.assignedDriverId && (
                          <button
                            onClick={() => handleUnassign(veh.id)}
                            className="text-[10px] font-mono text-nexus-critical hover:underline px-2 py-0.5 rounded border border-border hover:border-nexus-critical/40 transition-colors"
                          >
                            Unassign
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drivers Table */}
        <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-nexus-cyan" />
              Driver &amp; In-Vehicle Telemetry Terminal Status ({filteredDrivers.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-mono text-tx-muted">
                  <th className="pb-2">DRIVER</th>
                  <th className="pb-2">DUTY STATUS</th>
                  <th className="pb-2">APP BEACON</th>
                  <th className="pb-2">HEARTBEAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredDrivers.map((drv) => (
                  <tr key={drv.id} className="hover:bg-bg-elevated/40 transition-colors">
                    <td className="py-2.5">
                      <div className="font-semibold text-tx-primary">{drv.name}</div>
                      <div className="text-[10px] text-tx-muted font-mono">
                        {drv.id} &bull; {drv.phone}
                      </div>
                    </td>

                    <td className="py-2.5">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          drv.dutyStatus === "ON_DUTY"
                            ? "bg-nexus-cyan/20 text-nexus-cyan"
                            : "bg-bg-elevated text-tx-muted"
                        }`}
                      >
                        {drv.dutyStatus}
                      </span>
                    </td>

                    <td className="py-2.5 font-mono text-[11px]">
                      <span
                        className={
                          drv.deviceStatus === "ONLINE"
                            ? "text-nexus-safe font-semibold"
                            : drv.deviceStatus === "STALE"
                            ? "text-nexus-warning font-semibold"
                            : "text-tx-muted"
                        }
                      >
                        {drv.deviceStatus}
                      </span>
                      <span className="block text-[10px] text-tx-muted">{drv.appVersion}</span>
                    </td>

                    <td className="py-2.5 font-mono text-tx-secondary text-[11px]">
                      {drv.dutyStatus === "ON_DUTY" ? formatAgo(drv.lastHeartbeat) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
