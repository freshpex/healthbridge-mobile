import { Image, Text, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { ScreenView } from "../../components/layout/screen";
import type { Screen } from "../../types/domain";
import onboardingImage from "../../../assets/images/onboarding-healthbridge.png";

export function OnboardingScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <ScreenView title="HealthBridge" subtitle="Securely access, manage, and share medical records across hospitals.">
      <Image source={onboardingImage} resizeMode="cover" style={{ width: "100%", aspectRatio: 1.58, borderRadius: 18, borderWidth: 1, borderColor: "#DCE8F5" }} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <InfoCard label="Hospital sync" value="Connected" />
        <InfoCard label="Emergency code" value="Ready" tone="amber" />
        <InfoCard label="Audit logs" value="Visible" tone="teal" />
      </View>
      <View style={{ gap: 10, padding: 16, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE8F5" }}>
        <Text style={{ fontSize: 18, fontWeight: "800" }}>Patients stay in control.</Text>
        <Text style={{ color: "#607089", lineHeight: 23 }}>Select hospitals during signup, request record sync, share scoped consent, revoke access, and review every audit event.</Text>
      </View>
      <PrimaryButton label="Get started" onPress={() => setScreen("signin")} />
    </ScreenView>
  );
}
