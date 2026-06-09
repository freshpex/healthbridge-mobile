import { Text, View } from "react-native";
import { ScreenView } from "../../components/layout/screen";
import { colors } from "../../constants/theme";
import type { PatientDashboard } from "../../types/domain";

const dateText = (value?: string) => value ? new Date(value).toLocaleDateString() : "Not set";

export function RecordsScreen({ dashboard }: { dashboard?: PatientDashboard }) {
  return (
    <ScreenView title="Medical records" subtitle="History, lab results, prescriptions, diagnoses, appointments, and uploaded documents.">
      {!dashboard ? <Text selectable>Loading records...</Text> : null}
      {dashboard && dashboard.records.length === 0 ? <Text selectable style={{ color: colors.muted }}>No medical records have synced yet.</Text> : null}
      {dashboard?.records.map((record) => (
        <View key={record.id} style={{ gap: 8, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: record.critical ? "#FFDCA1" : colors.line }}>
          <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{record.title}</Text>
          <Text selectable style={{ color: colors.muted }}>{record.type} | {dateText(record.date)}</Text>
          <Text selectable style={{ lineHeight: 22 }}>{record.summary}</Text>
        </View>
      ))}
      {dashboard?.labResults.map((lab) => (
        <View key={lab._id} style={{ gap: 8, padding: 16, borderRadius: 12, backgroundColor: "#EFFCFF", borderWidth: 1, borderColor: colors.line }}>
          <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{lab.testName}</Text>
          <Text selectable>{lab.result}</Text>
          <Text selectable style={{ color: colors.muted }}>{lab.status} | {dateText(lab.collectedAt)}</Text>
        </View>
      ))}
      {dashboard?.prescriptions.map((rx) => (
        <View key={rx._id} style={{ gap: 8, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{rx.medication}</Text>
          <Text selectable>{rx.dosage} | {rx.frequency}</Text>
          <Text selectable style={{ color: colors.muted }}>{rx.active ? "Active" : "Inactive"}</Text>
        </View>
      ))}
      {dashboard?.appointments.map((appointment) => (
        <View key={appointment._id} style={{ gap: 8, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{appointment.reason}</Text>
          <Text selectable>{dateText(appointment.scheduledAt)}</Text>
          <Text selectable style={{ color: colors.muted }}>{appointment.status}</Text>
        </View>
      ))}
    </ScreenView>
  );
}
