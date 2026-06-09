import { Text, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { ScreenView } from "../../components/layout/screen";
import { patient, records } from "../../constants/demo-data";
import type { Screen } from "../../types/domain";

export function PatientHomeScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <ScreenView title="Patient dashboard" subtitle="Your medical profile, connected records, consent sharing, and emergency access.">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <InfoCard label="Blood group" value={patient.bloodGroup} />
        <InfoCard label="Records" value={String(records.length)} tone="teal" />
        <InfoCard label="Emergency code" value={patient.emergencyCode} tone="amber" />
      </View>
      <View style={{ gap: 10, padding: 16, borderRadius: 12, backgroundColor: "#FFFFFF" }}>
        <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{patient.fullName}</Text>
        <Text selectable>Allergies: {patient.allergies.join(", ")}</Text>
        <Text selectable>Chronic conditions: {patient.chronicConditions.join(", ")}</Text>
        <Text selectable>Current medications: {patient.currentMedications.join(", ")}</Text>
        <Text selectable>Emergency contact: {patient.emergencyContact}</Text>
      </View>
      <PrimaryButton label="View medical records" onPress={() => setScreen("records")} />
      <PrimaryButton label="Share records" tone="teal" onPress={() => setScreen("sharing")} />
      <PrimaryButton label="Emergency QR/code" tone="light" onPress={() => setScreen("emergency")} />
    </ScreenView>
  );
}
