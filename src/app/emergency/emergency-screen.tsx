import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { ScreenView } from "../../components/layout/screen";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { PatientDashboard } from "../../types/domain";
import { colors } from "../../constants/theme";

type EmergencyResult = Awaited<ReturnType<typeof healthbridgeApi.resolveEmergency>>;
const contactText = (contact: EmergencyResult["emergencyContact"]) =>
  typeof contact === "string" ? contact : [contact?.name, contact?.relationship, contact?.phone].filter(Boolean).join(", ");

export function EmergencyScreen({ token, dashboard, refresh }: { token?: string; dashboard?: PatientDashboard; refresh: () => Promise<void> }) {
  const [code, setCode] = useState(dashboard?.profile.emergencyCode ?? "HB-DEMO01");
  const [reason, setReason] = useState("Emergency intake requires critical medication and allergy information.");
  const [result, setResult] = useState<EmergencyResult>();
  const [error, setError] = useState("");

  const enable = async () => {
    if (!token) return;
    try {
      const next = await healthbridgeApi.enableEmergency(token);
      setCode(next.code);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not enable emergency code");
    }
  };

  const resolve = async () => {
    if (!token) return;
    setError("");
    try {
      setResult(await healthbridgeApi.resolveEmergency(token, code.trim().toUpperCase(), reason));
    } catch (caught) {
      setResult(undefined);
      setError(caught instanceof Error ? caught.message : "Code is invalid or disabled.");
    }
  };

  return (
    <ScreenView title="Emergency QR/code" subtitle="Scan or enter the emergency code. Critical information appears first and access is logged.">
      <View style={{ minHeight: 190, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: "#9FD6DC", backgroundColor: "#EFFCFF" }}>
        <Text selectable style={{ fontSize: 28, fontWeight: "900", color: colors.blue }}>{dashboard?.profile.emergencyCode ?? code}</Text>
        <Text selectable style={{ color: colors.muted }}>QR-ready presentation code</Text>
      </View>
      <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, backgroundColor: colors.surface }} />
      <TextInput value={reason} onChangeText={setReason} multiline style={{ minHeight: 80, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, backgroundColor: colors.surface }} />
      <PrimaryButton label="Generate new patient code" tone="light" onPress={enable} />
      <PrimaryButton label="Resolve emergency access" onPress={resolve} />
      {error ? <Text selectable style={{ color: colors.danger }}>{error}</Text> : null}
      {result ? (
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <InfoCard label="Full name" value={result.fullName} />
            <InfoCard label="Blood group" value={result.bloodGroup} tone="amber" />
          </View>
          <Text selectable>Allergies: {result.allergies.join(", ") || "None recorded"}</Text>
          <Text selectable>Chronic conditions: {result.chronicConditions.join(", ") || "None recorded"}</Text>
          <Text selectable>Current medications: {result.currentMedications.join(", ") || "None recorded"}</Text>
          <Text selectable>Emergency contact: {contactText(result.emergencyContact) || "Not set"}</Text>
          {result.recentCriticalRecords.map((record) => <Text selectable key={record.id ?? record._id}>Critical: {record.title} - {record.summary}</Text>)}
        </View>
      ) : null}
    </ScreenView>
  );
}
