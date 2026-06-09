import { Text, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { ScreenView } from "../../components/layout/screen";
import type { PatientDashboard, Screen } from "../../types/domain";

const contactText = (contact: PatientDashboard["profile"]["emergencyContact"]) =>
  typeof contact === "string" ? contact : [contact?.name, contact?.relationship, contact?.phone].filter(Boolean).join(", ");

export function PatientHomeScreen({ dashboard, refresh, setScreen, logout }: { dashboard?: PatientDashboard; refresh: () => Promise<void>; setScreen: (screen: Screen) => void; logout: () => Promise<void> }) {
  if (!dashboard) {
    return (
      <ScreenView title="Patient dashboard" subtitle="Loading your secure health bridge.">
        <Text selectable>Loading patient data from the API...</Text>
        <PrimaryButton label="Refresh" onPress={refresh} />
      </ScreenView>
    );
  }

  const patient = dashboard.profile;

  return (
    <ScreenView title="Patient dashboard" subtitle="Your medical profile, connected records, consent sharing, and emergency access.">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <InfoCard label="Blood group" value={patient.bloodGroup} />
        <InfoCard label="Records" value={String(dashboard.records.length)} tone="teal" />
        <InfoCard label="Emergency code" value={patient.emergencyCode ?? "Off"} tone="amber" />
      </View>
      <View style={{ gap: 10, padding: 16, borderRadius: 12, backgroundColor: "#FFFFFF" }}>
        <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{patient.fullName}</Text>
        <Text selectable>Hospitals: {patient.hospitalIds?.map((hospital) => hospital.name).join(", ") || patient.connectedHospitalIds.length}</Text>
        <Text selectable>Allergies: {patient.allergies.join(", ") || "None recorded"}</Text>
        <Text selectable>Chronic conditions: {patient.chronicConditions.join(", ") || "None recorded"}</Text>
        <Text selectable>Current medications: {patient.currentMedications.join(", ") || "None recorded"}</Text>
        <Text selectable>Emergency contact: {contactText(patient.emergencyContact) || "Not set"}</Text>
      </View>
      <PrimaryButton label="View medical records" onPress={() => setScreen("records")} />
      <PrimaryButton label="Share records" tone="teal" onPress={() => setScreen("sharing")} />
      <PrimaryButton label="Emergency QR/code" tone="light" onPress={() => setScreen("emergency")} />
      <PrimaryButton label="Refresh data" tone="light" onPress={refresh} />
      <PrimaryButton label="Sign out" tone="light" onPress={logout} />
    </ScreenView>
  );
}
