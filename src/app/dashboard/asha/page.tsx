"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { PageShell } from "@/components/layout/PageShell";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { Card, StatWidget } from "@/components/ui/Card";
import { Badge, UrgencyBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";
import { dataStore } from "@/lib/data-store";
import {
  AshaMotherRecord,
  AncVisit,
  Referral,
  Facility,
  Ambulance,
} from "@/types";
import {
  HeartPulse,
  AlertTriangle,
  Plus,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Ambulance as AmbulanceIcon,
  Building2,
  ArrowRight,
  UserCheck,
  Activity,
  FileText,
  AlertCircle,
  X,
  Stethoscope,
  ChevronRight,
  Sparkles,
  MapPin,
  Pill,
  Syringe,
  Check,
} from "lucide-react";

export default function AshaDashboardPage() {
  const { user } = useAuth();

  const [mothers, setMothers] = useState<AshaMotherRecord[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<"high-risk" | "cohort" | "transit" | "jsy">("high-risk");
  const [searchQuery, setSearchQuery] = useState("");
  const [trimesterFilter, setTrimesterFilter] = useState<"ALL" | "1" | "2" | "3" | "DELIVERED">("ALL");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "HIGH_RISK" | "NORMAL">("ALL");

  // Modals
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [ancModalOpen, setAncModalOpen] = useState(false);
  const [selectedMotherForAction, setSelectedMotherForAction] = useState<AshaMotherRecord | null>(null);

  // SOS Referral Form State
  const [sosMotherId, setSosMotherId] = useState("");
  const [sosEmergencyCondition, setSosEmergencyCondition] = useState("Severe Pre-eclampsia / Eclampsia");
  const [sosHospitalId, setSosHospitalId] = useState("FAC-DH-01");
  const [sosBp, setSosBp] = useState("160/105");
  const [sosNotes, setSosNotes] = useState("");
  const [isSubmittingSos, setIsSubmittingSos] = useState(false);
  const [sosSuccessMessage, setSosSuccessMessage] = useState<string | null>(null);

  // New Mother Registration State
  const [regName, setRegName] = useState("");
  const [regAge, setRegAge] = useState(24);
  const [regHusband, setRegHusband] = useState("");
  const [regPhone, setRegPhone] = useState("+91 ");
  const [regVillage, setRegVillage] = useState("Najafgarh Basti");
  const [regGravida, setRegGravida] = useState(1);
  const [regPara, setRegPara] = useState(0);
  const [regBloodGroup, setRegBloodGroup] = useState("O+");
  const [regLmp, setRegLmp] = useState("");
  const [regHighRisk, setRegHighRisk] = useState(false);
  const [regRiskReasons, setRegRiskReasons] = useState<string[]>([]);
  const [regBp, setRegBp] = useState("116/76");
  const [regHb, setRegHb] = useState(11.0);
  const [regWeight, setRegWeight] = useState(50);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // ANC Visit Form State
  const [ancVisitNumber, setAncVisitNumber] = useState<1 | 2 | 3 | 4>(2);
  const [ancWeight, setAncWeight] = useState(55);
  const [ancBpSystolic, setAncBpSystolic] = useState(120);
  const [ancBpDiastolic, setAncBpDiastolic] = useState(80);
  const [ancHb, setAncHb] = useState(10.5);
  const [ancFundalHeight, setAncFundalHeight] = useState(24);
  const [ancFhr, setAncFhr] = useState(140);
  const [ancAlbumin, setAncAlbumin] = useState<"NIL" | "TRACE" | "1+" | "2+" | "3+">("NIL");
  const [ancIfaGiven, setAncIfaGiven] = useState(60);
  const [ancCalciumGiven, setAncCalciumGiven] = useState(60);
  const [ancTtDose, setAncTtDose] = useState<"TT1" | "TT2" | "BOOSTER" | "NONE">("NONE");
  const [ancNotes, setAncNotes] = useState("");
  const [isSubmittingAnc, setIsSubmittingAnc] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [moths, refs, facs, ambs] = await Promise.all([
        apiClient.getAshaMothers(),
        apiClient.getReferrals(),
        apiClient.getFacilities(),
        apiClient.getActiveAmbulances(),
      ]);
      setMothers(moths);
      setReferrals(refs);
      setFacilities(facs);
      setAmbulances(ambs);
    } catch (err) {
      console.error("ASHA dashboard load error", err);
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
    return () => {
      window.removeEventListener("maira_store_updated", handleUpdate);
    };
  }, []);

  // Filtered Cohort
  const filteredMothers = useMemo(() => {
    return mothers.filter((m) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.husbandName.toLowerCase().includes(q) ||
        m.rchId.toLowerCase().includes(q) ||
        m.village.toLowerCase().includes(q);

      // Trimester Filter
      let matchesTrimester = true;
      if (trimesterFilter === "1") {
        matchesTrimester = m.gestationalWeeks <= 12 && m.deliveryStatus === "PREGNANT";
      } else if (trimesterFilter === "2") {
        matchesTrimester = m.gestationalWeeks >= 13 && m.gestationalWeeks <= 27 && m.deliveryStatus === "PREGNANT";
      } else if (trimesterFilter === "3") {
        matchesTrimester = m.gestationalWeeks >= 28 && m.deliveryStatus === "PREGNANT";
      } else if (trimesterFilter === "DELIVERED") {
        matchesTrimester = m.deliveryStatus === "DELIVERED";
      }

      // Risk Filter
      let matchesRisk = true;
      if (riskFilter === "HIGH_RISK") {
        matchesRisk = m.isHighRisk;
      } else if (riskFilter === "NORMAL") {
        matchesRisk = !m.isHighRisk;
      }

      return matchesSearch && matchesTrimester && matchesRisk;
    });
  }, [mothers, searchQuery, trimesterFilter, riskFilter]);

  // High-Risk list
  const highRiskMothers = useMemo(() => {
    return mothers.filter((m) => m.isHighRisk && m.deliveryStatus === "PREGNANT");
  }, [mothers]);

  // Approaching Delivery (due within 14 days or >= 37 weeks)
  const dueDeliveries = useMemo(() => {
    return mothers.filter((m) => m.gestationalWeeks >= 37 && m.deliveryStatus === "PREGNANT");
  }, [mothers]);

  // Active Referrals in transit from this ASHA's village / sector
  const activeReferrals = useMemo(() => {
    return referrals.filter(
      (r) =>
        r.mother.ashaName?.includes("Kamlesh") ||
        r.referringFacilityId === "FAC-CHC-04" ||
        mothers.some((m) => m.activeReferralId === r.id)
    );
  }, [referrals, mothers]);

  // Delivered mothers eligible for JSY claim
  const deliveredMothers = useMemo(() => {
    return mothers.filter((m) => m.deliveryStatus === "DELIVERED");
  }, [mothers]);

  // Open SOS Referral Modal with specific mother pre-filled
  const handleOpenSosForMother = (mother: AshaMotherRecord) => {
    setSelectedMotherForAction(mother);
    setSosMotherId(mother.id);
    if (mother.currentVitals) {
      setSosBp(`${mother.currentVitals.bpSystolic}/${mother.currentVitals.bpDiastolic}`);
    }
    if (mother.highRiskReasons.length > 0) {
      setSosEmergencyCondition(mother.highRiskReasons[0]);
    }
    setSosModalOpen(true);
  };

  // Open ANC Visit Modal for specific mother
  const handleOpenAncModal = (mother: AshaMotherRecord) => {
    setSelectedMotherForAction(mother);
    const nextVisitNumber = Math.min(mother.ancVisits.length + 1, 4) as 1 | 2 | 3 | 4;
    setAncVisitNumber(nextVisitNumber);
    setAncWeight(mother.currentVitals?.weightKg || 52);
    setAncBpSystolic(mother.currentVitals?.bpSystolic || 120);
    setAncBpDiastolic(mother.currentVitals?.bpDiastolic || 80);
    setAncHb(mother.currentVitals?.hemoglobin || 10.5);
    setAncFundalHeight(Math.max(mother.gestationalWeeks, 12));
    setAncModalOpen(true);
  };

  // Submit Emergency SOS Referral
  const handleSubmitSos = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSos(true);
    setSosSuccessMessage(null);

    try {
      const selectedMother = mothers.find((m) => m.id === sosMotherId);
      const hospital = facilities.find((f) => f.id === sosHospitalId) || facilities[0];

      const bpParts = sosBp.split("/").map((s) => parseInt(s.trim()));
      const systolic = bpParts[0] || 150;
      const diastolic = bpParts[1] || 95;

      const newRef = await apiClient.createReferral({
        mother: {
          id: selectedMother?.id || `MOTH-${Date.now()}`,
          name: selectedMother?.name || "Emergency Patient",
          age: selectedMother?.age || 25,
          rchId: selectedMother?.rchId || "RCH-EMERGENCY",
          gravida: selectedMother?.gravida || 2,
          para: selectedMother?.para || 1,
          gestationalWeeks: selectedMother?.gestationalWeeks || 38,
          bloodGroup: selectedMother?.bloodGroup || "Unknown",
          highRiskConditions: selectedMother?.highRiskReasons || [sosEmergencyCondition],
          contactPhone: selectedMother?.contactPhone || "+91 98765 00000",
          villageTown: selectedMother?.village || "Najafgarh Sector 4",
          ashaName: user?.name || "Kamlesh Devi ASHA",
          ashaContact: user?.phone || "+91 98765 44321",
        },
        referralType: "MATERNAL",
        status: "NEW",
        urgency: "CRITICAL",
        primaryDiagnosis: sosEmergencyCondition,
        reasonForReferral: `EMERGENCY SOS referral triggered by ASHA ${user?.name || "Kamlesh Devi"} from village field. Urgent 108 transport mobilized.`,
        clinicalSummary: `Patient presenting with ${sosEmergencyCondition}. Vitals: BP ${systolic}/${diastolic} mmHg. Notes: ${sosNotes || "Immediate obstetric evaluation required"}`,
        vitals: {
          bpSystolic: systolic,
          bpDiastolic: diastolic,
          heartRate: 98,
          respiratoryRate: 22,
          spO2: 97,
          temperatureF: 98.6,
          fetalHeartRate: selectedMother?.currentVitals?.fetalHeartRate || 140,
        },
        referringFacilityId: "FAC-CHC-04",
        referringFacilityName: "Najafgarh Community Health Centre (Field Unit)",
        referringFacilityType: "Community Health Centre",
        referringDoctorName: `${user?.name || "Kamlesh Devi"} (ASHA)`,
        referringDoctorPhone: user?.phone || "+91 98765 44321",
        receivingFacilityId: hospital.id,
        receivingFacilityName: hospital.name,
        receivingFacilityType: hospital.level.replace(/_/g, " "),
        transportRequired: true,
      });

      // Update mother's active referral ID in store if registered mother
      if (selectedMother) {
        dataStore.updateAshaMother({
          ...selectedMother,
          activeReferralId: newRef.id,
        });
      }

      setSosSuccessMessage(`Emergency Referral Created! Assigned ID: ${newRef.id}. 108 Dispatcher and ${hospital.name} notified.`);
      await loadData();

      setTimeout(() => {
        setIsSubmittingSos(false);
        setSosModalOpen(false);
        setSosSuccessMessage(null);
        setActiveTab("transit");
      }, 1600);
    } catch (err) {
      console.error(err);
      setIsSubmittingSos(false);
    }
  };

  // Submit New Mother Registration
  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReg(true);

    try {
      // Calculate EDD (LMP + 280 days) and gestational weeks
      let eddDate = "2026-11-30";
      let weeks = 12;
      if (regLmp) {
        const lmp = new Date(regLmp);
        const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
        eddDate = edd.toISOString().split("T")[0];

        const now = new Date();
        const diffMs = now.getTime() - lmp.getTime();
        weeks = Math.max(1, Math.min(42, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))));
      }

      const bpParts = regBp.split("/").map((s) => parseInt(s.trim()));
      const systolic = bpParts[0] || 116;
      const diastolic = bpParts[1] || 76;

      const newMother: AshaMotherRecord = {
        id: `moth-asha-${Date.now()}`,
        rchId: `RCH-2026-DL-${Math.floor(10000 + Math.random() * 90000)}`,
        name: regName,
        husbandName: regHusband,
        age: Number(regAge),
        contactPhone: regPhone,
        village: regVillage,
        wardNumber: "Ward 4",
        gravida: Number(regGravida),
        para: Number(regPara),
        bloodGroup: regBloodGroup,
        lmpDate: regLmp || new Date().toISOString().split("T")[0],
        eddDate,
        gestationalWeeks: weeks,
        isHighRisk: regHighRisk || systolic >= 140 || diastolic >= 90 || regHb < 7,
        highRiskReasons: regRiskReasons,
        currentVitals: {
          bpSystolic: systolic,
          bpDiastolic: diastolic,
          hemoglobin: Number(regHb),
          weightKg: Number(regWeight),
          fetalHeartRate: 144,
        },
        ancVisits: [
          {
            id: `anc-${Date.now()}-1`,
            visitNumber: 1,
            date: new Date().toISOString().split("T")[0],
            gestationalWeeks: weeks,
            weightKg: Number(regWeight),
            bpSystolic: systolic,
            bpDiastolic: diastolic,
            hemoglobin: Number(regHb),
            fundalHeightCm: Math.max(12, weeks),
            fetalHeartRate: 144,
            urineAlbumin: "NIL",
            ifaTabletsGiven: 30,
            calciumTabletsGiven: 30,
            ttDose: "TT1",
            highRiskIdentified: regHighRisk,
            notes: "Initial registration and MCP card issued at community health sub-centre.",
          },
        ],
        immunizationStatus: { tt1: true, tt2: false, booster: false },
        tabletsIssued: { ifaCount: 30, calciumCount: 30 },
        assignedAshaId: user?.id || "usr-asha-01",
        assignedAshaName: user?.name || "Kamlesh Devi ASHA",
        deliveryStatus: "PREGNANT",
        registeredDate: new Date().toISOString().split("T")[0],
      };

      await apiClient.addAshaMother(newMother);
      await loadData();
      setIsSubmittingReg(false);
      setRegisterModalOpen(false);

      // Reset form
      setRegName("");
      setRegHusband("");
      setRegPhone("+91 ");
      setRegRiskReasons([]);
      setRegHighRisk(false);
    } catch (err) {
      console.error(err);
      setIsSubmittingReg(false);
    }
  };

  // Submit Record ANC Visit
  const handleSubmitAnc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMotherForAction) return;

    setIsSubmittingAnc(true);
    try {
      const visitPayload: AncVisit = {
        id: `anc-${Date.now()}-${ancVisitNumber}`,
        visitNumber: ancVisitNumber,
        date: new Date().toISOString().split("T")[0],
        gestationalWeeks: selectedMotherForAction.gestationalWeeks,
        weightKg: Number(ancWeight),
        bpSystolic: Number(ancBpSystolic),
        bpDiastolic: Number(ancBpDiastolic),
        hemoglobin: Number(ancHb),
        fundalHeightCm: Number(ancFundalHeight),
        fetalHeartRate: Number(ancFhr),
        urineAlbumin: ancAlbumin,
        ifaTabletsGiven: Number(ancIfaGiven),
        calciumTabletsGiven: Number(ancCalciumGiven),
        ttDose: ancTtDose,
        highRiskIdentified: ancBpSystolic >= 140 || ancBpDiastolic >= 90 || ancHb < 7 || ancAlbumin !== "NIL",
        notes: ancNotes || `Routine ANC Visit ${ancVisitNumber} recorded in community beat.`,
      };

      await apiClient.recordAncVisit(selectedMotherForAction.id, visitPayload);
      await loadData();
      setIsSubmittingAnc(false);
      setAncModalOpen(false);
    } catch (err) {
      console.error(err);
      setIsSubmittingAnc(false);
    }
  };

  // Toggle risk reasons checkbox
  const handleToggleRiskReason = (reason: string) => {
    setRegRiskReasons((prev) => {
      const next = prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason];
      setRegHighRisk(next.length > 0);
      return next;
    });
  };

  return (
    <RoleGuard
      allowedRoles={["asha", "admin"]}
      fallbackTitle="ASHA Field Portal Restricted"
      fallbackMessage="This frontline maternal and child health operations dashboard is dedicated for accredited ASHA community health workers."
    >
      <PageShell
        title="ASHA Field Operations & Maternal Surveillance"
        description={`Logged in as ${user?.name || "Kamlesh Devi ASHA"} &bull; Sector Beat: Najafgarh Ward 4 &bull; Attached CHC: Najafgarh Community Health Centre`}
        actions={
          <div className="flex items-center gap-2">
            {/* Rapid 1-Click SOS Action */}
            <Button
              variant="danger"
              size="sm"
              leftIcon={<ShieldAlert className="w-4 h-4 animate-pulse" />}
              onClick={() => {
                setSelectedMotherForAction(null);
                setSosModalOpen(true);
              }}
              className="font-bold shadow-xs bg-red-600 hover:bg-red-700 text-white"
            >
              1-Click Emergency SOS
            </Button>

            {/* Register Mother */}
            <Button
              variant="navy"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setRegisterModalOpen(true)}
            >
              Register Mother
            </Button>
          </div>
        }
        breadcrumbs={[
          { label: "Operations Dashboard", href: "/dashboard" },
          { label: "ASHA Field Dashboard" },
        ]}
      >
        {/* Urgent High-Risk Pregnancy Warning Banner */}
        {highRiskMothers.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
              <div>
                <span className="font-bold text-[#A15C00] uppercase tracking-wide">
                  {highRiskMothers.length} High-Risk Pregnanc{highRiskMothers.length > 1 ? "ies" : "y"} Under Active Surveillance
                </span>
                <span className="text-[#5B6875] ml-2 hidden md:inline">
                  Severe Anemia, Pre-eclampsia, or Previous LSCS require weekly vitals & verified FRU delivery plans.
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("high-risk")}
              className="text-[#1D4ED8] font-semibold hover:underline shrink-0"
            >
              View High-Risk Queue &rarr;
            </button>
          </div>
        )}

        {/* Frontline Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatWidget
            title="Registered Mothers"
            value={mothers.length}
            subtitle="In Ward 4 beat"
            badgeText="Cohort"
            badgeVariant="primary"
          />
          <StatWidget
            title="High-Risk Flags"
            value={highRiskMothers.length}
            subtitle="Severe BP / Anemia"
            alert={highRiskMothers.length > 0}
            badgeText={highRiskMothers.length > 0 ? "Surveillance" : "Cleared"}
            badgeVariant={highRiskMothers.length > 0 ? "critical" : "success"}
          />
          <StatWidget
            title="Deliveries Due"
            value={dueDeliveries.length}
            subtitle="EDD <= 14 days"
            badgeText="Delivery Plan"
            badgeVariant="warning"
          />
          <StatWidget
            title="Active 108 Transits"
            value={activeReferrals.length}
            subtitle="Hospital referrals"
            badgeText={activeReferrals.length > 0 ? "In Transit" : "None"}
            badgeVariant={activeReferrals.length > 0 ? "primary" : "neutral"}
          />
          <StatWidget
            title="Delivered (PNC)"
            value={deliveredMothers.length}
            subtitle="Postnatal follow-up"
            badgeText="Delivered"
            badgeVariant="success"
          />
          <StatWidget
            title="JSY Incentives"
            value="₹1,400"
            subtitle="Institutional births"
            badgeText="Claim Active"
            badgeVariant="success"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Active Tabs & Cohort Tables */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs Header Navigation */}
            <div className="bg-white border border-[#D9E0E7] rounded-lg p-1.5 flex flex-wrap gap-1 shadow-xs">
              <button
                onClick={() => setActiveTab("high-risk")}
                className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === "high-risk"
                    ? "bg-red-50 text-red-700 border border-red-200 shadow-xs"
                    : "text-[#5B6875] hover:text-[#172B3A] hover:bg-slate-50"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>High-Risk Queue</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-100 text-red-800 text-[10px]">
                  {highRiskMothers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("cohort")}
                className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === "cohort"
                    ? "bg-[#163A5F] text-white shadow-xs"
                    : "text-[#5B6875] hover:text-[#172B3A] hover:bg-slate-50"
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>All Mothers (ANC)</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px]">
                  {mothers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("transit")}
                className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === "transit"
                    ? "bg-blue-50 text-[#1D4ED8] border border-blue-200 shadow-xs"
                    : "text-[#5B6875] hover:text-[#172B3A] hover:bg-slate-50"
                }`}
              >
                <AmbulanceIcon className="w-3.5 h-3.5" />
                <span>108 Transit & Status</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-100 text-[#1D4ED8] text-[10px]">
                  {activeReferrals.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("jsy")}
                className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === "jsy"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs"
                    : "text-[#5B6875] hover:text-[#172B3A] hover:bg-slate-50"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>JSY Incentives</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                  {deliveredMothers.length}
                </span>
              </button>
            </div>

            {/* TAB 1: HIGH-RISK SURVEILLANCE */}
            {activeTab === "high-risk" && (
              <Card
                title="High-Risk Maternal Surveillance (Red Alert Triage)"
                subtitle="Pregnant women presenting critical danger indicators requiring close monitoring & priority institutional referral"
                action={
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setSelectedMotherForAction(null);
                      setSosModalOpen(true);
                    }}
                  >
                    Quick 108 SOS
                  </Button>
                }
              >
                <div className="space-y-3">
                  {highRiskMothers.map((mother) => (
                    <div
                      key={mother.id}
                      className="p-3.5 rounded-lg border border-red-200 bg-red-50/30 hover:bg-red-50/60 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-red-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#163A5F]">
                              {mother.name}
                            </span>
                            <span className="text-xs text-[#5B6875]">
                              ({mother.age} yrs &bull; Husband: {mother.husbandName})
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                              HIGH RISK
                            </span>
                          </div>
                          <div className="text-[11px] text-[#5B6875] mt-0.5">
                            RCH: <strong className="text-[#172B3A]">{mother.rchId}</strong> &bull; {mother.village} ({mother.wardNumber}) &bull; Blood: <strong className="text-red-700">{mother.bloodGroup}</strong>
                          </div>
                        </div>

                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                          <div className="text-xs font-bold text-[#163A5F]">
                            {mother.gestationalWeeks} Weeks Gestation
                          </div>
                          <div className="text-[11px] text-[#A15C00] font-medium">
                            EDD: {mother.eddDate} ({Math.max(0, Math.ceil((new Date(mother.eddDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} days left)
                          </div>
                        </div>
                      </div>

                      {/* Clinical Risk Tags */}
                      <div className="py-2 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] font-semibold text-red-800">Critical Flags:</span>
                        {mother.highRiskReasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded bg-red-100 text-red-800 font-medium border border-red-200"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>

                      {/* Current Vitals Glance */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-red-100/60 text-xs text-[#5B6875]">
                        <div className="bg-white p-2 rounded border border-red-100">
                          <div className="text-[10px] uppercase">Blood Pressure</div>
                          <div className="text-xs font-bold text-red-700">
                            {mother.currentVitals?.bpSystolic}/{mother.currentVitals?.bpDiastolic} mmHg
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded border border-red-100">
                          <div className="text-[10px] uppercase">Hemoglobin (Hb)</div>
                          <div className={`text-xs font-bold ${mother.currentVitals && mother.currentVitals.hemoglobin < 8 ? "text-red-700" : "text-[#172B3A]"}`}>
                            {mother.currentVitals?.hemoglobin} g/dL
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded border border-red-100">
                          <div className="text-[10px] uppercase">Weight & FHR</div>
                          <div className="text-xs font-bold text-[#172B3A]">
                            {mother.currentVitals?.weightKg} kg &bull; {mother.currentVitals?.fetalHeartRate || 140} bpm
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded border border-red-100">
                          <div className="text-[10px] uppercase">ANC Progress</div>
                          <div className="text-xs font-bold text-[#163A5F]">
                            {mother.ancVisits.length} of 4 Completed
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2.5 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${mother.contactPhone}`}
                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded border border-[#D9E0E7] bg-white text-[#172B3A] hover:bg-slate-50 font-medium transition-colors"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>Call: {mother.contactPhone}</span>
                          </a>
                          {mother.activeReferralId && (
                            <Link href={`/referrals/${mother.activeReferralId}`}>
                              <span className="text-[11px] text-[#1D4ED8] hover:underline font-semibold flex items-center gap-1">
                                <AmbulanceIcon className="w-3 h-3" />
                                <span>Ref #{mother.activeReferralId} Active</span>
                              </span>
                            </Link>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Stethoscope className="w-3 h-3" />}
                            onClick={() => handleOpenAncModal(mother)}
                          >
                            Log ANC Visit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<ShieldAlert className="w-3 h-3" />}
                            onClick={() => handleOpenSosForMother(mother)}
                          >
                            Emergency 108 SOS
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {highRiskMothers.length === 0 && (
                    <div className="text-center py-8 text-xs text-[#5B6875] bg-[#F8FAFC] rounded-lg border border-[#E5EAF0]">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <div className="font-semibold text-sm text-[#163A5F]">No Active High-Risk Pregnancies</div>
                      <p className="mt-1">All pregnant mothers in Ward 4 currently present stable baseline parameters.</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* TAB 2: ALL REGISTERED MOTHERS (ANC COHORT) */}
            {activeTab === "cohort" && (
              <Card
                title="Village Mother Register (ANC Cohort)"
                subtitle="Complete longitudinal tracking of pregnant women under ASHA surveillance in Ward 4"
                action={
                  <Button
                    variant="navy"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setRegisterModalOpen(true)}
                  >
                    Register Mother
                  </Button>
                }
                noPadding
              >
                {/* Search & Filter Toolbar */}
                <div className="p-3 bg-[#F8FAFC] border-b border-[#E5EAF0] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#5B6875] absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search mother, RCH ID, village..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[#D9E0E7] bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Trimester Filter */}
                    <select
                      value={trimesterFilter}
                      onChange={(e) => setTrimesterFilter(e.target.value as any)}
                      className="text-xs p-1.5 rounded border border-[#D9E0E7] bg-white text-[#172B3A]"
                    >
                      <option value="ALL">All Stages</option>
                      <option value="1">1st Trimester (1-12w)</option>
                      <option value="2">2nd Trimester (13-27w)</option>
                      <option value="3">3rd Trimester (28-40w)</option>
                      <option value="DELIVERED">Delivered (PNC)</option>
                    </select>

                    {/* Risk Filter */}
                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value as any)}
                      className="text-xs p-1.5 rounded border border-[#D9E0E7] bg-white text-[#172B3A]"
                    >
                      <option value="ALL">All Risk Levels</option>
                      <option value="HIGH_RISK">High Risk Only</option>
                      <option value="NORMAL">Normal Risk</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full gov-table">
                    <thead>
                      <tr>
                        <th>Mother & RCH ID</th>
                        <th>Gestation / EDD</th>
                        <th>ANC Checklist</th>
                        <th>Vitals & Supplements</th>
                        <th>Risk Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMothers.map((mother) => (
                        <tr key={mother.id} className="hover:bg-slate-50 transition-colors">
                          <td>
                            <div className="font-semibold text-xs text-[#163A5F]">
                              {mother.name} ({mother.age}y)
                            </div>
                            <div className="text-[11px] text-[#5B6875]">
                              RCH: {mother.rchId} &bull; {mother.village}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Husband: {mother.husbandName} &bull; {mother.contactPhone}
                            </div>
                          </td>

                          <td>
                            {mother.deliveryStatus === "DELIVERED" ? (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                                Delivered ({mother.deliveryDetails?.deliveryType})
                              </span>
                            ) : (
                              <div>
                                <div className="text-xs font-bold text-[#172B3A]">
                                  {mother.gestationalWeeks} Weeks
                                </div>
                                <div className="text-[11px] text-[#5B6875]">
                                  EDD: {mother.eddDate}
                                </div>
                                <div className="text-[10px] text-amber-700 font-medium">
                                  G{mother.gravida}P{mother.para} &bull; {mother.bloodGroup}
                                </div>
                              </div>
                            )}
                          </td>

                          <td>
                            {/* 4 ANC Dots */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4].map((num) => {
                                  const done = mother.ancVisits.some((v) => v.visitNumber === num);
                                  return (
                                    <span
                                      key={num}
                                      title={`ANC ${num}: ${done ? "Completed" : "Pending"}`}
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        done
                                          ? "bg-emerald-600 text-white"
                                          : "bg-slate-200 text-[#5B6875]"
                                      }`}
                                    >
                                      {num}
                                    </span>
                                  );
                                })}
                              </div>
                              <div className="text-[10px] text-[#5B6875]">
                                TT1: {mother.immunizationStatus.tt1 ? "✓" : "—"} | TT2: {mother.immunizationStatus.tt2 ? "✓" : "—"}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="text-xs font-medium text-[#172B3A]">
                              BP: {mother.currentVitals?.bpSystolic}/{mother.currentVitals?.bpDiastolic}
                            </div>
                            <div className="text-[11px] text-[#5B6875]">
                              Hb: {mother.currentVitals?.hemoglobin} g/dL &bull; {mother.currentVitals?.weightKg} kg
                            </div>
                            <div className="text-[10px] text-emerald-700">
                              IFA: {mother.tabletsIssued.ifaCount} tabs issued
                            </div>
                          </td>

                          <td>
                            {mother.isHighRisk ? (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold border border-red-200 inline-block">
                                HIGH RISK
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium border border-emerald-200 inline-block">
                                Low Risk
                              </span>
                            )}
                          </td>

                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleOpenAncModal(mother)}
                              >
                                ANC Check
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleOpenSosForMother(mother)}
                              >
                                SOS
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredMothers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-xs text-[#5B6875]">
                            No pregnant mother records matching the filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* TAB 3: 108 TRANSIT STATUS */}
            {activeTab === "transit" && (
              <Card
                title="Active 108 Emergency Transit Tracking"
                subtitle="Live status updates for referred patients from Ward 4 to CHC/District Hospital"
              >
                <div className="space-y-3">
                  {activeReferrals.map((ref) => (
                    <div
                      key={ref.id}
                      className="p-3.5 rounded-lg border border-[#D9E0E7] bg-[#F8FAFC] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#163A5F]">
                            {ref.id}
                          </span>
                          <UrgencyBadge urgency={ref.urgency} />
                          <StatusBadge status={ref.status} />
                        </div>
                        <div className="text-xs text-[#5B6875]">
                          Created: {new Date(ref.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                        <div>
                          <div className="text-[10px] text-[#5B6875] uppercase">Patient</div>
                          <div className="font-semibold text-[#172B3A]">
                            {ref.mother.name} ({ref.mother.age}y, {ref.mother.gestationalWeeks}w)
                          </div>
                          <div className="text-[11px] text-red-700 font-medium">
                            {ref.primaryDiagnosis}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-[#5B6875] uppercase">Receiving Facility</div>
                          <div className="font-semibold text-[#172B3A]">
                            {ref.receivingFacilityName}
                          </div>
                          <div className="text-[11px] text-[#5B6875]">
                            Bed reserved on arrival
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-[#5B6875] uppercase">Ambulance Mobilization</div>
                          <div className="font-semibold text-[#163A5F] flex items-center gap-1">
                            <AmbulanceIcon className="w-3.5 h-3.5 text-blue-600" />
                            <span>{ref.ambulanceRegistration || "108 Unit DL-01-AB-108"}</span>
                          </div>
                          <div className="text-[11px] text-[#5B6875]">
                            Driver: {ref.driverName || "Ramesh Chand"} ({ref.driverPhone || "+91 98108 00001"})
                          </div>
                        </div>
                      </div>

                      {/* Transit Milestones Step Indicator */}
                      <div className="pt-2 border-t border-[#E5EAF0]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-[#163A5F]">
                            Current Milestone: <strong className="text-blue-700">{ref.status.replace(/_/g, " ")}</strong>
                          </span>
                          <Link href={`/referrals/${ref.id}`}>
                            <Button variant="secondary" size="sm" rightIcon={<ChevronRight className="w-3 h-3" />}>
                              View Hospital Referral Dossier
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}

                  {activeReferrals.length === 0 && (
                    <div className="text-center py-8 text-xs text-[#5B6875]">
                      No active referrals currently in transit for your sector.
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* TAB 4: JSY INCENTIVES */}
            {activeTab === "jsy" && (
              <Card
                title="Janani Suraksha Yojana (JSY) & Incentive Claims"
                subtitle="Track institutional deliveries facilitated in community beat and disbursement eligibility"
              >
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-900">ASHA Facilitation Incentive Structure:</div>
                      <div className="text-emerald-800 text-[11px] mt-0.5">
                        Rural Institutional Birth: ₹1,400 &bull; 4 ANC Checkups + Immunization: ₹300 &bull; Postnatal Followup (PNC): ₹250
                      </div>
                    </div>
                    <span className="font-bold text-base text-emerald-800">Total: ₹1,400</span>
                  </div>

                  {deliveredMothers.map((mother) => (
                    <div
                      key={mother.id}
                      className="p-3 rounded-lg border border-[#D9E0E7] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-sm text-[#163A5F]">
                          {mother.name} (Delivered on {mother.deliveryDetails?.date})
                        </div>
                        <div className="text-[11px] text-[#5B6875] mt-0.5">
                          Facility: <strong>{mother.deliveryDetails?.facilityName}</strong> &bull; Type: {mother.deliveryDetails?.deliveryType} &bull; Outcome: {mother.deliveryDetails?.outcome}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold text-emerald-700">₹1,400 Claim</div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                            {mother.deliveryDetails?.jsyIncentiveStatus || "APPROVED"}
                          </span>
                        </div>
                        <Button variant="secondary" size="sm">
                          Print Voucher
                        </Button>
                      </div>
                    </div>
                  ))}

                  {deliveredMothers.length === 0 && (
                    <div className="text-center py-6 text-xs text-[#5B6875]">
                      No institutional deliveries logged this cycle yet.
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column (1 Col): Emergency Dial, Nearest FRU, Clinical Danger SOP */}
          <div className="space-y-5">
            {/* 24x7 Emergency Helpline Card */}
            <Card
              title="Emergency Helplines (1-Click Dial)"
              subtitle="Direct line to ambulance dispatch & clinical coordinators"
            >
              <div className="space-y-2.5 text-xs">
                <a
                  href="tel:108"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      108
                    </div>
                    <div>
                      <div className="font-bold text-red-900">108 Emergency Ambulance</div>
                      <div className="text-[11px] text-red-700">Immediate BLS/ALS mobilization</div>
                    </div>
                  </div>
                  <Phone className="w-4 h-4 text-red-700" />
                </a>

                <a
                  href="tel:102"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      102
                    </div>
                    <div>
                      <div className="font-bold text-blue-900">102 Janani Shishu Helpline</div>
                      <div className="text-[11px] text-blue-700">Free drop-back vehicle</div>
                    </div>
                  </div>
                  <Phone className="w-4 h-4 text-[#1D4ED8]" />
                </a>

                <a
                  href="tel:011-23214569"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 border border-[#D9E0E7] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#163A5F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      MO
                    </div>
                    <div>
                      <div className="font-bold text-[#163A5F]">Najafgarh CHC Duty MO</div>
                      <div className="text-[11px] text-[#5B6875]">Dr. R. K. Singhal (+91 98765 22001)</div>
                    </div>
                  </div>
                  <Phone className="w-4 h-4 text-[#163A5F]" />
                </a>
              </div>
            </Card>

            {/* Nearest Accredited Hospitals (FRU Readiness) */}
            <Card
              title="Nearest First Referral Units (FRU)"
              subtitle="Hospital capacity & blood bank operational status"
            >
              <div className="space-y-3 text-xs">
                {facilities.slice(0, 2).map((fac) => (
                  <div key={fac.id} className="p-2.5 rounded border border-[#E5EAF0] bg-[#F8FAFC] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#163A5F]">{fac.name}</span>
                      <span className="text-[10px] bg-blue-100 text-[#1D4ED8] px-1.5 py-0.5 rounded font-semibold">
                        {fac.level.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5B6875]">
                      <div>
                        Labour Beds: <strong className="text-emerald-700">{fac.readiness.labourBedsAvailable}/{fac.readiness.labourBedsTotal}</strong>
                      </div>
                      <div>
                        SNCU Warmers: <strong className="text-emerald-700">{fac.readiness.sncuWarmerAvailable}/{fac.readiness.sncuWarmerTotal}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#5B6875] pt-1 border-t border-[#E5EAF0]">
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>C-Section OT Ready</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Blood Bank Ready</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Maternal Danger Signs Pocket Card (NHM SOP) */}
            <Card
              title="Danger Signs During Pregnancy (SOP)"
              subtitle="Trigger immediate 108 Emergency Referral if any present"
            >
              <div className="space-y-1.5 text-xs text-[#5B6875]">
                <div className="flex items-start gap-2 p-1.5 rounded bg-red-50 text-red-900 border border-red-100">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>Vaginal Bleeding (Antepartum Hemorrhage)</span>
                </div>
                <div className="flex items-start gap-2 p-1.5 rounded bg-red-50 text-red-900 border border-red-100">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>Convulsions / Severe headache with blurred vision</span>
                </div>
                <div className="flex items-start gap-2 p-1.5 rounded bg-red-50 text-red-900 border border-red-100">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>Ruptured membranes &bull; Water break without labor</span>
                </div>
                <div className="flex items-start gap-2 p-1.5 rounded bg-red-50 text-red-900 border border-red-100">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>Labor pains persisting for more than 12 hours</span>
                </div>
                <div className="flex items-start gap-2 p-1.5 rounded bg-red-50 text-red-900 border border-red-100">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>Absent or reduced fetal movements in 3rd trimester</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* MODAL 1: EMERGENCY SOS REFERRAL MODAL */}
        {sosModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-red-200 overflow-hidden">
              <div className="bg-red-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-base">Emergency SOS 108 Referral</h3>
                    <p className="text-[11px] text-red-100">Direct village emergency ambulance dispatch</p>
                  </div>
                </div>
                <button
                  onClick={() => setSosModalOpen(false)}
                  className="p-1 rounded text-red-100 hover:text-white hover:bg-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitSos} className="p-5 space-y-4 text-xs">
                {sosSuccessMessage && (
                  <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{sosSuccessMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-[#172B3A] mb-1 uppercase tracking-wide text-[11px]">
                    Select Pregnant Mother *
                  </label>
                  <select
                    required
                    value={sosMotherId}
                    onChange={(e) => {
                      setSosMotherId(e.target.value);
                      const m = mothers.find((mom) => mom.id === e.target.value);
                      if (m && m.currentVitals) {
                        setSosBp(`${m.currentVitals.bpSystolic}/${m.currentVitals.bpDiastolic}`);
                      }
                    }}
                    className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-sm"
                  >
                    <option value="">-- Choose Mother from Ward 4 Register --</option>
                    {mothers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.age}y, {m.gestationalWeeks}w) — RCH: {m.rchId} {m.isHighRisk ? "[HIGH RISK]" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#172B3A] mb-1 uppercase tracking-wide text-[11px]">
                    Emergency Clinical Condition / Danger Sign *
                  </label>
                  <select
                    required
                    value={sosEmergencyCondition}
                    onChange={(e) => setSosEmergencyCondition(e.target.value)}
                    className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-sm font-medium"
                  >
                    <option value="Severe Pre-eclampsia / Eclampsia">Severe Pre-eclampsia / Eclampsia (BP &ge; 160/110)</option>
                    <option value="Antepartum Hemorrhage (Severe Bleeding)">Antepartum Hemorrhage (Severe Bleeding)</option>
                    <option value="Obstructed / Prolonged Labor (>12h)">Obstructed / Prolonged Labor (&gt;12 hours)</option>
                    <option value="Ruptured Membranes with Cord Prolapse">Ruptured Membranes with Cord Prolapse</option>
                    <option value="Severe Anemia in Active Labor (Hb < 7)">Severe Anemia in Active Labor (Hb &lt; 7 g/dL)</option>
                    <option value="Eclampsia with Convulsions">Eclampsia with Convulsions</option>
                    <option value="Fetal Distress / Loss of Movements">Fetal Distress / Loss of Movements</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1 uppercase tracking-wide text-[11px]">
                      Current BP (Systolic/Diastolic) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="160/105"
                      value={sosBp}
                      onChange={(e) => setSosBp(e.target.value)}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1 uppercase tracking-wide text-[11px]">
                      Destination Hospital *
                    </label>
                    <select
                      required
                      value={sosHospitalId}
                      onChange={(e) => setSosHospitalId(e.target.value)}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-sm"
                    >
                      {facilities.map((fac) => (
                        <option key={fac.id} value={fac.id}>
                          {fac.name} ({fac.readiness.labourBedsAvailable} beds avail)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#172B3A] mb-1 uppercase tracking-wide text-[11px]">
                    Clinical Notes & Urgent Needs
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Patient has severe headache, facial swelling. Family notified and ready for pickup at village chowk."
                    value={sosNotes}
                    onChange={(e) => setSosNotes(e.target.value)}
                    className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5EAF0]">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSosModalOpen(false)}
                    disabled={isSubmittingSos}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    isLoading={isSubmittingSos}
                    leftIcon={<ShieldAlert className="w-4 h-4" />}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    Confirm & Mobilize 108 Ambulance
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: REGISTER NEW PREGNANT MOTHER MODAL */}
        {registerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-[#D9E0E7] overflow-hidden">
              <div className="bg-[#163A5F] text-white p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Register Pregnant Mother (RCH Portal)</h3>
                  <p className="text-[11px] text-white/70">Onboard new pregnant woman into Ward 4 active maternal register</p>
                </div>
                <button
                  onClick={() => setRegisterModalOpen(false)}
                  className="p-1 rounded text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitRegister} className="p-5 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">Mother's Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Meena Sharma"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">Age (Years) *</label>
                    <input
                      type="number"
                      required
                      min={15}
                      max={50}
                      value={regAge}
                      onChange={(e) => setRegAge(Number(e.target.value))}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">Husband / Guardian Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={regHusband}
                      onChange={(e) => setRegHusband(e.target.value)}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">Mobile Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 00000"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">Gravida (G)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={regGravida}
                      onChange={(e) => setRegGravida(Number(e.target.value))}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">Para (P)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={regPara}
                      onChange={(e) => setRegPara(Number(e.target.value))}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">Blood Group</label>
                    <select
                      value={regBloodGroup}
                      onChange={(e) => setRegBloodGroup(e.target.value)}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-xs font-semibold"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A- (Rh Neg)</option>
                      <option value="B+">B+</option>
                      <option value="B-">B- (Rh Neg)</option>
                      <option value="O+">O+</option>
                      <option value="O-">O- (Rh Neg)</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB- (Rh Neg)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">Last Menstrual Period (LMP) *</label>
                    <input
                      type="date"
                      required
                      value={regLmp}
                      onChange={(e) => setRegLmp(e.target.value)}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">Village / Locality</label>
                    <input
                      type="text"
                      value={regVillage}
                      onChange={(e) => setRegVillage(e.target.value)}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-xs"
                    />
                  </div>
                </div>

                {/* Baseline Vitals */}
                <div className="p-2.5 rounded bg-slate-50 border border-[#E5EAF0] space-y-2">
                  <div className="text-[11px] font-bold text-[#163A5F] uppercase">Baseline Vitals (ANC 1)</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#5B6875]">Blood Pressure</label>
                      <input
                        type="text"
                        value={regBp}
                        onChange={(e) => setRegBp(e.target.value)}
                        className="w-full p-1.5 border border-[#D9E0E7] rounded bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#5B6875]">Hb (g/dL)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={regHb}
                        onChange={(e) => setRegHb(Number(e.target.value))}
                        className="w-full p-1.5 border border-[#D9E0E7] rounded bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#5B6875]">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={regWeight}
                        onChange={(e) => setRegWeight(Number(e.target.value))}
                        className="w-full p-1.5 border border-[#D9E0E7] rounded bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* High Risk Conditions Checkboxes */}
                <div>
                  <label className="block font-semibold text-[#172B3A] mb-1 text-[11px]">
                    High-Risk Screening Factors:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {[
                      "Severe Anemia (Hb < 7)",
                      "Gestational Hypertension (BP >= 140/90)",
                      "Previous C-Section / LSCS Scar",
                      "Gestational Diabetes Mellitus (GDM)",
                      "Twin / Multiple Pregnancy",
                      "Rh-Negative Blood Group",
                      "Elderly Gravida (Age >= 35)",
                      "Teenage Pregnancy (Age < 18)",
                    ].map((cond) => (
                      <label key={cond} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={regRiskReasons.includes(cond)}
                          onChange={() => handleToggleRiskReason(cond)}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        <span>{cond}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5EAF0]">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setRegisterModalOpen(false)}
                    disabled={isSubmittingReg}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="navy"
                    isLoading={isSubmittingReg}
                    leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                  >
                    Save & Register Mother
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: RECORD ANC VISIT MODAL */}
        {ancModalOpen && selectedMotherForAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-[#D9E0E7] overflow-hidden">
              <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Record Antenatal Care (ANC) Visit</h3>
                  <p className="text-[11px] text-emerald-100">
                    Patient: {selectedMotherForAction.name} &bull; RCH: {selectedMotherForAction.rchId} ({selectedMotherForAction.gestationalWeeks}w)
                  </p>
                </div>
                <button
                  onClick={() => setAncModalOpen(false)}
                  className="p-1 rounded text-emerald-100 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitAnc} className="p-5 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">ANC Visit Number *</label>
                    <select
                      value={ancVisitNumber}
                      onChange={(e) => setAncVisitNumber(Number(e.target.value) as any)}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-sm font-semibold"
                    >
                      <option value={1}>ANC 1 (Within 12 Weeks)</option>
                      <option value={2}>ANC 2 (14 - 26 Weeks)</option>
                      <option value={3}>ANC 3 (28 - 34 Weeks)</option>
                      <option value={4}>ANC 4 (36 Weeks to Term)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={ancWeight}
                      onChange={(e) => setAncWeight(Number(e.target.value))}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">BP Systolic (mmHg) *</label>
                    <input
                      type="number"
                      required
                      value={ancBpSystolic}
                      onChange={(e) => setAncBpSystolic(Number(e.target.value))}
                      className={`w-full p-2 border rounded bg-white text-sm ${ancBpSystolic >= 140 ? "border-red-400 bg-red-50 text-red-700 font-bold" : "border-[#D9E0E7]"}`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">BP Diastolic (mmHg) *</label>
                    <input
                      type="number"
                      required
                      value={ancBpDiastolic}
                      onChange={(e) => setAncBpDiastolic(Number(e.target.value))}
                      className={`w-full p-2 border rounded bg-white text-sm ${ancBpDiastolic >= 90 ? "border-red-400 bg-red-50 text-red-700 font-bold" : "border-[#D9E0E7]"}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">Hb (g/dL) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={ancHb}
                      onChange={(e) => setAncHb(Number(e.target.value))}
                      className={`w-full p-2 border rounded bg-white text-xs ${ancHb < 8 ? "border-red-400 bg-red-50 text-red-700 font-bold" : "border-[#D9E0E7]"}`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">Fundal Height (cm)</label>
                    <input
                      type="number"
                      value={ancFundalHeight}
                      onChange={(e) => setAncFundalHeight(Number(e.target.value))}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">FHR (bpm)</label>
                    <input
                      type="number"
                      value={ancFhr}
                      onChange={(e) => setAncFhr(Number(e.target.value))}
                      className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">Urine Albumin</label>
                    <select
                      value={ancAlbumin}
                      onChange={(e) => setAncAlbumin(e.target.value as any)}
                      className="w-full p-1.5 border border-[#D9E0E7] rounded bg-white text-xs"
                    >
                      <option value="NIL">NIL</option>
                      <option value="TRACE">TRACE</option>
                      <option value="1+">1+</option>
                      <option value="2+">2+</option>
                      <option value="3+">3+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">TT / Td Vaccine</label>
                    <select
                      value={ancTtDose}
                      onChange={(e) => setAncTtDose(e.target.value as any)}
                      className="w-full p-1.5 border border-[#D9E0E7] rounded bg-white text-xs"
                    >
                      <option value="NONE">None This Visit</option>
                      <option value="TT1">TT1 Dose</option>
                      <option value="TT2">TT2 Dose</option>
                      <option value="BOOSTER">Booster Dose</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#172B3A] mb-1">IFA Tablets Given</label>
                    <input
                      type="number"
                      value={ancIfaGiven}
                      onChange={(e) => setAncIfaGiven(Number(e.target.value))}
                      className="w-full p-1.5 border border-[#D9E0E7] rounded bg-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#172B3A] mb-1">Clinical Observations & Advice</label>
                  <textarea
                    rows={2}
                    placeholder="Advised nutrition, iron tablet intake after meals, and warning signs of preeclampsia."
                    value={ancNotes}
                    onChange={(e) => setAncNotes(e.target.value)}
                    className="w-full p-2 border border-[#D9E0E7] rounded bg-white text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5EAF0]">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setAncModalOpen(false)}
                    disabled={isSubmittingAnc}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="navy"
                    isLoading={isSubmittingAnc}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Save ANC Checkup
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageShell>
    </RoleGuard>
  );
}
