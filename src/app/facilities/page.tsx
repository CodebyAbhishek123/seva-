"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { apiClient } from "@/lib/api-client";
import { Facility } from "@/types";
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Phone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  BedDouble,
  Baby,
  Droplet,
} from "lucide-react";

export default function FacilityDirectoryPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await apiClient.getFacilities();
      setFacilities(data);
      setIsLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let result = [...facilities];
    if (levelFilter !== "ALL") {
      result = result.filter((f) => f.level === levelFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.verifiedIdentifier.toLowerCase().includes(q) ||
          f.district.toLowerCase().includes(q) ||
          f.address.toLowerCase().includes(q)
      );
    }
    setFilteredFacilities(result);
  }, [facilities, levelFilter, searchTerm]);

  return (
    <PageShell
      title="Verified Facility Directory"
      description="Official state directory of accredited maternal & child health hospitals, referral centres, and CHCs"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Facility Directory" },
      ]}
    >
      {/* Search and Filters */}
      <div className="bg-white border border-[#D9E0E7] rounded-md p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#5B6875] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by facility name, MoHFW ID, district, address..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
        >
          <option value="ALL">All Facility Tiers</option>
          <option value="TERTIARY_MEDICAL_COLLEGE">Tertiary Medical Colleges</option>
          <option value="DISTRICT_HOSPITAL">District Hospitals</option>
          <option value="SUB_DISTRICT_HOSPITAL">Sub-District Hospitals</option>
          <option value="COMMUNITY_HEALTH_CENTRE">Community Health Centres (CHCs)</option>
          <option value="PRIMARY_HEALTH_CENTRE">Primary Health Centres (PHCs)</option>
        </select>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.map((fac) => (
          <div
            key={fac.id}
            className="bg-white border border-[#D9E0E7] rounded-md p-4 flex flex-col justify-between hover:border-slate-400 transition-all shadow-xs"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-[#163A5F] leading-snug">
                    {fac.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-[11px] text-[#5B6875]">
                      {fac.verifiedIdentifier}
                    </span>
                    {fac.isVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#5B6875] space-y-1">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-[#163A5F]" />
                  <span className="font-medium text-[#172B3A]">{fac.level.replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#163A5F] mt-0.5" />
                  <span className="line-clamp-1">{fac.address}, {fac.district}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-[#163A5F]" />
                  <span>Helpline: <strong className="text-[#172B3A]">{fac.emergencyHelpline}</strong></span>
                </div>
              </div>

              {/* Service Badges */}
              <div className="flex flex-wrap gap-1 pt-1">
                {fac.hasCSectionCapability && (
                  <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
                    LSCS OT
                  </span>
                )}
                {fac.hasSNCU && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                    SNCU Care
                  </span>
                )}
                {fac.hasNICU && (
                  <span className="text-[10px] bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded font-medium">
                    Level-3 NICU
                  </span>
                )}
                {fac.hasBloodBank && (
                  <span className="text-[10px] bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded font-medium">
                    Blood Bank
                  </span>
                )}
              </div>

              {/* Readiness Summary */}
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#5B6875]">Labour Beds:</span>
                  <span className="font-bold text-[#163A5F]">
                    {fac.readiness.labourBedsAvailable} / {fac.readiness.labourBedsTotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B6875]">SNCU Warmers:</span>
                  <span className="font-bold text-[#163A5F]">
                    {fac.readiness.sncuWarmerAvailable} / {fac.readiness.sncuWarmerTotal}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#5B6875]">Data Freshness:</span>
                  <span className="font-medium text-emerald-700">{fac.readiness.dataFreshness}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#E5EAF0] flex items-center justify-between">
              <span className="text-[11px] text-[#5B6875]">
                Nodal: {fac.nodalOfficerName}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedFacility(fac)}
              >
                Inspect Dossier
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Facility Detail Slideover/Modal */}
      {selectedFacility && (
        <Modal
          isOpen={!!selectedFacility}
          onClose={() => setSelectedFacility(null)}
          title={selectedFacility.name}
          description={`Verified Accreditation: ${selectedFacility.verifiedIdentifier}`}
          maxWidth="lg"
          footer={
            <Button variant="secondary" onClick={() => setSelectedFacility(null)}>
              Close Dossier
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8FAFC] border border-[#E5EAF0] rounded">
              <div>
                <span className="text-[#5B6875] block">Facility Level:</span>
                <span className="font-semibold text-sm text-[#163A5F]">
                  {selectedFacility.level.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span className="text-[#5B6875] block">District & Jurisdiction:</span>
                <span className="font-semibold text-sm text-[#163A5F]">
                  {selectedFacility.district}, {selectedFacility.state}
                </span>
              </div>
              <div>
                <span className="text-[#5B6875] block">Nodal Officer:</span>
                <span className="font-medium text-[#172B3A]">{selectedFacility.nodalOfficerName}</span>
              </div>
              <div>
                <span className="text-[#5B6875] block">Emergency Helpline:</span>
                <span className="font-mono font-semibold text-[#1D4ED8]">
                  {selectedFacility.emergencyHelpline}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-[#163A5F] mb-1">Physical Address:</h4>
              <p className="text-[#5B6875] leading-relaxed">
                {selectedFacility.address}, PIN: {selectedFacility.pincode}
              </p>
              <div className="text-[11px] text-[#5B6875] mt-1">
                GPS Lat/Lng: {selectedFacility.location.lat}, {selectedFacility.location.lng}
              </div>
            </div>

            <div className="p-3 bg-white border border-[#D9E0E7] rounded space-y-2">
              <h4 className="font-bold text-[#163A5F]">Live Capacity Metrics</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-[#5B6875] text-[10px]">Labour Beds</div>
                  <div className="font-bold text-sm text-[#163A5F] mt-0.5">
                    {selectedFacility.readiness.labourBedsAvailable} / {selectedFacility.readiness.labourBedsTotal}
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-[#5B6875] text-[10px]">SNCU Warmers</div>
                  <div className="font-bold text-sm text-[#163A5F] mt-0.5">
                    {selectedFacility.readiness.sncuWarmerAvailable} / {selectedFacility.readiness.sncuWarmerTotal}
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <div className="text-[#5B6875] text-[10px]">NICU Beds</div>
                  <div className="font-bold text-sm text-[#163A5F] mt-0.5">
                    {selectedFacility.readiness.nicuBedsAvailable}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}
