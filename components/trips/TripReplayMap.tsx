"use client";

import React, { useEffect, useRef } from "react";
import { HistoricalTrip } from "@/types";

export function TripReplayMap({
  trip,
  currentPointIndex,
}: {
  trip: HistoricalTrip;
  currentPointIndex: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const pathLayerRef = useRef<any>(null);
  const busMarkerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Compute road heading between consecutive coordinates
  const getBearing = (i: number) => {
    const nextIdx = Math.min(trip.coordinates.length - 1, i + 1);
    const [lat1, lng1] = trip.coordinates[i] || [0, 0];
    const [lat2, lng2] = trip.coordinates[nextIdx] || [0, 0];
    if (lat1 === lat2 && lng1 === lng2) return 0;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const rLat1 = (lat1 * Math.PI) / 180;
    const rLat2 = (lat2 * Math.PI) / 180;

    const y = Math.sin(dLng) * Math.cos(rLat2);
    const x =
      Math.cos(rLat1) * Math.sin(rLat2) -
      Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLng);

    return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
  };

  const createBusIconHtml = (heading: number) => `
    <div class="relative cursor-pointer select-none" style="width: 22px; height: 36px;">
      <div class="w-full h-full flex items-center justify-center transition-transform duration-200"
           style="transform: rotate(${heading}deg); transform-origin: 11px 18px;">
        <svg width="22" height="36" viewBox="0 0 22 36" fill="none" xmlns="http://www.w3.org/2000/svg"
             style="filter: drop-shadow(0 0 6px rgba(73, 217, 255, 0.5));">
          <rect x="1" y="1" width="20" height="34" rx="5" fill="#0C111D" stroke="#49D9FF" stroke-width="2"/>
          <path d="M4 6C4 4.5 5 3.5 7 3.5H15C17 3.5 18 4.5 18 6V9H4V6Z" fill="#49D9FF" fill-opacity="0.95"/>
          <circle cx="4.5" cy="2.5" r="1.5" fill="#FFFFFF"/>
          <circle cx="17.5" cy="2.5" r="1.5" fill="#FFFFFF"/>
          <rect x="2.5" y="12" width="2" height="4" rx="0.5" fill="#94A3B8"/>
          <rect x="2.5" y="18" width="2" height="4" rx="0.5" fill="#94A3B8"/>
          <rect x="2.5" y="24" width="2" height="4" rx="0.5" fill="#94A3B8"/>
          <rect x="17.5" y="12" width="2" height="4" rx="0.5" fill="#94A3B8"/>
          <rect x="17.5" y="18" width="2" height="4" rx="0.5" fill="#94A3B8"/>
          <rect x="17.5" y="24" width="2" height="4" rx="0.5" fill="#94A3B8"/>
          <rect x="4" y="30.5" width="14" height="2" rx="0.5" fill="#94A3B8" fill-opacity="0.8"/>
          <rect x="7" y="14" width="8" height="9" rx="1.5" fill="#49D9FF" fill-opacity="0.3"/>
        </svg>
      </div>

      <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.2 rounded bg-black/90 border border-cyan-400/60 text-[9px] font-mono font-bold text-cyan-300 shadow-lg pointer-events-none whitespace-nowrap z-20">
        ${trip.busId}
      </div>
    </div>
  `;

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
        center: trip.coordinates[0] || [26.465, 80.31],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // CartoDB Dark Matter
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
      pathLayerRef.current = L.layerGroup().addTo(map);

      // Draw full journey line with neon cyan glow
      const fullLine = L.polyline(trip.coordinates, {
        color: "#49D9FF",
        weight: 4.5,
        opacity: 0.8,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(pathLayerRef.current);

      map.fitBounds(fullLine.getBounds(), { padding: [40, 40] });

      // Start & End markers
      L.circleMarker(trip.coordinates[0], {
        radius: 6,
        color: "#38D996",
        fillColor: "#0C111D",
        fillOpacity: 1,
        weight: 2.5,
      })
        .addTo(pathLayerRef.current)
        .bindTooltip("Origin: " + trip.routeName.split("–")[0], { direction: "top" });

      L.circleMarker(trip.coordinates[trip.coordinates.length - 1], {
        radius: 6,
        color: "#4B7BFF",
        fillColor: "#0C111D",
        fillOpacity: 1,
        weight: 2.5,
      })
        .addTo(pathLayerRef.current)
        .bindTooltip("Destination: " + trip.routeName.split("–")[1], { direction: "top" });

      const heading = getBearing(currentPointIndex);
      const busIcon = L.divIcon({
        className: "replay-bus-aligned-marker",
        html: createBusIconHtml(heading),
        iconSize: [22, 36],
        iconAnchor: [11, 18],
      });

      leafletRef.current = L;
      (window as any).L = L;

      const currentPos = trip.coordinates[currentPointIndex] || trip.coordinates[0];
      busMarkerRef.current = L.marker(currentPos, { icon: busIcon }).addTo(map);

      // Force size invalidation so tiles and full journey polyline render without clipping
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.id]);

  // Update bus marker position and rotation as replay seeks
  useEffect(() => {
    if (!busMarkerRef.current || !trip.coordinates[currentPointIndex]) return;
    const L = leafletRef.current || (window as any).L;
    if (!L) return;

    const pt = trip.coordinates[currentPointIndex];
    const heading = getBearing(currentPointIndex);

    const busIcon = L.divIcon({
      className: "replay-bus-aligned-marker",
      html: createBusIconHtml(heading),
      iconSize: [22, 36],
      iconAnchor: [11, 18],
    });

    busMarkerRef.current.setLatLng(pt);
    busMarkerRef.current.setIcon(busIcon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPointIndex, trip.coordinates]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[520px] rounded-xl overflow-hidden border border-border bg-bg-surface shadow-2xl relative tech-card"
    />
  );
}
