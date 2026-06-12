import { Pressable, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { ScreenView } from "../../components/layout/screen";
import { colors, shadow } from "../../constants/theme";
import type { PatientDashboard, Screen } from "../../types/domain";

const contactText = (contact: PatientDashboard["profile"]["emergencyContact"]) =>
  typeof contact === "string" ? contact : [contact?.name, contact?.relationship, contact?.phone].filter(Boolean).join(", ");
const initials = (name: string) => name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
const dateText = (value?: string) => value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Not set";

export function PatientHomeScreen({ dashboard, refresh, setScreen, logout, loading }: { dashboard?: PatientDashboard; refresh: () => Promise<void>; setScreen: (screen: Screen) => void; logout: () => Promise<void>; loading?: boolean }) {
  if (!dashboard) {
    return (
      <ScreenView title="Patient dashboard" subtitle="Loading your secure health bridge.">
        <Text selectable>{loading ? "Loading patient data from the API..." : "Preparing your patient workspace..."}</Text>
        <PrimaryButton label="Refresh" onPress={refresh} />
      </ScreenView>
    );
  }

  const patient = dashboard.profile;
  const hospitals = patient.hospitalIds ?? [];
  const records = dashboard.records.slice(0, 4);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 112 }}>
      <StatusBar style="dark" />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 12 }}>
        <View>
          <Text style={{ color: colors.ink, fontSize: 12, fontWeight: "700" }}>Welcome back,</Text>
          <Text style={{ color: colors.navy, fontSize: 24, fontWeight: "900" }}>{patient.fullName.split(" ")[0]}</Text>
        </View>
        <View style={{ width: 52, height: 52, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "#DFF4F8", borderWidth: 3, borderColor: "#FFFFFF", boxShadow: shadow }}>
          <Text style={{ color: colors.navy, fontWeight: "900", fontSize: 18 }}>{initials(patient.fullName)}</Text>
        </View>
      </View>
      <Pressable onPress={() => setScreen("emergency")} style={{ gap: 10, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: "#FFC9C2", borderLeftWidth: 4, borderLeftColor: colors.danger, boxShadow: shadow }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: colors.ink, fontWeight: "900" }}>Emergency access</Text>
          <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "900" }}>{">"}</Text>
        </View>
        <Text style={{ color: colors.danger, fontSize: 11, fontWeight: "800" }}>Your emergency code</Text>
        <Text style={{ color: colors.danger, fontSize: 22, fontWeight: "900", letterSpacing: 0.2 }}>{patient.emergencyCode ?? "Not enabled"}</Text>
      </Pressable>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <InfoCard label="Blood" value={patient.bloodGroup} />
        <InfoCard label="Records" value={String(dashboard.records.length)} tone="teal" />
        <InfoCard label="Shares" value={String(dashboard.shares.filter((share) => share.status === "active").length)} tone="green" />
      </View>
      <View style={{ gap: 10, padding: 14, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Connected hospitals</Text>
          <Text onPress={() => setScreen("sharing")} style={{ color: colors.blue, fontWeight: "900", fontSize: 12 }}>View all</Text>
        </View>
        {(hospitals.length ? hospitals : patient.connectedHospitalIds.map((id) => ({ id, name: id, city: "", state: "" }))).slice(0, 3).map((hospital) => (
          <View key={hospital.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.line }}>
            <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: colors.blueSoft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#CBE3FF" }}>
              <Text style={{ color: colors.blue, fontWeight: "900" }}>+</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text selectable numberOfLines={1} style={{ color: colors.ink, fontWeight: "900", fontSize: 13 }}>{hospital.name}</Text>
              <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 12 }}>{[hospital.city, hospital.state].filter(Boolean).join(", ") || "Connected"}</Text>
            </View>
            <Text style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: "hidden", backgroundColor: colors.successSoft, color: colors.green, fontSize: 10, fontWeight: "900" }}>Connected</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: 10, padding: 14, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Medical records</Text>
          <Text onPress={() => setScreen("records")} style={{ color: colors.blue, fontWeight: "900", fontSize: 12 }}>View all</Text>
        </View>
        {records.map((record) => (
          <View key={record.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line }}>
            <View style={{ width: 32, height: 32, borderRadius: 999, backgroundColor: record.critical ? "#FFF6DF" : colors.blueSoft, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: record.critical ? colors.amber : colors.blue, fontWeight: "900" }}>{record.type[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text selectable numberOfLines={1} style={{ color: colors.ink, fontWeight: "900", fontSize: 13 }}>{record.title}</Text>
              <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 12 }}>{dateText(record.date)}</Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "800" }}>{record.critical ? "Critical" : "PDF"}</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: 8, padding: 14, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
        <Text selectable style={{ color: colors.ink, fontWeight: "900" }}>Profile safety summary</Text>
        <Text selectable style={{ color: colors.muted, lineHeight: 20 }}>Allergies: {patient.allergies.join(", ") || "None recorded"}</Text>
        <Text selectable style={{ color: colors.muted, lineHeight: 20 }}>Emergency contact: {contactText(patient.emergencyContact) || "Not set"}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><PrimaryButton label="Symptom checker" tone="light" onPress={() => setScreen("symptoms")} /></View>
        <View style={{ flex: 1 }}><PrimaryButton label="AI Assistant" tone="light" onPress={() => setScreen("ai-chat")} /></View>
      </View>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
        <View style={{ flex: 1 }}><PrimaryButton label="Refresh" tone="light" onPress={refresh} /></View>
        <View style={{ flex: 1 }}><PrimaryButton label="Sign out" tone="light" onPress={logout} /></View>
      </View>
    </ScrollView>
  );
}
