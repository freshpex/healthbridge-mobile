import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { ScreenView } from "../../components/layout/screen";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { colors } from "../../constants/theme";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { Hospital } from "../../types/domain";

export function LaboratoryScreen({
  token,
  onLogout
}: {
  token: string;
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
    <ScreenView title="Laboratory Portal" subtitle="Upload test results, manage samples, and link patients.">
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Results Uploaded</Text>
            <Text style={{ fontSize: 24, fontWeight: "900" }}>{uploadCount}</Text>
          </View>
          <View style={{ flex: 1, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Tests Available</Text>
            <Text style={{ fontSize: 24, fontWeight: "900" }}>10</Text>
          </View>
        </View>

        <View style={{ gap: 8, padding: 16, borderRadius: 12, backgroundColor: "#FBF5F0", borderWidth: 1, borderColor: "#FDCCC8" }}>
          <Text style={{ fontWeight: "900", color: "#6D4C41" }}>Pending Approval</Text>
          <Text style={{ color: "#6D4C41", fontSize: 13 }}>Your laboratory registration is under review. You'll receive a confirmation email once approved.</Text>
        </View>

        <View style={{ gap: 12 }}>
          <Text style={{ fontWeight: "900", fontSize: 18 }}>Quick Actions</Text>
          <PrimaryButton label="Upload Test Results" onPress={() => console.log("Upload test results")} />
          <PrimaryButton label="Manage Test Capabilities" onPress={() => console.log("Manage tests")} tone="light" />
          <PrimaryButton label="Link Patient" onPress={() => console.log("Link patient")} tone="light" />
        </View>

        <View style={{ gap: 12 }}>
          <Text style={{ fontWeight: "900", fontSize: 18 }}>Associated Hospital</Text>
          {loading ? (
            <ActivityIndicator color={colors.teal} />
          ) : hospitals.length > 0 ? (
            <View style={{ padding: 12, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
              <Text style={{ fontWeight: "800", fontSize: 16 }}>{hospitals[0].name}</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>{hospitals[0].city}</Text>
            </View>
          ) : (
            <Text style={{ color: colors.muted }}>No hospitals available</Text>
          )}
        </View>

        <PrimaryButton label="Sign out" tone="light" onPress={onLogout} />
      </ScrollView>
    </ScreenView>
  );
}
