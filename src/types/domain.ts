export type Role = "patient" | "doctor" | "hospital_admin" | "super_admin" | "emergency_staff" | "laboratory";
export type Screen = "onboarding" | "signin" | "patient" | "records" | "sharing" | "emergency" | "emergency-card" | "symptoms" | "hospital-finder" | "audit" | "profile" | "hospital" | "doctor" | "admin" | "laboratory";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  hospitalId?: string;
  patientId?: string;
}

export interface Hospital {
  _id?: string;
  id: string;
  name: string;
  status: "approved" | "pending" | "suspended";
  city: string;
  state?: string;
  specialties: string[];
}

export interface RecordItem {
  _id?: string;
  id: string;
  title: string;
  type: string;
  date: string;
  recordDate?: string;
  summary: string;
  critical?: boolean;
}

export interface PatientProfile {
  _id?: string;
  id: string;
  fullName: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContact: string | { name?: string; relationship?: string; phone?: string };
  connectedHospitalIds: string[];
  hospitalIds?: Hospital[];
  emergencyCode?: string;
  emergencyAccessEnabled: boolean;
}

export interface ConsentShare {
  _id?: string;
  id: string;
  toHospitalId: string;
  scopes: string[];
  status: "active" | "revoked" | "expired";
  expiresAt?: string;
}

export interface Laboratory {
  _id?: string;
  id: string;
  labName: string;
  status: "approved" | "pending" | "suspended";
  certificationNumber: string;
  department: string;
  hospitalId?: string;
  hospitalName?: string;
  testCapabilities: string[];
  isActive: boolean;
  isStandalone: boolean;
}

export interface AuditLog {
  _id?: string;
  id: string;
  actorRole: Role | "system";
  action: string;
  createdAt: string;
  emergency?: boolean;
}

export interface PatientDashboard {
  profile: PatientProfile;
  records: RecordItem[];
  labResults: Array<{ _id: string; testName: string; result: string; status: string; collectedAt: string }>;
  prescriptions: Array<{ _id: string; medication: string; dosage: string; frequency: string; active: boolean }>;
  appointments: Array<{ _id: string; reason: string; scheduledAt: string; status: string }>;
  shares: ConsentShare[];
  auditLogs: AuditLog[];
  uploads: Array<{ _id: string; fileName: string; provider: string; category: string }>;
}
