import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { colors, shadow } from "../../constants/theme";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { Hospital, User } from "../../types/domain";

const initials = (name: string) => name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

export function LaboratoryScreen({
  token,
  user,
  onLogout
}: {
  token: string;
  user?: User;
  onLogout: () => Promise<void>;
}) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadCount, setUploadCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const items = await healthbridgeApi.hospitals();
        if (!alive) return;
        setHospitals(items.filter((h) => h.status === "approved"));
        
        // Load upload count from dashboard
        try {
          const dashboard = await healthbridgeApi.patientDashboard(token);
          if (alive) {
            setUploadCount(dashboard.uploads.length);
          }
        } catch {
          console.error("Could not load upload count");
        }
      } catch (caught) {
        if (alive) {
          console.error(caught instanceof Error ? caught.message : "Could not load hospitals");
        }
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 112 }}>
      <StatusBar style="dark" />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 12 }}>
        <View>
          <Text style={{ color: colors.ink, fontSize: 12, fontWeight: "700" }}>Welcome back,</Text>
          <Text style={{ color: colors.navy, fontSize: 24, fontWeight: "900" }}>{user?.name?.split(" ")[0] ?? "Lab"}</Text>
        </View>
        <View style={{ width: 52, height: 52, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "#FCE4EC", borderWidth: 3, borderColor: "#FFFFFF", boxShadow: shadow }}>
          <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 18 }}>{initials(user?.name ?? "LS")}</Text>
        </View>
      </View>
      <View style={{ gap: 10, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
        <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Laboratory Portal</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <InfoCard label="Uploaded" value={String(uploadCount)} />
          <InfoCard label="Available" value="10" tone="teal" />
        </View>
      </View>

      <View style={{ gap: 8, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: "#FBF5F0", borderWidth: 1, borderColor: "#FDCCC8" }}>
        <Text style={{ fontWeight: "900", color: "#6D4C41", fontSize: 14 }}>Pending Approval</Text>
        <Text style={{ color: "#6D4C41", fontSize: 13, lineHeight: 18 }}>Your laboratory registration is under review. You'll receive a confirmation email once approved.</Text>
      </View>

      <View style={{ gap: 12 }}>
        <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Quick Actions</Text>
        <PrimaryButton label="Upload Test Results" onPress={() => console.log("Upload test results")} />
        <PrimaryButton label="Manage Test Capabilities" onPress={() => console.log("Manage tests")} tone="light" />
        <PrimaryButton label="Link Patient" onPress={() => console.log("Link patient")} tone="light" />
      </View>

      <View style={{ gap: 10, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
        <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Associated Hospital</Text>
        {loading ? (
          <ActivityIndicator color={colors.teal} />
        ) : hospitals.length > 0 ? (
          <View style={{ gap: 10 }}>
            {hospitals.slice(0, 2).map((hospital) => (
              <View key={hospital.id} style={{ padding: 12, borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.line }}>
                <Text style={{ fontWeight: "800", fontSize: 14, color: colors.navy }}>{hospital.name}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{[hospital.city, hospital.state].filter(Boolean).join(", ")}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: colors.muted }}>No hospitals available</Text>
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><PrimaryButton label="Sign out" tone="light" onPress={onLogout} /></View>
      </View>
    </ScrollView>
  );
}
