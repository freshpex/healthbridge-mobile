import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { ScreenView } from "../../components/layout/screen";
import { patient, records } from "../../constants/demo-data";
import { colors } from "../../constants/theme";

export function EmergencyScreen() {
  const [code, setCode] = useState(patient.emergencyCode);
  const [resolved, setResolved] = useState(false);
  const invalid = code.trim().toUpperCase() !== patient.emergencyCode;
  return (
    <ScreenView title="Emergency QR/code" subtitle="Scan or enter the emergency code. Critical information appears first and access is logged.">
      <View style={{ minHeight: 190, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: "#9FD6DC", backgroundColor: "#EFFCFF" }}>
        <Text selectable style={{ fontSize: 28, fontWeight: "900", color: colors.blue }}>{patient.emergencyCode}</Text>
        <Text style={{ color: colors.muted }}>QR-ready presentation code</Text>
      </View>
      <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, backgroundColor: colors.surface }} />
      <PrimaryButton label="Resolve emergency access" onPress={() => setResolved(!invalid)} />
      {invalid ? <Text selectable style={{ color: colors.danger }}>Code is invalid or disabled.</Text> : null}
      {resolved ? (
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <InfoCard label="Full name" value={patient.fullName} />
            <InfoCard label="Blood group" value={patient.bloodGroup} tone="amber" />
          </View>
          <Text selectable>Allergies: {patient.allergies.join(", ")}</Text>
          <Text selectable>Chronic conditions: {patient.chronicConditions.join(", ")}</Text>
          <Text selectable>Current medications: {patient.currentMedications.join(", ")}</Text>
          <Text selectable>Emergency contact: {patient.emergencyContact}</Text>
          {records.filter((record) => record.critical).map((record) => <Text selectable key={record.id}>Critical: {record.title} - {record.summary}</Text>)}
        </View>
      ) : null}
    </ScreenView>
  );
}
