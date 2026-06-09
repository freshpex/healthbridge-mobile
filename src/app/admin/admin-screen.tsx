import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { InfoCard } from "../../components/cards/info-card";
import { ScreenView } from "../../components/layout/screen";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { Hospital, User } from "../../types/domain";
import { colors } from "../../constants/theme";

export function AdminScreen({ token }: { token?: string }) {
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

  return (
    <ScreenView title="Super admin" subtitle="Approve hospitals and monitor platform governance.">
      {error ? <Text selectable style={{ color: colors.danger }}>{error}</Text> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <InfoCard label="Approved" value={String(hospitals.filter((hospital) => hospital.status === "approved").length)} />
        <InfoCard label="Pending" value={String(hospitals.filter((hospital) => hospital.status === "pending").length)} tone="amber" />
        <InfoCard label="Users" value={String(users.length)} tone="teal" />
      </View>
      {hospitals.map((hospital) => (
        <View key={hospital.id} style={{ gap: 6, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          <Text selectable style={{ fontWeight: "900" }}>{hospital.name}</Text>
          <Text selectable>{hospital.city} | {hospital.status}</Text>
        </View>
      ))}
    </ScreenView>
  );
}
