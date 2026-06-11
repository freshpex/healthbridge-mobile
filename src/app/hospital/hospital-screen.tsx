import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { PatientProfile, User } from "../../types/domain";
import { colors, shadow } from "../../constants/theme";

const initials = (name: string) => name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

export function HospitalScreen({ token, user, logout }: { token?: string; user?: User; logout?: () => Promise<void> }) {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    if (!token || !user?.hospitalId) return;
    healthbridgeApi.hospitalPatients(token, user.hospitalId)
      .then((nextPatients) => {
        if (alive) setPatients(nextPatients);
      })
      .catch((caught) => {
        if (alive) setError(caught instanceof Error ? caught.message : "Could not load hospital patients");
      });
    return () => {
      alive = false;
    };
  }, [token, user?.hospitalId]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 112 }}>
      <StatusBar style="dark" />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 12 }}>
        <View>
          <Text style={{ color: colors.ink, fontSize: 12, fontWeight: "700" }}>Welcome back,</Text>
          <Text style={{ color: colors.navy, fontSize: 24, fontWeight: "900" }}>{user?.name?.split(" ")[0] ?? "Admin"}</Text>
        </View>
        <View style={{ width: 52, height: 52, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "#F3E5F5", borderWidth: 3, borderColor: "#FFFFFF", boxShadow: shadow }}>
          <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 18 }}>{initials(user?.name ?? "HA")}</Text>
        </View>
      </View>
      <View style={{ gap: 10, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
        <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Hospital Administration</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <InfoCard label="Connected" value={user?.hospitalId ? "Yes" : "No"} tone="teal" />
          <InfoCard label="Patients" value={String(patients.length)} />
          <InfoCard label="Role" value={user?.role.replace("_", " ") ?? "Staff"} tone="green" />
        </View>
      </View>
      {error ? <Text selectable style={{ color: colors.danger, paddingHorizontal: 14 }}>{error}</Text> : null}
      {patients.length === 0 ? (
        <View style={{ gap: 10, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          <Text selectable style={{ color: colors.muted }}>No connected patients are visible yet.</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Connected Patients</Text>
          {patients.map((patient) => (
            <View key={patient.id} style={{ gap: 10, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
              <Text selectable style={{ fontWeight: "900", fontSize: 14, color: colors.navy }}>{patient.fullName}</Text>
              <View style={{ gap: 6 }}>
                <Text selectable style={{ color: colors.ink, fontSize: 12 }}>Blood: <Text style={{ fontWeight: "700" }}>{patient.bloodGroup}</Text></Text>
                <Text selectable style={{ color: colors.ink, fontSize: 12 }}>Allergies: <Text style={{ fontWeight: "700" }}>{patient.allergies.length > 0 ? patient.allergies.join(", ") : "None"}</Text></Text>
                <Text selectable style={{ color: colors.ink, fontSize: 12 }}>Conditions: <Text style={{ fontWeight: "700" }}>{patient.chronicConditions.length > 0 ? patient.chronicConditions.join(", ") : "None"}</Text></Text>
              </View>
            </View>
          ))}
        </View>
      )}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><PrimaryButton label="Sign out" tone="light" onPress={() => logout?.()} /></View>
      </View>
    </ScrollView>
  );
}
