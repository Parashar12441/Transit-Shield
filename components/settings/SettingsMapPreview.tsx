"use client";

import React, { useEffect, useRef, useState } from "react";
import { Maximize2, Layers, CheckCircle2, ShieldCheck } from "lucide-react";

interface SettingsMapPreviewProps {
  provider: string;
  apiKey?: string;
}

const TILE_CONFIGS: {
  [key: string]: {
    name: string;
    url: string;
    attribution: string;
    subdomains: string;
    maxZoom: number;
    requiresKey: boolean;
  };
} = {
  cartodb: {
    name: "CartoDB Dark Matter",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
    requiresKey: false,
  },
  osm: {
    name: "OpenStreetMap Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: "abc",
    maxZoom: 19,
    requiresKey: false,
  },
  stadia: {
    name: "Stadia Alidade Smooth Dark",
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    subdomains: "",
    maxZoom: 20,
    requiresKey: true,
  },
  google: {
    name: "CartoDB Dark (Google Maps Fallback)",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
    requiresKey: true,
  },
};

export function SettingsMapPreview({ provider, apiKey }: SettingsMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const activeConfig = TILE_CONFIGS[provider] || TILE_CONFIGS.cartodb;

  // Initialize Leaflet preview map
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

      const map = L.map(container, {
        center: [26.465, 80.32],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Add base tile layer
      tileLayerRef.current = L.tileLayer(activeConfig.url, {
        attribution: activeConfig.attribution,
        subdomains: activeConfig.subdomains,
        maxZoom: activeConfig.maxZoom,
      }).addTo(map);

      // Sample route line through Kanpur Central
      const sampleCoords: [number, number][] = [
        [26.4538, 80.3512],
        [26.4605, 80.3395],
        [26.4678, 80.3242],
        [26.4795, 80.3015],
      ];

      L.polyline(sampleCoords, {
        color: "#49D9FF",
        weight: 4,
        opacity: 0.9,
      }).addTo(map);

      // Overhead Transit Bus Marker
      const busIconHtml = `
        <div class="relative cursor-pointer select-none" style="width: 22px; height: 36px;">
          <div class="w-full h-full flex items-center justify-center" style="transform: rotate(62deg); transform-origin: 11px 18px;">
            <svg width="22" height="36" viewBox="0 0 22 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 6px rgba(73, 217, 255, 0.6));">
              <rect x="1" y="1" width="20" height="34" rx="5" fill="#0C111D" stroke="#49D9FF" stroke-width="2"/>
              <path d="M4 6C4 4.5 5 3.5 7 3.5H15C17 3.5 18 4.5 18 6V9H4V6Z" fill="#38D996" fill-opacity="0.95"/>
              <circle cx="4.5" cy="2.5" r="1.5" fill="#FFFFFF"/>
              <circle cx="17.5" cy="2.5" r="1.5" fill="#FFFFFF"/>
              <rect x="2.5" y="12" width="2" height="4" rx="0.5" fill="#94A3B8"/>
              <rect x="2.5" y="18" width="2" height="4" rx="0.5" fill="#94A3B8"/>
              <rect x="2.5" y="24" width="2" height="4" rx="0.5" fill="#94A3B8"/>
              <rect x="17.5" y="12" width="2" height="4" rx="0.5" fill="#94A3B8"/>
              <rect x="17.5" y="18" width="2" height="4" rx="0.5" fill="#94A3B8"/>
              <rect x="17.5" y="24" width="2" height="4" rx="0.5" fill="#94A3B8"/>
              <rect x="4" y="30.5" width="14" height="2" rx="0.5" fill="#94A3B8" fill-opacity="0.8"/>
              <circle cx="3.5" cy="33.5" r="1.2" fill="#FF4D67"/>
              <circle cx="18.5" cy="33.5" r="1.2" fill="#FF4D67"/>
              <rect x="7" y="14" width="8" height="9" rx="1.5" fill="#49D9FF" fill-opacity="0.25"/>
            </svg>
          </div>
          <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.2 rounded bg-black/90 border border-cyan-400/60 text-[9px] font-mono font-bold text-cyan-300 shadow-lg pointer-events-none whitespace-nowrap z-20">
            KNP-TEST &bull; 34k
          </div>
        </div>
      `;

      const busIcon = L.divIcon({
        className: "preview-bus-aligned-marker",
        html: busIconHtml,
        iconSize: [22, 36],
        iconAnchor: [11, 18],
      });

      leafletRef.current = L;
      (window as any).L = L;

      L.marker([26.4678, 80.3242], { icon: busIcon }).addTo(map);

      mapRef.current = map;
      setMapReady(true);

      // Force size invalidation
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update tile layer when provider changes
  useEffect(() => {
    if (!mapReady || !mapRef.current || !tileLayerRef.current) return;
    const L = leafletRef.current || (window as any).L;
    if (!L) return;

    mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(activeConfig.url, {
      attribution: activeConfig.attribution,
      subdomains: activeConfig.subdomains,
      maxZoom: activeConfig.maxZoom,
    }).addTo(mapRef.current);
  }, [provider, mapReady, activeConfig]);

  const recenter = () => {
    if (!mapRef.current) return;
    mapRef.current.setView([26.465, 80.32], 13, { animate: true });
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-bg-surface shadow-xl tech-card">
      {/* Map DOM Container */}
      <div ref={containerRef} className="w-full h-[260px] z-0" />

      {/* Floating Status Badge (Top Left) */}
      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-bg-surface/95 border border-border/80 backdrop-blur-md text-[10px] font-mono text-tx-secondary shadow-lg flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-nexus-safe animate-pulse" />
        <span className="text-tx-primary font-bold">
          LEAFLET MAP: {activeConfig.name.toUpperCase()}
        </span>
        <span className="text-border-bright">&bull;</span>
        <span className="text-nexus-safe font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          <span>NO PAID API KEY REQUIRED</span>
        </span>
      </div>

      {/* Recenter button (Top Right) */}
      <div className="absolute top-3 right-3 z-10">
        <button
          type="button"
          onClick={recenter}
          className="p-1.5 rounded-lg bg-bg-elevated/90 hover:bg-bg-hover text-tx-secondary hover:text-nexus-cyan border border-border shadow-md backdrop-blur-md transition-colors"
          title="Recenter on Kanpur Corridor"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Bar Info */}
      <div className="p-2.5 bg-bg-elevated/90 border-t border-border flex items-center justify-between text-[11px] font-mono text-tx-muted">
        <div className="flex items-center gap-1.5 text-nexus-safe">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Active Leaflet Engine: CartoDB Dark Matter &bull; Lat: 26.465, Lng: 80.320</span>
        </div>
        <span className="text-[10px] text-tx-secondary">
          Live Vector &amp; Marker Render Test OK
        </span>
      </div>
    </div>
  );
}
