export type Role = "patient" | "doctor" | "hospital_admin" | "super_admin" | "emergency_staff" | "laboratory";
export type Screen = "onboarding" | "role-select" | "signin" | "signup" | "patient" | "records" | "sharing" | "emergency" | "emergency-card" | "emergency-cases" | "symptoms" | "hospital-finder" | "audit" | "profile" | "hospital" | "doctor" | "admin" | "laboratory" | "ai-chat" | "notifications" | "patient-appointments" | "doctor-appointments" | "doctor-patients" | "doctor-messages" | "doctor-profile" | "hospital-staff" | "hospital-patients" | "hospital-appointments" | "hospital-profile" | "admin-users" | "admin-hospitals" | "admin-operations" | "admin-profile" | "laboratory-requests" | "laboratory-results" | "laboratory-patients" | "laboratory-profile" | "emergency-dashboard" | "emergency-requests" | "emergency-notifications" | "emergency-profile";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  hospitalId?: string;
  patientId?: string;
  phone?: string;
  avatarUrl?: string;
  notificationPreferences?: NotificationPreferences;
  emergencyProfile?: EmergencyProfile;
  doctorProfile?: DoctorRoleProfile;
  labProfile?: Laboratory;
  hospitalProfile?: Hospital;
  patientProfile?: PatientProfile;
}

export interface NotificationPreferences {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  clinicalAlerts?: boolean;
  appointmentReminders?: boolean;
  appointments?: boolean;
  labResults?: boolean;
  emergencyAlerts?: boolean;
  marketing?: boolean;
}

export interface EmergencyProfile {
  organizationName?: string;
  serviceArea?: string;
  certificationNumber?: string;
  dispatchContact?: string;
}

export interface Hospital {
  _id?: string;
  id: string;
  name: string;
  status: "approved" | "pending" | "suspended";
  city: string;
  state?: string;
  address?: string;
  contactEmail?: string;
  specialties: string[];
}

export interface RecordItem {
  _id?: string;
  id: string;
  title: string;
  type: string;
  hospitalId?: string;
  date: string;
  recordDate?: string;
  summary: string;
  critical?: boolean;
}

export interface PatientProfile {
  _id?: string;
  id: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
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
  status?: "approved" | "pending" | "suspended";
  certificationNumber: string;
  department: string;
  hospitalId?: string;
  hospitalName?: string;
  testCapabilities: string[];
  isActive: boolean;
  isStandalone: boolean;
}

export interface DoctorProfile {
  _id?: string;
  userId: string;
  hospitalId?: string;
  specialty: string;
  licenseNumber: string;
  department: string;
  acceptingAppointments?: boolean;
  availability?: Array<{ day: string; start: string; end: string }>;
  availabilityText?: string;
  hospitalAffiliation?: string;
}

export interface DoctorRoleProfile {
  specialty?: string;
  licenseNumber?: string;
  department?: string;
  availability?: string;
  acceptingAppointments?: boolean;
  hospitalAffiliation?: string;
}

export type AppointmentStatus = "requested" | "scheduled" | "accepted" | "completed" | "cancelled" | "rejected" | "reschedule_requested";

export interface Appointment {
  _id: string;
  id?: string;
  patientId?: string;
  hospitalId?: string;
  doctorId?: string;
  reason: string;
  scheduledAt: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface Prescription { _id: string; medication: string; dosage: string; frequency: string; active: boolean; startDate?: string; }
export interface NotificationItem { _id: string; title: string; body: string; type: string; readAt?: string; createdAt: string; }
export interface MessageItem { _id: string; body: string; senderUserId: string; createdAt: string; }
export interface AuditLog {
  _id?: string;
  id: string;
  actorRole: Role | "system";
  action: string;
  createdAt: string;
  emergency?: boolean;
}

export type LabRequestStatus = "requested" | "accepted" | "in_progress" | "completed" | "rejected" | "cancelled";

export interface LabRequest {
  _id: string;
  id?: string;
  patientId: string | { _id?: string; id?: string; fullName?: string; bloodGroup?: string };
  hospitalId: string | { _id?: string; id?: string; name?: string; city?: string; state?: string };
  laboratoryId?: string | { _id?: string; id?: string; labName?: string };
  testName: string;
  priority: "routine" | "urgent" | "stat";
  clinicalNotes?: string;
  notes?: string;
  status: LabRequestStatus;
  rejectionReason?: string;
  resultSummary?: string;
  dueAt?: string;
  createdAt?: string;
}

export interface EmergencyCase {
  _id?: string;
  id: string;
  patientId: string | { _id?: string; id?: string; fullName?: string; bloodGroup?: string; emergencyContact?: PatientProfile["emergencyContact"] };
  hospitalId?: string | { _id?: string; id?: string; name?: string; city?: string; state?: string };
  assignedUserId?: string | { _id?: string; id?: string; name?: string; email?: string; role?: Role };
  assignedServiceId?: string | { _id?: string; id?: string; name?: string; city?: string; state?: string };
  assignedResponderId?: string | { _id?: string; id?: string; name?: string; email?: string; role?: Role };
  assignedStaffUserIds?: Array<string | { _id?: string; id?: string; name?: string; email?: string; role?: Role }>;
  chiefComplaint?: string;
  reason?: string;
  location?: string;
  severity?: "low" | "medium" | "high" | "critical";
  priority?: "low" | "medium" | "high" | "critical";
  status: "requested" | "triaged" | "assigned" | "in_progress" | "dispatched" | "en_route" | "arrived" | "resolved" | "cancelled" | "active";
  dispatchStatus?: "unassigned" | "assigned" | "dispatched" | "arrived" | "cleared";
  notes?: string;
  dispatchNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminOperations {
  statistics: {
    totalUsers: number;
    activeUsers: number;
    hospitals: number;
    pendingApprovals: number;
    appointmentsByStatus: Array<{ _id: string; count: number }>;
    emergencyCasesByStatus: Array<{ _id: string; count: number }>;
    labRequestsByStatus: Array<{ _id: string; count: number }>;
  };
  pendingApprovals: { hospitals: Hospital[]; laboratories: Laboratory[] };
  users: User[];
  hospitals: Hospital[];
  appointments: Array<{ _id: string; reason: string; scheduledAt: string; status: string; patientId?: { fullName?: string }; hospitalId?: { name?: string } }>;
}

export interface LabResult {
  _id: string;
  requestId?: string;
  patientId?: string;
  hospitalId?: string;
  laboratoryId?: string;
  testName: string;
  result: string;
  unit?: string;
  referenceRange?: string;
  status: "normal" | "abnormal" | "critical";
  collectedAt: string;
}

export interface PatientDashboard {
  profile: PatientProfile;
  records: RecordItem[];
  labResults: LabResult[];
  prescriptions: Array<{ _id: string; medication: string; dosage: string; frequency: string; active: boolean }>;
  appointments: Appointment[];
  shares: ConsentShare[];
  auditLogs: AuditLog[];
  uploads: Array<{ _id: string; fileName: string; provider: string; category: string }>;
}

export interface AccountProfilePayload {
  account?: User;
  patientProfile?: PatientProfile;
  doctorProfile?: DoctorProfile;
  labProfile?: Laboratory;
  hospitalProfile?: Hospital;
}

export interface WorkspacePayload {
  profile: AccountProfilePayload;
  patients: PatientProfile[];
  staff: User[];
  doctors: DoctorProfile[];
  appointments: Appointment[];
  records: RecordItem[];
  labResults: LabResult[];
  prescriptions: Prescription[];
  notifications: NotificationItem[];
  messages: MessageItem[];
  hospitals: Hospital[];
  laboratories: Laboratory[];
}
