import { Pressable, Text } from "react-native";
import { colors } from "../../constants/theme";

export function PrimaryButton({ label, onPress, tone = "blue" }: { label: string; onPress: () => void; tone?: "blue" | "teal" | "light" }) {
  const backgroundColor = tone === "light" ? "#E9F5FF" : tone === "teal" ? colors.teal : colors.blue;
  const color = tone === "light" ? colors.blue : "#FFFFFF";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
        backgroundColor,
        opacity: pressed ? 0.82 : 1
      })}
    >
      <Text style={{ color, fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}
