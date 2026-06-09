import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { InfoCard } from "../../components/cards/info-card";
import { ScreenView } from "../../components/layout/screen";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { PatientProfile, User } from "../../types/domain";
import { colors } from "../../constants/theme";

export function HospitalScreen({ token, user }: { token?: string; user?: User }) {
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
    <ScreenView title="Hospital portal" subtitle="Verify connected patients, manage staff, upload records, and handle sync requests.">
      {error ? <Text selectable style={{ color: colors.danger }}>{error}</Text> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <InfoCard label="Hospital" value={user?.hospitalId ? "connected" : "missing"} />
        <InfoCard label="Connected patients" value={String(patients.length)} tone="teal" />
        <InfoCard label="Role" value={user?.role.replace("_", " ") ?? "staff"} tone="green" />
      </View>
      {patients.length === 0 ? <Text selectable style={{ color: colors.muted }}>No connected patients are visible yet.</Text> : null}
      {patients.map((patient) => (
        <View key={patient.id} style={{ gap: 6, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{patient.fullName}</Text>
          <Text selectable>Blood: {patient.bloodGroup}</Text>
          <Text selectable>Allergies: {patient.allergies.join(", ") || "None recorded"}</Text>
          <Text selectable>Conditions: {patient.chronicConditions.join(", ") || "None recorded"}</Text>
        </View>
      ))}
    </ScreenView>
  );
}
