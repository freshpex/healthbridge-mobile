import { Text, View } from "react-native";
import { ScreenView } from "../../components/layout/screen";
import type { PatientDashboard } from "../../types/domain";
import { colors } from "../../constants/theme";

const dateText = (value?: string) => value ? new Date(value).toLocaleString() : "Not set";

export function AuditScreen({ dashboard }: { dashboard?: PatientDashboard }) {
  return (
    <ScreenView title="Audit history" subtitle="Review who accessed, shared, or changed your medical data.">
      {!dashboard ? <Text selectable>Loading audit history...</Text> : null}
      {dashboard && dashboard.auditLogs.length === 0 ? <Text selectable style={{ color: colors.muted }}>No audit events have been recorded yet.</Text> : null}
      {dashboard?.auditLogs.map((log) => (
        <View key={log.id ?? log._id} style={{ gap: 8, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: log.emergency ? "#FFDCA1" : colors.line }}>
          <Text selectable style={{ fontWeight: "900", fontSize: 17 }}>{log.action}</Text>
          <Text selectable style={{ color: colors.muted }}>{log.actorRole.replace("_", " ")} | {dateText(log.createdAt)}</Text>
          {log.emergency ? <Text selectable style={{ color: "#B45309", fontWeight: "800" }}>Emergency access event</Text> : null}
        </View>
      ))}
    </ScreenView>
  );
}
