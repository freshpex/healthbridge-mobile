import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { ScreenView } from "../../components/layout/screen";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { PatientDashboard, Screen } from "../../types/domain";
import { colors } from "../../constants/theme";

type EmergencyResult = Awaited<ReturnType<typeof healthbridgeApi.resolveEmergency>>;
const contactText = (contact: EmergencyResult["emergencyContact"]) =>
  typeof contact === "string" ? contact : [contact?.name, contact?.relationship, contact?.phone].filter(Boolean).join(", ");

export function EmergencyScreen({ token, dashboard, refresh, setScreen }: { token?: string; dashboard?: PatientDashboard; refresh: () => Promise<void>; setScreen?: (screen: Screen) => void }) {
  const [code, setCode] = useState(dashboard?.profile.emergencyCode ?? "");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<EmergencyResult>();
  const [error, setError] = useState("");
  const [scanText, setScanText] = useState("");

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

  const useScannedCode = () => {
    const match = scanText.match(/HB[-A-Z0-9]+/i) ?? scanText.match(/[A-Z0-9-]{6,}/i);
    if (!match) {
      setError("We could not find a valid HealthBridge emergency code in that QR value. Please scan again or enter the code manually.");
      return;
    }
    setCode(match[0].trim().toUpperCase());
    setError("");
  };

  const resolve = async () => {
    if (!token) return;
    setError("");
    try {
      setResult(await healthbridgeApi.resolveEmergency(token, code.trim().toUpperCase(), reason));
    } catch {
      setResult(undefined);
      setError("We could not open that emergency card. Please check the code and try again.");
    }
  };

  return (
    <ScreenView title="Emergency QR/code" subtitle="Scan or enter the emergency code. Critical information appears first and access is logged.">
      <View style={{ minHeight: 190, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: colors.tealLine, backgroundColor: colors.tealSoft }}>
        <Text selectable style={{ fontSize: 28, fontWeight: "900", color: colors.blue }}>{dashboard?.profile.emergencyCode ?? code}</Text>
        <Text selectable style={{ color: colors.muted }}>QR-ready presentation code</Text>
      </View>
      <Text style={{ color: colors.ink, fontWeight: "900" }}>Emergency code</Text>
      <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="Enter emergency code" placeholderTextColor={colors.muted} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, backgroundColor: colors.field, color: colors.ink }} />
      <View style={{ gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}>
        <Text style={{ color: colors.ink, fontWeight: "900" }}>QR scan alternative</Text>
        <Text style={{ color: colors.muted }}>Use your device camera or scanner to copy the QR value, paste it here, and HealthBridge will extract the emergency code. If camera permission is unavailable, manual entry still works.</Text>
        <TextInput value={scanText} onChangeText={setScanText} autoCapitalize="characters" placeholder="Paste scanned QR value" placeholderTextColor={colors.muted} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, backgroundColor: colors.field, color: colors.ink }} />
        <PrimaryButton label="Use scanned QR value" tone="light" onPress={useScannedCode} />
      </View>
      <TextInput value={reason} onChangeText={setReason} multiline placeholder="Access reason" placeholderTextColor={colors.muted} style={{ minHeight: 80, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, backgroundColor: colors.field, color: colors.ink }} />
      {setScreen ? <PrimaryButton label="Open emergency cases" tone="light" onPress={() => setScreen("emergency-cases")} /> : null}
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
