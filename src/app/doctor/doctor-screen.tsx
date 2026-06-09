import { useState } from "react";
import { Text, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { ScreenView } from "../../components/layout/screen";
import { patient, records } from "../../constants/demo-data";

export function DoctorScreen() {
  const [saved, setSaved] = useState(false);
  return (
    <ScreenView title="Doctor portal" subtitle="Review patient history and add diagnoses, prescriptions, lab notes, and emergency notes.">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <InfoCard label="Patient panel" value="1" />
        <InfoCard label="Critical flags" value={String(records.filter((record) => record.critical).length)} tone="amber" />
      </View>
      <View style={{ gap: 10 }}>
        <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{patient.fullName}</Text>
        <Text selectable>Allergies: {patient.allergies.join(", ")}</Text>
        <Text selectable>Current medications: {patient.currentMedications.join(", ")}</Text>
        <PrimaryButton label={saved ? "Diagnosis note saved" : "Add diagnosis note"} onPress={() => setSaved(true)} />
      </View>
    </ScreenView>
  );
}
