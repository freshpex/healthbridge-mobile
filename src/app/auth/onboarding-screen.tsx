import { Text, View } from "react-native";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react-native";
import { ScreenView } from "../../components/layout/screen";
import type { Screen } from "../../types/domain";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { colors } from "../../constants/theme";

export function OnboardingScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <ScreenView title="HealthBridge" subtitle="Secure records, connected hospitals, and emergency access in one patient-controlled app.">
      <View style={{ gap: 16, paddingVertical: 8 }}>
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
        <View style={{ flex: 1, padding: 14, borderRadius: 16, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.line }}>
          <LogIn size={18} color={colors.blue} />
          <Text style={{ marginTop: 10, fontWeight: "900", color: colors.ink }}>Sign in</Text>
          <Text style={{ marginTop: 4, color: colors.muted, lineHeight: 20 }}>Return to your records, appointments, sharing, and emergency access.</Text>
        </View>
        <View style={{ flex: 1, padding: 14, borderRadius: 16, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.line }}>
          <UserPlus size={18} color={colors.teal} />
          <Text style={{ marginTop: 10, fontWeight: "900", color: colors.ink }}>Create account</Text>
          <Text style={{ marginTop: 4, color: colors.muted, lineHeight: 20 }}>Start a secure patient, clinician, hospital, lab, or emergency profile.</Text>
        </View>
      </View>
      <PrimaryButton label="Sign in" onPress={() => setScreen("signin")} />
      <PrimaryButton tone="light" label="Create account" onPress={() => setScreen("role-select")} />
    </ScreenView>
  );
}
