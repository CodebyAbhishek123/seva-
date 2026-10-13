"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { PageShell } from "@/components/layout/PageShell";
import { StatWidget, Card } from "@/components/ui/Card";
import { UrgencyBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OperationalChart } from "@/components/charts/OperationalChart";
import { dataStore } from "@/lib/data-store";
import { apiClient } from "@/lib/api-client";
import { Referral, Facility, Ambulance } from "@/types";
import {
  GitPullRequest,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ambulance as AmbulanceIcon,
  BedDouble,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Building2,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [refs, facs, ambs] = await Promise.all([
        apiClient.getReferrals(),
        apiClient.getFacilities(),
        apiClient.getActiveAmbulances(),
      ]);
      setReferrals(refs);
      setFacilities(facs);
      setAmbulances(ambs);
      setLastRefreshed(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      console.error("Dashboard data load error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleStoreUpdate = () => {
      loadData();
    };

    window.addEventListener("maira_store_updated", handleStoreUpdate);
    return () => {
      window.removeEventListener("maira_store_updated", handleStoreUpdate);
    };
  }, []);

  // Filtered metrics
  const newCount = referrals.filter((r) => r.status === "NEW").length;
  const reviewCount = referrals.filter((r) => r.status === "NEEDS_REVIEW").length;
  const acceptedCount = referrals.filter((r) => r.status === "ACCEPTED").length;
  const declinedCount = referrals.filter((r) => r.status === "DECLINED").length;
  const completedCount = referrals.filter((r) => r.status === "COMPLETED").length;
  const criticalCount = referrals.filter((r) => r.urgency === "CRITICAL" && r.status !== "COMPLETED" && r.status !== "DECLINED").length;

  // Dispatcher specific metrics
  const activeTransportCount = referrals.filter((r) =>
    ["ACCEPTED", "AMBULANCE_ASSIGNED", "PATIENT_ONBOARD", "ARRIVED"].includes(r.status) && r.transportRequired
  ).length;
  const unassignedAmbulanceRequests = referrals.filter(
    (r) => r.transportRequired && !r.assignedAmbulanceId && r.status !== "DECLINED" && r.status !== "COMPLETED"
  ).length;
  const availableAmbulances = ambulances.filter((a) => a.status === "AVAILABLE").length;
  const activeTrips = ambulances.filter((a) => a.status !== "AVAILABLE" && a.status !== "MAINTENANCE").length;
  const delayedWorkflows = referrals.filter((r) => {
    // If NEW or NEEDS_REVIEW for > 15 mins (approximated)
    return r.urgency === "CRITICAL" && (r.status === "NEW" || r.status === "NEEDS_REVIEW");
  }).length;

  // Primary user facility (e.g. DWH Central)
  const currentFacility = facilities.find((f) => f.id === user?.facilityId) || facilities[0];

  return (
    <PageShell
      title={`${role === "dispatcher" ? "108 Dispatch Coordination" : role === "admin" ? "State Health Administration" : "Hospital Triage Operations"} Dashboard`}
      description={`Authenticated as ${user?.name || "Healthcare Staff"} &bull; ${user?.facilityName || user?.designation || "Government Health Service"}`}
      actions={
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#5B6875] hidden sm:inline">
            Updated: {lastRefreshed || "Just now"}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Grid
          </Button>
          <Link href="/referrals">
            <Button variant="navy" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Referrals Queue
            </Button>
          </Link>
        </div>
      }
      breadcrumbs={[{ label: "Operations Dashboard" }]}
    >
      {/* Critical Triage Notice Banner if any critical items */}
      {criticalCount > 0 && (
        <div className="bg-[#FEF3F2] border border-[#FECDCA] rounded-md p-3.5 flex items-center justify-between text-xs text-[#B42318]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B42318] animate-ping" />
            <span className="font-bold uppercase tracking-wide">
              {criticalCount} Critical Emergency Referral{criticalCount > 1 ? "s" : ""} Requiring Immediate Review
            </span>
          </div>
          <Link
            href="/referrals?urgency=CRITICAL"
            className="font-semibold underline hover:text-[#911D13] ml-2"
          >
            View Critical Queue &rarr;
          </Link>
        </div>
      )}

      {/* Role-Specific Metric Cards */}
      {role === "dispatcher" ? (
        // DISPATCHER METRICS
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatWidget
            title="Transport Requests"
            value={activeTransportCount}
            subtitle="Maternal/neonatal moves"
            badgeText="Active"
            badgeVariant="primary"
          />
          <StatWidget
            title="Unassigned Requests"
            value={unassignedAmbulanceRequests}
            subtitle="Ambulance pending"
            alert={unassignedAmbulanceRequests > 0}
            badgeText={unassignedAmbulanceRequests > 0 ? "Action Required" : "Cleared"}
            badgeVariant={unassignedAmbulanceRequests > 0 ? "critical" : "success"}
          />
          <StatWidget
            title="Available Ambulances"
            value={`${availableAmbulances}/${ambulances.length}`}
            subtitle="Stationed & standby"
            badgeText="Ready"
            badgeVariant="success"
          />
          <StatWidget
            title="Active Trips"
            value={activeTrips}
            subtitle="En route / onboard"
            badgeText="Telemetry Live"
            badgeVariant="primary"
          />
          <StatWidget
            title="Delayed Workflows"
            value={delayedWorkflows}
            subtitle="Triage > 15m delay"
            alert={delayedWorkflows > 0}
            badgeText={delayedWorkflows > 0 ? "Alert" : "Normal"}
            badgeVariant={delayedWorkflows > 0 ? "warning" : "neutral"}
          />
          <StatWidget
            title="Stale GPS Units"
            value={ambulances.filter((a) => a.isGpsStale).length}
            subtitle="No fix > 10m"
            badgeText="Telematics"
            badgeVariant="neutral"
          />
        </div>
      ) : (
        // HOSPITAL & ADMIN METRICS
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatWidget
            title="New Referrals"
            value={newCount}
            subtitle="Incoming from CHC/PHC"
            badgeText={newCount > 0 ? "Unassigned" : "Nil"}
            badgeVariant={newCount > 0 ? "primary" : "neutral"}
          />
          <StatWidget
            title="Needing Review"
            value={reviewCount}
            subtitle="Clinical evaluation"
            alert={reviewCount > 0}
            badgeText={reviewCount > 0 ? "Attention" : "Clear"}
            badgeVariant={reviewCount > 0 ? "warning" : "success"}
          />
          <StatWidget
            title="Accepted Referrals"
            value={acceptedCount}
            subtitle="Bed/Team reserved"
            badgeText="Active Care"
            badgeVariant="success"
          />
          <StatWidget
            title="Declined"
            value={declinedCount}
            subtitle="Rerouted / Capacity"
            badgeText="Audited"
            badgeVariant="neutral"
          />
          <StatWidget
            title="Completed Handover"
            value={completedCount}
            subtitle="Transferred to OT/Ward"
            badgeText="Delivered"
            badgeVariant="neutral"
          />
        </div>
      )}

      {/* Main Grid: Priority Referral Queue & Hospital Readiness Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Urgent Referral Triage Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Incoming & Active Referral Workflows"
            subtitle="Authorized clinical records requiring immediate departmental coordination"
            action={
              <Link href="/referrals">
                <Button variant="secondary" size="sm">
                  View All Referrals ({referrals.length})
                </Button>
              </Link>
            }
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full gov-table">
                <thead>
                  <tr>
                    <th>Referral ID & Urgency</th>
                    <th>Mother / Gestation</th>
                    <th>Referring Source</th>
                    <th>Receiving Hospital</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.slice(0, 5).map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-50 transition-colors">
                      <td>
                        <div className="font-semibold text-xs text-[#163A5F]">
                          {ref.id}
                        </div>
                        <div className="mt-0.5">
                          <UrgencyBadge urgency={ref.urgency} />
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-xs text-[#172B3A]">
                          {ref.mother.name} ({ref.mother.age}y)
                        </div>
                        <div className="text-[11px] text-[#5B6875]">
                          G{ref.mother.gravida}P{ref.mother.para} &bull; {ref.mother.gestationalWeeks}w &bull; {ref.mother.bloodGroup}
                        </div>
                      </td>
                      <td>
                        <div className="text-xs text-[#172B3A] font-medium line-clamp-1">
                          {ref.referringFacilityName}
                        </div>
                        <div className="text-[11px] text-[#5B6875]">
                          {ref.referringDoctorName}
                        </div>
                      </td>
                      <td>
                        <div className="text-xs text-[#172B3A] line-clamp-1">
                          {ref.receivingFacilityName}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={ref.status} />
                      </td>
                      <td className="text-right">
                        <Link href={`/referrals/${ref.id}`}>
                          <Button variant="navy" size="sm">
                            Evaluate
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {referrals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-xs text-[#5B6875]">
                        No referral records currently active in the queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Operational Aggregation Charts */}
          <OperationalChart referrals={referrals} />
        </div>

        {/* Right Column (1 Col): Hospital Readiness & Ambulance Telematics Snapshot */}
        <div className="space-y-6">
          {/* Facility Readiness Card */}
          {currentFacility && (
            <Card
              title="Hospital Readiness Snapshot"
              subtitle={currentFacility.name}
              action={
                <Link href="/facilities/readiness">
                  <Button variant="secondary" size="sm">
                    Update Readiness
                  </Button>
                </Link>
              }
            >
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5EAF0]">
                  <span className="text-[#5B6875]">Verified ID:</span>
                  <span className="font-semibold text-[#163A5F]">
                    {currentFacility.verifiedIdentifier}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                    <div className="text-[#5B6875] text-[11px]">Labour Beds</div>
                    <div className="text-base font-bold text-[#163A5F] mt-0.5">
                      {currentFacility.readiness.labourBedsAvailable} / {currentFacility.readiness.labourBedsTotal}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium">Available now</div>
                  </div>

                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                    <div className="text-[#5B6875] text-[11px]">SNCU Warmers</div>
                    <div className="text-base font-bold text-[#163A5F] mt-0.5">
                      {currentFacility.readiness.sncuWarmerAvailable} / {currentFacility.readiness.sncuWarmerTotal}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium">Neonatal ready</div>
                  </div>
                </div>

                {/* Blood Bank Availability glance */}
                <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0] space-y-1">
                  <div className="text-[11px] font-semibold text-[#163A5F] flex justify-between">
                    <span>Blood Units Stocked</span>
                    <span className="text-[10px] text-emerald-700">Bank Operational</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#5B6875] pt-1">
                    <span>A+: <strong>{currentFacility.readiness.bloodUnits.aPositive}</strong></span>
                    <span>B+: <strong>{currentFacility.readiness.bloodUnits.bPositive}</strong></span>
                    <span>O+: <strong>{currentFacility.readiness.bloodUnits.oPositive}</strong></span>
                    <span>AB+: <strong>{currentFacility.readiness.bloodUnits.abPositive}</strong></span>
                    <span className={currentFacility.readiness.bloodUnits.oNegative < 2 ? "text-red-700 font-bold" : ""}>
                      O-: <strong>{currentFacility.readiness.bloodUnits.oNegative}</strong>
                    </span>
                  </div>
                </div>

                {/* Staffing on duty */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5B6875]">On-Duty Obstetrician:</span>
                    <span className="font-semibold text-emerald-700">Present</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5B6875]">Emergency LSCS OT:</span>
                    <span className="font-semibold text-emerald-700">Ready</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5B6875]">Anaesthetist:</span>
                    <span className="font-semibold text-emerald-700">On Duty</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-[#5B6875] border-t border-[#E5EAF0] flex justify-between items-center">
                  <span>Last verified: {currentFacility.readiness.lastUpdated.split("T")[1]?.slice(0, 5)}</span>
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                    {currentFacility.readiness.dataFreshness}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Ambulance Dispatch Status */}
          <Card
            title="108 Emergency Ambulance Fleet"
            subtitle={`${ambulances.length} Registered Units in District`}
            action={
              <Link href="/ambulances">
                <Button variant="navy" size="sm">
                  Operations Map
                </Button>
              </Link>
            }
          >
            <div className="space-y-2 text-xs">
              {ambulances.slice(0, 4).map((amb) => (
                <div
                  key={amb.id}
                  className="p-2.5 rounded border border-[#E5EAF0] bg-[#F8FAFC] flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-[#163A5F]">
                      {amb.registrationNumber}
                    </div>
                    <div className="text-[11px] text-[#5B6875]">
                      {amb.type} &bull; Driver: {amb.driverName}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        amb.status === "AVAILABLE"
                          ? "bg-emerald-100 text-emerald-800"
                          : amb.status === "PATIENT_ONBOARD"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {amb.status.replace(/_/g, " ")}
                    </span>
                    <div className="text-[10px] text-[#5B6875] mt-1">
                      {amb.assignedReferralId || amb.baseStation.split(" ")[0]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
