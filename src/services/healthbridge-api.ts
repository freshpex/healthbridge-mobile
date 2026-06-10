import { apiClient } from "./api-client";
import type { ConsentShare, Hospital, PatientDashboard, PatientProfile, RecordItem, User } from "../types/domain";

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

type RawHospital = Omit<Hospital, "id"> & { _id: string };
type RawPatient = Omit<PatientProfile, "id" | "connectedHospitalIds"> & { _id: string; hospitalIds?: RawHospital[] | string[] };
type RawRecord = Omit<RecordItem, "id" | "date"> & { _id: string; recordDate?: string; createdAt?: string };
type RawShare = Omit<ConsentShare, "id"> & { _id: string; toHospitalId: string | RawHospital };

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

export const healthbridgeApi = {
  login: (email: string, password: string) =>
    apiClient.request<AuthSession>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  signup: (payload: { name: string; email: string; password: string; hospitalIds: string[] }) =>
    apiClient.request<AuthSession>("/auth/signup", { method: "POST", body: JSON.stringify({ ...payload, role: "patient" }) }),

  refresh: (refreshToken: string) =>
    apiClient.request<AuthSession>("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) }),

  me: (token: string) => apiClient.request<User>("/auth/me", {}, token),

  hospitals: async () => {
    const hospitals = await apiClient.request<RawHospital[]>("/hospitals");
    return hospitals.map(normalizeHospital);
  },

  patientDashboard: async (token: string): Promise<PatientDashboard> => {
    const data = await apiClient.request<Omit<PatientDashboard, "profile" | "records" | "shares"> & {
      profile: RawPatient;
      records: RawRecord[];
      shares: RawShare[];
    }>("/patients/me/dashboard", {}, token);
    return {
      ...data,
      profile: normalizePatient(data.profile),
      records: data.records.map(normalizeRecord),
      shares: data.shares.map(normalizeShare)
    };
  },

  hospitalPatients: async (token: string, hospitalId: string) => {
    const patients = await apiClient.request<RawPatient[]>(`/hospitals/${hospitalId}/patients`, {}, token);
    return patients.map(normalizePatient);
  },

  users: (token: string) => apiClient.request<User[]>("/users", {}, token),

  revokeShare: (token: string, id: string) =>
    apiClient.request<RawShare>(`/consent-sharing/${id}/revoke`, { method: "PATCH" }, token).then(normalizeShare),

  createShare: (token: string, payload: { toHospitalId: string; scopes: string[]; expiresAt?: string }) =>
    apiClient.request<RawShare>("/consent-sharing", { method: "POST", body: JSON.stringify(payload) }, token).then(normalizeShare),

  updateProfile: (token: string, payload: Partial<Pick<PatientProfile, "bloodGroup" | "allergies" | "chronicConditions" | "currentMedications" | "emergencyContact">>) =>
    apiClient.request<RawPatient>("/patients/me", { method: "PATCH", body: JSON.stringify(payload) }, token).then(normalizePatient),

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
      staff: unknown[];
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
