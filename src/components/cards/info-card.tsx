import { Text, View } from "react-native";
import { colors, shadow } from "../../constants/theme";

export function InfoCard({ label, value, tone = "blue" }: { label: string; value: string; tone?: "blue" | "teal" | "green" | "amber" }) {
  const accent = colors[tone];
  return (
    <View style={{ flex: 1, minWidth: 104, gap: 7, padding: 12, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
      <View style={{ width: 32, height: 4, borderRadius: 999, backgroundColor: accent }} />
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "700" }}>{label}</Text>
      <Text selectable style={{ color: colors.ink, fontWeight: "900", fontSize: 18 }}>{value}</Text>
    </View>
  );
}
