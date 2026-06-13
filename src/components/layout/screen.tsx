import type { ReactNode } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../constants/theme";

export function ScreenView({ title, subtitle, children, onBack }: { title: string; subtitle?: string; children: ReactNode; onBack?: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 128 + insets.bottom }}
      >
        <StatusBar style={colors.background === "#061221" ? "light" : "dark"} />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {onBack ? (
            <Pressable onPress={onBack} style={{ padding: 8 }}>
              <Text style={{ color: colors.blue, fontWeight: "800" }}>{"< Back"}</Text>
            </Pressable>
          ) : <View />}
        </View>
        <View style={{ gap: 6, paddingTop: 4 }}>
          <Text style={{ color: colors.ink, fontSize: 27, fontWeight: "900", lineHeight: 32 }}>{title}</Text>
          {subtitle ? <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
