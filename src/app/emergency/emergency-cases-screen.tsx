import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenView } from "../../components/layout/screen";
import { colors, shadow } from "../../constants/theme";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { EmergencyCase } from "../../types/domain";

const statusOptions: EmergencyCase["status"][] = ["requested", "triaged", "assigned", "in_progress", "resolved", "cancelled"];

export function EmergencyCasesScreen({ token }: { token?: string }) {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCases = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setCases(await healthbridgeApi.listEmergencyCases(token));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load emergency cases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCases();
  }, [token]);

  const createCase = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const created = await healthbridgeApi.createEmergencyCase(token, { location, reason, priority: "high" });
      setCases((current) => [created, ...current]);
      setLocation("");
      setReason("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create emergency case.");
    } finally {
      setSaving(false);
    }
  };

  const advanceStatus = async (emergencyCase: EmergencyCase) => {
    if (!token) return;
    const currentIndex = statusOptions.indexOf(emergencyCase.status);
    const status = statusOptions[Math.min(currentIndex + 1, statusOptions.length - 1)];
    if (status === emergencyCase.status) return;
    try {
      const updated = await healthbridgeApi.updateEmergencyCase(token, emergencyCase.id, { status });
      setCases((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update emergency case.");
    }
  };

  return (
    <ScreenView title="Emergency cases" subtitle="Create and follow emergency requests with live backend data.">
      <ScrollView contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 120 }}>
        <View style={{ gap: 10, padding: 14, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
          <Text style={{ color: colors.ink, fontWeight: "900" }}>Create emergency request</Text>
          <TextInput value={location} onChangeText={setLocation} placeholder="Location" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12 }} />
          <TextInput value={reason} onChangeText={setReason} placeholder="Reason" multiline style={{ minHeight: 80, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12 }} />
          <Pressable disabled={saving || !location.trim() || !reason.trim()} onPress={createCase} style={{ padding: 12, borderRadius: 10, backgroundColor: colors.blue, opacity: saving || !location.trim() || !reason.trim() ? 0.5 : 1, alignItems: "center" }}>
            <Text style={{ color: "white", fontWeight: "900" }}>{saving ? "Creating..." : "Create case"}</Text>
          </Pressable>
        </View>

        {error ? <Text style={{ color: colors.danger, fontWeight: "800" }}>{error}</Text> : null}
        {loading ? <ActivityIndicator color={colors.blue} /> : null}
        {!loading && cases.length === 0 ? (
          <View style={{ padding: 16, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
            <Text style={{ color: colors.muted, fontWeight: "800" }}>No emergency cases are available for your account yet.</Text>
          </View>
        ) : null}
        {cases.map((emergencyCase) => (
          <View key={emergencyCase.id} style={{ gap: 8, padding: 14, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
            <Text style={{ color: colors.ink, fontWeight: "900" }}>{(emergencyCase.priority ?? emergencyCase.severity ?? "high").toUpperCase()} · {emergencyCase.status.replace("_", " ")}</Text>
            <Text style={{ color: colors.muted, fontWeight: "700" }}>{emergencyCase.location}</Text>
            <Text style={{ color: colors.ink }}>{emergencyCase.reason}</Text>
            <Pressable onPress={() => void advanceStatus(emergencyCase)} style={{ padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.blue, alignItems: "center" }}>
              <Text style={{ color: colors.blue, fontWeight: "900" }}>Advance status</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </ScreenView>
  );
}
