import type { Hospital, RecordItem, User } from "../types/domain";

export const demoPassword = "Password123!";

export const users: User[] = [
  { id: "u-patient", name: "Elena Brooks", email: "patient@healthbridge.test", role: "patient" },
  { id: "u-doctor", name: "Dr. Priya Nair", email: "doctor@mercy.test", role: "doctor" },
  { id: "u-admin", name: "Morgan Hayes", email: "admin@mercy.test", role: "hospital_admin" },
  { id: "u-emt", name: "Sam Rivera EMT", email: "emt@healthbridge.test", role: "emergency_staff" },
  { id: "u-super", name: "Avery Platform", email: "superadmin@healthbridge.test", role: "super_admin" }
];

export const hospitals: Hospital[] = [
  { id: "h-mercy", name: "Mercy General Hospital", status: "approved", city: "Boston", specialties: ["Emergency", "Pulmonology"] },
  { id: "h-city", name: "CityCare Medical Center", status: "approved", city: "New York", specialties: ["Labs", "Imaging"] },
  { id: "h-lake", name: "Lakeview Children's Hospital", status: "pending", city: "Chicago", specialties: ["Pediatrics"] }
];

export const records: RecordItem[] = [
  { id: "r1", title: "Asthma care plan", type: "Diagnosis", date: "Mar 12, 2026", summary: "Controlled persistent asthma. Continue rescue inhaler.", critical: true },
  { id: "r2", title: "Annual wellness visit", type: "Visit", date: "May 20, 2026", summary: "Vitals stable, allergy profile updated." },
  { id: "r3", title: "CBC Panel", type: "Lab", date: "May 21, 2026", summary: "Within normal reference range." },
  { id: "r4", title: "Albuterol 90 mcg", type: "Prescription", date: "May 22, 2026", summary: "Two puffs as needed.", critical: true }
];

export const patient = {
  fullName: "Elena Brooks",
  bloodGroup: "A+",
  allergies: ["Penicillin", "Latex"],
  chronicConditions: ["Asthma"],
  currentMedications: ["Albuterol inhaler", "Cetirizine 10mg"],
  emergencyContact: "Jordan Brooks, spouse, +1 555 0134",
  emergencyCode: "HB-DEMO01"
};
