import { useState } from "react";
import { View } from "react-native";
import { OnboardingScreen } from "./auth/onboarding-screen";
import { SignInScreen } from "./auth/sign-in-screen";
import { AdminScreen } from "./admin/admin-screen";
import { DoctorScreen } from "./doctor/doctor-screen";
import { EmergencyScreen } from "./emergency/emergency-screen";
import { HospitalScreen } from "./hospital/hospital-screen";
import { PatientHomeScreen } from "./patient/patient-home-screen";
import { RecordsScreen } from "./patient/records-screen";
import { SharingScreen } from "./patient/sharing-screen";
import { Tabs } from "../navigation/tabs";
import type { Screen, User } from "../types/domain";
import { colors } from "../constants/theme";

export function RootApp() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [user, setUser] = useState<User | undefined>();

  const showPatientTabs = user?.role === "patient" && ["patient", "records", "sharing", "emergency"].includes(screen);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {screen === "onboarding" ? <OnboardingScreen setScreen={setScreen} /> : null}
      {screen === "signin" ? <SignInScreen setScreen={setScreen} setUser={setUser} /> : null}
      {screen === "patient" ? <PatientHomeScreen setScreen={setScreen} /> : null}
      {screen === "records" ? <RecordsScreen /> : null}
      {screen === "sharing" ? <SharingScreen /> : null}
      {screen === "emergency" ? <EmergencyScreen /> : null}
      {screen === "hospital" ? <HospitalScreen /> : null}
      {screen === "doctor" ? <DoctorScreen /> : null}
      {screen === "admin" ? <AdminScreen /> : null}
      {showPatientTabs ? (
        <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface }}>
          <Tabs current={screen} onChange={setScreen} />
        </View>
      ) : null}
    </View>
  );
}
