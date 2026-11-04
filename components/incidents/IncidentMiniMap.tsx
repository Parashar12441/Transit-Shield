"use client";

import React, { useEffect, useRef } from "react";

export function IncidentMiniMap({
  lat,
  lng,
  severity,
  busId,
}: {
  lat: number;
  lng: number;
  severity: string;
  busId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

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
        center: [lat, lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Dark Matter (clean URL without {r} 404 issue)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Add emergency marker
      const color = severity === "CRITICAL" ? "#FF4D67" : severity === "HIGH" ? "#FFB547" : "#49D9FF";
      const markerHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 rounded-full border border-red-500/80" style="animation: radar-ping 1.8s infinite; background: rgba(255, 77, 103, 0.25);"></div>
          <div style="background-color: ${color};" class="w-6 h-6 rounded-full border-2 border-white shadow-2xl flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-black"></div>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: "incident-map-marker",
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([lat, lng], { icon }).addTo(map);

      // Add accuracy circle
      L.circle([lat, lng], {
        radius: 140,
        color,
        fillColor: color,
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: "4, 6",
      }).addTo(map);

      mapRef.current = map;

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 150);
    }

    init();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (container && (container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
    };
  }, [lat, lng, severity, busId]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 14, { animate: true });
    }
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="w-full h-44 rounded-lg overflow-hidden border border-border bg-bg-surface relative shadow-inner tech-card"
    />
  );
}
