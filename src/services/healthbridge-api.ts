import { apiClient } from "./api-client";
import type { AccountProfilePayload, AdminOperations, Appointment, EmergencyCase, LabRequest, LabResult, ConsentShare, Hospital, PatientDashboard, PatientProfile, RecordItem, User, Role, WorkspacePayload } from "../types/domain";

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

type RawHospital = Omit<Hospital, "id"> & { _id: string };
type RawPatient = Omit<PatientProfile, "id" | "connectedHospitalIds"> & { _id: string; hospitalIds?: RawHospital[] | string[] };
type RawRecord = Omit<RecordItem, "id" | "date"> & { _id: string; recordDate?: string; createdAt?: string };
type RawShare = Omit<ConsentShare, "id"> & { _id: string; toHospitalId: string | RawHospital };
type RawEmergencyCase = Omit<EmergencyCase, "id"> & { _id: string };
type RawAppointment = Omit<Appointment, "id" | "hospitalId" | "doctorId"> & { _id: string; hospitalId?: string | RawHospital; doctorId?: string | { _id?: string; id?: string; name?: string } };

const idOf = (value: string | { _id?: string; id?: string } | undefined) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.id ?? value._id ?? "";
};

const normalizeHospital = (hospital: RawHospital): Hospital => ({ ...hospital, id: idOf(hospital) });

const normalizePatient = (patient: RawPatient): PatientProfile => ({
  ...patient,
  id: idOf(patient),
  connectedHospitalIds: ((patient.hospitalIds ?? []) as Array<RawHospital | string>).map((hospital) => idOf(hospital)),
  hospitalIds: ((patient.hospitalIds ?? []) as Array<RawHospital | string>)
    .filter((hospital) => typeof hospital !== "string")
    .map((hospital) => normalizeHospital(hospital))
});

const normalizeRecord = (record: RawRecord): RecordItem => ({
  ...record,
  id: idOf(record),
  date: record.recordDate ?? record.createdAt ?? ""
});

const normalizeShare = (share: RawShare): ConsentShare => ({
  ...share,
  id: idOf(share),
  toHospitalId: idOf(share.toHospitalId as RawHospital | string)
});

const normalizeEmergencyCase = (emergencyCase: RawEmergencyCase): EmergencyCase => ({
  ...emergencyCase,
  id: idOf(emergencyCase)
});

const normalizeAppointment = (appointment: RawAppointment | Appointment): Appointment => ({
  ...appointment,
  id: idOf(appointment),
  hospitalId: idOf(appointment.hospitalId as RawHospital | string | undefined),
  doctorId: idOf(appointment.doctorId as { _id?: string; id?: string } | string | undefined)
});

export const healthbridgeApi = {
  login: (email: string, password: string) =>
    apiClient.request<AuthSession>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  signup: (payload: { name: string; email: string; password: string; hospitalIds: string[]; role?: Role }) =>
    apiClient.request<AuthSession>("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  
  aiChat: (token: string | undefined, messages: { role: "user" | "assistant" | "system"; content: string }[]) =>
    apiClient.request<{ id: string; reply: string }>("/ai/chat", { method: "POST", body: JSON.stringify({ messages }) }, token),

  refresh: (refreshToken: string) =>
    apiClient.request<AuthSession>("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) }),

  me: (token: string) => apiClient.request<User>("/auth/me", {}, token),

  accountProfile: (token: string) => apiClient.request<AccountProfilePayload>("/users/me", {}, token),

  updateAccountProfile: (token: string, payload: Record<string, unknown>) =>
    apiClient.request<AccountProfilePayload>("/users/me", { method: "PATCH", body: JSON.stringify(payload) }, token),

  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    apiClient.request<void>("/users/me/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }, token),

  workspace: (token: string) => apiClient.request<WorkspacePayload>("/users/me/workspace", {}, token),

  notifications: (token: string) => apiClient.request<WorkspacePayload["notifications"]>("/users/me/notifications", {}, token),

  markNotificationRead: (token: string, id: string) => apiClient.request(`/users/me/notifications/${id}/read`, { method: "PATCH" }, token),

  appointments: (token: string) => apiClient.request<WorkspacePayload["appointments"]>("/appointments", {}, token),

  getAppointments: (token: string, patientId?: string) =>
    apiClient.request<RawAppointment[]>(`/appointments${patientId ? `?patientId=${patientId}` : ""}`, {}, token).then((appointments) => appointments.map(normalizeAppointment)),

  createAppointment: (token: string, payload: { patientId?: string; hospitalId?: string; doctorId?: string; reason: string; scheduledAt: string; status?: Appointment["status"]; notes?: string }) =>
    apiClient.request<RawAppointment>("/appointments", { method: "POST", body: JSON.stringify(payload) }, token).then(normalizeAppointment),

  updateAppointment: (token: string, id: string, payload: Partial<Pick<Appointment, "reason" | "scheduledAt" | "status" | "doctorId" | "notes">>) =>
    apiClient.request<RawAppointment>(`/appointments/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token).then(normalizeAppointment),

  hospitals: async () => {
    const hospitals = await apiClient.request<RawHospital[]>("/hospitals");
    return hospitals.map(normalizeHospital);
  },

  patientDashboard: async (token: string): Promise<PatientDashboard> => {
    const data = await apiClient.request<Omit<PatientDashboard, "profile" | "records" | "shares"> & {
      profile: RawPatient;
      records: RawRecord[];
      shares: RawShare[];
      appointments: RawAppointment[];
    }>("/patients/me/dashboard", {}, token);
    return {
      ...data,
      profile: normalizePatient(data.profile),
      records: data.records.map(normalizeRecord),
      appointments: data.appointments.map(normalizeAppointment),
      shares: data.shares.map(normalizeShare)
    };
  },

  hospitalPatients: async (token: string, hospitalId: string) => {
    const patients = await apiClient.request<RawPatient[]>(`/hospitals/${hospitalId}/patients`, {}, token);
    return patients.map(normalizePatient);
  },

  users: (token: string) => apiClient.request<User[]>("/users", {}, token),

  getLabRequests: (token: string, patientId?: string) =>
    apiClient.request<LabRequest[]>(`/lab-results/requests${patientId ? `?patientId=${patientId}` : ""}`, {}, token),

  getLabResults: (token: string, patientId?: string) =>
    apiClient.request<LabResult[]>(`/lab-results${patientId ? `?patientId=${patientId}` : ""}`, {}, token),

  updateLabRequestStatus: (token: string, requestId: string, payload: { status: LabRequest["status"]; rejectionReason?: string; clinicalNotes?: string } | LabRequest["status"], resultSummary?: string) =>
    typeof payload === "string"
      ? apiClient.request<LabRequest>(`/lab-requests/${requestId}/status`, { method: "PATCH", body: JSON.stringify({ status: payload, resultSummary }) }, token)
      : apiClient.request<LabRequest>(`/lab-results/requests/${requestId}/status`, { method: "PATCH", body: JSON.stringify(payload) }, token),

  uploadLabResult: (token: string, payload: { requestId?: string; patientId?: string; hospitalId?: string; laboratoryId?: string; testName?: string; result: string; unit?: string; referenceRange?: string; status?: "normal" | "abnormal" | "critical"; notes?: string; collectedAt?: string }) =>
    apiClient.request<LabResult>("/lab-results", { method: "POST", body: JSON.stringify(payload) }, token),

  updateLabResult: (token: string, resultId: string, payload: Partial<Pick<LabResult, "result" | "unit" | "referenceRange" | "status" | "collectedAt">> & { notes?: string }) =>
    apiClient.request<LabResult>(`/lab-results/${resultId}`, { method: "PATCH", body: JSON.stringify(payload) }, token),

  labRequests: (token: string) =>
    apiClient.request<LabRequest[]>("/lab-requests/assigned", {}, token),

  acceptLabRequest: (token: string, id: string) =>
    apiClient.request<LabRequest>(`/lab-requests/${id}/accept`, { method: "PATCH" }, token),

  rejectLabRequest: (token: string, id: string, rejectionReason?: string) =>
    apiClient.request<LabRequest>(`/lab-requests/${id}/reject`, { method: "PATCH", body: JSON.stringify({ rejectionReason }) }, token),

  emergencyCases: (token: string) =>
    apiClient.request<EmergencyCase[]>("/emergency-cases/assigned", {}, token),

  updateEmergencyCaseStatus: (token: string, id: string, status: EmergencyCase["status"], notes?: string) =>
    apiClient.request<EmergencyCase>(`/emergency-cases/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, notes }) }, token),

  updateEmergencyDispatch: (token: string, id: string, dispatchStatus: EmergencyCase["dispatchStatus"], dispatchNotes?: string) =>
    apiClient.request<EmergencyCase>(`/emergency-cases/${id}/dispatch`, { method: "PATCH", body: JSON.stringify({ dispatchStatus, dispatchNotes }) }, token),

  adminOperations: async (token: string): Promise<AdminOperations> => {
    const response = await apiClient.request<{ data: AdminOperations } | AdminOperations>("/workspace/admin/operations", {}, token);
    return "data" in response ? response.data : response;
  },

  approveHospital: (token: string, id: string) =>
    apiClient.request<Hospital>(`/hospitals/${id}/approve`, { method: "PATCH" }, token),

  approveLaboratory: (token: string, id: string) =>
    apiClient.request("/laboratories/approve", { method: "POST", body: JSON.stringify({ laboratoryId: id }) }, token),

  revokeShare: (token: string, id: string) =>
    apiClient.request<RawShare>(`/consent-sharing/${id}/revoke`, { method: "PATCH" }, token).then(normalizeShare),

  createShare: (token: string, payload: { toHospitalId: string; scopes: string[]; expiresAt?: string }) =>
    apiClient.request<RawShare>("/consent-sharing", { method: "POST", body: JSON.stringify(payload) }, token).then(normalizeShare),

  updateProfile: (token: string, payload: Partial<Pick<PatientProfile, "fullName" | "dateOfBirth" | "gender" | "address" | "bloodGroup" | "allergies" | "chronicConditions" | "currentMedications" | "emergencyContact">>) =>
    apiClient.request<RawPatient>("/patients/me", { method: "PATCH", body: JSON.stringify(payload) }, token).then(normalizePatient),

  updatePatientAccountProfile: (token: string, payload: {
    name?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    notificationPreferences?: User["notificationPreferences"];
    patientProfile?: Partial<Pick<PatientProfile, "fullName" | "dateOfBirth" | "gender" | "address" | "bloodGroup" | "allergies" | "chronicConditions" | "currentMedications" | "emergencyContact">>;
  }) => apiClient.request<AccountProfilePayload>("/users/me", { method: "PATCH", body: JSON.stringify(payload) }, token),

  uploadDocument: (token: string, file: { uri: string; name: string; mimeType?: string }) => {
    const form = new FormData();
    form.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? "application/octet-stream"
    } as unknown as Blob);
    form.append("category", "personal_document");
    return apiClient.request<{ _id: string; fileName: string; provider: string }>("/uploads", { method: "POST", body: form }, token);
  },

  enableEmergency: (token: string) => apiClient.request<{ code: string }>("/emergency-access/enable", { method: "POST" }, token),

  resolveEmergency: (token: string, code: string, reason: string) =>
    apiClient.request<{
      fullName: string;
      bloodGroup: string;
      allergies: string[];
      chronicConditions: string[];
      currentMedications: string[];
      emergencyContact: PatientProfile["emergencyContact"];
      recentCriticalRecords: RecordItem[];
    }>("/emergency-access/resolve", { method: "POST", body: JSON.stringify({ code, reason }) }, token),

  listEmergencyCases: (token: string, params?: { status?: EmergencyCase["status"]; patientId?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.patientId) query.set("patientId", params.patientId);
    const suffix = query.toString();
    return apiClient.request<RawEmergencyCase[]>(`/emergency-cases${suffix ? `?${suffix}` : ""}`, {}, token).then((cases) => cases.map(normalizeEmergencyCase));
  },

  createEmergencyCase: (token: string, payload: { patientId?: string; priority?: EmergencyCase["priority"]; location: string; reason: string; notes?: string }) =>
    apiClient.request<RawEmergencyCase>("/emergency-cases", { method: "POST", body: JSON.stringify(payload) }, token).then(normalizeEmergencyCase),

  updateEmergencyCase: (token: string, id: string, payload: Partial<Pick<EmergencyCase, "status" | "priority" | "location" | "reason" | "notes">>) =>
    apiClient.request<RawEmergencyCase>(`/emergency-cases/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token).then(normalizeEmergencyCase),

  assignEmergencyCase: (token: string, id: string, payload: { assignedUserId?: string; assignedServiceId?: string; hospitalId?: string; notes?: string }) =>
    apiClient.request<RawEmergencyCase>(`/emergency-cases/${id}/assign`, { method: "PATCH", body: JSON.stringify(payload) }, token).then(normalizeEmergencyCase),

  assessSymptoms: (token: string, symptoms: string[], notes?: string) =>
    apiClient.request<{
      symptoms: string[];
      assessment: {
        conditions: string[];
        urgency: "low" | "medium" | "high";
        recommendations: string[];
      };
      timestamp: string;
    }>("/symptoms/assess", { method: "POST", body: JSON.stringify({ symptoms, notes }) }, token),

  findNearbyHospitals: (latitude: number, longitude: number, radius?: number, specialty?: string, token?: string) =>
    apiClient.request<Array<{ id: string; name: string; city: string; state: string; address: string; specialties: string[]; distance: number; contactEmail: string }>>(
      `/hospital-finder/nearby?latitude=${latitude}&longitude=${longitude}${radius ? `&radius=${radius}` : ""}${specialty ? `&specialty=${specialty}` : ""}`,
      {},
      token
    ),

  searchHospitals: (query: string, specialty?: string, city?: string, token?: string) =>
    apiClient.request<Array<{ id: string; name: string; city: string; state: string; address: string; specialties: string[]; contactEmail: string }>>(
      `/hospital-finder/search?query=${encodeURIComponent(query)}${specialty ? `&specialty=${encodeURIComponent(specialty)}` : ""}${city ? `&city=${encodeURIComponent(city)}` : ""}`,
      {},
      token
    ),

  getHospitalDetails: (hospitalId: string) =>
    apiClient.request<{
      id: string;
      name: string;
      city: string;
      state: string;
      address: string;
      specialties: string[];
      contactEmail: string;
      status: string;
      connectedPatients: number;
      staff: Array<{ _id?: string; id?: string; name: string; role: Role; email?: string }>;
    }>(`/hospital-finder/${hospitalId}/details`),

  getEmergencyQRCode: (token: string) =>
    apiClient.request<{
      code: string;
      qrCodeUrl: string;
      shortCode: string;
      instructions: string;
      expiresAt: null;
    }>("/qrcode/emergency", {}, token),

  getProfileQRCode: (token: string) =>
    apiClient.request<{
      link: string;
      qrCodeUrl: string;
      instructions: string;
    }>("/qrcode/profile", {}, token),

  getAuditLogs: (token: string, patientId?: string) =>
    apiClient.request<Array<{
      id: string;
      action: string;
      actor: string;
      role: string;
      target: string;
      reason?: string;
      date: string;
    }>>(`/audit-logs${patientId ? `?patientId=${patientId}` : ""}`, {}, token),

  request: <T = unknown,>(path: string, options?: RequestInit, token?: string) => apiClient.request<T>(path, options, token)
};
