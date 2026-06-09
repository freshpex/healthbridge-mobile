import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { ScreenView } from "../../components/layout/screen";
import { colors } from "../../constants/theme";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { Hospital, PatientDashboard } from "../../types/domain";

const scopes = ["profile", "records", "labs", "prescriptions", "appointments", "critical"];

export function SharingScreen({ token, dashboard, hospitals, refresh }: { token?: string; dashboard?: PatientDashboard; hospitals: Hospital[]; refresh: () => Promise<void> }) {
  const [message, setMessage] = useState("");
  const destinations = hospitals.filter((hospital) => !dashboard?.profile.connectedHospitalIds.includes(hospital.id));
  const [toHospitalId, setToHospitalId] = useState(destinations[0]?.id ?? "");
  const [selectedScopes, setSelectedScopes] = useState(["profile", "records"]);

  const revoke = async (id: string) => {
    if (!token) return;
    try {
      await healthbridgeApi.revokeShare(token, id);
      setMessage("Access revoked and audit trail updated.");
      await refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not revoke access");
    }
  };

  const createShare = async () => {
    if (!token) return;
    const destination = toHospitalId || destinations[0]?.id;
    if (!destination) {
      setMessage("No destination hospital is available.");
      return;
    }
    try {
      await healthbridgeApi.createShare(token, { toHospitalId: destination, scopes: selectedScopes, expiresAt: "2026-12-31" });
      setMessage("Consent share created.");
      await refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not create share");
    }
  };

  return (
    <ScreenView title="Consent sharing" subtitle="Share scoped access with another hospital or doctor and revoke it at any time.">
      {message ? <View style={{ padding: 16, borderRadius: 12, backgroundColor: "#E9F9F2" }}><Text selectable style={{ color: "#09643D" }}>{message}</Text></View> : null}
      {!dashboard ? <Text selectable>Loading sharing settings...</Text> : null}
      {dashboard ? (
        <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>Create scoped share</Text>
          {destinations.length === 0 ? <Text selectable style={{ color: colors.muted }}>No destination hospital is available.</Text> : null}
          {destinations.map((hospital) => (
            <Pressable key={hospital.id} onPress={() => setToHospitalId(hospital.id)} style={{ padding: 12, borderRadius: 10, borderWidth: 1, borderColor: (toHospitalId || destinations[0]?.id) === hospital.id ? colors.teal : colors.line }}>
              <Text selectable style={{ fontWeight: "800" }}>{hospital.name}</Text>
              <Text selectable style={{ color: colors.muted }}>{hospital.city}</Text>
            </Pressable>
          ))}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {scopes.map((scope) => {
              const active = selectedScopes.includes(scope);
              return (
                <Pressable key={scope} onPress={() => setSelectedScopes((current) => active ? current.filter((item) => item !== scope) : [...current, scope])} style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999, backgroundColor: active ? colors.blue : "#E9F5FF" }}>
                  <Text style={{ color: active ? "#FFFFFF" : colors.blue, fontWeight: "800" }}>{scope}</Text>
                </Pressable>
              );
            })}
          </View>
          <PrimaryButton label="Share records" tone="teal" onPress={createShare} />
        </View>
      ) : null}
      {dashboard && dashboard.shares.length === 0 ? <Text selectable style={{ color: colors.muted }}>No active sharing grants yet.</Text> : null}
      {dashboard?.shares.map((share) => (
        <View key={share.id} style={{ gap: 10, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{share.toHospitalId}</Text>
          <Text selectable>Scopes: {share.scopes.join(", ")}</Text>
          <Text selectable>Expires: {share.expiresAt ? new Date(share.expiresAt).toLocaleDateString() : "No expiry"}</Text>
          <Text selectable>Status: {share.status}</Text>
          <PrimaryButton label={share.status === "active" ? "Revoke shared access" : "Access revoked"} tone={share.status === "active" ? "teal" : "light"} onPress={() => share.status === "active" ? revoke(share.id) : undefined} />
        </View>
      ))}
    </ScreenView>
  );
}
