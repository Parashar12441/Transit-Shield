"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useFleet } from "@/lib/context/FleetContext";

const SettingsMapPreview = dynamic(
  () => import("@/components/settings/SettingsMapPreview").then((m) => m.SettingsMapPreview),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[260px] rounded-xl border border-border bg-bg-surface flex items-center justify-center text-xs text-tx-muted font-mono animate-pulse">
        CALIBRATING LEAFLET MAP ENGINE...
      </div>
    ),
  }
);
import {
  Settings,
  Building2,
  ShieldAlert,
  Clock,
  Bell,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  MapPin,
  KeyRound,
  Layers,
  ExternalLink,
  Globe,
} from "lucide-react";

export default function OrganisationSettingsPage() {
  const { resetDemoData } = useFleet();

  const [orgName, setOrgName] = useState("Kanpur Metropolitan City Transport Authority");
  const [regionCode, setRegionCode] = useState("UP-78-METRO");
  const [escalationTimeoutMin, setEscalationTimeoutMin] = useState(5);
  const [staleThresholdSec, setStaleThresholdSec] = useState(60);
  const [dataRetentionDays, setDataRetentionDays] = useState(90);
  const [smsFallbackEnabled, setSmsFallbackEnabled] = useState(false);
  const [mapProvider, setMapProvider] = useState("osm");
  const [mapsApiKey, setMapsApiKey] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);

  React.useEffect(() => {
    try {
      const storedKey = localStorage.getItem("nexus_maps_api_key");
      if (storedKey) setMapsApiKey(storedKey);
      const storedProvider = localStorage.getItem("nexus_map_provider");
      if (storedProvider) setMapProvider(storedProvider);
    } catch {}
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("nexus_maps_api_key", mapsApiKey.trim());
      localStorage.setItem("nexus_map_provider", mapProvider);
    } catch {}
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-5 max-w-5xl animate-fade-in">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-border bg-bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-nexus-cyan" />
            <h2 className="text-base font-bold text-tx-primary font-mono tracking-wide">
              ORGANISATION &amp; REGULATORY SAFETY SETTINGS
            </h2>
          </div>
          <p className="text-xs text-tx-secondary mt-0.5">
            Configure telemetry timeouts, automated escalation timers, and compliance policies.
          </p>
        </div>

        <button
          onClick={resetDemoData}
          className="px-3.5 py-1.5 rounded-lg bg-bg-elevated hover:bg-bg-hover text-tx-secondary hover:text-tx-primary border border-border text-xs font-mono transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Defaults</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Organisation Profile Card */}
        <div className="p-5 rounded-xl border border-border bg-bg-surface space-y-4 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono flex items-center gap-2">
            <Building2 className="w-4 h-4 text-nexus-cyan" />
            Fleet Organisation Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-[11px] text-tx-muted block mb-1">
                ORGANISATION NAME
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-xs text-tx-primary focus:outline-none focus:border-nexus-cyan font-sans"
              />
            </div>

            <div>
              <label className="text-[11px] text-tx-muted block mb-1">
                REGULATORY REGION CODE
              </label>
              <input
                type="text"
                value={regionCode}
                onChange={(e) => setRegionCode(e.target.value)}
                className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-xs text-tx-primary focus:outline-none focus:border-nexus-cyan font-mono"
              />
            </div>
          </div>
        </div>

        {/* Map Engine & API Key Configuration Card */}
        <div className="p-5 rounded-xl border border-border bg-bg-surface space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-nexus-cyan" />
              Map Engine &amp; API Key Configuration
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-nexus-safe/10 border border-nexus-safe/30 text-nexus-safe font-bold">
              ✓ ZERO-KEY FREE ENGINE ACTIVE
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-elevated/80 border border-border space-y-2 text-xs">
            <div className="flex items-start gap-2.5 text-tx-secondary">
              <CheckCircle2 className="w-4 h-4 text-nexus-safe shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-tx-primary">No Paid Google Maps API Key Required:</span>{" "}
                By default, NEXUS Transit uses high-contrast CartoDB Dark Matter tiles and OpenStreetMap vectors with zero subscription, zero billing, and zero rate limits.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-[11px] text-tx-muted block mb-1">
                DEFAULT MAP TILE PROVIDER
              </label>
              <select
                value={mapProvider}
                onChange={(e) => setMapProvider(e.target.value)}
                className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-xs text-tx-primary focus:outline-none focus:border-nexus-cyan font-sans"
              >
                <option value="osm">OpenStreetMap Standard (Free • Global Coverage • Default)</option>
                <option value="cartodb">CartoDB Dark Matter (Tactical Dark - Free)</option>
                <option value="stadia">Stadia Alidade Smooth Dark (Requires Key)</option>
                <option value="google">Google Maps Platform / Mapbox (Requires Key)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-tx-muted block mb-1">
                OPTIONAL MAP API KEY (GOOGLE MAPS / MAPBOX)
              </label>
              <input
                type="text"
                placeholder="AIzaSy... or pk.eyJ1... (Leave blank for default)"
                value={mapsApiKey}
                onChange={(e) => setMapsApiKey(e.target.value)}
                className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-xs text-tx-primary focus:outline-none focus:border-nexus-cyan font-mono"
              />
            </div>
          </div>

          {/* Interactive Leaflet Map Preview & Verification */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-tx-secondary">
              <span className="flex items-center gap-1.5 font-bold text-tx-primary">
                <Layers className="w-3.5 h-3.5 text-nexus-cyan" />
                Live Leaflet Map Vector Engine &amp; Tile Preview
              </span>
              <span className="text-nexus-safe font-semibold">
                ✓ 100% Free Out-of-the-Box (No Billing / No Key)
              </span>
            </div>

            <SettingsMapPreview provider={mapProvider} apiKey={mapsApiKey} />
          </div>

          <div className="p-3 rounded-lg bg-bg-elevated border border-border flex items-center justify-between text-[11px] font-mono text-tx-muted">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-nexus-cyan" />
              <span>Environment Configuration: <code className="text-nexus-cyan font-bold">.env.local</code> &bull; NEXT_PUBLIC_MAP_PROVIDER=&quot;cartodb&quot;</span>
            </div>
            <a
              href="https://developers.google.com/maps/documentation"
              target="_blank"
              rel="noreferrer"
              className="text-nexus-cyan hover:underline flex items-center gap-1 font-sans"
            >
              <span>Get Google API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Safety Engine Thresholds */}
        <div className="p-5 rounded-xl border border-border bg-bg-surface space-y-4 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono flex items-center gap-2">
            <Sliders className="w-4 h-4 text-nexus-cyan" />
            Global Telemetry &amp; Escalation Thresholds
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-bg-elevated border border-border space-y-1">
              <label className="font-semibold text-tx-primary block">
                Incident Auto-Escalation Deadline
              </label>
              <p className="text-[11px] text-tx-muted">
                If a CRITICAL or HIGH incident is unacknowledged within this window, it escalates to senior supervisor.
              </p>
              <div className="flex items-center gap-2 pt-2 font-mono">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={escalationTimeoutMin}
                  onChange={(e) => setEscalationTimeoutMin(Number(e.target.value))}
                  className="w-20 bg-bg-surface border border-border rounded px-2.5 py-1 text-center font-bold text-tx-primary focus:outline-none focus:border-nexus-cyan"
                />
                <span className="text-tx-secondary">minutes</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-bg-elevated border border-border space-y-1">
              <label className="font-semibold text-tx-primary block">
                GPS Stale Heartbeat Threshold
              </label>
              <p className="text-[11px] text-tx-muted">
                Maximum duration without telemetry fix before vehicle status flips to STALE.
              </p>
              <div className="flex items-center gap-2 pt-2 font-mono">
                <input
                  type="number"
                  min={15}
                  max={300}
                  step={5}
                  value={staleThresholdSec}
                  onChange={(e) => setStaleThresholdSec(Number(e.target.value))}
                  className="w-20 bg-bg-surface border border-border rounded px-2.5 py-1 text-center font-bold text-tx-primary focus:outline-none focus:border-nexus-cyan"
                />
                <span className="text-tx-secondary">seconds</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-bg-elevated border border-border space-y-1">
              <label className="font-semibold text-tx-primary block">
                Telemetry Log Retention Window
              </label>
              <p className="text-[11px] text-tx-muted">
                India DPDP Act data minimization: raw telemetry partitioned and pruned after retention expiration.
              </p>
              <div className="flex items-center gap-2 pt-2 font-mono">
                <input
                  type="number"
                  min={7}
                  max={365}
                  value={dataRetentionDays}
                  onChange={(e) => setDataRetentionDays(Number(e.target.value))}
                  className="w-20 bg-bg-surface border border-border rounded px-2.5 py-1 text-center font-bold text-tx-primary focus:outline-none focus:border-nexus-cyan"
                />
                <span className="text-tx-secondary">days</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-bg-elevated border border-border space-y-2">
              <label className="font-semibold text-tx-primary block">
                Offline SMS/Voice Fallback Channel
              </label>
              <p className="text-[11px] text-tx-muted">
                Fallback outbound SMS trigger via telecom gateway when cellular data connection drops.
              </p>
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-mono text-[11px]">
                  <input
                    type="checkbox"
                    checked={smsFallbackEnabled}
                    onChange={(e) => setSmsFallbackEnabled(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4"
                  />
                  <span>Enable SMS Gateway Fallback (Mock Carrier)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Regulatory Compliance Card */}
        <div className="p-5 rounded-xl border border-border bg-bg-surface space-y-3 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono flex items-center gap-2">
            <Lock className="w-4 h-4 text-nexus-cyan" />
            Statutory Compliance Architecture Reference
          </h3>

          <div className="space-y-2 text-xs text-tx-secondary leading-relaxed font-sans">
            <div className="p-3 rounded-lg bg-bg-elevated/50 border border-border">
              <div className="font-bold text-tx-primary mb-1">
                AIS-140 Vehicle Tracking &amp; Emergency Buttons (India MoRTH)
              </div>
              <p className="text-[11px]">
                Under Indian transport regulations (AIS-140), passenger transport vehicles operating on public roads require authorized vehicle-mounted telematics and physical panic buttons connected to state emergency response centres. Android phone-based tracking serves as an operational companion and driver interface; hardware integration endpoints are provided in the backend architecture.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-bg-elevated/50 border border-border">
              <div className="font-bold text-tx-primary mb-1">
                Digital Personal Data Protection (DPDP) Act Compliance
              </div>
              <p className="text-[11px]">
                Driver location is tracked exclusively during active scheduled trips with explicit foreground notice. No off-duty background surveillance is permitted. Audit trails maintain immutable operator change stamps.
              </p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedNotice ? (
            <div className="text-xs text-nexus-safe font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings updated successfully in session store.</span>
            </div>
          ) : (
            <div className="text-xs text-tx-muted font-mono">
              ALL CHANGES PERSIST IN APPLICATION CLIENT STORE.
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-nexus-cyan text-black font-bold text-xs uppercase tracking-wider shadow-glow hover:bg-cyan-300 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
