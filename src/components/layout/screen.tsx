import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../constants/theme";

export function ScreenView({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 128 }}>
      <StatusBar style="dark" />
      <View style={{ gap: 6, paddingTop: 14 }}>
        <Text style={{ color: colors.ink, fontSize: 27, fontWeight: "900", lineHeight: 32 }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>{subtitle}</Text> : null}
      </View>
      {children}
    </ScrollView>
  );
}
