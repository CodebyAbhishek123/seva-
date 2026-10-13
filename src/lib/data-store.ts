"use client";

import {
  Referral,
  Facility,
  Ambulance,
  ActivityEvent,
  SystemAuditLog,
  User,
  TripStage,
  FacilityReadiness,
} from "@/types";
import {
  MOCK_REFERRALS,
  MOCK_FACILITIES,
  MOCK_AMBULANCES,
  MOCK_ACTIVITY,
  MOCK_AUDIT_LOGS,
  MOCK_USERS,
} from "./mock-data";

const STORAGE_KEYS = {
  REFERRALS: "maira_demo_referrals",
  FACILITIES: "maira_demo_facilities",
  AMBULANCES: "maira_demo_ambulances",
  ACTIVITY: "maira_demo_activity",
  AUDIT: "maira_demo_audit",
};

class DataStore {
  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // --- REFERRALS ---
  getReferrals(): Referral[] {
    if (!this.isBrowser()) return MOCK_REFERRALS;
    const stored = localStorage.getItem(STORAGE_KEYS.REFERRALS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(MOCK_REFERRALS));
      return MOCK_REFERRALS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_REFERRALS;
    }
  }

  getReferralById(id: string): Referral | undefined {
    return this.getReferrals().find((r) => r.id === id);
  }

  updateReferral(updated: Referral): Referral {
    const list = this.getReferrals();
    const index = list.findIndex((r) => r.id === updated.id);
    if (index >= 0) {
      list[index] = { ...updated, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(updated);
    }
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(list));
      window.dispatchEvent(new Event("maira_store_updated"));
    }
    return updated;
  }

  acceptReferral(referralId: string, actorName: string, actorId: string, notes?: string): Referral | null {
    const ref = this.getReferralById(referralId);
    if (!ref) return null;

    const timestamp = new Date().toISOString();
    const updated: Referral = {
      ...ref,
      status: "ACCEPTED",
      acceptedAt: timestamp,
      acceptedBy: actorName,
      updatedAt: timestamp,
      timeline: [
        ...ref.timeline,
        {
          id: `ev-${Date.now()}`,
          stage: "REFERRAL_ACCEPTED",
          title: "Referral Accepted by Receiving Hospital",
          actorName,
          actorRole: "Hospital Specialist",
          timestamp,
          notes: notes || "Bed and clinical team reserved at receiving facility.",
          severity: "success",
        },
      ],
    };

    this.logActivity({
      referralId,
      eventType: "REFERRAL_ACCEPTED",
      title: "Referral Accepted",
      description: `Referral ${referralId} accepted by ${actorName}. Notes: ${notes || "No extra notes"}`,
      actorId,
      actorName,
      actorRole: "hospital",
      timestamp,
      dispatchChannels: { inApp: true, smsDelivered: true, ivrTriggered: false },
    });

    this.logAudit({
      action: "ACCEPT_REFERRAL",
      entityType: "Referral",
      entityId: referralId,
      userId: actorId,
      userName: actorName,
      userRole: "hospital",
      timestamp,
      status: "SUCCESS",
    });

    return this.updateReferral(updated);
  }

  declineReferral(referralId: string, reason: string, actorName: string, actorId: string): Referral | null {
    const ref = this.getReferralById(referralId);
    if (!ref) return null;

    const timestamp = new Date().toISOString();
    const updated: Referral = {
      ...ref,
      status: "DECLINED",
      declinedAt: timestamp,
      declinedBy: actorName,
      declineReason: reason,
      updatedAt: timestamp,
      timeline: [
        ...ref.timeline,
        {
          id: `ev-${Date.now()}`,
          stage: "REFERRAL_DECLINED",
          title: "Referral Declined with Mandatory Clinical Reason",
          actorName,
          actorRole: "Hospital Specialist",
          timestamp,
          notes: reason,
          severity: "warning",
        },
      ],
    };

    this.logActivity({
      referralId,
      eventType: "REFERRAL_DECLINED",
      title: "Referral Declined",
      description: `Referral ${referralId} declined. Reason: ${reason}`,
      actorId,
      actorName,
      actorRole: "hospital",
      timestamp,
      dispatchChannels: { inApp: true, smsDelivered: true, ivrTriggered: true },
    });

    this.logAudit({
      action: "DECLINE_REFERRAL",
      entityType: "Referral",
      entityId: referralId,
      userId: actorId,
      userName: actorName,
      userRole: "hospital",
      timestamp,
      status: "SUCCESS",
      metadata: { reason },
    });

    return this.updateReferral(updated);
  }

  requestAdditionalInfo(referralId: string, query: string, actorName: string, actorId: string): Referral | null {
    const ref = this.getReferralById(referralId);
    if (!ref) return null;

    const timestamp = new Date().toISOString();
    const updated: Referral = {
      ...ref,
      status: "NEEDS_REVIEW",
      additionalInfoRequested: query,
      updatedAt: timestamp,
      timeline: [
        ...ref.timeline,
        {
          id: `ev-${Date.now()}`,
          stage: "ADDITIONAL_INFO_REQUESTED",
          title: "Additional Clinical Information Requested",
          actorName,
          actorRole: "Hospital Specialist",
          timestamp,
          notes: query,
          severity: "warning",
        },
      ],
    };

    this.logActivity({
      referralId,
      eventType: "ADDITIONAL_INFO_REQUESTED",
      title: "Additional Clinical Info Requested",
      description: `Hospital requested info for ${referralId}: "${query}"`,
      actorId,
      actorName,
      actorRole: "hospital",
      timestamp,
      dispatchChannels: { inApp: true, smsDelivered: true, ivrTriggered: false },
    });

    return this.updateReferral(updated);
  }

  confirmArrival(referralId: string, actorName: string, actorId: string): Referral | null {
    const ref = this.getReferralById(referralId);
    if (!ref) return null;

    const timestamp = new Date().toISOString();
    const updated: Referral = {
      ...ref,
      status: "ARRIVED",
      tripStage: "ARRIVED",
      arrivalConfirmedAt: timestamp,
      updatedAt: timestamp,
      timeline: [
        ...ref.timeline,
        {
          id: `ev-${Date.now()}`,
          stage: "ARRIVED",
          title: "Patient Arrival Confirmed at Receiving Hospital",
          actorName,
          actorRole: "Hospital Triage / Emergency MO",
          timestamp,
          notes: "Patient reached triage entrance. Handover procedure initiated.",
          severity: "info",
        },
      ],
    };

    this.logActivity({
      referralId,
      eventType: "ARRIVAL_CONFIRMED",
      title: "Patient Arrival Confirmed",
      description: `Patient arrived at ${ref.receivingFacilityName} for referral ${referralId}`,
      actorId,
      actorName,
      actorRole: "hospital",
      timestamp,
      dispatchChannels: { inApp: true, smsDelivered: false, ivrTriggered: false },
    });

    return this.updateReferral(updated);
  }

  recordHandover(referralId: string, handoverNotes: string, actorName: string, actorId: string): Referral | null {
    const ref = this.getReferralById(referralId);
    if (!ref) return null;

    const timestamp = new Date().toISOString();
    const updated: Referral = {
      ...ref,
      status: "COMPLETED",
      tripStage: "HANDOVER_COMPLETED",
      handoverCompletedAt: timestamp,
      handoverNotes,
      updatedAt: timestamp,
      timeline: [
        ...ref.timeline,
        {
          id: `ev-${Date.now()}`,
          stage: "CLINICAL_HANDOVER_COMPLETED",
          title: "Formal Clinical Handover Completed",
          actorName,
          actorRole: "Receiving Obstetrician / MO",
          timestamp,
          notes: handoverNotes,
          severity: "success",
        },
      ],
    };

    // Free up the assigned ambulance if any
    if (ref.assignedAmbulanceId) {
      this.updateAmbulanceStatus(ref.assignedAmbulanceId, "AVAILABLE", undefined);
    }

    this.logActivity({
      referralId,
      eventType: "CLINICAL_HANDOVER_COMPLETED",
      title: "Clinical Handover Complete",
      description: `Handover finalized for ${referralId}. Transferred to ward/OT.`,
      actorId,
      actorName,
      actorRole: "hospital",
      timestamp,
      dispatchChannels: { inApp: true, smsDelivered: true, ivrTriggered: false },
    });

    return this.updateReferral(updated);
  }

  assignAmbulance(referralId: string, ambulanceId: string, actorName: string, actorId: string): Referral | null {
    const ref = this.getReferralById(referralId);
    const amb = this.getAmbulanceById(ambulanceId);
    if (!ref || !amb) return null;

    const timestamp = new Date().toISOString();
    const updated: Referral = {
      ...ref,
      status: "AMBULANCE_ASSIGNED",
      assignedAmbulanceId: amb.id,
      ambulanceRegistration: amb.registrationNumber,
      ambulanceType: amb.type,
      driverName: amb.driverName,
      driverPhone: amb.driverPhone,
      tripStage: "EN_ROUTE_PICKUP",
      estimatedArrivalMinutes: 15,
      updatedAt: timestamp,
      timeline: [
        ...ref.timeline,
        {
          id: `ev-${Date.now()}`,
          stage: "AMBULANCE_ASSIGNED",
          title: `Ambulance Dispatched: ${amb.registrationNumber}`,
          actorName,
          actorRole: "108 Dispatch Coordinator",
          timestamp,
          notes: `Vehicle type: ${amb.type}, Driver: ${amb.driverName} (${amb.driverPhone})`,
          severity: "info",
        },
      ],
    };

    // Update ambulance
    this.updateAmbulanceStatus(ambulanceId, "EN_ROUTE_PICKUP", referralId, ref.receivingFacilityId, ref.receivingFacilityName);

    this.logActivity({
      referralId,
      eventType: "AMBULANCE_ASSIGNED",
      title: "Ambulance Dispatched",
      description: `Ambulance ${amb.registrationNumber} (${amb.type}) dispatched for referral ${referralId} by ${actorName}`,
      actorId,
      actorName,
      actorRole: "dispatcher",
      timestamp,
      dispatchChannels: { inApp: true, smsDelivered: true, ivrTriggered: true },
    });

    return this.updateReferral(updated);
  }

  // --- AMBULANCES ---
  getAmbulances(): Ambulance[] {
    if (!this.isBrowser()) return MOCK_AMBULANCES;
    const stored = localStorage.getItem(STORAGE_KEYS.AMBULANCES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.AMBULANCES, JSON.stringify(MOCK_AMBULANCES));
      return MOCK_AMBULANCES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_AMBULANCES;
    }
  }

  getAmbulanceById(id: string): Ambulance | undefined {
    return this.getAmbulances().find((a) => a.id === id);
  }

  updateAmbulanceStatus(
    id: string,
    status: Ambulance["status"],
    assignedReferralId?: string,
    destinationFacilityId?: string,
    destinationFacilityName?: string
  ): Ambulance | null {
    const list = this.getAmbulances();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      status,
      assignedReferralId,
      destinationFacilityId: destinationFacilityId ?? list[index].destinationFacilityId,
      destinationFacilityName: destinationFacilityName ?? list[index].destinationFacilityName,
      lastGpsUpdate: new Date().toISOString(),
      isGpsStale: false,
    };

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.AMBULANCES, JSON.stringify(list));
      window.dispatchEvent(new Event("maira_store_updated"));
    }
    return list[index];
  }

  // --- FACILITIES ---
  getFacilities(): Facility[] {
    if (!this.isBrowser()) return MOCK_FACILITIES;
    const stored = localStorage.getItem(STORAGE_KEYS.FACILITIES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(MOCK_FACILITIES));
      return MOCK_FACILITIES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_FACILITIES;
    }
  }

  getFacilityById(id: string): Facility | undefined {
    return this.getFacilities().find((f) => f.id === id);
  }

  updateFacilityReadiness(facilityId: string, readinessUpdate: Partial<FacilityReadiness>, actorName: string, actorId: string): Facility | null {
    const list = this.getFacilities();
    const index = list.findIndex((f) => f.id === facilityId);
    if (index === -1) return null;

    const current = list[index];
    const timestamp = new Date().toISOString();

    const updatedReadiness: FacilityReadiness = {
      ...current.readiness,
      ...readinessUpdate,
      lastUpdated: timestamp,
      updatedBy: actorName,
      dataFreshness: "FRESH",
    };

    list[index] = {
      ...current,
      readiness: updatedReadiness,
      updatedAt: timestamp,
    };

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(list));
      window.dispatchEvent(new Event("maira_store_updated"));
    }

    this.logActivity({
      referralId: facilityId,
      eventType: "READINESS_UPDATED",
      title: "Hospital Readiness Updated",
      description: `${current.name} updated capacity by ${actorName}`,
      actorId,
      actorName,
      actorRole: "hospital",
      timestamp,
      dispatchChannels: { inApp: true, smsDelivered: false, ivrTriggered: false },
    });

    this.logAudit({
      action: "UPDATE_HOSPITAL_READINESS",
      entityType: "FacilityReadiness",
      entityId: facilityId,
      userId: actorId,
      userName: actorName,
      userRole: "hospital",
      timestamp,
      status: "SUCCESS",
    });

    return list[index];
  }

  // --- ACTIVITY & AUDIT ---
  getActivity(): ActivityEvent[] {
    if (!this.isBrowser()) return MOCK_ACTIVITY;
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(MOCK_ACTIVITY));
      return MOCK_ACTIVITY;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_ACTIVITY;
    }
  }

  logActivity(event: Omit<ActivityEvent, "id">): ActivityEvent {
    const list = this.getActivity();
    const newEvent: ActivityEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    list.unshift(newEvent);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(list.slice(0, 100)));
      window.dispatchEvent(new Event("maira_store_updated"));
    }
    return newEvent;
  }

  getAuditLogs(): SystemAuditLog[] {
    if (!this.isBrowser()) return MOCK_AUDIT_LOGS;
    const stored = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(MOCK_AUDIT_LOGS));
      return MOCK_AUDIT_LOGS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_AUDIT_LOGS;
    }
  }

  logAudit(log: Omit<SystemAuditLog, "id" | "ipAddress">): SystemAuditLog {
    const list = this.getAuditLogs();
    const newLog: SystemAuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ipAddress: "10.14.82.11 (Gov Intranet)",
    };
    list.unshift(newLog);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(list.slice(0, 100)));
    }
    return newLog;
  }

  resetDemoData(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(STORAGE_KEYS.REFERRALS);
      localStorage.removeItem(STORAGE_KEYS.FACILITIES);
      localStorage.removeItem(STORAGE_KEYS.AMBULANCES);
      localStorage.removeItem(STORAGE_KEYS.ACTIVITY);
      localStorage.removeItem(STORAGE_KEYS.AUDIT);
      window.dispatchEvent(new Event("maira_store_updated"));
    }
  }
}

export const dataStore = new DataStore();
