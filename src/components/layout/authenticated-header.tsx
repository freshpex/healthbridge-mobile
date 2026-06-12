import { Pressable, Text, View } from "react-native";
import { Bell, HeartPulse, LogOut, Moon, Sun } from "lucide-react-native";
import { colors } from "../../constants/theme";

export function AuthenticatedHeader({ title, dark, onToggleTheme, onNotifications, onLogout }: { title: string; dark: boolean; onToggleTheme: () => void; onNotifications: () => void; onLogout: () => void }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.line }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: colors.blueSoft, alignItems: "center", justifyContent: "center" }}>
            <HeartPulse color={colors.teal} size={20} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: colors.teal, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 }}>HEALTHBRIDGE</Text>
            <Text numberOfLines={1} style={{ color: colors.ink, fontSize: 18, fontWeight: "900" }}>{title}</Text>
          </View>
        </View>
        <Pressable accessibilityLabel="Notifications" onPress={onNotifications} style={{ padding: 10, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          <Bell color={colors.ink} size={18} />
        </Pressable>
        <Pressable accessibilityLabel="Toggle color mode" onPress={onToggleTheme} style={{ padding: 10, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          {dark ? <Sun color={colors.ink} size={18} /> : <Moon color={colors.ink} size={18} />}
        </Pressable>
        <Pressable accessibilityLabel="Sign out" onPress={onLogout} style={{ padding: 10, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          <LogOut color={colors.ink} size={18} />
        </Pressable>
      </View>
    </View>
  );
}
