import { Pressable, Text, View } from "react-native";
import { colors } from "../constants/theme";
import type { Screen } from "../types/domain";

export function Tabs({ current, onChange }: { current: Screen; onChange: (screen: Screen) => void }) {
  const items: Array<[Screen, string]> = [["patient", "Home"], ["records", "Records"], ["sharing", "Share"], ["emergency", "Emergency"]];
  return (
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
      {items.map(([screen, label]) => (
        <Pressable key={screen} onPress={() => onChange(screen)} style={{ minHeight: 40, borderRadius: 999, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", backgroundColor: current === screen ? colors.blue : "#E9F5FF" }}>
          <Text style={{ color: current === screen ? "#FFFFFF" : colors.blue, fontWeight: "800" }}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
