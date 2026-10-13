"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { UrgencyBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiClient } from "@/lib/api-client";
import { Referral, ReferralStatus, UrgencyLevel } from "@/types";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowRight,
  Clock,
  Building2,
  Ambulance,
  AlertCircle,
  Baby,
  User,
} from "lucide-react";

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const loadReferrals = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getReferrals();
      setReferrals(data);
    } catch (err) {
      console.error("Failed to load referrals", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();

    const handleUpdate = () => {
      loadReferrals();
    };
    window.addEventListener("maira_store_updated", handleUpdate);
    return () => window.removeEventListener("maira_store_updated", handleUpdate);
  }, []);

  // Filter effect
  useEffect(() => {
    let result = [...referrals];

    if (statusFilter !== "ALL") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (urgencyFilter !== "ALL") {
      result = result.filter((r) => r.urgency === urgencyFilter);
    }

    if (typeFilter !== "ALL") {
      result = result.filter((r) => r.referralType === typeFilter);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(query) ||
          r.mother.name.toLowerCase().includes(query) ||
          r.mother.rchId.toLowerCase().includes(query) ||
          r.referringFacilityName.toLowerCase().includes(query) ||
          r.receivingFacilityName.toLowerCase().includes(query) ||
          r.primaryDiagnosis.toLowerCase().includes(query)
      );
    }

    setFilteredReferrals(result);
  }, [referrals, statusFilter, urgencyFilter, typeFilter, searchTerm]);

  const statusTabs: { label: string; value: string; count: number }[] = [
    { label: "All Referrals", value: "ALL", count: referrals.length },
    { label: "New", value: "NEW", count: referrals.filter((r) => r.status === "NEW").length },
    { label: "Needs Review", value: "NEEDS_REVIEW", count: referrals.filter((r) => r.status === "NEEDS_REVIEW").length },
    { label: "Accepted", value: "ACCEPTED", count: referrals.filter((r) => r.status === "ACCEPTED").length },
    {
      label: "In Transit",
      value: "AMBULANCE_ASSIGNED",
      count: referrals.filter((r) => ["AMBULANCE_ASSIGNED", "PATIENT_ONBOARD", "ARRIVED"].includes(r.status)).length,
    },
    { label: "Completed", value: "COMPLETED", count: referrals.filter((r) => r.status === "COMPLETED").length },
    { label: "Declined", value: "DECLINED", count: referrals.filter((r) => r.status === "DECLINED").length },
  ];

  return (
    <PageShell
      title="Referral Management Queue"
      description="Centralized triage queue of obstetric and neonatal emergency transfers across district facilities"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadReferrals}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      }
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Referral Management" },
      ]}
    >
      {/* Search and Filters Bar */}
      <div className="bg-white border border-[#D9E0E7] rounded-md p-4 space-y-3">
        {/* Top search & dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#5B6875] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Referral ID, Patient Name, RCH ID, Facility or Diagnosis..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-2.5 py-2 text-xs border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            >
              <option value="ALL">All Urgency Levels</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Priority</option>
              <option value="NORMAL">Normal Priority</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-2 text-xs border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            >
              <option value="ALL">All Patient Types</option>
              <option value="MATERNAL">Maternal Only</option>
              <option value="NEONATAL">Neonatal Only</option>
              <option value="COMBINED">Combined Mother & Baby</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#E5EAF0]">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                statusFilter === tab.value
                  ? "bg-[#163A5F] text-white shadow-xs font-semibold"
                  : "bg-[#F1F4F8] text-[#172B3A] hover:bg-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.value
                    ? "bg-white/20 text-white"
                    : "bg-white text-[#5B6875]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Referrals Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full gov-table">
            <thead>
              <tr>
                <th>Referral ID & Priority</th>
                <th>Patient Details & Type</th>
                <th>Primary Clinical Indication</th>
                <th>Referring Source</th>
                <th>Receiving Hospital</th>
                <th>Transport & Stage</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td>
                    <div className="font-bold text-xs text-[#163A5F]">
                      {ref.id}
                    </div>
                    <div className="mt-1">
                      <UrgencyBadge urgency={ref.urgency} />
                    </div>
                    <div className="text-[10px] text-[#5B6875] mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ref.createdAt.split("T")[1]?.slice(0, 5)} hrs
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-1.5">
                      {ref.referralType === "NEONATAL" ? (
                        <Baby className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span className="font-semibold text-xs text-[#172B3A]">
                        {ref.mother.name}
                      </span>
                      <span className="text-[11px] text-[#5B6875]">({ref.mother.age}y)</span>
                    </div>
                    <div className="text-[11px] text-[#5B6875] mt-0.5">
                      RCH: <span className="font-mono">{ref.mother.rchId}</span>
                    </div>
                    <div className="text-[11px] text-[#5B6875]">
                      G{ref.mother.gravida}P{ref.mother.para} &bull; {ref.mother.gestationalWeeks}w &bull; Grp: {ref.mother.bloodGroup}
                    </div>
                  </td>

                  <td className="max-w-xs">
                    <div className="font-medium text-xs text-[#172B3A] line-clamp-1">
                      {ref.primaryDiagnosis}
                    </div>
                    <div className="text-[11px] text-[#5B6875] line-clamp-1 mt-0.5">
                      {ref.reasonForReferral}
                    </div>
                    <div className="text-[10px] text-[#163A5F] mt-1">
                      BP {ref.vitals.bpSystolic}/{ref.vitals.bpDiastolic} &bull; HR {ref.vitals.heartRate} &bull; SpO2 {ref.vitals.spO2}%
                    </div>
                  </td>

                  <td>
                    <div className="text-xs font-medium text-[#172B3A]">
                      {ref.referringFacilityName}
                    </div>
                    <div className="text-[11px] text-[#5B6875]">
                      {ref.referringDoctorName}
                    </div>
                  </td>

                  <td>
                    <div className="text-xs font-medium text-[#172B3A]">
                      {ref.receivingFacilityName}
                    </div>
                    <div className="text-[11px] text-[#5B6875]">
                      {ref.receivingFacilityType}
                    </div>
                  </td>

                  <td>
                    {ref.transportRequired ? (
                      <div>
                        {ref.assignedAmbulanceId ? (
                          <div className="flex items-center gap-1.5 text-xs text-[#163A5F] font-semibold">
                            <Ambulance className="w-3.5 h-3.5 text-[#1D4ED8]" />
                            <span>{ref.ambulanceRegistration}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            Transport Needed (Unassigned)
                          </span>
                        )}
                        {ref.tripStage && (
                          <div className="text-[10px] text-[#5B6875] mt-0.5">
                            Stage: {ref.tripStage.replace(/_/g, " ")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#5B6875]">Self/Local transport</span>
                    )}
                  </td>

                  <td>
                    <StatusBadge status={ref.status} />
                  </td>

                  <td className="text-right">
                    <Link href={`/referrals/${ref.id}`}>
                      <Button variant="navy" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                        Review Case
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredReferrals.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="max-w-xs mx-auto space-y-2">
                      <AlertCircle className="w-8 h-8 text-[#5B6875] mx-auto" />
                      <p className="text-sm font-semibold text-[#163A5F]">
                        No matching referrals found
                      </p>
                      <p className="text-xs text-[#5B6875]">
                        Try adjusting your search criteria or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
}
