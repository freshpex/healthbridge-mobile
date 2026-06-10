import { ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors, shadow } from "../../constants/theme";
import type { PatientDashboard } from "../../types/domain";

const dateText = (value?: string) => value ? new Date(value).toLocaleDateString() : "Not set";

export function RecordsScreen({ dashboard }: { dashboard?: PatientDashboard }) {
  const records = dashboard?.records ?? [];
  const labs = dashboard?.labResults ?? [];
  const prescriptions = dashboard?.prescriptions ?? [];
  const appointments = dashboard?.appointments ?? [];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 12, paddingBottom: 112 }}>
      <StatusBar style="dark" />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
        <Text style={{ color: colors.ink, fontSize: 24, fontWeight: "900" }}>{"<"}</Text>
        <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "900" }}>Medical records</Text>
        <Text style={{ color: colors.ink, fontSize: 18, fontWeight: "900" }}>v</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {["All", "Lab", "Imaging", "Visits", "Other"].map((item, index) => (
          <View key={item} style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 7, backgroundColor: index === 0 ? colors.blue : "#EEF3F8" }}>
            <Text style={{ color: index === 0 ? "#FFFFFF" : colors.muted, fontSize: 11, fontWeight: "900" }}>{item}</Text>
          </View>
        ))}
      </View>
      {!dashboard ? <Text selectable>Loading records...</Text> : null}
      {dashboard && records.length === 0 && labs.length === 0 ? <Text selectable style={{ color: colors.muted }}>No medical records have synced yet.</Text> : null}
      {records.map((record) => (
        <View key={record.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: record.critical ? "#FFDCA1" : colors.line, boxShadow: shadow }}>
          <View style={{ width: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: record.critical ? "#FFF6DF" : colors.blueSoft }}>
            <Text style={{ color: record.critical ? colors.amber : colors.blue, fontWeight: "900" }}>{record.type[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text selectable numberOfLines={1} style={{ color: colors.ink, fontWeight: "900", fontSize: 13 }}>{record.title}</Text>
            <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 11 }}>{dateText(record.date)} · {record.type}</Text>
          </View>
          <Text style={{ paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, overflow: "hidden", backgroundColor: "#F1F5F9", color: colors.muted, fontSize: 10, fontWeight: "900" }}>{record.critical ? "ALERT" : "PDF"}</Text>
        </View>
      ))}
      {labs.map((lab) => (
        <View key={lab._id} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
          <View style={{ width: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "#EFE7FF" }}>
            <Text style={{ color: "#7C3AED", fontWeight: "900" }}>L</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text selectable numberOfLines={1} style={{ color: colors.ink, fontWeight: "900", fontSize: 13 }}>{lab.testName}</Text>
            <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 11 }}>{dateText(lab.collectedAt)} · {lab.result}</Text>
          </View>
          <Text style={{ paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, overflow: "hidden", backgroundColor: "#F1F5F9", color: colors.muted, fontSize: 10, fontWeight: "900" }}>PDF</Text>
        </View>
      ))}
      {prescriptions.map((rx) => (
        <View key={rx._id} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
          <View style={{ width: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "#E8F9F1" }}>
            <Text style={{ color: colors.green, fontWeight: "900" }}>P</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text selectable numberOfLines={1} style={{ color: colors.ink, fontWeight: "900", fontSize: 13 }}>{rx.medication}</Text>
            <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 11 }}>{rx.dosage} · {rx.frequency}</Text>
          </View>
          <Text style={{ paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, overflow: "hidden", backgroundColor: "#F1F5F9", color: colors.muted, fontSize: 10, fontWeight: "900" }}>{rx.active ? "ACTIVE" : "PAST"}</Text>
        </View>
      ))}
      {appointments.map((appointment) => (
        <View key={appointment._id} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
          <View style={{ width: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF6DF" }}>
            <Text style={{ color: colors.amber, fontWeight: "900" }}>V</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text selectable numberOfLines={1} style={{ color: colors.ink, fontWeight: "900", fontSize: 13 }}>{appointment.reason}</Text>
            <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 11 }}>{dateText(appointment.scheduledAt)} · {appointment.status}</Text>
          </View>
          <Text style={{ paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, overflow: "hidden", backgroundColor: "#F1F5F9", color: colors.muted, fontSize: 10, fontWeight: "900" }}>VISIT</Text>
        </View>
      ))}
    </ScrollView>
  );
}
