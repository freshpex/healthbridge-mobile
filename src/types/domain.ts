export type Role = "patient" | "doctor" | "hospital_admin" | "super_admin" | "emergency_staff";
export type Screen = "onboarding" | "signin" | "patient" | "records" | "sharing" | "emergency" | "hospital" | "doctor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Hospital {
  id: string;
  name: string;
  status: "approved" | "pending";
  city: string;
  specialties: string[];
}

export interface RecordItem {
  id: string;
  title: string;
  type: string;
  date: string;
  summary: string;
  critical?: boolean;
}
