"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFleet } from "@/lib/context/FleetContext";
import { formatAgo, formatTimeIST, getSeverityBadgeClass } from "@/lib/utils";
import { MapPin, Maximize2, ShieldAlert, Layers, Filter } from "lucide-react";

export function IncidentHeatmap() {
  const { incidents, routes } = useFleet();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [showBuffers, setShowBuffers] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;
    const container = containerRef.current;

    async function init() {
      if (!container || mapRef.current) return;
      const leafletMod = await import("leaflet");
      const L: any = (leafletMod as any).default?.map ? (leafletMod as any).default : leafletMod;
      if (!isMounted || !container) return;

      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      leafletRef.current = L;
      (window as any).L = L;

      const map = L.map(container, {
        center: [26.465, 80.315],
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // CartoDB Dark Matter (100% Free, No API Key Required)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      mapRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
      setMapReady(true);

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 150);

      if (typeof ResizeObserver !== "undefined" && containerRef.current) {
        resizeObserverRef.current = new ResizeObserver(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        });
        resizeObserverRef.current.observe(containerRef.current);
      }
    }

    init();

    return () => {
      isMounted = false;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (container && (container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
      setMapReady(false);
    };
  }, []);

  // Render Routes and Incident Hotspots
  useEffect(() => {
    if (!mapReady || !mapRef.current || !layerGroupRef.current) return;
    const L = leafletRef.current || (window as any).L;
    if (!L) return;

    layerGroupRef.current.clearLayers();

    // 1. Draw route corridors
    routes.forEach((route) => {
      L.polyline(route.waypoints, {
        color: route.color,
        weight: 3,
        opacity: 0.45,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(layerGroupRef.current);
    });

    // 2. Filter incidents by severity
    const filteredIncidents = incidents.filter(
      (inc) => selectedSeverity === "ALL" || inc.severity === selectedSeverity
    );

    // 3. Render incident hotspot markers
    filteredIncidents.forEach((inc) => {
      const isCritical = inc.severity === "CRITICAL";
      const color =
        inc.severity === "CRITICAL"
          ? "#FF4D67"
          : inc.severity === "HIGH"
          ? "#FFB547"
          : inc.severity === "MEDIUM"
          ? "#49D9FF"
          : "#5B6A82";

      // Pulsing hotspot circle
      if (showBuffers) {
        L.circle([inc.lat, inc.lng], {
          radius: isCritical ? 220 : 140,
          color,
          fillColor: color,
          fillOpacity: isCritical ? 0.22 : 0.12,
          weight: 1,
          dashArray: isCritical ? "3, 5" : undefined,
        }).addTo(layerGroupRef.current);
      }

      // Marker Icon
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer select-none" style="width: 28px; height: 28px;">
          ${
            isCritical
              ? `<div class="absolute -inset-2 rounded-full border border-red-500/80 pointer-events-none" style="animation: radar-ping 1.8s infinite; background: rgba(255, 77, 103, 0.3);"></div>`
              : ""
          }
          <div style="background-color: ${color}; box-shadow: 0 0 10px ${color};" class="w-5 h-5 rounded-full border-2 border-bg-surface flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: "incident-map-marker",
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const popupContent = `
        <div class="font-sans text-xs p-1 space-y-1">
          <div class="flex items-center justify-between gap-2 border-b border-border pb-1">
            <span class="font-mono font-bold text-white">${inc.id}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold" style="background: ${color}33; color: ${color}; border: 1px solid ${color}66;">
              ${inc.severity}
            </span>
          </div>
          <div class="font-bold text-white text-xs mt-1">${inc.title}</div>
          <div class="text-gray-300 text-[11px] font-mono">
            Vehicle: <b class="text-cyan-400">${inc.busId}</b> &bull; ${inc.speedAtIncidentKmh} km/h
          </div>
          <div class="text-gray-400 text-[10px] font-mono">
            ${inc.routeName}
          </div>
          <div class="text-gray-400 text-[10px] pt-1 border-t border-border/50">
            ${formatTimeIST(inc.triggeredAt)} (${formatAgo(inc.triggeredAt)})
          </div>
        </div>
      `;

      L.marker([inc.lat, inc.lng], { icon })
        .addTo(layerGroupRef.current)
        .bindPopup(popupContent, { offset: [0, -10] });
    });
  }, [mapReady, incidents, routes, selectedSeverity, showBuffers]);

  const fitBounds = () => {
    if (!mapRef.current || incidents.length === 0) return;
    const L = leafletRef.current || (window as any).L;
    if (!L) return;

    const bounds = L.latLngBounds(incidents.map((i) => [i.lat, i.lng]));
    mapRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-3 shadow-xl tech-card">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-nexus-cyan" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-tx-primary font-mono">
            Geospatial Incident Densities &amp; Corridor Hotspots ({incidents.length} Events)
          </h3>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1">
            {(["ALL", "CRITICAL", "HIGH", "MEDIUM"] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded text-[10px] transition-colors ${
                  selectedSeverity === sev
                    ? "bg-nexus-cyan/20 text-nexus-cyan border border-nexus-cyan/40 font-bold"
                    : "text-tx-muted hover:text-tx-primary bg-bg-elevated border border-border"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowBuffers(!showBuffers)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showBuffers
                ? "bg-nexus-cyan/20 text-nexus-cyan border-nexus-cyan/50"
                : "bg-bg-elevated text-tx-muted border-border hover:text-tx-primary"
            }`}
            title="Toggle Incident Dispersion Buffers"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={fitBounds}
            className="p-1.5 rounded-lg bg-bg-elevated hover:bg-bg-hover text-tx-secondary hover:text-nexus-cyan border border-border transition-colors"
            title="Fit to All Incidents"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map DOM Viewport */}
      <div className="relative rounded-xl overflow-hidden border border-border bg-bg-surface h-[380px]">
        <div ref={containerRef} className="w-full h-full z-0" />

        {/* Free Map Floating Badge */}
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-bg-surface/95 border border-border/80 backdrop-blur-md text-[10px] font-mono text-tx-secondary shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-nexus-safe animate-pulse" />
          <span className="text-tx-primary font-bold">LEAFLET CORRIDOR ENGINE</span>
          <span className="text-border-bright">&bull;</span>
          <span className="text-nexus-safe font-semibold">CARTODB DARK MATTER (FREE)</span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-bg-surface/95 border border-border/80 backdrop-blur-md text-[10px] font-mono text-tx-secondary shadow-lg flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-nexus-critical" />
            <span className="text-white">Critical SOS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-nexus-warning" />
            <span>High Severity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-nexus-cyan" />
            <span>Medium / Speed</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] font-mono text-tx-muted pt-1">
        <span>Click any incident hotspot to inspect telemetry values, speed, and time.</span>
        <span className="text-nexus-cyan">NO API KEY REQUIRED &bull; OPENSTREETMAP DATA</span>
      </div>
    </div>
  );
}
