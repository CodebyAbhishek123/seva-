"use client";

import React, { useEffect, useRef, useState } from "react";
import { Ambulance, Facility } from "@/types";
import { MapPin, Navigation, ShieldAlert, Phone, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface AmbulanceMapProps {
  ambulances: Ambulance[];
  facilities: Facility[];
  selectedAmbulanceId?: string;
  onSelectAmbulance?: (ambulance: Ambulance) => void;
  center?: [number, number];
  zoom?: number;
}

export function AmbulanceMap({
  ambulances,
  facilities,
  selectedAmbulanceId,
  onSelectAmbulance,
  center = [28.6448, 77.2167], // Central Delhi coordinates
  zoom = 11,
}: AmbulanceMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        if (!isMounted || !mapContainerRef.current) return;

        // Create Leaflet Map
        const map = L.map(mapContainerRef.current, {
          center,
          zoom,
          zoomControl: false,
        });

        // Add Zoom Control on top right
        L.control.zoom({ position: "topright" }).addTo(map);

        // OpenStreetMap Tile Layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
          minZoom: 8,
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapReady(true);
      } catch (err: unknown) {
        console.error("Leaflet initialization failed", err);
        setMapError("Failed to initialize OpenStreetMap tiles. Displaying telemetry list.");
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when ambulances or facilities change
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    import("leaflet").then((LModule) => {
      const L = LModule.default;
      const map = mapInstanceRef.current;

      // Clear previous markers
      Object.values(markersRef.current).forEach((marker: any) => marker.remove());
      markersRef.current = {};

      // 1. Add Facility Markers (Hospitals)
      facilities.forEach((fac) => {
        const iconHtml = `
          <div style="background-color: #163A5F; color: white; border: 2px solid #FFFFFF; border-radius: 6px; padding: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h6M9 13h6M9 17h6"/></svg>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-facility-marker",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([fac.location.lat, fac.location.lng], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #172B3A; min-width: 200px;">
            <div style="font-weight: 700; color: #163A5F; font-size: 13px; margin-bottom: 2px;">${fac.name}</div>
            <div style="font-size: 11px; color: #5B6875; margin-bottom: 6px;">${fac.level.replace(/_/g, " ")} &bull; ${fac.verifiedIdentifier}</div>
            <div style="background: #F8FAFC; border: 1px solid #D9E0E7; padding: 6px; border-radius: 4px; margin-bottom: 6px;">
              <div>Labour Beds: <strong>${fac.readiness.labourBedsAvailable} / ${fac.readiness.labourBedsTotal}</strong></div>
              <div>SNCU Warmers: <strong>${fac.readiness.sncuWarmerAvailable} / ${fac.readiness.sncuWarmerTotal}</strong></div>
              <div>Blood Bank: <strong>${fac.readiness.bloodBankOperational ? "Operational" : "Linkage only"}</strong></div>
            </div>
            <div style="font-size: 11px; color: #1D4ED8;">Emergency: ${fac.emergencyHelpline}</div>
          </div>
        `);

        markersRef.current[`fac-${fac.id}`] = marker;
      });

      // 2. Add Ambulance Markers
      ambulances.forEach((amb) => {
        const isSelected = amb.id === selectedAmbulanceId;
        const isStale = amb.isGpsStale;
        const color = isStale
          ? "#DC2626"
          : amb.status === "AVAILABLE"
          ? "#18794E"
          : amb.status === "PATIENT_ONBOARD"
          ? "#D97706"
          : "#1D4ED8";

        const iconHtml = `
          <div style="background-color: ${color}; color: white; border: ${
          isSelected ? "3px solid #F59E0B" : "2px solid #FFFFFF"
        }; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.35); position: relative;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 17h4M19 17h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2-4H8L6 7H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
            ${
              isStale
                ? '<div style="position: absolute; top:-2px; right:-2px; width: 10px; height: 10px; background: #DC2626; border: 2px solid #FFF; border-radius: 50%;"></div>'
                : ""
            }
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-ambulance-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([amb.currentLocation.lat, amb.currentLocation.lng], {
          icon: customIcon,
        }).addTo(map);

        marker.on("click", () => {
          if (onSelectAmbulance) onSelectAmbulance(amb);
        });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #172B3A; min-width: 210px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 700; color: #163A5F; font-size: 13px;">${amb.registrationNumber}</span>
              <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #EFF6FF; color: #1D4ED8; font-weight: 600;">${amb.type}</span>
            </div>
            <div style="font-size: 11px; color: #5B6875; margin-bottom: 6px;">Status: <strong>${amb.status.replace(/_/g, " ")}</strong></div>
            <div style="font-size: 11px; margin-bottom: 4px;">Driver: ${amb.driverName} (${amb.driverPhone})</div>
            <div style="font-size: 11px; color: #5B6875; margin-bottom: 6px;">Location: ${amb.currentLocation.address}</div>
            ${
              amb.assignedReferralId
                ? `<div style="background: #FEF7EC; border: 1px solid #FCE1B6; padding: 4px 6px; border-radius: 4px; font-size: 11px; color: #A15C00; margin-bottom: 6px;">
                    Assigned: <strong>${amb.assignedReferralId}</strong>
                    ${amb.destinationFacilityName ? `<br>Dest: ${amb.destinationFacilityName}` : ""}
                  </div>`
                : `<div style="font-size: 11px; color: #18794E; font-weight: 600;">Available for immediate dispatch</div>`
            }
            ${
              isStale
                ? `<div style="font-size: 10px; color: #B42318; font-weight: 600;">Warning: Stale GPS (${amb.lastGpsUpdate.split("T")[1]?.slice(0, 5)})</div>`
                : ""
            }
          </div>
        `);

        markersRef.current[`amb-${amb.id}`] = marker;
      });

      // Fly to selected ambulance if provided
      if (selectedAmbulanceId && markersRef.current[`amb-${selectedAmbulanceId}`]) {
        const targetAmb = ambulances.find((a) => a.id === selectedAmbulanceId);
        if (targetAmb) {
          map.setView([targetAmb.currentLocation.lat, targetAmb.currentLocation.lng], 13, {
            animate: true,
          });
          markersRef.current[`amb-${selectedAmbulanceId}`].openPopup();
        }
      }
    });
  }, [mapReady, ambulances, facilities, selectedAmbulanceId, onSelectAmbulance]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-100 rounded-md border border-[#D9E0E7] overflow-hidden">
      {/* Map Header Status Overlay */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xs border border-[#D9E0E7] rounded px-3 py-1.5 shadow-sm text-xs flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[#163A5F]">
            108 Telematics Grid
          </span>
          <span className="text-[#5B6875]">({ambulances.length} Active Units)</span>
        </div>

        <div className="bg-white/95 backdrop-blur-xs border border-[#D9E0E7] rounded px-3 py-1.5 shadow-sm text-xs hidden sm:flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#18794E]" />
            <span className="text-[#5B6875]">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" />
            <span className="text-[#5B6875]">En Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
            <span className="text-[#5B6875]">Patient Onboard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
            <span className="text-[#5B6875]">Stale GPS</span>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
        <div className="bg-white/95 border border-[#D9E0E7] rounded px-2.5 py-1 text-[11px] text-[#5B6875] shadow-xs pointer-events-auto">
          OpenStreetMap &bull; Authorized Fleet GPS Only &bull; Non-Emergency Use Prohibited
        </div>
      </div>

      {/* Map Div */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px]" />

      {mapError && (
        <div className="absolute inset-0 z-30 bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-2">
            <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
            <p className="text-sm font-semibold text-[#163A5F]">
              Map Rendering Fallback
            </p>
            <p className="text-xs text-[#5B6875]">{mapError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
