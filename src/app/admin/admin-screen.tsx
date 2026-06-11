import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { Hospital, User } from "../../types/domain";
import { colors, shadow } from "../../constants/theme";

const initials = (name: string) => name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

export function AdminScreen({ token, user, logout }: { token?: string; user?: User; logout?: () => Promise<void> }) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    if (!token) return;
    Promise.all([healthbridgeApi.hospitals(), healthbridgeApi.users(token)])
      .then(([nextHospitals, nextUsers]) => {
        if (!alive) return;
        setHospitals(nextHospitals);
        setUsers(nextUsers);
      })
      .catch((caught) => {
        if (alive) setError(caught instanceof Error ? caught.message : "Could not load admin data");
      });
    return () => {
      alive = false;
    };
  }, [token]);

  const approvedCount = hospitals.filter((hospital) => hospital.status === "approved").length;
  const pendingCount = hospitals.filter((hospital) => hospital.status === "pending").length;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 112 }}>
      <StatusBar style="dark" />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 12 }}>
        <View>
          <Text style={{ color: colors.ink, fontSize: 12, fontWeight: "700" }}>Welcome back,</Text>
          <Text style={{ color: colors.navy, fontSize: 24, fontWeight: "900" }}>{user?.name?.split(" ")[0] ?? "Admin"}</Text>
        </View>
        <View style={{ width: 52, height: 52, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "#FFEBEE", borderWidth: 3, borderColor: "#FFFFFF", boxShadow: shadow }}>
          <Text style={{ color: colors.danger, fontWeight: "900", fontSize: 18 }}>{initials(user?.name ?? "SA")}</Text>
        </View>
      </View>
      <View style={{ gap: 10, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
        <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Platform Administration</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <InfoCard label="Approved" value={String(approvedCount)} />
          <InfoCard label="Pending" value={String(pendingCount)} tone="amber" />
          <InfoCard label="Users" value={String(users.length)} tone="teal" />
        </View>
      </View>
      {error ? <Text selectable style={{ color: colors.danger, paddingHorizontal: 14 }}>{error}</Text> : null}
      {hospitals.length === 0 ? (
        <View style={{ gap: 10, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          <Text selectable style={{ color: colors.muted }}>No hospitals to display.</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Hospital Registry</Text>
          {hospitals.map((hospital) => (
            <View key={hospital.id} style={{ gap: 10, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text selectable style={{ fontWeight: "900", fontSize: 14, color: colors.navy }}>{hospital.name}</Text>
                  <Text selectable style={{ color: colors.muted, fontSize: 12 }}>{[hospital.city, hospital.state].filter(Boolean).join(", ")}</Text>
                </View>
                <Text style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: "hidden", backgroundColor: hospital.status === "approved" ? colors.successSoft : colors.warningSoft, color: hospital.status === "approved" ? colors.green : colors.amber, fontSize: 10, fontWeight: "900" }}>
                  {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                </Text>
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
