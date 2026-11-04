"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFleet } from "@/lib/context/FleetContext";
import { formatAgo } from "@/lib/utils";
import {
  Maximize2,
  Layers,
  AlertTriangle,
  Radio,
  Navigation,
  Clock,
  ShieldAlert,
  BatteryCharging,
  LocateFixed,
  ChevronRight,
  Eye,
  Siren,
  KeyRound,
  CheckCircle2,
  X,
  ExternalLink,
  Activity,
  Wifi,
  Copy,
  Terminal,
  Send,
} from "lucide-react";

type MapTileProvider = "osm" | "cartodb" | "osm_day";

const TILE_PROVIDERS: {
  [key in MapTileProvider]: {
    name: string;
    url: string;
    attribution: string;
    subdomains: string;
    maxZoom: number;
    className?: string;
  };
} = {
  osm: {
    name: "OpenStreetMap Tactical Dark (Leaflet OSM)",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: "abc",
    maxZoom: 19,
    className: "osm-tactical-tile",
  },
  cartodb: {
    name: "CartoDB Dark Matter (Tactical Dark)",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  },
  osm_day: {
    name: "OpenStreetMap Standard (Daylight)",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: "abc",
    maxZoom: 19,
  },
};

export function FleetMap({
  height = "520px",
  focusedRouteId,
  singleBusId,
  passengerMode = false,
}: {
  height?: string;
  focusedRouteId?: string;
  singleBusId?: string;
  passengerMode?: boolean;
}) {
  const {
    buses,
    routes,
    selectedBusId,
    selectBus,
    incidents,
    triggerSimulatedSos,
    telemetryMode,
    setTelemetryMode,
    ingestLiveTelemetry,
    liveFeedStats,
  } = useFleet();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<{ [busId: string]: any }>({});
  const routesLayerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [activeTileProvider, setActiveTileProvider] = useState<MapTileProvider>("osm");
  const [showGeofences, setShowGeofences] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [followMode, setFollowMode] = useState(false);
  const [isApiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [isLiveFeedModalOpen, setLiveFeedModalOpen] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [savedKeyNotice, setSavedKeyNotice] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [injectFeedback, setInjectFeedback] = useState(false);

  const selectedBus = buses.find((b) => b.id === selectedBusId);
  const selectedBusRouteId = selectedBus?.routeId;

  const handleInjectChaloSample = async () => {
    const samplePayload = {
      source: "CHALO_LIVE_FEED",
      city: "Kanpur",
      buses: [
        {
          vehicleId: "KNP-CHALO-101",
          registration: "UP-78-CH-4921",
          routeNumber: "101",
          routeName: "Kanpur Central Line",
          lat: 26.4715,
          lng: 80.3245,
          speedKmh: 36,
          headingDeg: 110,
          accuracy: 3.2,
          occupancy: "SEATS_AVAILABLE",
          driverName: "Sanjay Kumar (Chalo Live)",
          timestamp: Date.now(),
        },
        {
          vehicleId: "KNP-CHALO-102",
          registration: "UP-78-CH-5510",
          routeNumber: "102",
          routeName: "Kalyanpur Expressway Corridor",
          lat: 26.4950,
          lng: 80.2650,
          speedKmh: 42,
          headingDeg: 285,
          accuracy: 2.8,
          occupancy: "STANDING_ONLY",
          driverName: "Deepak Verma (Chalo Live)",
          timestamp: Date.now(),
        },
      ],
    };

    try {
      await fetch("/api/telematics/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(samplePayload),
      });
      ingestLiveTelemetry(samplePayload);
      setInjectFeedback(true);
      setTimeout(() => setInjectFeedback(false), 2500);
    } catch {}
  };

  // Load custom key and provider from localStorage on mount
  useEffect(() => {
    try {
      const storedKey = localStorage.getItem("nexus_maps_api_key");
      if (storedKey) setCustomKey(storedKey);
      const storedProvider = localStorage.getItem("nexus_map_provider");
      if (storedProvider === "osm" || storedProvider === "cartodb" || storedProvider === "osm_day") {
        setActiveTileProvider(storedProvider as MapTileProvider);
      } else {
        setActiveTileProvider("osm");
      }
    } catch {}
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    let isMounted = true;
    const container = mapContainerRef.current;

    async function initMap() {
      if (!container || mapInstanceRef.current) return;
      setInitError(null);

      try {
        const leafletMod = await import("leaflet");
        const L: any = (leafletMod as any).default?.map ? (leafletMod as any).default : leafletMod;

        if (!isMounted || !container) return;

        // Clean up any stale Leaflet ID to prevent "Map container is already initialized"
        if ((container as any)._leaflet_id) {
          delete (container as any)._leaflet_id;
        }

        leafletRef.current = L;
        (window as any).L = L;

        const map = L.map(container, {
          center: [26.465, 80.31],
          zoom: 12,
          zoomControl: false,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Dedicated map panes to keep corridors, routes, and stops strictly above tiles
        if (!map.getPane("corridorPane")) {
          const corridorPane = map.createPane("corridorPane");
          corridorPane.style.zIndex = "430";
        }
        if (!map.getPane("routesPane")) {
          const routesPane = map.createPane("routesPane");
          routesPane.style.zIndex = "450";
        }
        if (!map.getPane("stopsPane")) {
          const stopsPane = map.createPane("stopsPane");
          stopsPane.style.zIndex = "470";
        }

        // Add base tile layer
        const provider = TILE_PROVIDERS[activeTileProvider] || TILE_PROVIDERS.osm;
        tileLayerRef.current = L.tileLayer(provider.url, {
          attribution: provider.attribution,
          subdomains: provider.subdomains,
          maxZoom: provider.maxZoom,
          className: provider.className || "",
        }).addTo(map);

        let fallbackTriggered = false;
        tileLayerRef.current.on("tileerror", () => {
          // If dark tiles fail, fallback once gracefully
          if (!fallbackTriggered && activeTileProvider !== "osm" && mapInstanceRef.current && L) {
            fallbackTriggered = true;
            try {
              mapInstanceRef.current.removeLayer(tileLayerRef.current);
              tileLayerRef.current = L.tileLayer(TILE_PROVIDERS.osm.url, {
                attribution: TILE_PROVIDERS.osm.attribution,
                subdomains: TILE_PROVIDERS.osm.subdomains,
                maxZoom: TILE_PROVIDERS.osm.maxZoom,
                className: TILE_PROVIDERS.osm.className || "",
              }).addTo(mapInstanceRef.current);
              setActiveTileProvider("osm");
            } catch {}
          }
        });

        mapInstanceRef.current = map;
        routesLayerRef.current = L.layerGroup().addTo(map);
        setMapReady(true);

        // Force multiple size invalidations so tiles and vectors fill container without clipping
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 300);
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 700);

        // Keep map responsive to container or layout size changes
        if (typeof ResizeObserver !== "undefined" && container) {
          resizeObserverRef.current = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          });
          resizeObserverRef.current.observe(container);
        }
      } catch (err) {
        console.error("Leaflet map initialization error:", err);
        setInitError(err instanceof Error ? err.message : String(err));
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (container && (container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
      markersRef.current = {};
      routesLayerRef.current = null;
      tileLayerRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  // Handle tile provider switch
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !tileLayerRef.current) return;
    const L = leafletRef.current || (window as any).L;
    if (!L) return;

    try {
      localStorage.setItem("nexus_map_provider", activeTileProvider);
    } catch {}

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const provider = TILE_PROVIDERS[activeTileProvider] || TILE_PROVIDERS.osm;
    tileLayerRef.current = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: provider.subdomains,
      maxZoom: provider.maxZoom,
      className: provider.className || "",
    }).addTo(mapInstanceRef.current);

    if (typeof tileLayerRef.current.bringToBack === "function") {
      tileLayerRef.current.bringToBack();
    }
  }, [activeTileProvider, mapReady]);

  // Initial fit to fleet routes on map load
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || focusedRouteId || selectedBusId) return;
    const L = leafletRef.current || (window as any).L;
    if (!L) return;

    const allWaypoints = routes.flatMap((r) => r.waypoints || []);
    if (allWaypoints.length > 0) {
      try {
        const bounds = L.latLngBounds(allWaypoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [35, 35], maxZoom: 13 });
      } catch {}
    }
  }, [mapReady, routes, focusedRouteId, selectedBusId]);

  // Draw marked routes, corridors, and stops
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !routesLayerRef.current) return;
    const L = leafletRef.current || (window as any).L;
    if (!L) return;

    routesLayerRef.current.clearLayers();

    // If singleBusId or passengerMode, filter to only the route for that bus or focusedRouteId
    const targetRouteId = focusedRouteId || (singleBusId ? buses.find((b) => b.id === singleBusId)?.routeId : undefined);
    const routesToDraw = (passengerMode || singleBusId) && targetRouteId
      ? routes.filter((r) => r.id === targetRouteId)
      : routes;

    routesToDraw.forEach((route) => {
      const waypoints: [number, number][] =
        Array.isArray(route.waypoints) && route.waypoints.length > 0
          ? route.waypoints
          : Array.isArray(route.stops) && route.stops.length > 0
          ? route.stops.map((s) => [s.lat, s.lng] as [number, number])
          : [];

      if (waypoints.length === 0) return;

      const isRouteActive = focusedRouteId
        ? route.id === focusedRouteId
        : selectedBusRouteId
        ? selectedBusRouteId === route.id
        : true;

      // 1. Safety corridor ribbon along waypoints (Visible marked corridor buffer)
      if (showGeofences) {
        L.polyline(waypoints, {
          pane: "corridorPane",
          color: route.color,
          weight: isRouteActive ? 26 : 16,
          opacity: isRouteActive ? 0.22 : 0.08,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(routesLayerRef.current);
      }

      // 2. High-contrast dark casing/outline polyline (guarantees clear visibility on ANY tile layer)
      L.polyline(waypoints, {
        pane: "routesPane",
        color: "#050A14",
        weight: isRouteActive ? 8.5 : 6,
        opacity: isRouteActive ? 0.95 : 0.75,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(routesLayerRef.current);

      // 3. Core colored marked route polyline
      const routeLine = L.polyline(waypoints, {
        pane: "routesPane",
        color: route.color,
        weight: isRouteActive ? 5 : 3.5,
        opacity: isRouteActive ? 1.0 : 0.8,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(routesLayerRef.current);

      routeLine.bindTooltip(
        `<div class="font-sans text-xs">
          <div class="font-bold flex items-center gap-1.5" style="color: ${route.color}">
            <span class="w-2.5 h-2.5 rounded-full" style="background: ${route.color}"></span>
            ${route.code || route.id}: ${route.name}
          </div>
          <div class="font-mono text-[10px] text-gray-300 mt-1">
            Speed Limit: ${route.speedLimitKmh} km/h &bull; Corridor: &plusmn;${route.deviationCorridorMeters}m &bull; ${route.stops.length} Stops
          </div>
        </div>`,
        { sticky: true }
      );

      // 4. Marked stops along the route with white rim and colored core
      route.stops.forEach((stop, index) => {
        const stopCircle = L.circleMarker([stop.lat, stop.lng], {
          pane: "stopsPane",
          radius: isRouteActive ? 5.5 : 4.5,
          color: "#FFFFFF",
          fillColor: route.color,
          fillOpacity: 1,
          weight: 2,
        }).addTo(routesLayerRef.current);

        stopCircle.bindTooltip(
          `<div class="font-sans text-xs">
            <div class="font-bold text-white flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full" style="background: ${route.color}"></span>
              ${stop.name}
            </div>
            <div class="font-mono text-[10px] text-gray-300 mt-0.5">
              Stop #${stop.sequence || index + 1} &bull; Route ${route.code || route.id} (${route.name.split("–")[0].trim()})
            </div>
            <div class="font-mono text-[9px] text-gray-400 mt-0.5">
              Expected Dwell: ${stop.expectedDwellSec}s
            </div>
          </div>`,
          { direction: "top", offset: [0, -6] }
        );

        // 5. Circular geofence buffer around each stop
        if (showGeofences) {
          L.circle([stop.lat, stop.lng], {
            pane: "corridorPane",
            radius: route.deviationCorridorMeters || 150,
            color: route.color,
            weight: 1,
            dashArray: "4, 6",
            fillColor: route.color,
            fillOpacity: isRouteActive ? 0.08 : 0.02,
          }).addTo(routesLayerRef.current);
        }
      });
    });
  }, [mapReady, routes, showGeofences, selectedBusRouteId, focusedRouteId, singleBusId, passengerMode, buses]);

  // Center on single bus or focused route when singleBusId/focusedRouteId changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const L = leafletRef.current || (window as any).L;
    if (!L) return;

    if (singleBusId) {
      const bus = buses.find((b) => b.id === singleBusId);
      if (bus) {
        const route = routes.find((r) => r.id === bus.routeId);
        if (route && route.waypoints?.length) {
          const bounds = L.latLngBounds(route.waypoints);
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
        } else {
          mapInstanceRef.current.setView([bus.lat, bus.lng], 15, { animate: true });
        }
      }
      return;
    }

    if (focusedRouteId) {
      const route = routes.find((r) => r.id === focusedRouteId);
      if (!route || !route.waypoints?.length) return;
      const bounds = L.latLngBounds(route.waypoints);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
  }, [focusedRouteId, singleBusId, mapReady, routes, buses]);

  // Update bus markers dynamically: PRECISELY LINE-ALIGNED OVERHEAD BUS SILHOUETTE
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const L = leafletRef.current || (window as any).L;
    if (!L) return;

    const visibleBuses = singleBusId ? buses.filter((b) => b.id === singleBusId) : buses;

    visibleBuses.forEach((bus) => {
      const hasCritical = incidents.some(
        (i) => i.busId === bus.id && i.severity === "CRITICAL" && ["NEW", "RESPONDING"].includes(i.status)
      );

      let markerColor = "#38D996"; // LIVE green
      let glowRgba = "rgba(56, 217, 150, 0.4)";
      if (bus.trackingStatus === "STALE") {
        markerColor = "#FFB547"; // STALE amber
        glowRgba = "rgba(255, 181, 71, 0.4)";
      }
      if (hasCritical) {
        markerColor = "#FF4D67"; // CRITICAL red
        glowRgba = "rgba(255, 77, 103, 0.8)";
      }

      const isSelected = selectedBusId === bus.id;

      // Exact road segment bearing (headingDeg calculated parallel to route waypoints)
      const heading = bus.headingDeg || 0;

      // Overhead Transit Bus Marker: 22px width x 36px height
      // Centered precisely on GPS coordinate with iconAnchor: [11, 18]
      const markerHtml = `
        <div class="relative cursor-pointer select-none" style="width: 22px; height: 36px;">
          ${/* Radar Pulse for Critical Emergencies */ ""}
          ${
            hasCritical
              ? `<div class="absolute -inset-4 rounded-full border-2 border-red-500/80 pointer-events-none" style="animation: radar-ping 1.8s infinite; background: rgba(255, 77, 103, 0.25);"></div>`
              : ""
          }

          ${/* Overhead Transit Bus Capsule Rotated to Road Bearing */ ""}
          <div class="w-full h-full flex items-center justify-center transition-transform duration-300"
               style="transform: rotate(${heading}deg); transform-origin: 11px 18px;">
            <svg width="22" height="36" viewBox="0 0 22 36" fill="none" xmlns="http://www.w3.org/2000/svg"
                 style="filter: drop-shadow(0 0 ${isSelected ? "8px" : "4px"} ${glowRgba});">
              ${/* Bus Outer Body */ ""}
              <rect x="1" y="1" width="20" height="34" rx="5" fill="#0C111D" stroke="${isSelected ? "#49D9FF" : markerColor}" stroke-width="${isSelected ? "2.5" : "2"}"/>
              
              ${/* Front Windshield with Headlights (Facing Travel Direction) */ ""}
              <path d="M4 6C4 4.5 5 3.5 7 3.5H15C17 3.5 18 4.5 18 6V9H4V6Z" fill="${markerColor}" fill-opacity="0.95"/>
              <circle cx="4.5" cy="2.5" r="1.5" fill="#FFFFFF"/>
              <circle cx="17.5" cy="2.5" r="1.5" fill="#FFFFFF"/>

              ${/* Side Passenger Windows */ ""}
              <rect x="2.5" y="12" width="2" height="4" rx="0.5" fill="#94A3B8"/>
              <rect x="2.5" y="18" width="2" height="4" rx="0.5" fill="#94A3B8"/>
              <rect x="2.5" y="24" width="2" height="4" rx="0.5" fill="#94A3B8"/>

              <rect x="17.5" y="12" width="2" height="4" rx="0.5" fill="#94A3B8"/>
              <rect x="17.5" y="18" width="2" height="4" rx="0.5" fill="#94A3B8"/>
              <rect x="17.5" y="24" width="2" height="4" rx="0.5" fill="#94A3B8"/>

              ${/* Rear Tail Window & Red Brake Lights */ ""}
              <rect x="4" y="30.5" width="14" height="2" rx="0.5" fill="#94A3B8" fill-opacity="0.8"/>
              <circle cx="3.5" cy="33.5" r="1.2" fill="#FF4D67"/>
              <circle cx="18.5" cy="33.5" r="1.2" fill="#FF4D67"/>

              ${/* Roof Vent / Engine Center */ ""}
              <rect x="7" y="14" width="8" height="9" rx="1.5" fill="${markerColor}" fill-opacity="0.25"/>
            </svg>
          </div>

          ${/* Anchored Vehicle ID & Speed Tag (Floats Below Center without Shifting Coordinates) */ ""}
          <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.2 rounded bg-black/90 border border-gray-700/80 text-[9px] font-mono font-bold text-gray-200 flex items-center gap-1 shadow-lg pointer-events-none whitespace-nowrap z-20">
            <span style="color: ${markerColor};">${bus.id}</span>
            <span class="text-gray-400 font-normal">&bull; ${bus.speedKmh}k</span>
            ${bus.scheduleStatus?.nextStop ? `<span class="text-cyan-400 font-normal hidden sm:inline">&bull; &rarr; ${bus.scheduleStatus.nextStop}</span>` : ""}
          </div>
        </div>
      `;

      // CRITICAL: iconSize: [22, 36], iconAnchor: [11, 18] guarantees mathematical alignment directly on the polyline!
      const icon = L.divIcon({
        className: "custom-bus-aligned-marker",
        html: markerHtml,
        iconSize: [22, 36],
        iconAnchor: [11, 18],
      });

      const tooltipContent = `
        <div class="font-sans text-xs p-1">
          <div class="font-bold font-mono text-cyan-400">${bus.id} (${bus.registration})</div>
          <div class="text-[10px] text-gray-300 font-medium">${bus.routeName}</div>
          ${bus.scheduleStatus ? `
            <div class="mt-1 pt-1 border-t border-gray-700 font-mono text-[10px]">
              <span class="text-gray-400">Next:</span> <span class="text-white font-bold">${bus.scheduleStatus.nextStop}</span>
              <span class="text-cyan-300">(${bus.scheduleStatus.etaNextStopMin > 0 ? `~${bus.scheduleStatus.etaNextStopMin}m` : "At Stop"})</span>
            </div>
            <div class="text-[9px] font-mono text-gray-400">
              Trip: ${bus.scheduleStatus.currentTripDeparture} &bull; ${bus.scheduleStatus.isDwellingAtStop ? '<span class="text-yellow-400">Boarding</span>' : '<span class="text-emerald-400">On Time</span>'}
            </div>
          ` : ""}
        </div>
      `;

      if (!markersRef.current[bus.id]) {
        const marker = L.marker([bus.lat, bus.lng], { icon })
          .addTo(mapInstanceRef.current)
          .bindTooltip(tooltipContent, { direction: "top", offset: [0, -18] })
          .on("click", () => {
            selectBus(bus.id);
            setFollowMode(false);
          });

        markersRef.current[bus.id] = marker;
      } else {
        const marker = markersRef.current[bus.id];
        marker.setLatLng([bus.lat, bus.lng]);
        marker.setIcon(icon);
        marker.setTooltipContent(tooltipContent);
      }
    });

    // Remove stale markers for buses that are not in visibleBuses
    Object.keys(markersRef.current).forEach((busId) => {
      if (!visibleBuses.some((b) => b.id === busId)) {
        if (markersRef.current[busId] && mapInstanceRef.current) {
          try {
            mapInstanceRef.current.removeLayer(markersRef.current[busId]);
          } catch {}
        }
        delete markersRef.current[busId];
      }
    });

    // If follow mode is active or passengerMode, smoothly pan map
    const activeFollowBus = singleBusId ? visibleBuses[0] : (followMode && selectedBus ? selectedBus : null);
    if ((followMode || passengerMode) && activeFollowBus && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([activeFollowBus.lat, activeFollowBus.lng], {
        animate: true,
        duration: 1.0,
      });
    }
  }, [mapReady, buses, selectedBusId, incidents, selectBus, followMode, selectedBus, singleBusId, passengerMode]);

  // Center on selected bus when selectedBusId changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedBusId || singleBusId) return;
    const bus = buses.find((b) => b.id === selectedBusId);
    if (!bus) return;
    mapInstanceRef.current.setView([bus.lat, bus.lng], 14, {
      animate: true,
      duration: 0.8,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBusId, singleBusId]);

  const fitToFleet = () => {
    if (!mapInstanceRef.current) return;
    const L = leafletRef.current || (window as any).L;
    if (!L) return;

    if (singleBusId) {
      const bus = buses.find((b) => b.id === singleBusId);
      if (bus) {
        const route = routes.find((r) => r.id === bus.routeId);
        if (route && route.waypoints?.length) {
          mapInstanceRef.current.fitBounds(L.latLngBounds(route.waypoints), { padding: [50, 50] });
        } else {
          mapInstanceRef.current.setView([bus.lat, bus.lng], 15, { animate: true });
        }
      }
      return;
    }

    if (buses.length === 0) return;
    const bounds = L.latLngBounds(buses.map((b) => [b.lat, b.lng]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    setFollowMode(false);
  };

  const handleSaveCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("nexus_maps_api_key", customKey.trim());
      setSavedKeyNotice(true);
      setTimeout(() => setSavedKeyNotice(false), 3000);
    } catch {}
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-bg-surface shadow-2xl tech-card">
      {/* Map DOM Container */}
      <div
        ref={mapContainerRef}
        style={{ height, minHeight: height || "480px" }}
        className="w-full relative z-0 h-full min-h-[480px]"
      />

      {/* Map Initialization Error Fallback */}
      {initError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-surface/90 backdrop-blur-md z-30 text-xs font-mono text-center p-6 space-y-3">
          <div className="w-10 h-10 rounded-full bg-nexus-critical/20 border border-nexus-critical flex items-center justify-center text-nexus-critical mx-auto">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-tx-primary">GEOSPATIAL ENGINE INITIALIZATION ERROR</span>
          <span className="text-nexus-critical text-xs max-w-md">{initError}</span>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="px-4 py-2 rounded-lg bg-nexus-cyan text-black font-bold text-xs hover:bg-nexus-cyan/90 transition-all shadow-glow mt-2"
          >
            Retry / Reinitialize Leaflet Map
          </button>
        </div>
      )}

      {/* Instant Calibrating Overlay before Tiles Mount */}
      {!mapReady && !initError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-surface/60 backdrop-blur-[2px] z-20 text-xs font-mono text-nexus-cyan gap-2 pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-nexus-cyan border-t-transparent animate-spin" />
          <span className="tracking-wider">CALIBRATING LEAFLET GEOSPATIAL TILES...</span>
        </div>
      )}

      {/* Floating Tactical Tools (Top Right) */}
      <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 flex flex-col gap-1.5 sm:gap-2">
        {passengerMode && singleBusId && (
          <button
            onClick={() => {
              const b = buses.find((bus) => bus.id === singleBusId);
              if (b && mapInstanceRef.current) {
                mapInstanceRef.current.setView([b.lat, b.lng], 15, { animate: true });
              }
            }}
            className="p-2 sm:p-2.5 rounded-lg bg-nexus-cyan/20 hover:bg-nexus-cyan/30 text-nexus-cyan border border-nexus-cyan/50 shadow-glow backdrop-blur-md transition-colors"
            title="Recenter Map on My Bus"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={fitToFleet}
          className="p-2 sm:p-2.5 rounded-lg bg-bg-elevated/90 hover:bg-bg-hover text-tx-secondary hover:text-nexus-cyan border border-border shadow-xl backdrop-blur-md transition-colors"
          title={passengerMode ? "Fit Route Corridor" : "Fit bounds to active fleet"}
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowGeofences(!showGeofences)}
          className={`p-2 sm:p-2.5 rounded-lg border shadow-xl backdrop-blur-md transition-colors ${
            showGeofences
              ? "bg-nexus-cyan/20 text-nexus-cyan border-nexus-cyan/50 shadow-glow"
              : "bg-bg-elevated/90 text-tx-muted border-border hover:text-tx-primary"
          }`}
          title="Toggle route geofences and safety corridor buffers"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Map Tile Layers Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="p-2 sm:p-2.5 rounded-lg bg-bg-elevated/90 hover:bg-bg-hover text-tx-secondary hover:text-nexus-cyan border border-border shadow-xl backdrop-blur-md transition-colors"
            title="Switch Map Tiles Provider"
          >
            <Radio className="w-4 h-4" />
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 top-11 w-56 p-2 rounded-xl bg-bg-surface/95 border border-border shadow-2xl backdrop-blur-xl z-30 text-xs space-y-1">
              <div className="text-[10px] font-mono text-tx-muted px-2 py-1 uppercase tracking-wider font-semibold">
                Map Tile Layers
              </div>
              {(["osm", "cartodb", "osm_day"] as const).map((prov) => (
                <button
                  key={prov}
                  onClick={() => {
                    setActiveTileProvider(prov);
                    setShowLayerMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                    activeTileProvider === prov
                      ? "bg-nexus-cyan/15 text-nexus-cyan border border-nexus-cyan/40 font-bold"
                      : "text-tx-secondary hover:bg-bg-elevated hover:text-tx-primary"
                  }`}
                >
                  <span>{TILE_PROVIDERS[prov].name.split("(")[0]}</span>
                  {activeTileProvider === prov && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {!passengerMode && (
          <>
            {/* Map API Key Settings Trigger */}
            <button
              onClick={() => setApiKeyModalOpen(true)}
              className="p-2.5 rounded-lg bg-bg-elevated/90 hover:bg-bg-hover text-nexus-cyan border border-border shadow-xl backdrop-blur-md transition-colors"
              title="Configure Map API Key / Provider Settings"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Live Feed & Chalo Telematics Ingestion Trigger */}
            <button
              onClick={() => setLiveFeedModalOpen(true)}
              className={`p-2.5 rounded-lg border shadow-xl backdrop-blur-md transition-colors relative ${
                liveFeedStats.liveBusesCount > 0
                  ? "bg-nexus-safe/20 text-nexus-safe border-nexus-safe/50 shadow-glow-safe"
                  : "bg-bg-elevated/90 hover:bg-bg-hover text-tx-secondary hover:text-nexus-cyan border-border"
              }`}
              title="Connect Chalo & Live Bus GPS Telematics"
            >
              <Activity className="w-4 h-4" />
              {liveFeedStats.liveBusesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-nexus-safe animate-pulse" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Top Banner: Passenger Mode or Operator Engine Status */}
      {passengerMode ? (
        <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-bg-surface/95 border border-nexus-safe/50 backdrop-blur-md text-[10px] sm:text-[11px] font-mono shadow-2xl flex items-center gap-1.5 sm:gap-2.5 max-w-[calc(100%-120px)] truncate">
          <span className="w-2 h-2 rounded-full bg-nexus-safe animate-pulse shadow-glow-safe shrink-0" />
          <span className="font-bold text-tx-primary truncate">ONBOARD {singleBusId}</span>
          {buses.find((b) => b.id === singleBusId)?.scheduleStatus?.nextStop && (
            <>
              <span className="text-tx-muted hidden sm:inline">&bull;</span>
              <span className="text-tx-secondary hidden sm:inline truncate">
                Next: <strong className="text-white">{buses.find((b) => b.id === singleBusId)?.scheduleStatus?.nextStop}</strong>
              </span>
            </>
          )}
        </div>
      ) : (
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-bg-surface/90 border border-border/80 backdrop-blur-md text-[11px] font-mono text-tx-secondary shadow-xl hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-nexus-safe animate-pulse" />
          <span>MAP ENGINE: {(TILE_PROVIDERS[activeTileProvider] || TILE_PROVIDERS.osm).name.split("(")[0].toUpperCase()}</span>
          <span className="text-border-bright">•</span>
          <button
            onClick={() => setActiveTileProvider(activeTileProvider === "osm" ? "cartodb" : "osm")}
            className="text-nexus-cyan hover:underline font-semibold flex items-center gap-1 transition-colors"
            title="Toggle OpenStreetMap (OSM) / Dark Matter Leaflet tiles"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{activeTileProvider === "osm" ? "Dark Matter" : "Tactical OSM"}</span>
          </button>
          <span className="text-border-bright">•</span>
          <button
            onClick={() => setApiKeyModalOpen(true)}
            className="text-tx-secondary hover:text-nexus-cyan hover:underline font-semibold"
          >
            API Config
          </button>
          <span className="text-border-bright">•</span>
          <button
            onClick={() => setLiveFeedModalOpen(true)}
            className="text-nexus-safe hover:underline font-semibold flex items-center gap-1"
          >
            <Activity className="w-3 h-3" />
            <span>CHALO / LIVE FEED ({telemetryMode})</span>
          </button>
        </div>
      )}

      {/* Marked Route Corridor Badges Bar (Operator Mode Only) */}
      {!passengerMode && (
        <div className="absolute top-14 left-4 z-10 px-2.5 py-1 rounded-lg bg-bg-surface/95 border border-border/80 backdrop-blur-md text-[11px] font-mono shadow-xl hidden md:flex items-center gap-2">
          <span className="text-[10px] text-tx-muted uppercase tracking-wider font-semibold">Marked Corridors:</span>
          {routes.map((r) => {
            const isFocused = focusedRouteId === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  if (mapInstanceRef.current && r.waypoints?.length) {
                    const L = leafletRef.current || (window as any).L;
                    if (L) {
                      mapInstanceRef.current.fitBounds(L.latLngBounds(r.waypoints), {
                        padding: [50, 50],
                        animate: true,
                      });
                    }
                  }
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 border ${
                  isFocused
                    ? "bg-bg-elevated text-white border-white/50 shadow-sm"
                    : "hover:bg-bg-elevated text-tx-secondary hover:text-white border-transparent"
                }`}
                title={`Frame and view marked route corridor for ${r.code}: ${r.name}`}
              >
                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: r.color }} />
                <span>{r.code || r.id}</span>
              </button>
            );
          })}
          <button
            onClick={fitToFleet}
            className="text-[10px] text-nexus-cyan hover:underline px-1 font-semibold"
            title="Frame all marked corridors and active fleet"
          >
            View All
          </button>
        </div>
      )}

      {/* Real-time Status Counter Pill (Bottom Left) */}
      {passengerMode ? (
        <div className="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-4 z-10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-bg-surface/95 border border-border/80 backdrop-blur-md text-[10px] sm:text-[11px] font-mono shadow-xl flex items-center gap-2 sm:gap-3 text-tx-secondary">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-nexus-safe shadow-glow-safe" />
            <span className="text-tx-primary font-bold">GPS ACTIVE</span>
          </div>
          <span>&bull;</span>
          <span>SPEED: <strong className="text-white">{buses.find((b) => b.id === singleBusId)?.speedKmh || 0} km/h</strong></span>
          <span className="hidden xs:inline">&bull;</span>
          <span className="hidden xs:inline truncate max-w-[130px]">
            <strong className="text-nexus-cyan">{buses.find((b) => b.id === singleBusId)?.routeName?.split("–")[0]?.trim() || "Active"}</strong>
          </span>
        </div>
      ) : (
        <div className="absolute bottom-4 left-4 z-10 px-3 py-2 rounded-lg bg-bg-surface/95 border border-border/80 backdrop-blur-md text-[11px] font-mono flex items-center gap-4 text-tx-secondary shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-nexus-safe shadow-glow-safe" />
            <span className="text-tx-primary font-bold">LIVE: {buses.filter((b) => b.trackingStatus === "LIVE").length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-nexus-warning shadow-glow-warning" />
            <span className="text-tx-primary font-bold">STALE: {buses.filter((b) => b.trackingStatus === "STALE").length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-nexus-critical shadow-glow-critical animate-pulse" />
            <span className="text-tx-primary font-bold">ALERT: {incidents.filter((i) => !["RESOLVED", "CLOSED"].includes(i.status)).length}</span>
          </div>
        </div>
      )}

      {/* Advanced Futuristic Bus Telemetry HUD (Operator Mode: When a bus is selected) */}
      {!passengerMode && selectedBus && (
        <div className="absolute top-14 left-4 z-10 w-84 p-4 rounded-xl bg-bg-surface/95 border border-nexus-cyan/50 shadow-2xl backdrop-blur-xl animate-fade-in space-y-3">
          <div className="flex items-start justify-between pb-2.5 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-tx-primary">
                  {selectedBus.id}
                </span>
                <span className="text-[11px] font-mono text-tx-muted px-1.5 py-0.2 rounded bg-bg-elevated border border-border">
                  {selectedBus.registration}
                </span>
              </div>
              <div className="text-xs text-nexus-cyan font-medium mt-0.5 truncate">
                {selectedBus.routeName}
              </div>
            </div>

            <button
              onClick={() => {
                selectBus(null);
                setFollowMode(false);
              }}
              className="text-tx-muted hover:text-tx-primary text-xs w-6 h-6 rounded flex items-center justify-center bg-bg-elevated hover:bg-bg-hover"
            >
              &times;
            </button>
          </div>

          {/* Scheduled Route Timetable Status Banner */}
          {selectedBus.scheduleStatus && (
            <div className="p-2.5 rounded-lg bg-bg-elevated/90 border border-nexus-cyan/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-tx-muted uppercase tracking-wider flex items-center gap-1 font-bold">
                  <Clock className="w-3 h-3 text-nexus-cyan" />
                  Timetable Adherence
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    selectedBus.scheduleStatus.isDwellingAtStop
                      ? "bg-nexus-cyan/20 text-nexus-cyan border border-nexus-cyan/40"
                      : selectedBus.scheduleStatus.scheduleAdherence === "ON_TIME"
                      ? "bg-nexus-safe/20 text-nexus-safe border border-nexus-safe/40"
                      : "bg-nexus-warning/20 text-nexus-warning border border-nexus-warning/40"
                  }`}
                >
                  {selectedBus.scheduleStatus.isDwellingAtStop
                    ? `BOARDING: ${selectedBus.scheduleStatus.dwellingStopName}`
                    : selectedBus.scheduleStatus.scheduleAdherence === "ON_TIME"
                    ? "ON SCHEDULE"
                    : "SLIGHT DELAY"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono bg-bg-surface/80 p-2 rounded border border-border">
                <div className="min-w-0 pr-2">
                  <span className="text-tx-muted text-[9px] uppercase tracking-wider block">NEXT STOP</span>
                  <span className="font-bold text-tx-primary truncate block">{selectedBus.scheduleStatus.nextStop}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-tx-muted text-[9px] uppercase tracking-wider block">ESTIMATED ETA</span>
                  <span className="font-bold text-nexus-cyan text-xs">
                    {selectedBus.scheduleStatus.etaNextStopMin > 0 ? `~${selectedBus.scheduleStatus.etaNextStopMin} min` : "At Stop"}
                  </span>
                </div>
              </div>

              <div className="pt-1 border-t border-border/50 flex items-center justify-between text-[10px] text-tx-muted font-mono">
                <span>Trip: {selectedBus.scheduleStatus.currentTripDeparture} &rarr; {selectedBus.scheduleStatus.currentTripArrival}</span>
                <span className="text-nexus-cyan/80">Every {selectedBus.scheduleStatus.headwayMinutes}m</span>
              </div>
            </div>
          )}

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-bg-elevated/70 border border-border/60">
              <span className="text-[10px] text-tx-muted block">CURRENT SPEED</span>
              <div className="text-base font-bold text-tx-primary flex items-baseline gap-1">
                {selectedBus.speedKmh} <span className="text-[10px] text-tx-muted font-normal">km/h</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-bg-elevated/70 border border-border/60">
              <span className="text-[10px] text-tx-muted block">DRIVER</span>
              <div className="text-xs font-bold text-tx-primary truncate mt-0.5 font-sans">
                {selectedBus.driverName}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-bg-elevated/70 border border-border/60">
              <span className="text-[10px] text-tx-muted block">ROAD BEARING</span>
              <div className="text-xs font-bold text-nexus-cyan mt-0.5">
                {selectedBus.headingDeg}&deg; <span className="text-[10px] text-tx-muted font-normal">Line Aligned</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-bg-elevated/70 border border-border/60">
              <span className="text-[10px] text-tx-muted block">LAST TELEMETRY FIX</span>
              <div className="text-xs font-bold text-tx-primary mt-0.5">
                {formatAgo(selectedBus.lastSeenMs)}
              </div>
            </div>
          </div>

          {/* Trip Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-mono text-tx-secondary mb-1">
              <span>Route Trajectory</span>
              <span className="text-nexus-cyan font-bold">{selectedBus.progressPercent}%</span>
            </div>
            <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-nexus-cyan h-full transition-all duration-700 shadow-glow"
                style={{ width: `${selectedBus.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Actions Bar */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
            <button
              onClick={() => setFollowMode(!followMode)}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                followMode
                  ? "bg-nexus-cyan text-black border-nexus-cyan shadow-glow"
                  : "bg-bg-elevated text-tx-secondary hover:text-tx-primary border-border"
              }`}
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>{followMode ? "Tracking Bus..." : "Follow Camera"}</span>
            </button>

            <button
              onClick={() => triggerSimulatedSos(selectedBus.id)}
              className="py-1.5 px-3 rounded-lg bg-nexus-critical/15 hover:bg-nexus-critical/25 text-nexus-critical border border-nexus-critical/40 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
              title="Trigger simulated driver panic button on this bus"
            >
              <Siren className="w-3.5 h-3.5" />
              <span>Sim SOS</span>
            </button>
          </div>
        </div>
      )}

      {/* Map API Key & Engine Config Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-bg-surface border border-nexus-cyan/40 rounded-xl shadow-2xl overflow-hidden flex flex-col tech-card">
            <div className="p-4 border-b border-border bg-bg-elevated flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-nexus-cyan" />
                <div>
                  <h3 className="font-bold text-sm text-tx-primary tracking-wide">
                    Map API Key &amp; Tile Provider Settings
                  </h3>
                  <div className="text-[11px] font-mono text-tx-secondary">
                    GEOSPATIAL VECTOR CONFIGURATION
                  </div>
                </div>
              </div>
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-bg-hover text-tx-muted hover:text-tx-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomKey} className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-lg bg-nexus-safe/10 border border-nexus-safe/30 text-nexus-safe leading-relaxed flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">NO PAID API KEY REQUIRED:</span> The system comes with free, high-resolution dark tiles enabled out-of-the-box (CartoDB Dark Matter &amp; OpenStreetMap). You can run this platform locally and in production without incurring billing charges or registering with Google Maps Platform.
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-tx-muted block mb-1 uppercase tracking-wider font-semibold">
                  Google Maps Platform / Mapbox API Key (Optional)
                </label>
                <input
                  type="text"
                  placeholder="AIzaSy... or pk.eyJ1..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-xs text-tx-primary focus:outline-none focus:border-nexus-cyan font-mono"
                />
                <span className="text-[10px] text-tx-muted mt-1 block">
                  Leave blank to continue using the free built-in dark telemetry tile engine.
                </span>
              </div>

              {/* Active Leaflet Map Status Card */}
              <div className="p-3 rounded-lg bg-bg-surface border border-border flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2 text-nexus-cyan font-bold">
                  <span className="w-2 h-2 rounded-full bg-nexus-safe animate-pulse" />
                  <span>LEAFLET ENGINE: {TILE_PROVIDERS[activeTileProvider].name.split("(")[0].toUpperCase()}</span>
                </div>
                <span className="text-nexus-safe font-semibold text-[10px] px-2 py-0.5 rounded bg-nexus-safe/10 border border-nexus-safe/30">
                  ✓ ZERO KEY REQUIRED
                </span>
              </div>

              {savedKeyNotice && (
                <div className="p-2.5 rounded bg-nexus-safe/10 border border-nexus-safe/30 text-[11px] text-nexus-safe flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>API Key configuration saved in client environment.</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <a
                  href="https://developers.google.com/maps/documentation"
                  target="_blank"
                  rel="noreferrer"
                  className="text-tx-muted hover:text-nexus-cyan flex items-center gap-1 font-mono text-[11px]"
                >
                  <span>Google Maps Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-nexus-cyan text-black font-bold text-xs uppercase tracking-wider shadow-glow hover:bg-cyan-300 transition-colors font-mono"
                >
                  Save Map Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chalo & Live Telematics Ingestion Gateway Modal */}
      {isLiveFeedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-bg-surface border border-nexus-cyan/40 rounded-xl shadow-2xl overflow-hidden flex flex-col tech-card max-h-[90vh]">
            <div className="p-4 border-b border-border bg-bg-elevated flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-nexus-safe" />
                <div>
                  <h3 className="font-bold text-sm text-tx-primary tracking-wide">
                    Chalo App &amp; Live Bus Telematics Gateway
                  </h3>
                  <div className="text-[11px] font-mono text-tx-secondary">
                    EXTERNAL GPS INGESTION &bull; KANPUR / REGIONAL CITY FLEET
                  </div>
                </div>
              </div>
              <button
                onClick={() => setLiveFeedModalOpen(false)}
                className="p-1 rounded-lg hover:bg-bg-hover text-tx-muted hover:text-tx-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Architecture Reality Card */}
              <div className="p-3.5 rounded-lg bg-bg-elevated border border-border space-y-2">
                <div className="font-bold text-tx-primary flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-nexus-warning" />
                  <span>Chalo App Architecture &amp; Public API Status</span>
                </div>
                <p className="text-[11px] text-tx-secondary leading-relaxed">
                  <strong>Chalo (formerly Zophop)</strong> operates as a private concessionaire for Indian municipal transport corporations (e.g. Kanpur City Transport Services - KCTSL, Mumbai BEST, Bhopal BCLL). Their mobile app communicates through closed microservices protected by <strong>SSL Pinning</strong> and <strong>Play Integrity tokens</strong> with no public third-party developer API.
                </p>
                <p className="text-[11px] text-tx-secondary leading-relaxed">
                  To stream real-time local bus data into NEXUS Transit, the platform provides a dedicated <strong>Live Telematics Ingestion Gateway</strong> that accepts Chalo-format JSON, Indian statutory <strong>AIS-140 GPS hardware packets</strong>, or municipal GTFS-Realtime feeds.
                </p>
              </div>

              {/* Ingestion Mode Selector */}
              <div>
                <label className="text-[11px] font-mono text-tx-muted block mb-2 uppercase tracking-wider font-semibold">
                  Select Active Telemetry Source Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: "HYBRID", label: "Hybrid (Recommended)", desc: "Simulated fleet + real-time external stream" },
                      { id: "LIVE_FEED", label: "Live Feed Only", desc: "Show exclusively ingested GPS coordinates" },
                      { id: "SIMULATION", label: "Internal Sim", desc: "Kanpur mathematical waypoint engine" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setTelemetryMode(m.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        telemetryMode === m.id
                          ? "bg-nexus-cyan/15 border-nexus-cyan text-nexus-cyan shadow-glow"
                          : "bg-bg-elevated border-border text-tx-secondary hover:text-tx-primary"
                      }`}
                    >
                      <div className="font-bold text-xs">{m.label}</div>
                      <div className="text-[10px] text-tx-muted mt-1">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gateway Endpoint & Test Action */}
              <div className="p-3.5 rounded-lg bg-bg-elevated/70 border border-border space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-tx-muted uppercase font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-nexus-cyan" />
                    <span>Live Webhook Ingestion URL</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-nexus-safe/10 border border-nexus-safe/30 text-nexus-safe font-bold">
                    HTTP POST ACTIVE
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded bg-bg-surface border border-border text-[11px] text-nexus-cyan break-all">
                    http://localhost:3000/api/telematics/ingest
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("http://localhost:3000/api/telematics/ingest");
                      setCopyFeedback(true);
                      setTimeout(() => setCopyFeedback(false), 2000);
                    }}
                    className="p-2 rounded bg-bg-hover hover:bg-border text-tx-primary text-xs flex items-center gap-1"
                    title="Copy URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copyFeedback ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-border/60">
                  <div className="text-[11px] text-tx-muted">
                    Packets Ingested: <strong className="text-tx-primary">{liveFeedStats.totalPackets}</strong> &bull; Live Buses: <strong className="text-nexus-safe">{liveFeedStats.liveBusesCount}</strong>
                  </div>

                  <button
                    onClick={handleInjectChaloSample}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-nexus-safe text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow-safe hover:bg-emerald-300 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{injectFeedback ? "✓ Ingested Live Buses!" : "Inject Live Chalo Sample"}</span>
                  </button>
                </div>
              </div>

              {/* cURL Example */}
              <div>
                <label className="text-[11px] font-mono text-tx-muted block mb-1 uppercase tracking-wider font-semibold">
                  Stream Live Buses via cURL / Script
                </label>
                <pre className="p-3 rounded-lg bg-black/80 border border-border text-[10px] text-gray-300 font-mono overflow-x-auto">
{`curl -X POST http://localhost:3000/api/telematics/ingest \\
  -H "Content-Type: application/json" \\
  -d '{
    "source": "CHALO_LIVE_FEED",
    "city": "Kanpur",
    "buses": [{
      "vehicleId": "KNP-CHALO-101",
      "registration": "UP-78-CH-4921",
      "routeNumber": "101",
      "lat": 26.4715,
      "lng": 80.3245,
      "speedKmh": 36,
      "headingDeg": 110
    }]
  }'`}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-bg-elevated flex items-center justify-between text-xs">
              <span className="text-[11px] text-tx-muted font-mono">
                Companion script available at: <code>scripts/chalo-live-streamer.js</code>
              </span>
              <button
                onClick={() => setLiveFeedModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-bg-surface hover:bg-bg-hover text-tx-primary border border-border font-mono text-xs"
              >
                Close Gateway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FleetMap;
