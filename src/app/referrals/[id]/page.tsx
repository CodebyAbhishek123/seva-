"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { PageShell } from "@/components/layout/PageShell";
import { UrgencyBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { apiClient } from "@/lib/api-client";
import { Referral, Ambulance } from "@/types";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building2,
  Ambulance as AmbulanceIcon,
  Clock,
  User,
  HeartPulse,
  AlertTriangle,
  FileText,
  MapPin,
  Baby,
  Phone,
  ShieldCheck,
  Send,
  Calendar,
} from "lucide-react";

function ReferralDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user, role } = useAuth();
  const referralId = params?.id as string;

  const [referral, setReferral] = useState<Referral | null>(null);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptNotes, setAcceptNotes] = useState("");

  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declineError, setDeclineError] = useState("");

  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [infoQuery, setInfoQuery] = useState("");

  const [showArrivalModal, setShowArrivalModal] = useState(false);

  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverNotes, setHandoverNotes] = useState("");

  const [showAssignAmbulanceModal, setShowAssignAmbulanceModal] = useState(false);
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ref, ambs] = await Promise.all([
        apiClient.getReferralById(referralId),
        apiClient.getActiveAmbulances(),
      ]);
      setReferral(ref);
      setAmbulances(ambs);
      const available = ambs.find((a) => a.status === "AVAILABLE");
      if (available) setSelectedAmbulanceId(available.id);
    } catch (err) {
      console.error("Error loading referral detail", err);
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
  }, [referralId]);

  if (isLoading) {
    return (
      <PageShell title="Loading Referral Dossier..." breadcrumbs={[{ label: "Referrals", href: "/referrals" }]}>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#163A5F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#5B6875]">Fetching clinical records from government database...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!referral) {
    return (
      <PageShell title="Referral Not Found" breadcrumbs={[{ label: "Referrals", href: "/referrals" }]}>
        <div className="bg-white border border-[#D9E0E7] rounded p-8 text-center space-y-3 max-w-md mx-auto my-8">
          <AlertTriangle className="w-8 h-8 text-[#B42318] mx-auto" />
          <h2 className="text-base font-bold text-[#163A5F]">Record Unavailable</h2>
          <p className="text-xs text-[#5B6875]">
            Referral record with ID <span className="font-mono">{referralId}</span> does not exist or has been archived.
          </p>
          <Link href="/referrals">
            <Button variant="navy" size="sm">
              Return to Referral Queue
            </Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  // --- ACTIONS ---
  const handleAccept = async () => {
    if (!user) return;
    setActionLoading(true);
    await apiClient.acceptReferral(referral.id, user.name, user.id, acceptNotes);
    setActionLoading(false);
    setShowAcceptModal(false);
    setAcceptNotes("");
  };

  const handleDecline = async () => {
    if (!user) return;
    if (!declineReason.trim() || declineReason.trim().length < 10) {
      setDeclineError("A valid clinical reason (min 10 characters) is mandatory under SOP guidelines.");
      return;
    }
    setActionLoading(true);
    await apiClient.declineReferral(referral.id, declineReason.trim(), user.name, user.id);
    setActionLoading(false);
    setShowDeclineModal(false);
    setDeclineReason("");
  };

  const handleRequestInfo = async () => {
    if (!user || !infoQuery.trim()) return;
    setActionLoading(true);
    await apiClient.requestAdditionalInfo(referral.id, infoQuery.trim(), user.name, user.id);
    setActionLoading(false);
    setShowRequestInfoModal(false);
    setInfoQuery("");
  };

  const handleConfirmArrival = async () => {
    if (!user) return;
    setActionLoading(true);
    await apiClient.confirmArrival(referral.id, user.name, user.id);
    setActionLoading(false);
    setShowArrivalModal(false);
  };

  const handleHandover = async () => {
    if (!user) return;
    setActionLoading(true);
    await apiClient.recordHandover(
      referral.id,
      handoverNotes || "Patient transferred to Emergency OT / Postnatal ICU.",
      user.name,
      user.id
    );
    setActionLoading(false);
    setShowHandoverModal(false);
    setHandoverNotes("");
  };

  const handleAssignAmbulance = async () => {
    if (!user || !selectedAmbulanceId) return;
    setActionLoading(true);
    await apiClient.assignAmbulance(referral.id, selectedAmbulanceId, user.name, user.id);
    setActionLoading(false);
    setShowAssignAmbulanceModal(false);
  };

  // Determine allowed action buttons
  const isHospital = role === "hospital" || role === "admin";
  const isDispatcher = role === "dispatcher" || role === "admin";
  const canAcceptOrDecline = isHospital && (referral.status === "NEW" || referral.status === "NEEDS_REVIEW");
  const canConfirmArrival = isHospital && (referral.status === "AMBULANCE_ASSIGNED" || referral.status === "PATIENT_ONBOARD" || referral.status === "ACCEPTED");
  const canHandover = isHospital && (referral.status === "ARRIVED" || referral.status === "PATIENT_ONBOARD" || referral.status === "ACCEPTED");
  const canAssignAmbulance = isDispatcher && referral.transportRequired && !referral.assignedAmbulanceId && referral.status !== "DECLINED" && referral.status !== "COMPLETED";

  return (
    <PageShell
      title={`Referral Dossier: ${referral.id}`}
      description={`Maternal & Neonatal Emergency Triage Record &bull; Created at ${new Date(referral.createdAt).toLocaleString("en-IN")}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/referrals">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Queue
            </Button>
          </Link>

          {/* Hospital Accept Button */}
          {canAcceptOrDecline && (
            <>
              <Button
                variant="success"
                size="sm"
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => setShowAcceptModal(true)}
              >
                Accept Referral
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                onClick={() => {
                  setDeclineError("");
                  setShowDeclineModal(true);
                }}
              >
                Decline with Reason
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
                onClick={() => setShowRequestInfoModal(true)}
              >
                Request Info
              </Button>
            </>
          )}

          {/* Dispatcher Ambulance Assignment */}
          {canAssignAmbulance && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<AmbulanceIcon className="w-3.5 h-3.5" />}
              onClick={() => setShowAssignAmbulanceModal(true)}
            >
              Dispatch 108 Ambulance
            </Button>
          )}

          {/* Confirm Arrival Button */}
          {canConfirmArrival && (
            <Button
              variant="navy"
              size="sm"
              leftIcon={<MapPin className="w-3.5 h-3.5" />}
              onClick={() => setShowArrivalModal(true)}
            >
              Confirm Patient Arrival
            </Button>
          )}

          {/* Handover Completed Button */}
          {canHandover && (
            <Button
              variant="success"
              size="sm"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
              onClick={() => setShowHandoverModal(true)}
            >
              Record Clinical Handover
            </Button>
          )}
        </div>
      }
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Referral Management", href: "/referrals" },
        { label: referral.id },
      ]}
    >
      {/* Triage Urgency & Status Bar */}
      <div className="bg-white border border-[#D9E0E7] rounded-md p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <UrgencyBadge urgency={referral.urgency} />
          <StatusBadge status={referral.status} />
          <span className="text-xs text-[#5B6875]">
            Type: <strong className="text-[#163A5F]">{referral.referralType}</strong>
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#5B6875]">
          <div>
            Referring: <strong className="text-[#172B3A]">{referral.referringFacilityName}</strong>
          </div>
          <div>
            Receiving: <strong className="text-[#172B3A]">{referral.receivingFacilityName}</strong>
          </div>
          <div>
            Last updated: <strong className="text-[#172B3A]">{new Date(referral.updatedAt).toLocaleTimeString("en-IN")}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Clinical Dossier + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Clinical Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Clinical Reason & Diagnosis */}
          <Card
            title="Reported Reason for Emergency Referral"
            subtitle={`Primary Clinical Indication: ${referral.primaryDiagnosis}`}
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded text-[#172B3A] leading-relaxed">
                <span className="font-semibold text-[#A15C00] block mb-1 uppercase tracking-wider text-[11px]">
                  Referring Medical Officer Clinical Report:
                </span>
                {referral.reasonForReferral}
              </div>

              {referral.clinicalSummary && (
                <div>
                  <h4 className="font-semibold text-[#163A5F] mb-1">Clinical Assessment & Management at Source:</h4>
                  <p className="text-[#5B6875] leading-relaxed">{referral.clinicalSummary}</p>
                </div>
              )}

              {/* Decline Reason Banner if declined */}
              {referral.declineReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-[#B42318]">
                  <span className="font-semibold block mb-0.5 uppercase tracking-wider text-[11px]">
                    Official Decline Reason (Declined by {referral.declinedBy || "Receiving Specialist"}):
                  </span>
                  {referral.declineReason}
                </div>
              )}

              {/* Additional info requested notice if any */}
              {referral.additionalInfoRequested && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-[#1D4ED8]">
                  <span className="font-semibold block mb-0.5 uppercase tracking-wider text-[11px]">
                    Additional Clinical Information Query:
                  </span>
                  {referral.additionalInfoRequested}
                </div>
              )}
            </div>
          </Card>

          {/* Recorded Vitals & Observations */}
          <Card title="Recorded Maternal / Patient Physiological Vitals" subtitle="Captured at referring facility during emergency triage">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <div className="text-[11px] text-[#5B6875]">Blood Pressure</div>
                <div className={`text-base font-bold mt-1 ${referral.vitals.bpSystolic >= 160 ? "text-[#B42318]" : "text-[#163A5F]"}`}>
                  {referral.vitals.bpSystolic} / {referral.vitals.bpDiastolic}
                </div>
                <div className="text-[10px] text-[#5B6875] mt-0.5">mmHg</div>
              </div>

              <div className="p-3 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <div className="text-[11px] text-[#5B6875]">Heart Rate</div>
                <div className={`text-base font-bold mt-1 ${referral.vitals.heartRate > 110 ? "text-[#B42318]" : "text-[#163A5F]"}`}>
                  {referral.vitals.heartRate}
                </div>
                <div className="text-[10px] text-[#5B6875] mt-0.5">bpm</div>
              </div>

              <div className="p-3 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <div className="text-[11px] text-[#5B6875]">Oxygen Saturation (SpO2)</div>
                <div className={`text-base font-bold mt-1 ${referral.vitals.spO2 < 94 ? "text-[#B42318]" : "text-[#18794E]"}`}>
                  {referral.vitals.spO2}%
                </div>
                <div className="text-[10px] text-[#5B6875] mt-0.5">Room air / O2</div>
              </div>

              <div className="p-3 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <div className="text-[11px] text-[#5B6875]">Temperature</div>
                <div className="text-base font-bold text-[#163A5F] mt-1">
                  {referral.vitals.temperatureF}&deg;F
                </div>
                <div className="text-[10px] text-[#5B6875] mt-0.5">Axillary</div>
              </div>
            </div>

            {referral.vitals.fetalHeartRate && (
              <div className="mt-3 p-2.5 rounded bg-blue-50/60 border border-blue-200/60 flex items-center justify-between text-xs text-[#1D4ED8]">
                <span>Fetal Heart Sound (FHR): <strong>{referral.vitals.fetalHeartRate} bpm</strong> (Doppler auscultated)</span>
                <span>Normal baseline (110 - 160 bpm)</span>
              </div>
            )}
          </Card>

          {/* Mother Demographics & RCH History */}
          <Card title="Mother & Obstetric History" subtitle={`RCH ID: ${referral.mother.rchId}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-[#E5EAF0]">
                  <span className="text-[#5B6875]">Full Name:</span>
                  <span className="font-semibold text-[#172B3A]">{referral.mother.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5EAF0]">
                  <span className="text-[#5B6875]">Age:</span>
                  <span className="font-medium text-[#172B3A]">{referral.mother.age} years</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5EAF0]">
                  <span className="text-[#5B6875]">Blood Group:</span>
                  <span className="font-bold text-[#B42318]">{referral.mother.bloodGroup}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5EAF0]">
                  <span className="text-[#5B6875]">Obstetric Gravida / Para:</span>
                  <span className="font-medium text-[#172B3A]">Gravida {referral.mother.gravida}, Para {referral.mother.para}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5EAF0]">
                  <span className="text-[#5B6875]">Gestational Age:</span>
                  <span className="font-semibold text-[#163A5F]">{referral.mother.gestationalWeeks} Weeks</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-[#E5EAF0]">
                  <span className="text-[#5B6875]">Village / Ward:</span>
                  <span className="font-medium text-[#172B3A]">{referral.mother.villageTown}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5EAF0]">
                  <span className="text-[#5B6875]">Patient Contact:</span>
                  <span className="font-mono text-[#172B3A]">{referral.mother.contactPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5EAF0]">
                  <span className="text-[#5B6875]">Accompanying ASHA:</span>
                  <span className="font-medium text-[#172B3A]">{referral.mother.ashaName || "Assigned ASHA"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5EAF0]">
                  <span className="text-[#5B6875]">ASHA Helpline:</span>
                  <span className="font-mono text-[#172B3A]">{referral.mother.ashaContact || "Available via PHC"}</span>
                </div>
              </div>
            </div>

            {/* High-Risk Conditions Chips */}
            {referral.mother.highRiskConditions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#E5EAF0]">
                <span className="text-[11px] font-semibold text-[#5B6875] uppercase tracking-wider block mb-2">
                  High-Risk Obstetric Indicators:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {referral.mother.highRiskConditions.map((cond, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      {cond}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Newborn Card if applicable */}
          {referral.newborn && (
            <Card title="Newborn Clinical Profile" subtitle={`Newborn ID: ${referral.newborn.id}`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                  <div className="text-[11px] text-[#5B6875]">Gender</div>
                  <div className="text-sm font-bold text-[#163A5F] mt-1">{referral.newborn.gender}</div>
                </div>
                <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                  <div className="text-[11px] text-[#5B6875]">Birth Weight</div>
                  <div className="text-sm font-bold text-amber-700 mt-1">{referral.newborn.birthWeightGrams} g</div>
                </div>
                <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                  <div className="text-[11px] text-[#5B6875]">APGAR (1m / 5m)</div>
                  <div className="text-sm font-bold text-[#163A5F] mt-1">
                    {referral.newborn.apgarScore1Min ?? "-"} / {referral.newborn.apgarScore5Min ?? "-"}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                  <div className="text-[11px] text-[#5B6875]">Gestational Age</div>
                  <div className="text-sm font-bold text-[#163A5F] mt-1">{referral.newborn.gestationalAgeWeeks} Weeks</div>
                </div>
              </div>

              {referral.newborn.clinicalConditions.length > 0 && (
                <div className="mt-3 pt-2">
                  <span className="text-[11px] font-semibold text-[#5B6875] block mb-1">Neonatal Complications:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {referral.newborn.clinicalConditions.map((cond, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-900 border border-amber-200">
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Column: Transport, Facilities & Timeline */}
        <div className="space-y-6">
          {/* Transport / Ambulance Status Card */}
          <Card
            title="Transport & Emergency Ambulance"
            subtitle={referral.transportRequired ? "108 Service Requested" : "Self-arranged"}
            action={
              canAssignAmbulance && (
                <Button variant="primary" size="sm" onClick={() => setShowAssignAmbulanceModal(true)}>
                  Assign Vehicle
                </Button>
              )
            }
          >
            {referral.transportRequired ? (
              <div className="space-y-3 text-xs">
                {referral.assignedAmbulanceId ? (
                  <>
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded">
                      <div className="flex items-center justify-between font-bold text-[#163A5F]">
                        <span>{referral.ambulanceRegistration}</span>
                        <span className="text-[10px] bg-blue-100 text-[#1D4ED8] px-1.5 py-0.5 rounded font-semibold">
                          {referral.ambulanceType}
                        </span>
                      </div>
                      <div className="text-[#5B6875] mt-1">
                        Driver: <strong>{referral.driverName}</strong> ({referral.driverPhone})
                      </div>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#E5EAF0]">
                      <span className="text-[#5B6875]">Trip Stage:</span>
                      <span className="font-semibold text-[#1D4ED8]">
                        {referral.tripStage?.replace(/_/g, " ") || "Dispatched"}
                      </span>
                    </div>

                    {referral.estimatedArrivalMinutes && (
                      <div className="flex justify-between py-1 border-b border-[#E5EAF0]">
                        <span className="text-[#5B6875]">Estimated Arrival:</span>
                        <span className="font-bold text-[#18794E]">
                          ~{referral.estimatedArrivalMinutes} minutes
                        </span>
                      </div>
                    )}

                    <div className="pt-2">
                      <Link href="/ambulances">
                        <Button variant="navy" size="sm" className="w-full">
                          Track on Ambulance Operations Map
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 space-y-2">
                    <p className="font-semibold text-xs">No Ambulance Assigned Yet</p>
                    <p className="text-[11px] text-[#5B6875]">
                      This referral requires government emergency transport. 108 Dispatchers have been alerted to mobilize a vehicle.
                    </p>
                    {isDispatcher && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => setShowAssignAmbulanceModal(true)}
                      >
                        Dispatch Available Ambulance Now
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#5B6875]">
                Patient arrived via local private transport or walking transfer.
              </p>
            )}
          </Card>

          {/* Facility Contact Details */}
          <Card title="Facilities in Workflow">
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <div className="text-[10px] uppercase font-bold text-[#5B6875]">Referring Facility</div>
                <div className="font-semibold text-sm text-[#163A5F] mt-0.5">{referral.referringFacilityName}</div>
                <div className="text-[#5B6875] text-[11px]">{referral.referringFacilityType}</div>
                <div className="text-[#172B3A] mt-1">
                  Doctor: <strong>{referral.referringDoctorName}</strong> ({referral.referringDoctorPhone})
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <div className="text-[10px] uppercase font-bold text-[#5B6875]">Receiving Facility</div>
                <div className="font-semibold text-sm text-[#163A5F] mt-0.5">{referral.receivingFacilityName}</div>
                <div className="text-[#5B6875] text-[11px]">{referral.receivingFacilityType}</div>
                {referral.acceptedBy && (
                  <div className="text-emerald-700 font-medium mt-1">
                    Accepted by: {referral.acceptedBy}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Audit Event Timeline */}
          <Card title="Case Audit Timeline" subtitle={`${referral.timeline.length} Recorded Milestone Events`}>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D9E0E7]">
              {referral.timeline.map((event) => (
                <div key={event.id} className="relative text-xs">
                  <span
                    className={`absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      event.severity === "critical"
                        ? "bg-[#B42318]"
                        : event.severity === "success"
                        ? "bg-[#18794E]"
                        : event.severity === "warning"
                        ? "bg-[#A15C00]"
                        : "bg-[#1D4ED8]"
                    }`}
                  />
                  <div className="font-semibold text-[#163A5F]">{event.title}</div>
                  <div className="text-[11px] text-[#5B6875] mt-0.5">
                    {event.actorName} &bull; {event.actorRole}
                  </div>
                  <div className="text-[10px] text-[#5B6875] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(event.timestamp).toLocaleString("en-IN")}
                  </div>
                  {event.notes && (
                    <div className="mt-1 p-2 bg-[#F8FAFC] border border-[#E5EAF0] rounded text-[11px] text-[#172B3A]">
                      {event.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Accept Modal */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="Confirm Referral Acceptance"
        description="Formal clinical confirmation that the receiving hospital will admit and manage this case"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAcceptModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleAccept} isLoading={actionLoading}>
              Confirm Acceptance
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-[#5B6875] leading-relaxed">
            By accepting, you confirm that a labour bed, surgical team, or neonatal warmer is allocated at{" "}
            <strong>{referral.receivingFacilityName}</strong>.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              Internal Preparedness Notes (Optional):
            </label>
            <textarea
              rows={3}
              value={acceptNotes}
              onChange={(e) => setAcceptNotes(e.target.value)}
              placeholder="e.g. Bed #2 reserved in high-dependency unit. Blood bank notified for 2 units O+ PRBC."
              className="w-full p-2.5 text-xs border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#18794E]"
            />
          </div>
        </div>
      </Modal>

      {/* Decline Modal */}
      <Modal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        title="Decline Referral (Mandatory Clinical Reason Required)"
        description="Under government maternal health protocol, all declines must state legitimate capacity or clinical reasons"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeclineModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDecline} isLoading={actionLoading}>
              Confirm Decline
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {declineError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-[#B42318] text-xs rounded">
              {declineError}
            </div>
          )}
          <p className="text-xs text-[#5B6875] leading-relaxed">
            Please enter the official clinical justification (e.g., zero NICU warmers available, blood storage outage, or advise rerouting to Tertiary Medical College).
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              Mandatory Reason for Decline: *
            </label>
            <textarea
              rows={3}
              required
              value={declineReason}
              onChange={(e) => {
                setDeclineReason(e.target.value);
                setDeclineError("");
              }}
              placeholder="e.g. Zero NICU warmers available today. Please reroute immediately to Tertiary Medical College where 5 beds are open."
              className="w-full p-2.5 text-xs border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#B42318]"
            />
          </div>
        </div>
      </Modal>

      {/* Request Info Modal */}
      <Modal
        isOpen={showRequestInfoModal}
        onClose={() => setShowRequestInfoModal(false)}
        title="Request Additional Clinical Information"
        description="Send an urgent clinical inquiry to the referring Medical Officer"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRequestInfoModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="navy" onClick={handleRequestInfo} isLoading={actionLoading}>
              Send Inquiry
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              Inquiry / Missing Clinical Observation:
            </label>
            <textarea
              rows={3}
              value={infoQuery}
              onChange={(e) => setInfoQuery(e.target.value)}
              placeholder="e.g. Please confirm if second dose of MgSO4 was given, and current reflex status."
              className="w-full p-2.5 text-xs border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
        </div>
      </Modal>

      {/* Confirm Arrival Modal */}
      <Modal
        isOpen={showArrivalModal}
        onClose={() => setShowArrivalModal(false)}
        title="Confirm Patient Arrival at Hospital"
        description="Acknowledge that patient and ambulance have reached hospital emergency triage"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowArrivalModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="navy" onClick={handleConfirmArrival} isLoading={actionLoading}>
              Confirm Arrival
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#5B6875] leading-relaxed">
          Confirming arrival logs the hospital triage timestamp, alerts the on-duty emergency obstetrician, and prompts the clinical handover workflow.
        </p>
      </Modal>

      {/* Handover Modal */}
      <Modal
        isOpen={showHandoverModal}
        onClose={() => setShowHandoverModal(false)}
        title="Record Clinical Handover and Next Steps"
        description="Formal transfer of care from transport EMT to inpatient Obstetric / Neonatal unit"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowHandoverModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleHandover} isLoading={actionLoading}>
              Finalize Handover & Complete
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-[#5B6875] leading-relaxed">
            Completing handover releases the assigned 108 ambulance back to available status and marks this referral as completed.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              Handover Disposition & Initial Care Unit:
            </label>
            <textarea
              rows={3}
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              placeholder="e.g. Transferred to Emergency Operation Theatre for immediate LSCS. Vitals recorded stable upon reception."
              className="w-full p-2.5 text-xs border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#18794E]"
            />
          </div>
        </div>
      </Modal>

      {/* Dispatch Ambulance Modal (For Dispatchers) */}
      <Modal
        isOpen={showAssignAmbulanceModal}
        onClose={() => setShowAssignAmbulanceModal(false)}
        title="Dispatch 108 Emergency Ambulance"
        description="Assign an authorized emergency vehicle and driver to this maternal/infant transfer"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAssignAmbulanceModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssignAmbulance} isLoading={actionLoading}>
              Confirm Dispatch
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#5B6875]">
            Select an available vehicle from the district telematics fleet:
          </p>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {ambulances.map((amb) => (
              <label
                key={amb.id}
                className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition-colors ${
                  selectedAmbulanceId === amb.id
                    ? "border-[#1D4ED8] bg-blue-50"
                    : "border-[#D9E0E7] bg-[#F8FAFC] hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="ambulanceChoice"
                    checked={selectedAmbulanceId === amb.id}
                    onChange={() => setSelectedAmbulanceId(amb.id)}
                    className="text-[#1D4ED8]"
                  />
                  <div>
                    <div className="font-bold text-[#163A5F]">
                      {amb.registrationNumber} ({amb.type})
                    </div>
                    <div className="text-[11px] text-[#5B6875]">
                      Driver: {amb.driverName} ({amb.driverPhone})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      amb.status === "AVAILABLE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {amb.status.replace(/_/g, " ")}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

export default function ReferralDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#163A5F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#5B6875]">Loading referral dossier...</p>
          </div>
        </div>
      }
    >
      <ReferralDetailContent />
    </React.Suspense>
  );
}
