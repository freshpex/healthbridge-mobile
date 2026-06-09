import { Text, View } from "react-native";
import { InfoCard } from "../../components/cards/info-card";
import { ScreenView } from "../../components/layout/screen";
import { hospitals } from "../../constants/demo-data";
import { colors } from "../../constants/theme";

export function AdminScreen() {
  return (
    <ScreenView title="Super admin" subtitle="Approve hospitals and monitor platform governance.">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <InfoCard label="Approved" value={String(hospitals.filter((hospital) => hospital.status === "approved").length)} />
        <InfoCard label="Pending" value={String(hospitals.filter((hospital) => hospital.status === "pending").length)} tone="amber" />
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
