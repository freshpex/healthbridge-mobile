import { useState } from "react";
import { Text, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { ScreenView } from "../../components/layout/screen";
import { colors } from "../../constants/theme";

export function SharingScreen() {
  const [revoked, setRevoked] = useState(false);
  return (
    <ScreenView title="Consent sharing" subtitle="Share scoped access with another hospital or doctor and revoke it at any time.">
      <View style={{ gap: 10, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
        <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>CityCare Medical Center</Text>
        <Text selectable>Scopes: profile, records, labs</Text>
        <Text selectable>Expires: Dec 31, 2026</Text>
        <Text selectable>Status: {revoked ? "revoked" : "active"}</Text>
        <PrimaryButton label={revoked ? "Access revoked" : "Revoke shared access"} tone={revoked ? "light" : "teal"} onPress={() => setRevoked(true)} />
      </View>
      <View style={{ padding: 16, borderRadius: 12, backgroundColor: "#E9F9F2" }}>
        <Text selectable style={{ color: "#09643D" }}>Every share and revoke event is written to patient audit history.</Text>
      </View>
    </ScreenView>
  );
}
