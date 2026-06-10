import { Pressable, Text, View } from "react-native";
import { colors } from "../constants/theme";
import type { Screen } from "../types/domain";

export function Tabs({ current, onChange }: { current: Screen; onChange: (screen: Screen) => void }) {
  const items: Array<[Screen, string]> = [["patient", "Home"], ["records", "Records"], ["emergency", "+"], ["sharing", "Share"], ["profile", "Profile"]];
  return (
    <View style={{ flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "space-between" }}>
      {items.map(([screen, label]) => (
        <Pressable
          key={screen}
          onPress={() => onChange(screen)}
          style={{
            width: screen === "emergency" ? 48 : 58,
            height: screen === "emergency" ? 48 : 42,
            borderRadius: screen === "emergency" ? 999 : 8,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: screen === "emergency" ? colors.blue : current === screen ? colors.blueSoft : "transparent"
          }}
        >
          <Text style={{ color: screen === "emergency" ? "#FFFFFF" : current === screen ? colors.blue : colors.ink, fontWeight: "900", fontSize: screen === "emergency" ? 24 : 11 }}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
