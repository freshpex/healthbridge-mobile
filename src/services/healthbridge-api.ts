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
  connectedHospitalIds: (patient.hospitalIds ?? []).map((hospital) => idOf(hospital as RawHospital | string)),
  hospitalIds: (patient.hospitalIds ?? []).filter((hospital): hospital is RawHospital => typeof hospital !== "string").map(normalizeHospital)
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

  revokeShare: (token: string, id: string) =>
    apiClient.request<RawShare>(`/consent-sharing/${id}/revoke`, { method: "PATCH" }, token).then(normalizeShare),

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
    }>("/emergency-access/resolve", { method: "POST", body: JSON.stringify({ code, reason }) }, token)
};
