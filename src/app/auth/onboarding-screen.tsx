import { Image, Text, View } from "react-native";
import { ScreenView } from "../../components/layout/screen";
import type { Screen } from "../../types/domain";
import conceptImage from "../../../assets/images/healthbridge-mobile-concept.png";
import { PrimaryButton } from "../../components/buttons/primary-button";

export function OnboardingScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <ScreenView title="HealthBridge" subtitle="Secure medical records, hospital connections, and emergency access in one patient-controlled app.">
      <Image source={conceptImage} resizeMode="contain" style={{ width: "100%", aspectRatio: 0.47, borderRadius: 18 }} />
      <View style={{ gap: 10, padding: 16, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE8F5" }}>
        <Text style={{ fontSize: 18, fontWeight: "800" }}>Patients stay in control.</Text>
        <Text style={{ color: "#607089", lineHeight: 23 }}>Connect approved hospitals, manage emergency access, share records with consent, and review audit activity from your phone.</Text>
      </View>
      <PrimaryButton label="Get started" onPress={() => setScreen("signin")} />
    </ScreenView>
  );
}
