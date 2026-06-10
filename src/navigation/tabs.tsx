import { Pressable, Text, View } from "react-native";
import { colors } from "../constants/theme";
import type { Screen } from "../types/domain";

export function Tabs({ current, onChange }: { current: Screen; onChange: (screen: Screen) => void }) {
  const items: Array<[Screen, string, string]> = [
    ["patient", "Home", "🏠"],
    ["records", "Records", "📋"],
    ["symptoms", "Symptoms", "🩺"],
    ["emergency-card", "Card", "🆘"],
    ["profile", "Profile", "👤"]
  ];

  return (
    <View style={{ flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "space-between" }}>
      {items.map(([screen, label, icon]) => (
        <Pressable
          key={screen}
          onPress={() => onChange(screen)}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            backgroundColor: current === screen ? colors.blueSoft : "transparent"
          }}
        >
          <Text style={{ color: current === screen ? colors.blue : colors.ink, fontWeight: "900", fontSize: 16 }}>
            {icon}
          </Text>
          <Text style={{ color: current === screen ? colors.blue : colors.ink, fontWeight: "800", fontSize: 9 }}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
