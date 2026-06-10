import { Pressable, Text, View } from "react-native";
import { colors } from "../constants/theme";
import type { Screen } from "../types/domain";

export function Tabs({ current, onChange }: { current: Screen; onChange: (screen: Screen) => void }) {
  const items: Array<[Screen, string, string]> = [["patient", "Home", "H"], ["records", "Records", "R"], ["emergency", "", "+"], ["sharing", "Share", "S"], ["profile", "Profile", "P"]];
  return (
    <View style={{ flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "space-between" }}>
      {items.map(([screen, label, icon]) => (
        <Pressable
          key={screen}
          onPress={() => onChange(screen)}
          style={{
            width: screen === "emergency" ? 52 : 60,
            height: screen === "emergency" ? 52 : 48,
            borderRadius: screen === "emergency" ? 999 : 8,
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            backgroundColor: screen === "emergency" ? colors.blue : current === screen ? colors.blueSoft : "transparent"
          }}
        >
          <Text style={{ color: screen === "emergency" ? "#FFFFFF" : current === screen ? colors.blue : colors.ink, fontWeight: "900", fontSize: screen === "emergency" ? 25 : 14 }}>{icon}</Text>
          {label ? <Text style={{ color: current === screen ? colors.blue : colors.ink, fontWeight: "800", fontSize: 10 }}>{label}</Text> : null}
        </Pressable>
      ))}
    </View>
  );
}
