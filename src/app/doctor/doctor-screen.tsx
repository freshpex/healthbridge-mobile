import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { InfoCard } from "../../components/cards/info-card";
import { ScreenView } from "../../components/layout/screen";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { PatientProfile, User } from "../../types/domain";
import { colors } from "../../constants/theme";

export function DoctorScreen({ token, user }: { token?: string; user?: User }) {
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
        if (alive) setError(caught instanceof Error ? caught.message : "Could not load doctor panel");
      });
    return () => {
      alive = false;
    };
  }, [token, user?.hospitalId]);

  const criticalCount = patients.filter((patient) => patient.allergies.length || patient.chronicConditions.length).length;

  return (
    <ScreenView title="Doctor portal" subtitle="Review patient history and add diagnoses, prescriptions, lab notes, and emergency notes.">
      {error ? <Text selectable style={{ color: colors.danger }}>{error}</Text> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <InfoCard label="Patient panel" value={String(patients.length)} />
        <InfoCard label="Clinical flags" value={String(criticalCount)} tone="amber" />
      </View>
      {patients.length === 0 ? <Text selectable style={{ color: colors.muted }}>No connected patients are visible for this doctor yet.</Text> : null}
      {patients.map((patient) => (
        <View key={patient.id} style={{ gap: 10, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{patient.fullName}</Text>
          <Text selectable>Allergies: {patient.allergies.join(", ") || "None recorded"}</Text>
          <Text selectable>Current medications: {patient.currentMedications.join(", ") || "None recorded"}</Text>
        </View>
      ))}
    </ScreenView>
  );
}
