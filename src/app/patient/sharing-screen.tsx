import { useState } from "react";
import { Text, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { ScreenView } from "../../components/layout/screen";
import { colors } from "../../constants/theme";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { PatientDashboard } from "../../types/domain";

export function SharingScreen({ token, dashboard, refresh }: { token?: string; dashboard?: PatientDashboard; refresh: () => Promise<void> }) {
  const [message, setMessage] = useState("");

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

  return (
    <ScreenView title="Consent sharing" subtitle="Share scoped access with another hospital or doctor and revoke it at any time.">
      {message ? <View style={{ padding: 16, borderRadius: 12, backgroundColor: "#E9F9F2" }}><Text selectable style={{ color: "#09643D" }}>{message}</Text></View> : null}
      {!dashboard ? <Text selectable>Loading sharing settings...</Text> : null}
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
