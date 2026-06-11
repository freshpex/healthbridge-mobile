import { Pressable, Text, View } from "react-native";
import { Activity, CirclePlus, FileText, Home, Share2, UserRound } from "lucide-react-native";
import { colors } from "../constants/theme";
import type { Screen } from "../types/domain";

export function Tabs({ current, onChange }: { current: Screen; onChange: (screen: Screen) => void }) {
  const items: Array<{ screen: Screen; label: string; icon: typeof Home; center?: boolean }> = [
    { screen: "patient", label: "Home", icon: Home },
    { screen: "records", label: "Records", icon: FileText },
    { screen: "symptoms", label: "Symptoms", icon: Activity },
    { screen: "emergency-card", label: "Card", icon: CirclePlus, center: true },
    { screen: "sharing", label: "Share", icon: Share2 },
    { screen: "profile", label: "Profile", icon: UserRound }
  ];

  const navigate = (screen: Screen, center?: boolean) => onChange(center ? "emergency-card" : screen);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      {items.map(({ screen, label, icon: Icon, center }) => {
        const active = !center && current === screen;
        if (center) {
          return (
            <Pressable
              key="center-action"
              onPress={() => navigate(screen, true)}
              style={{
                width: 52,
                height: 52,
                marginTop: -18,
                borderRadius: 26,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.blue,
                borderWidth: 4,
                borderColor: "#FFFFFF",
                shadowColor: "#0A1F44",
                shadowOpacity: 0.18,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 8 },
                elevation: 8
              }}
            >
              <Icon color="#FFFFFF" size={24} />
            </Pressable>
          );
        }

        return (
          <Pressable
            key={screen}
            onPress={() => onChange(screen)}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              backgroundColor: active ? colors.blueSoft : "transparent"
            }}
          >
            <Icon color={active ? colors.blue : colors.muted} size={21} />
            <Text style={{ color: active ? colors.blue : colors.muted, fontWeight: "800", fontSize: 10 }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
