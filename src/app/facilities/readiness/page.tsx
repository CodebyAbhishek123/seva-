"use client";

import React, { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, StatWidget } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Facility, FacilityReadiness } from "@/types";
import {
  BedDouble,
  Baby,
  Droplet,
  Clock,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Building2,
  Filter,
} from "lucide-react";

export default function FacilityReadinessPage() {
  const { user, role } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form edit fields
  const [labourBeds, setLabourBeds] = useState(0);
  const [sncuWarmers, setSncuWarmers] = useState(0);
  const [nicuBeds, setNicuBeds] = useState(0);
  const [bloodUnitsA, setBloodUnitsA] = useState(0);
  const [bloodUnitsB, setBloodUnitsB] = useState(0);
  const [bloodUnitsO, setBloodUnitsO] = useState(0);
  const [bloodUnitsAB, setBloodUnitsAB] = useState(0);
  const [bloodUnitsONeg, setBloodUnitsONeg] = useState(0);
  const [otReady, setOtReady] = useState(true);

  const loadFacilities = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getFacilities();
      setFacilities(data);
    } catch (err) {
      console.error("Error loading facilities", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
    const handleUpdate = () => {
      loadFacilities();
    };
    window.addEventListener("maira_store_updated", handleUpdate);
    return () => window.removeEventListener("maira_store_updated", handleUpdate);
  }, []);

  const openUpdateModal = (fac: Facility) => {
    setSelectedFacility(fac);
    setLabourBeds(fac.readiness.labourBedsAvailable);
    setSncuWarmers(fac.readiness.sncuWarmerAvailable);
    setNicuBeds(fac.readiness.nicuBedsAvailable);
    setBloodUnitsA(fac.readiness.bloodUnits.aPositive);
    setBloodUnitsB(fac.readiness.bloodUnits.bPositive);
    setBloodUnitsO(fac.readiness.bloodUnits.oPositive);
    setBloodUnitsAB(fac.readiness.bloodUnits.abPositive);
    setBloodUnitsONeg(fac.readiness.bloodUnits.oNegative);
    setOtReady(fac.readiness.emergencyOtReady);
    setShowEditModal(true);
  };

  const handleSaveReadiness = async () => {
    if (!selectedFacility || !user) return;
    setIsUpdating(true);

    const update: Partial<FacilityReadiness> = {
      labourBedsAvailable: Number(labourBeds),
      sncuWarmerAvailable: Number(sncuWarmers),
      nicuBedsAvailable: Number(nicuBeds),
      bloodUnits: {
        aPositive: Number(bloodUnitsA),
        bPositive: Number(bloodUnitsB),
        oPositive: Number(bloodUnitsO),
        abPositive: Number(bloodUnitsAB),
        oNegative: Number(bloodUnitsONeg),
      },
      emergencyOtReady: otReady,
      dataFreshness: "FRESH",
    };

    await apiClient.updateFacilityReadiness(
      selectedFacility.id,
      update,
      user.name,
      user.id
    );

    setIsUpdating(false);
    setShowEditModal(false);
  };

  // Aggregated totals
  const totalLabourBedsAvailable = facilities.reduce((sum, f) => sum + f.readiness.labourBedsAvailable, 0);
  const totalLabourBeds = facilities.reduce((sum, f) => sum + f.readiness.labourBedsTotal, 0);
  const totalSncuWarmers = facilities.reduce((sum, f) => sum + f.readiness.sncuWarmerAvailable, 0);
  const totalNicuBeds = facilities.reduce((sum, f) => sum + f.readiness.nicuBedsAvailable, 0);
  const staleCount = facilities.filter((f) => f.readiness.dataFreshness === "STALE").length;

  return (
    <PageShell
      title="Hospital Readiness & Resource Telemetry"
      description="Live verified capacity for labour beds, SNCU/NICU warmers, and critical blood stocks across district healthcare network"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadFacilities}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Telemetry
          </Button>
        </div>
      }
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Hospital Readiness" },
      ]}
    >
      {/* Notice on honest data freshness */}
      <div className="bg-slate-50 border border-[#D9E0E7] rounded-md p-3 text-xs text-[#5B6875] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#163A5F] shrink-0" />
          <span>
            Readiness data is verified strictly via periodic nodal officer telemetry updates. Facilities marked with{" "}
            <strong className="text-amber-800">EXPIRING SOON</strong> or{" "}
            <strong className="text-red-800">STALE</strong> require verification before dispatch.
          </span>
        </div>
        {staleCount > 0 && (
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
            {staleCount} Stale Verification{staleCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Aggregate District Capacity Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatWidget
          title="Labour & Delivery Beds"
          value={`${totalLabourBedsAvailable} / ${totalLabourBeds}`}
          subtitle="District available capacity"
          badgeText="Verified Beds"
          badgeVariant="success"
        />
        <StatWidget
          title="SNCU Warmers Ready"
          value={totalSncuWarmers}
          subtitle="Special Newborn Care Units"
          badgeText="Neonatal"
          badgeVariant="primary"
        />
        <StatWidget
          title="Level-3 NICU Incubators"
          value={totalNicuBeds}
          subtitle="Tertiary medical college"
          badgeText="High Dependency"
          badgeVariant="primary"
        />
        <StatWidget
          title="Blood Banks Active"
          value={`${facilities.filter((f) => f.readiness.bloodBankOperational).length}/${facilities.length}`}
          subtitle="Stocked blood centers"
          badgeText="Licensed"
          badgeVariant="neutral"
        />
      </div>

      {/* Verified Facility Readiness Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full gov-table">
            <thead>
              <tr>
                <th>Verified Facility</th>
                <th>Tier & District</th>
                <th>Labour Beds</th>
                <th>SNCU Warmers</th>
                <th>NICU Beds</th>
                <th>Tracked Blood Units</th>
                <th>Surgical OT</th>
                <th>Data Freshness</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((fac) => {
                const isMyFacility = user?.facilityId === fac.id;
                const canEdit = (role === "hospital" && isMyFacility) || role === "admin";

                return (
                  <tr key={fac.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td>
                      <div className="font-bold text-xs text-[#163A5F]">
                        {fac.name}
                      </div>
                      <div className="text-[11px] text-[#5B6875] mt-0.5 font-mono">
                        {fac.verifiedIdentifier}
                      </div>
                      {isMyFacility && (
                        <span className="inline-block mt-1 text-[10px] bg-blue-100 text-[#1D4ED8] font-bold px-1.5 py-0.2 rounded">
                          Your Assigned Facility
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="text-xs font-medium text-[#172B3A]">
                        {fac.level.replace(/_/g, " ")}
                      </div>
                      <div className="text-[11px] text-[#5B6875]">
                        {fac.district}
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold ${
                            fac.readiness.labourBedsAvailable === 0
                              ? "text-[#B42318]"
                              : fac.readiness.labourBedsAvailable < 3
                              ? "text-amber-700"
                              : "text-[#18794E]"
                          }`}
                        >
                          {fac.readiness.labourBedsAvailable} / {fac.readiness.labourBedsTotal}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#5B6875]">
                        {fac.readiness.labourBedsAvailable === 0 ? "Unavailable" : "Beds free"}
                      </div>
                    </td>

                    <td>
                      <div className="text-xs font-bold text-[#163A5F]">
                        {fac.readiness.sncuWarmerAvailable} / {fac.readiness.sncuWarmerTotal}
                      </div>
                      <div className="text-[10px] text-[#5B6875]">
                        {fac.hasSNCU ? "Operational" : "No SNCU"}
                      </div>
                    </td>

                    <td>
                      <div className="text-xs font-bold text-[#163A5F]">
                        {fac.readiness.nicuBedsAvailable}
                      </div>
                      <div className="text-[10px] text-[#5B6875]">
                        {fac.hasNICU ? "NICU Unit" : "N/A"}
                      </div>
                    </td>

                    <td>
                      {fac.readiness.bloodBankOperational ? (
                        <div className="text-[11px] space-y-0.5">
                          <div>
                            A+: <strong>{fac.readiness.bloodUnits.aPositive}</strong> &bull; B+: <strong>{fac.readiness.bloodUnits.bPositive}</strong>
                          </div>
                          <div>
                            O+: <strong>{fac.readiness.bloodUnits.oPositive}</strong> &bull; AB+: <strong>{fac.readiness.bloodUnits.abPositive}</strong>
                          </div>
                          <div className={fac.readiness.bloodUnits.oNegative < 2 ? "text-[#B42318] font-bold" : ""}>
                            O- (Rare): <strong>{fac.readiness.bloodUnits.oNegative} units</strong>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#5B6875] italic">
                          Linked to District Blood Bank
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          fac.readiness.emergencyOtReady
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {fac.readiness.emergencyOtReady ? "LSCS OT Ready" : "OT Standby"}
                      </span>
                    </td>

                    <td>
                      <div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            fac.readiness.dataFreshness === "FRESH"
                              ? "bg-emerald-100 text-emerald-800"
                              : fac.readiness.dataFreshness === "EXPIRING_SOON"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {fac.readiness.dataFreshness.replace(/_/g, " ")}
                        </span>
                        <div className="text-[10px] text-[#5B6875] mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {fac.readiness.lastUpdated.split("T")[1]?.slice(0, 5)} hrs
                        </div>
                      </div>
                    </td>

                    <td className="text-right">
                      {canEdit ? (
                        <Button
                          variant="navy"
                          size="sm"
                          leftIcon={<Edit3 className="w-3 h-3" />}
                          onClick={() => openUpdateModal(fac)}
                        >
                          Update
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openUpdateModal(fac)}
                        >
                          View
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Readiness Modal */}
      {selectedFacility && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Update Capacity Telemetry: ${selectedFacility.name}`}
          description={`Verified ID: ${selectedFacility.verifiedIdentifier} &bull; Recorded by ${user?.name}`}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveReadiness}
                isLoading={isUpdating}
              >
                Save & Broadcast Readiness
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
                  Labour Beds Available:
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedFacility.readiness.labourBedsTotal}
                  value={labourBeds}
                  onChange={(e) => setLabourBeds(Number(e.target.value))}
                  className="w-full p-2 border border-[#D9E0E7] rounded bg-white font-semibold text-[#163A5F]"
                />
                <span className="text-[10px] text-[#5B6875]">Total: {selectedFacility.readiness.labourBedsTotal}</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
                  SNCU Warmers Available:
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedFacility.readiness.sncuWarmerTotal}
                  value={sncuWarmers}
                  onChange={(e) => setSncuWarmers(Number(e.target.value))}
                  className="w-full p-2 border border-[#D9E0E7] rounded bg-white font-semibold text-[#163A5F]"
                />
                <span className="text-[10px] text-[#5B6875]">Total: {selectedFacility.readiness.sncuWarmerTotal}</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
                  NICU Incubators:
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedFacility.readiness.nicuBedsTotal}
                  value={nicuBeds}
                  onChange={(e) => setNicuBeds(Number(e.target.value))}
                  className="w-full p-2 border border-[#D9E0E7] rounded bg-white font-semibold text-[#163A5F]"
                />
                <span className="text-[10px] text-[#5B6875]">Total: {selectedFacility.readiness.nicuBedsTotal}</span>
              </div>
            </div>

            {/* Blood Bank stock fields if blood bank operational */}
            <div className="p-3 bg-[#F8FAFC] border border-[#E5EAF0] rounded space-y-2">
              <span className="font-semibold text-[#163A5F] block">Blood Units Stocked on Site (PRBC Units):</span>
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <label className="block text-[10px] text-[#5B6875]">A+</label>
                  <input
                    type="number"
                    min="0"
                    value={bloodUnitsA}
                    onChange={(e) => setBloodUnitsA(Number(e.target.value))}
                    className="w-full p-1.5 border border-[#D9E0E7] rounded text-center font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#5B6875]">B+</label>
                  <input
                    type="number"
                    min="0"
                    value={bloodUnitsB}
                    onChange={(e) => setBloodUnitsB(Number(e.target.value))}
                    className="w-full p-1.5 border border-[#D9E0E7] rounded text-center font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#5B6875]">O+</label>
                  <input
                    type="number"
                    min="0"
                    value={bloodUnitsO}
                    onChange={(e) => setBloodUnitsO(Number(e.target.value))}
                    className="w-full p-1.5 border border-[#D9E0E7] rounded text-center font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#5B6875]">AB+</label>
                  <input
                    type="number"
                    min="0"
                    value={bloodUnitsAB}
                    onChange={(e) => setBloodUnitsAB(Number(e.target.value))}
                    className="w-full p-1.5 border border-[#D9E0E7] rounded text-center font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#B42318] font-bold">O- (Rh-)</label>
                  <input
                    type="number"
                    min="0"
                    value={bloodUnitsONeg}
                    onChange={(e) => setBloodUnitsONeg(Number(e.target.value))}
                    className="w-full p-1.5 border border-red-300 rounded text-center font-bold text-red-700 bg-red-50/50"
                  />
                </div>
              </div>
            </div>

            {/* OT status check */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="otReadyCheck"
                checked={otReady}
                onChange={(e) => setOtReady(e.target.checked)}
                className="rounded border-[#D9E0E7] text-[#1D4ED8]"
              />
              <label htmlFor="otReadyCheck" className="text-xs font-medium text-[#172B3A] cursor-pointer">
                Emergency Obstetric Operation Theatre (LSCS OT) is staffed and sterile
              </label>
            </div>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}
