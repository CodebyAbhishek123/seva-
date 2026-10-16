export type UserRole = "hospital" | "dispatcher" | "admin" | "asha";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  facilityId?: string;
  facilityName?: string;
  phone: string;
  lastLogin?: string;
}

export interface AncVisit {
  id: string;
  visitNumber: 1 | 2 | 3 | 4;
  date: string;
  gestationalWeeks: number;
  weightKg: number;
  bpSystolic: number;
  bpDiastolic: number;
  hemoglobin: number;
  fundalHeightCm?: number;
  fetalHeartRate?: number;
  urineAlbumin?: "NIL" | "TRACE" | "1+" | "2+" | "3+";
  ifaTabletsGiven: number;
  calciumTabletsGiven: number;
  ttDose?: "TT1" | "TT2" | "BOOSTER" | "NONE";
  highRiskIdentified?: boolean;
  notes?: string;
}

export interface AshaMotherRecord {
  id: string;
  rchId: string;
  name: string;
  husbandName: string;
  age: number;
  contactPhone: string;
  village: string;
  wardNumber: string;
  gravida: number;
  para: number;
  bloodGroup: string;
  lmpDate: string;
  eddDate: string;
  gestationalWeeks: number;
  isHighRisk: boolean;
  highRiskReasons: string[];
  currentVitals: {
    bpSystolic: number;
    bpDiastolic: number;
    hemoglobin: number;
    weightKg: number;
    fetalHeartRate?: number;
  };
  ancVisits: AncVisit[];
  immunizationStatus: {
    tt1: boolean;
    tt2: boolean;
    booster: boolean;
  };
  tabletsIssued: {
    ifaCount: number;
    calciumCount: number;
  };
  assignedAshaId: string;
  assignedAshaName: string;
  activeReferralId?: string;
  deliveryStatus: "PREGNANT" | "DELIVERED" | "TRANSFERRED";
  deliveryDetails?: {
    date: string;
    facilityName: string;
    deliveryType: "NORMAL" | "C_SECTION" | "ASSISTED";
    outcome: "HEALTHY" | "SNCU_ADMISSION" | "COMPLICATIONS";
    jsyIncentiveStatus: "PENDING" | "APPROVED" | "DISBURSED";
  };
  registeredDate: string;
}

export type UrgencyLevel = "CRITICAL" | "HIGH" | "NORMAL";

export type ReferralStatus =
  | "NEW"
  | "NEEDS_REVIEW"
  | "ACCEPTED"
  | "DECLINED"
  | "AMBULANCE_ASSIGNED"
  | "PATIENT_ONBOARD"
  | "ARRIVED"
  | "COMPLETED";

export interface ClinicalVitals {
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  respiratoryRate: number;
  spO2: number;
  temperatureF: number;
  fetalHeartRate?: number;
  bloodSugar?: number;
}

export interface MotherInfo {
  id: string;
  name: string;
  age: number;
  rchId: string; // Reproductive and Child Health ID
  gravida: number;
  para: number;
  gestationalWeeks: number;
  bloodGroup: string;
  highRiskConditions: string[];
  contactPhone: string;
  villageTown: string;
  ashaName?: string;
  ashaContact?: string;
}

export interface NewbornInfo {
  id: string;
  gender: "MALE" | "FEMALE" | "AMBIGUOUS";
  birthWeightGrams?: number;
  apgarScore1Min?: number;
  apgarScore5Min?: number;
  gestationalAgeWeeks?: number;
  clinicalConditions: string[];
}

export interface ReferralTimelineEvent {
  id: string;
  stage: string;
  title: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  notes?: string;
  severity?: "info" | "warning" | "success" | "critical";
}

export interface Referral {
  id: string; // e.g. "REF-2026-0842"
  mother: MotherInfo;
  newborn?: NewbornInfo;
  referralType: "MATERNAL" | "NEONATAL" | "COMBINED";
  status: ReferralStatus;
  urgency: UrgencyLevel;
  primaryDiagnosis: string;
  reasonForReferral: string;
  clinicalSummary: string;
  vitals: ClinicalVitals;
  
  // Facilities
  referringFacilityId: string;
  referringFacilityName: string;
  referringFacilityType: string;
  referringDoctorName: string;
  referringDoctorPhone: string;

  receivingFacilityId: string;
  receivingFacilityName: string;
  receivingFacilityType: string;
  
  // Transport details
  transportRequired: boolean;
  assignedAmbulanceId?: string;
  ambulanceRegistration?: string;
  ambulanceType?: "BLS" | "ALS" | "NEONATAL_ICU";
  driverName?: string;
  driverPhone?: string;
  tripStage?: TripStage;
  estimatedArrivalMinutes?: number;

  // Decision details
  acceptedAt?: string;
  acceptedBy?: string;
  declinedAt?: string;
  declinedBy?: string;
  declineReason?: string;
  additionalInfoRequested?: string;
  arrivalConfirmedAt?: string;
  handoverCompletedAt?: string;
  handoverNotes?: string;

  createdAt: string;
  updatedAt: string;
  timeline: ReferralTimelineEvent[];
}

export type TripStage =
  | "DISPATCHED"
  | "EN_ROUTE_PICKUP"
  | "PATIENT_ONBOARD"
  | "EN_ROUTE_HOSPITAL"
  | "ARRIVED"
  | "HANDOVER_COMPLETED";

export interface Ambulance {
  id: string; // e.g. "AMB-108-01"
  registrationNumber: string; // e.g. "DL-01-AB-108"
  type: "BLS" | "ALS" | "NEONATAL_ICU";
  baseStation: string;
  status: "AVAILABLE" | "EN_ROUTE_PICKUP" | "PATIENT_ONBOARD" | "EN_ROUTE_HOSPITAL" | "ARRIVED" | "MAINTENANCE";
  driverName: string;
  driverPhone: string;
  paramedicName: string;
  assignedReferralId?: string;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  destinationFacilityId?: string;
  destinationFacilityName?: string;
  lastGpsUpdate: string;
  equipment: {
    oxygenCylinder: boolean;
    transportVentilator: boolean;
    infantIncubator: boolean;
    suctionApparatus: boolean;
    defibrillator: boolean;
  };
  isGpsStale?: boolean; // If last update > 10 mins
}

export type FacilityLevel =
  | "PRIMARY_HEALTH_CENTRE"
  | "COMMUNITY_HEALTH_CENTRE"
  | "SUB_DISTRICT_HOSPITAL"
  | "DISTRICT_HOSPITAL"
  | "TERTIARY_MEDICAL_COLLEGE";

export interface FacilityReadiness {
  labourBedsAvailable: number;
  labourBedsTotal: number;
  sncuWarmerAvailable: number;
  sncuWarmerTotal: number;
  nicuBedsAvailable: number;
  nicuBedsTotal: number;
  bloodUnits: {
    aPositive: number;
    bPositive: number;
    oPositive: number;
    abPositive: number;
    oNegative: number;
  };
  bloodBankOperational: boolean;
  emergencyOtReady: boolean;
  gynecologistOnDuty: boolean;
  pediatricianOnDuty: boolean;
  anaesthetistOnDuty: boolean;
  lastUpdated: string;
  updatedBy: string;
  dataFreshness: "FRESH" | "EXPIRING_SOON" | "STALE" | "UNKNOWN";
}

export interface Facility {
  id: string; // e.g. "FAC-DH-01"
  verifiedIdentifier: string; // e.g. "MOHFW-DL-00109"
  name: string;
  level: FacilityLevel;
  district: string;
  state: string;
  pincode: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  nodalOfficerName: string;
  contactPhone: string;
  emergencyHelpline: string;
  isVerified: boolean;
  hasCSectionCapability: boolean;
  hasSNCU: boolean;
  hasNICU: boolean;
  hasBloodBank: boolean;
  readiness: FacilityReadiness;
  updatedAt: string;
}

export interface ActivityEvent {
  id: string;
  referralId?: string;
  eventType:
    | "REFERRAL_CREATED"
    | "REFERRAL_UNDER_REVIEW"
    | "REFERRAL_ACCEPTED"
    | "REFERRAL_DECLINED"
    | "ADDITIONAL_INFO_REQUESTED"
    | "AMBULANCE_ASSIGNED"
    | "TRIP_STAGE_UPDATED"
    | "PATIENT_ONBOARD"
    | "ARRIVAL_CONFIRMED"
    | "CLINICAL_HANDOVER_COMPLETED"
    | "READINESS_UPDATED"
    | "SECURITY_LOGIN";
  title: string;
  description: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
  dispatchChannels: {
    inApp: boolean;
    smsDelivered: boolean;
    ivrTriggered: boolean;
  };
}

export interface SystemAuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  timestamp: string;
  status: "SUCCESS" | "DENIED" | "FAILURE";
  metadata?: Record<string, unknown>;
}
