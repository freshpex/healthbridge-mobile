import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { OnboardingScreen } from "./auth/onboarding-screen";
import { SignInScreen } from "./auth/sign-in-screen";
import { AdminScreen } from "./admin/admin-screen";
import { DoctorScreen } from "./doctor/doctor-screen";
import { EmergencyScreen } from "./emergency/emergency-screen";
import { HospitalScreen } from "./hospital/hospital-screen";
import { PatientHomeScreen } from "./patient/patient-home-screen";
import { AuditScreen } from "./patient/audit-screen";
import { ProfileScreen } from "./patient/profile-screen";
import { RecordsScreen } from "./patient/records-screen";
import { SharingScreen } from "./patient/sharing-screen";
import { SymptomsScreen } from "./patient/symptoms-screen";
import { HospitalFinderScreen } from "./patient/hospital-finder-screen";
import { EmergencyCardScreen } from "./patient/emergency-card-screen";
import { Tabs } from "../navigation/tabs";
import { healthbridgeApi, type AuthSession } from "../services/healthbridge-api";
import type { Hospital, PatientDashboard, Screen, User } from "../types/domain";
import { colors } from "../constants/theme";
import { homeForRole } from "../utilities/rbac";

const accessKey = "healthbridge-mobile-access-token";
const refreshKey = "healthbridge-mobile-refresh-token";

export function RootApp() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [user, setUser] = useState<User | undefined>();
  const [token, setToken] = useState<string | undefined>();
  const [dashboard, setDashboard] = useState<PatientDashboard | undefined>();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");

  const persistSession = async (session: AuthSession) => {
    setUser(session.user);
    setToken(session.accessToken);
    await Promise.all([
      SecureStore.setItemAsync(accessKey, session.accessToken),
      SecureStore.setItemAsync(refreshKey, session.refreshToken)
    ]);
  };

  const loadDashboard = async (nextToken = token) => {
    if (!nextToken) return;
    setDashboard(await healthbridgeApi.patientDashboard(nextToken));
  };

  useEffect(() => {
    let alive = true;
    const boot = async () => {
      try {
        const [storedAccess, storedRefresh, nextHospitals] = await Promise.all([
          SecureStore.getItemAsync(accessKey),
          SecureStore.getItemAsync(refreshKey),
          healthbridgeApi.hospitals()
        ]);
        if (!alive) return;
        setHospitals(nextHospitals.filter((hospital) => hospital.status === "approved"));
        if (storedAccess) {
          const nextUser = await healthbridgeApi.me(storedAccess);
          if (!alive) return;
          setUser(nextUser);
          setToken(storedAccess);
          setScreen(homeForRole[nextUser.role]);
          if (nextUser.role === "patient") setDashboard(await healthbridgeApi.patientDashboard(storedAccess));
        } else if (storedRefresh) {
          const session = await healthbridgeApi.refresh(storedRefresh);
          if (!alive) return;
          await persistSession(session);
          setScreen(homeForRole[session.user.role]);
          if (session.user.role === "patient") setDashboard(await healthbridgeApi.patientDashboard(session.accessToken));
        }
      } catch {
        await Promise.all([SecureStore.deleteItemAsync(accessKey), SecureStore.deleteItemAsync(refreshKey)]);
      } finally {
        if (alive) setBooting(false);
      }
    };
    void boot();
    return () => {
      alive = false;
    };
  }, []);

  const onSession = async (session: AuthSession) => {
    setError("");
    await persistSession(session);
    setScreen(homeForRole[session.user.role]);
    if (session.user.role === "patient") {
      setDashboard(await healthbridgeApi.patientDashboard(session.accessToken));
    }
  };

  const logout = async () => {
    await Promise.all([SecureStore.deleteItemAsync(accessKey), SecureStore.deleteItemAsync(refreshKey)]);
    setUser(undefined);
    setToken(undefined);
    setDashboard(undefined);
    setScreen("signin");
  };

  const showPatientTabs = user?.role === "patient" && ["patient", "records", "sharing", "emergency", "emergency-card", "symptoms", "hospital-finder", "audit", "profile"].includes(screen);

  if (booting) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background, gap: 12 }}>
        <ActivityIndicator color={colors.teal} />
        <Text selectable style={{ color: colors.muted }}>Checking HealthBridge session...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {screen === "onboarding" ? <OnboardingScreen setScreen={setScreen} /> : null}
      {screen === "signin" ? <SignInScreen hospitals={hospitals} onSession={onSession} setError={setError} /> : null}
      {error ? <Text selectable style={{ color: colors.danger, paddingHorizontal: 18 }}>{error}</Text> : null}
      {screen === "patient" ? <PatientHomeScreen dashboard={dashboard} refresh={loadDashboard} setScreen={setScreen} logout={logout} /> : null}
      {screen === "records" ? <RecordsScreen dashboard={dashboard} /> : null}
      {screen === "sharing" ? <SharingScreen token={token} dashboard={dashboard} hospitals={hospitals} refresh={loadDashboard} /> : null}
      {screen === "emergency" ? <EmergencyScreen token={token} dashboard={dashboard} refresh={loadDashboard} /> : null}
      {screen === "emergency-card" ? token && user ? <EmergencyCardScreen token={token} user={user} /> : null : null}
      {screen === "symptoms" ? token ? <SymptomsScreen token={token} setScreen={setScreen} /> : null : null}
      {screen === "hospital-finder" ? token ? <HospitalFinderScreen token={token} /> : null : null}
      {screen === "audit" ? <AuditScreen dashboard={dashboard} /> : null}
      {screen === "profile" ? <ProfileScreen token={token} dashboard={dashboard} refresh={loadDashboard} /> : null}
      {screen === "hospital" ? <HospitalScreen token={token} user={user} /> : null}
      {screen === "doctor" ? <DoctorScreen token={token} user={user} /> : null}
      {screen === "admin" ? <AdminScreen token={token} /> : null}
      {showPatientTabs ? (
        <View style={{ position: "absolute", left: 14, right: 14, bottom: 14, padding: 8, borderRadius: 20, borderCurve: "continuous", borderWidth: 1, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, boxShadow: "0 18px 40px rgba(14, 65, 115, 0.18)" }}>
          <Tabs current={screen} onChange={setScreen} />
        </View>
      ) : null}
    </View>
  );
}
