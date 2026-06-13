import { Pressable, Text } from "react-native";
import { colors } from "../../constants/theme";

export function PrimaryButton({ label, onPress, tone = "blue", disabled = false }: { label: string; onPress: () => void; tone?: "blue" | "teal" | "light"; disabled?: boolean }) {
  const backgroundColor = tone === "light" ? colors.blueSoft : tone === "teal" ? colors.teal : colors.blue;
  const color = tone === "light" ? colors.blue : colors.onPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        minHeight: 48,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
        backgroundColor,
        opacity: disabled ? 0.5 : pressed ? 0.82 : 1
      })}
    >
      <Text style={{ color, fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}
