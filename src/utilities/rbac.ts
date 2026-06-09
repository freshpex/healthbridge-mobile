import type { Role, Screen } from "../types/domain";

export const homeForRole: Record<Role, Screen> = {
  patient: "patient",
  doctor: "doctor",
  hospital_admin: "hospital",
  super_admin: "admin",
  emergency_staff: "emergency"
};

export const canOpenEmergency = (role: Role) => role === "emergency_staff" || role === "doctor" || role === "patient";
