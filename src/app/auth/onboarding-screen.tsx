import { Text, View } from "react-native";
import { ShieldCheck, Sparkles, Stethoscope } from "lucide-react-native";
import { ScreenView } from "../../components/layout/screen";
import type { Screen } from "../../types/domain";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { colors } from "../../constants/theme";

export function OnboardingScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <ScreenView title="HealthBridge" subtitle="Secure records, connected hospitals, and emergency access in one patient-controlled app.">
      <View style={{ gap: 16, padding: 18, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, shadowColor: "#0E4173", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6 }}>
        <View style={{ width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.blueSoft }}>
          <ShieldCheck size={30} color={colors.blue} />
        </View>
        <Text style={{ fontSize: 28, fontWeight: "900", color: colors.ink, lineHeight: 34 }}>Stay connected to care without losing control.</Text>
        <Text style={{ color: colors.muted, lineHeight: 24 }}>HealthBridge keeps your medical profile, approved hospital connections, emergency access, and audit trail in one clean mobile experience.</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.blueSoft }}>
            <Text style={{ color: colors.blue, fontWeight: "800", fontSize: 12 }}>Patient-first</Text>
          </View>
          <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.successSoft }}>
            <Text style={{ color: colors.green, fontWeight: "800", fontSize: 12 }}>Consent-based sharing</Text>
          </View>
          <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.warningSoft }}>
            <Text style={{ color: colors.amber, fontWeight: "800", fontSize: 12 }}>Emergency ready</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, padding: 14, borderRadius: 16, backgroundColor: "#F2F8FF", borderWidth: 1, borderColor: colors.line }}>
          <Sparkles size={18} color={colors.blue} />
          <Text style={{ marginTop: 10, fontWeight: "900", color: colors.ink }}>Cleaner landing</Text>
          <Text style={{ marginTop: 4, color: colors.muted, lineHeight: 20 }}>No oversized hero image. Just a polished start screen with the brand and a clear path to sign in.</Text>
        </View>
        <View style={{ flex: 1, padding: 14, borderRadius: 16, backgroundColor: "#F0FBF8", borderWidth: 1, borderColor: colors.line }}>
          <Stethoscope size={18} color={colors.teal} />
          <Text style={{ marginTop: 10, fontWeight: "900", color: colors.ink }}>Patient account</Text>
          <Text style={{ marginTop: 4, color: colors.muted, lineHeight: 20 }}>Create one secure patient account and connect it to approved hospitals from the backend.</Text>
        </View>
      </View>
      <PrimaryButton label="Sign in" onPress={() => setScreen("signin")} />
      <PrimaryButton tone="light" label="Create account" onPress={() => setScreen("signup")} />
    </ScreenView>
  );
}
