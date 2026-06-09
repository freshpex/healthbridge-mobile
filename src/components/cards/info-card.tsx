import { Text, View } from "react-native";
import { colors, shadow } from "../../constants/theme";

export function InfoCard({ label, value, tone = "blue" }: { label: string; value: string; tone?: "blue" | "teal" | "green" | "amber" }) {
  const accent = colors[tone];
  return (
    <View style={{ flex: 1, minWidth: 145, gap: 8, padding: 16, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
      <View style={{ width: 32, height: 4, borderRadius: 999, backgroundColor: accent }} />
      <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
      <Text selectable style={{ color: colors.ink, fontWeight: "900", fontSize: 22 }}>{value}</Text>
    </View>
  );
}
