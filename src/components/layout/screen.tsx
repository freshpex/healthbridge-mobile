import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../constants/theme";

export function ScreenView({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 42 }}>
      <StatusBar style="dark" />
      <View style={{ gap: 8, paddingTop: 18 }}>
        <Text style={{ color: colors.ink, fontSize: 34, fontWeight: "900", lineHeight: 38 }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.muted, fontSize: 16, lineHeight: 24 }}>{subtitle}</Text> : null}
      </View>
      {children}
    </ScrollView>
  );
}
