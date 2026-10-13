import {
  Referral,
  Facility,
  Ambulance,
  MotherInfo,
  NewbornInfo,
  TripStage,
  FacilityReadiness,
  ActivityEvent,
} from "@/types";
import { dataStore } from "./data-store";

// Base API URL configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
export const IS_DEMO_MODE = !process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  isDemoFallback?: boolean;
}

export class MairaApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Helper fetcher with error & timeout handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (!this.baseUrl) {
      // In Demo Mode: Caller should handle or return demo state
      return { isDemoFallback: true };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: `Server error [${response.status}]: ${errorText}` };
      }

      const data = await response.json();
      return { data };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return { error: message, isDemoFallback: true };
    }
  }

  // --- REFERRALS ---
  async getReferrals(statusFilter?: string): Promise<Referral[]> {
    if (this.baseUrl) {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const res = await this.request<Referral[]>(`/api/referrals${query}`);
      if (res.data) return res.data;
    }
    // Demo store fallback
    const all = dataStore.getReferrals();
    if (!statusFilter || statusFilter === "ALL") return all;
    return all.filter((r) => r.status === statusFilter);
  }

  async getReferralById(id: string): Promise<Referral | null> {
    if (this.baseUrl) {
      const res = await this.request<Referral>(`/api/referrals/${id}`);
      if (res.data) return res.data;
    }
    return dataStore.getReferralById(id) || null;
  }

  async createReferral(payload: Partial<Referral>): Promise<Referral> {
    if (this.baseUrl) {
      const res = await this.request<Referral>("/api/referrals", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.data) return res.data;
    }
    const newRef: Referral = {
      id: `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      mother: payload.mother || {
        id: `MOTH-${Date.now()}`,
        name: "Anonymous Patient",
        age: 25,
        rchId: "RCH-PENDING",
        gravida: 1,
        para: 0,
        gestationalWeeks: 38,
        bloodGroup: "Unknown",
        highRiskConditions: [],
        contactPhone: "",
        villageTown: "Local Area",
      },
      referralType: payload.referralType || "MATERNAL",
      status: "NEW",
      urgency: payload.urgency || "NORMAL",
      primaryDiagnosis: payload.primaryDiagnosis || "Pending Triage",
      reasonForReferral: payload.reasonForReferral || "Clinical referral",
      clinicalSummary: payload.clinicalSummary || "Referral created via portal",
      vitals: payload.vitals || {
        bpSystolic: 120,
        bpDiastolic: 80,
        heartRate: 72,
        respiratoryRate: 18,
        spO2: 98,
        temperatureF: 98.6,
      },
      referringFacilityId: payload.referringFacilityId || "FAC-CHC-04",
      referringFacilityName: payload.referringFacilityName || "Community Health Centre",
      referringFacilityType: "Community Health Centre",
      referringDoctorName: payload.referringDoctorName || "Referring MO",
      referringDoctorPhone: payload.referringDoctorPhone || "+91 99999 00000",
      receivingFacilityId: payload.receivingFacilityId || "FAC-DH-01",
      receivingFacilityName: payload.receivingFacilityName || "District Women's Hospital",
      receivingFacilityType: "District Hospital",
      transportRequired: payload.transportRequired ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: `ev-${Date.now()}`,
          stage: "REFERRAL_CREATED",
          title: "Referral Created",
          actorName: payload.referringDoctorName || "Referring MO",
          actorRole: "Medical Officer",
          timestamp: new Date().toISOString(),
          notes: "Initial referral recorded in MAIRA system.",
          severity: "info",
        },
      ],
    };
    return dataStore.updateReferral(newRef);
  }

  async acceptReferral(
    id: string,
    actorName: string,
    actorId: string,
    notes?: string
  ): Promise<Referral | null> {
    if (this.baseUrl) {
      const res = await this.request<Referral>(`/api/referrals/${id}/accept`, {
        method: "POST",
        body: JSON.stringify({ actorName, actorId, notes }),
      });
      if (res.data) return res.data;
    }
    return dataStore.acceptReferral(id, actorName, actorId, notes);
  }

  async declineReferral(
    id: string,
    reason: string,
    actorName: string,
    actorId: string
  ): Promise<Referral | null> {
    if (this.baseUrl) {
      const res = await this.request<Referral>(`/api/referrals/${id}/decline`, {
        method: "POST",
        body: JSON.stringify({ reason, actorName, actorId }),
      });
      if (res.data) return res.data;
    }
    return dataStore.declineReferral(id, reason, actorName, actorId);
  }

  async requestAdditionalInfo(
    id: string,
    query: string,
    actorName: string,
    actorId: string
  ): Promise<Referral | null> {
    if (this.baseUrl) {
      const res = await this.request<Referral>(`/api/referrals/${id}/request-info`, {
        method: "POST",
        body: JSON.stringify({ query, actorName, actorId }),
      });
      if (res.data) return res.data;
    }
    return dataStore.requestAdditionalInfo(id, query, actorName, actorId);
  }

  async confirmArrival(
    id: string,
    actorName: string,
    actorId: string
  ): Promise<Referral | null> {
    if (this.baseUrl) {
      const res = await this.request<Referral>(`/api/referrals/${id}/confirm-arrival`, {
        method: "POST",
        body: JSON.stringify({ actorName, actorId }),
      });
      if (res.data) return res.data;
    }
    return dataStore.confirmArrival(id, actorName, actorId);
  }

  async recordHandover(
    id: string,
    handoverNotes: string,
    actorName: string,
    actorId: string
  ): Promise<Referral | null> {
    if (this.baseUrl) {
      const res = await this.request<Referral>(`/api/referrals/${id}/handover`, {
        method: "POST",
        body: JSON.stringify({ handoverNotes, actorName, actorId }),
      });
      if (res.data) return res.data;
    }
    return dataStore.recordHandover(id, handoverNotes, actorName, actorId);
  }

  async assignAmbulance(
    referralId: string,
    ambulanceId: string,
    actorName: string,
    actorId: string
  ): Promise<Referral | null> {
    if (this.baseUrl) {
      const res = await this.request<Referral>(`/api/referrals/${referralId}/assign-ambulance`, {
        method: "POST",
        body: JSON.stringify({ ambulanceId, actorName, actorId }),
      });
      if (res.data) return res.data;
    }
    return dataStore.assignAmbulance(referralId, ambulanceId, actorName, actorId);
  }

  // --- FACILITIES ---
  async getFacilities(): Promise<Facility[]> {
    if (this.baseUrl) {
      const res = await this.request<Facility[]>("/api/facilities");
      if (res.data) return res.data;
    }
    return dataStore.getFacilities();
  }

  async getFacilityById(id: string): Promise<Facility | null> {
    return dataStore.getFacilityById(id) || null;
  }

  async updateFacilityReadiness(
    id: string,
    readinessUpdate: Partial<FacilityReadiness>,
    actorName: string,
    actorId: string
  ): Promise<Facility | null> {
    if (this.baseUrl) {
      const res = await this.request<Facility>(`/api/facilities/${id}/readiness`, {
        method: "POST",
        body: JSON.stringify(readinessUpdate),
      });
      if (res.data) return res.data;
    }
    return dataStore.updateFacilityReadiness(id, readinessUpdate, actorName, actorId);
  }

  // --- AMBULANCES ---
  async getActiveAmbulances(): Promise<Ambulance[]> {
    if (this.baseUrl) {
      const res = await this.request<Ambulance[]>("/api/ambulances/active");
      if (res.data) return res.data;
    }
    return dataStore.getAmbulances();
  }

  async updateTripEvent(
    tripId: string,
    eventStage: TripStage,
    notes?: string
  ): Promise<boolean> {
    if (this.baseUrl) {
      const res = await this.request(`/api/trips/${tripId}/events`, {
        method: "POST",
        body: JSON.stringify({ eventStage, notes }),
      });
      return !res.error;
    }
    return true;
  }

  // --- ACTIVITY ---
  async getActivity(): Promise<ActivityEvent[]> {
    if (this.baseUrl) {
      const res = await this.request<ActivityEvent[]>("/api/activity");
      if (res.data) return res.data;
    }
    return dataStore.getActivity();
  }
}

export const apiClient = new MairaApiClient();
