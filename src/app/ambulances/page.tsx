"use client";

import React, { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { AmbulanceMap } from "@/components/maps/AmbulanceMap";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Ambulance, Facility, Referral, TripStage } from "@/types";
import {
  Ambulance as AmbulanceIcon,
  Search,
  Filter,
  RefreshCw,
  Phone,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Navigation,
  Send,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function AmbulanceOperationsPage() {
  const { user, role } = useAuth();
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Dispatch modal
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedReferralId, setSelectedReferralId] = useState("");
  const [dispatchTargetAmbulance, setDispatchTargetAmbulance] = useState<Ambulance | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  // Trip stage update modal
  const [showStageModal, setShowStageModal] = useState(false);
  const [targetTripStage, setTargetTripStage] = useState<TripStage>("PATIENT_ONBOARD");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ambs, facs, refs] = await Promise.all([
        apiClient.getActiveAmbulances(),
        apiClient.getFacilities(),
        apiClient.getReferrals(),
      ]);
      setAmbulances(ambs);
      setFacilities(facs);
      setReferrals(refs);
      if (ambs.length > 0 && !selectedAmbulance) {
        setSelectedAmbulance(ambs[0]);
      }
    } catch (err) {
      console.error("Error loading ambulance fleet", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener("maira_store_updated", handleUpdate);
    return () => window.removeEventListener("maira_store_updated", handleUpdate);
  }, []);

  const eligibleReferrals = referrals.filter(
    (r) => r.transportRequired && !r.assignedAmbulanceId && r.status !== "DECLINED" && r.status !== "COMPLETED"
  );

  const filteredAmbulances = ambulances.filter((a) => {
    if (statusFilter === "AVAILABLE" && a.status !== "AVAILABLE") return false;
    if (statusFilter === "ACTIVE_TRIP" && (a.status === "AVAILABLE" || a.status === "MAINTENANCE")) return false;
    if (statusFilter === "STALE_GPS" && !a.isGpsStale) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        a.registrationNumber.toLowerCase().includes(q) ||
        a.driverName.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        (a.assignedReferralId && a.assignedReferralId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenDispatch = (amb: Ambulance) => {
    setDispatchTargetAmbulance(amb);
    if (eligibleReferrals.length > 0) {
      setSelectedReferralId(eligibleReferrals[0].id);
    }
    setShowDispatchModal(true);
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchTargetAmbulance || !selectedReferralId || !user) return;
    setIsDispatching(true);
    await apiClient.assignAmbulance(
      selectedReferralId,
      dispatchTargetAmbulance.id,
      user.name,
      user.id
    );
    setIsDispatching(false);
    setShowDispatchModal(false);
  };

  const handleUpdateTripStage = async () => {
    if (!selectedAmbulance || !user) return;
    setIsDispatching(true);
    await apiClient.updateTripEvent(selectedAmbulance.id, targetTripStage);
    setIsDispatching(false);
    setShowStageModal(false);
  };

  return (
    <PageShell
      title="Ambulance Operations & Dispatch Fleet"
      description="108 Emergency Medical Services telematics grid & maternal emergency dispatch coordination"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Telemetry
          </Button>
        </div>
      }
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Ambulance Operations" },
      ]}
    >
      {/* Notice Banner */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-md p-3 text-xs text-[#163A5F] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#1D4ED8] shrink-0" />
          <span>
            Telemetry Grid: <strong>{ambulances.length} Registered 108 Units</strong> &bull;{" "}
            <strong>{ambulances.filter((a) => a.status === "AVAILABLE").length} Standby</strong> &bull;{" "}
            <strong>{ambulances.filter((a) => a.isGpsStale).length} Stale Telemetry</strong>
          </span>
        </div>
        <div className="text-[11px] text-[#5B6875]">
          Static Demonstration GPS Data &bull; Non-Production Mode
        </div>
      </div>

      {/* Main Operations Split Layout: Map on top/main, Fleet sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side (1 Col): Vehicle List & Quick Filters */}
        <div className="space-y-4">
          <div className="bg-white border border-[#D9E0E7] rounded-md p-3 space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#5B6875] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search registration, driver..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                  statusFilter === "ALL" ? "bg-[#163A5F] text-white" : "bg-[#F1F4F8] text-[#5B6875]"
                }`}
              >
                All ({ambulances.length})
              </button>
              <button
                onClick={() => setStatusFilter("AVAILABLE")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                  statusFilter === "AVAILABLE" ? "bg-[#18794E] text-white" : "bg-[#F1F4F8] text-[#5B6875]"
                }`}
              >
                Available ({ambulances.filter((a) => a.status === "AVAILABLE").length})
              </button>
              <button
                onClick={() => setStatusFilter("ACTIVE_TRIP")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                  statusFilter === "ACTIVE_TRIP" ? "bg-[#1D4ED8] text-white" : "bg-[#F1F4F8] text-[#5B6875]"
                }`}
              >
                In Transit ({ambulances.filter((a) => a.status !== "AVAILABLE" && a.status !== "MAINTENANCE").length})
              </button>
              <button
                onClick={() => setStatusFilter("STALE_GPS")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                  statusFilter === "STALE_GPS" ? "bg-[#B42318] text-white" : "bg-[#F1F4F8] text-[#5B6875]"
                }`}
              >
                Stale ({ambulances.filter((a) => a.isGpsStale).length})
              </button>
            </div>
          </div>

          {/* Ambulance Cards List */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredAmbulances.map((amb) => {
              const isSelected = selectedAmbulance?.id === amb.id;

              return (
                <div
                  key={amb.id}
                  onClick={() => setSelectedAmbulance(amb)}
                  className={`p-3 rounded-md border cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#1D4ED8] bg-blue-50/50 shadow-xs"
                      : "border-[#D9E0E7] bg-white hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#163A5F]">
                          {amb.registrationNumber}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-blue-100 text-[#1D4ED8]">
                          {amb.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#5B6875] mt-0.5">
                        Base: {amb.baseStation}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        amb.isGpsStale
                          ? "bg-red-100 text-red-800"
                          : amb.status === "AVAILABLE"
                          ? "bg-emerald-100 text-emerald-800"
                          : amb.status === "PATIENT_ONBOARD"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {amb.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="text-xs text-[#172B3A] mt-2 pt-2 border-t border-[#E5EAF0] space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#5B6875]">Driver:</span>
                      <span>{amb.driverName} ({amb.driverPhone})</span>
                    </div>

                    {amb.assignedReferralId && (
                      <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-[11px] flex items-center justify-between text-amber-900">
                        <span>Assigned Case:</span>
                        <Link
                          href={`/referrals/${amb.assignedReferralId}`}
                          className="font-bold underline hover:text-amber-950"
                        >
                          {amb.assignedReferralId} &rarr;
                        </Link>
                      </div>
                    )}

                    <div className="text-[10px] text-[#5B6875] flex items-center justify-between pt-1">
                      <span>GPS: {amb.currentLocation.address}</span>
                      <span className={amb.isGpsStale ? "text-red-700 font-bold" : ""}>
                        {amb.lastGpsUpdate.split("T")[1]?.slice(0, 5)} hrs
                      </span>
                    </div>
                  </div>

                  {/* Dispatcher Actions */}
                  {amb.status === "AVAILABLE" && (
                    <div className="mt-2 pt-2 border-t border-[#E5EAF0]">
                      <Button
                        variant="navy"
                        size="sm"
                        className="w-full text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDispatch(amb);
                        }}
                      >
                        Dispatch on Referral
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side (2 Cols): Interactive Map & Selected Unit Telematics Dossier */}
        <div className="lg:col-span-2 space-y-4">
          {/* Map */}
          <div className="h-[480px]">
            <AmbulanceMap
              ambulances={ambulances}
              facilities={facilities}
              selectedAmbulanceId={selectedAmbulance?.id}
              onSelectAmbulance={(amb) => setSelectedAmbulance(amb)}
            />
          </div>

          {/* Selected Vehicle Dossier Bar */}
          {selectedAmbulance && (
            <Card
              title={`Vehicle Dossier: ${selectedAmbulance.registrationNumber} (${selectedAmbulance.type})`}
              subtitle={`Driver: ${selectedAmbulance.driverName} &bull; Base Station: ${selectedAmbulance.baseStation}`}
              action={
                <div className="flex items-center gap-2">
                  {selectedAmbulance.status !== "AVAILABLE" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowStageModal(true)}
                    >
                      Update Trip Stage
                    </Button>
                  )}
                  {selectedAmbulance.assignedReferralId && (
                    <Link href={`/referrals/${selectedAmbulance.assignedReferralId}`}>
                      <Button variant="navy" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                        Open Case Dossier
                      </Button>
                    </Link>
                  )}
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0] space-y-1">
                  <div className="text-[11px] text-[#5B6875]">Assigned Destination:</div>
                  <div className="font-semibold text-[#163A5F]">
                    {selectedAmbulance.destinationFacilityName || "None (At Base Standby)"}
                  </div>
                  <div className="text-[10px] text-[#5B6875]">
                    Paramedic: {selectedAmbulance.paramedicName}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0] space-y-1">
                  <div className="text-[11px] text-[#5B6875]">Medical Equipment:</div>
                  <div className="text-[11px] text-[#172B3A] space-y-0.5">
                    <div>Oxygen: {selectedAmbulance.equipment.oxygenCylinder ? "✓ Verified" : "✗ Missing"}</div>
                    <div>Transport Ventilator: {selectedAmbulance.equipment.transportVentilator ? "✓ Equipped" : "✗ N/A"}</div>
                    <div>Infant Incubator: {selectedAmbulance.equipment.infantIncubator ? "✓ Equipped" : "✗ N/A"}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0] space-y-1">
                  <div className="text-[11px] text-[#5B6875]">Telematics Freshness:</div>
                  <div className="font-semibold text-[#163A5F]">
                    {selectedAmbulance.isGpsStale ? "Stale (> 10m without fix)" : "Real-time Telemetry"}
                  </div>
                  <div className="text-[10px] text-[#5B6875]">
                    Last Ping: {new Date(selectedAmbulance.lastGpsUpdate).toLocaleTimeString("en-IN")}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Dispatch Modal */}
      {dispatchTargetAmbulance && (
        <Modal
          isOpen={showDispatchModal}
          onClose={() => setShowDispatchModal(false)}
          title={`Dispatch Ambulance ${dispatchTargetAmbulance.registrationNumber}`}
          description={`Vehicle Type: ${dispatchTargetAmbulance.type} &bull; Driver: ${dispatchTargetAmbulance.driverName}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDispatchModal(false)} disabled={isDispatching}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDispatch}
                isLoading={isDispatching}
                disabled={eligibleReferrals.length === 0}
              >
                Confirm Dispatch
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            {eligibleReferrals.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded">
                No referrals are currently awaiting ambulance dispatch.
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  Select Unassigned Emergency Referral:
                </label>
                <select
                  value={selectedReferralId}
                  onChange={(e) => setSelectedReferralId(e.target.value)}
                  className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-[#172B3A] text-xs"
                >
                  {eligibleReferrals.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} &bull; {r.mother.name} ({r.urgency}) &bull; From: {r.referringFacilityName} &rarr; To: {r.receivingFacilityName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Trip Stage Update Modal */}
      {selectedAmbulance && (
        <Modal
          isOpen={showStageModal}
          onClose={() => setShowStageModal(false)}
          title={`Update Trip Stage: ${selectedAmbulance.registrationNumber}`}
          description="Driver-reported trip progression status"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowStageModal(false)} disabled={isDispatching}>
                Cancel
              </Button>
              <Button variant="navy" onClick={handleUpdateTripStage} isLoading={isDispatching}>
                Update Stage
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#172B3A] mb-1">Select Stage:</label>
              <select
                value={targetTripStage}
                onChange={(e) => setTargetTripStage(e.target.value as TripStage)}
                className="w-full p-2 border border-[#D9E0E7] rounded bg-white"
              >
                <option value="EN_ROUTE_PICKUP">En Route to Pickup</option>
                <option value="PATIENT_ONBOARD">Patient Onboard</option>
                <option value="EN_ROUTE_HOSPITAL">En Route to Hospital</option>
                <option value="ARRIVED">Arrived at Receiving Facility</option>
                <option value="HANDOVER_COMPLETED">Clinical Handover Completed</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}
