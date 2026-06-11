import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { LogOut, MessageCircle } from "lucide-react-native";
import { OnboardingScreen } from "./auth/onboarding-screen";
import { SignInScreen } from "./auth/sign-in-screen";
import { SignUpScreen } from "./auth/sign-up-screen";
import { RoleSelectScreen } from "./auth/role-select-screen";
import { AdminScreen } from "./admin/admin-screen";
import { DoctorScreen } from "./doctor/doctor-screen";
import { EmergencyScreen } from "./emergency/emergency-screen";
import { HospitalScreen } from "./hospital/hospital-screen";
import { LaboratoryScreen } from "./laboratory/laboratory-screen";
import { PatientHomeScreen } from "./patient/patient-home-screen";
import { AiChatScreen } from "./patient/ai-chat-screen";
import { AuditScreen } from "./patient/audit-screen";
import { ProfileScreen } from "./patient/profile-screen";
import { RecordsScreen } from "./patient/records-screen";
import { SharingScreen } from "./patient/sharing-screen";
import { SymptomsScreen } from "./patient/symptoms-screen";
import { HospitalFinderScreen } from "./patient/hospital-finder-screen";
import { EmergencyCardScreen } from "./patient/emergency-card-screen";
import { Tabs } from "../navigation/tabs";
import { healthbridgeApi, type AuthSession } from "../services/healthbridge-api";
import type { Hospital, PatientDashboard, Role, Screen, User } from "../types/domain";
import { colors } from "../constants/theme";
import { homeForRole } from "../utilities/rbac";

const accessKey = "healthbridge-mobile-access-token";
const refreshKey = "healthbridge-mobile-refresh-token";
const patientScreens: Screen[] = ["patient", "records", "sharing", "emergency", "emergency-card", "symptoms", "hospital-finder", "audit", "profile"];
const screenTitles: Partial<Record<Screen, string>> = {
  patient: "Home",
  records: "Medical records",
  sharing: "Share records",
  emergency: "Emergency access",
  "emergency-card": "Emergency card",
  symptoms: "Symptom checker",
  "hospital-finder": "Hospital finder",
  audit: "Audit history",
  profile: "Profile"
};

export function RootApp() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [user, setUser] = useState<User | undefined>();
  const [token, setToken] = useState<string | undefined>();
  const [dashboard, setDashboard] = useState<PatientDashboard | undefined>();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role>("patient");
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");
  const insets = useSafeAreaInsets();

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

  const showPatientChrome = user?.role === "patient" && patientScreens.includes(screen);
  const showAuthenticatedUi = !!user && screen !== "onboarding" && screen !== "signin" && screen !== "signup" && screen !== "role-select";
  const showAiButton = showAuthenticatedUi && screen !== "ai-chat";

  if (booting) {
    return (
      <SafeAreaView style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, justifyContent: "center", alignItems: "center", backgroundColor: colors.background, gap: 12 }}>
        <ActivityIndicator color={colors.teal} />
        <Text selectable style={{ color: colors.muted }}>Checking HealthBridge session...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {showPatientChrome ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.line }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <View style={{ gap: 2 }}>
              <Text style={{ color: colors.teal, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 }}>HEALTHBRIDGE</Text>
              <Text style={{ color: colors.ink, fontSize: 18, fontWeight: "900" }}>{screenTitles[screen] ?? "HealthBridge"}</Text>
            </View>
            <Pressable
              onPress={logout}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.line
              }}
            >
              <LogOut color={colors.ink} size={16} />
              <Text style={{ color: colors.ink, fontWeight: "800", fontSize: 12 }}>Sign out</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        {screen === "onboarding" ? <OnboardingScreen setScreen={setScreen} /> : null}
        {screen === "signin" ? <SignInScreen onSession={onSession} setError={setError} onSwitchToSignup={() => setScreen("role-select")} onBack={() => setScreen("onboarding")} /> : null}
        {screen === "role-select" ? <RoleSelectScreen selectedRole={selectedRole} onSelectRole={(role) => { setSelectedRole(role); setScreen("signup"); }} onBack={() => setScreen("onboarding")} /> : null}
        {screen === "signup" ? <SignUpScreen hospitals={hospitals} selectedRole={selectedRole} onRoleChange={setSelectedRole} onSession={onSession} setError={setError} onSwitchToSignin={() => setScreen("signin")} onBack={() => setScreen("role-select")} /> : null}
        {error ? <Text selectable style={{ color: colors.danger, paddingHorizontal: 18, paddingTop: 8 }}>{error}</Text> : null}
        {screen === "patient" ? <PatientHomeScreen dashboard={dashboard} refresh={loadDashboard} setScreen={setScreen} logout={logout} /> : null}
        {screen === "ai-chat" ? <AiChatScreen token={token} onBack={() => setScreen("patient")} /> : null}
        {screen === "records" ? <RecordsScreen dashboard={dashboard} /> : null}
        {screen === "sharing" ? <SharingScreen token={token} dashboard={dashboard} hospitals={hospitals} refresh={loadDashboard} /> : null}
        {screen === "emergency" ? <EmergencyScreen token={token} dashboard={dashboard} refresh={loadDashboard} /> : null}
        {screen === "emergency-card" ? token && user ? <EmergencyCardScreen token={token} user={user} /> : null : null}
        {screen === "symptoms" ? token ? <SymptomsScreen token={token} setScreen={setScreen} /> : null : null}
        {screen === "hospital-finder" ? token ? <HospitalFinderScreen token={token} /> : null : null}
        {screen === "audit" ? <AuditScreen dashboard={dashboard} /> : null}
        {screen === "profile" ? <ProfileScreen token={token} dashboard={dashboard} refresh={loadDashboard} /> : null}
        {screen === "hospital" ? <HospitalScreen token={token} user={user} logout={logout} /> : null}
        {screen === "doctor" ? <DoctorScreen token={token} user={user} logout={logout} /> : null}
        {screen === "laboratory" ? token ? <LaboratoryScreen token={token} user={user} onLogout={logout} /> : null : null}
        {screen === "admin" ? <AdminScreen token={token} user={user} logout={logout} /> : null}
      </View>
      {showAiButton ? (
        <Pressable
          onPress={() => setScreen("ai-chat")}
          style={{
            position: "absolute",
            right: 18,
            bottom: showPatientChrome ? insets.bottom + 94 : insets.bottom + 18,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.blue,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#0A1F44",
            shadowOpacity: 0.18,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 8 },
            elevation: 10
          }}
        >
          <MessageCircle color="#FFFFFF" size={24} />
        </Pressable>
      ) : null}
      {showPatientChrome ? (
        <View style={{ position: "absolute", left: 14, right: 14, bottom: insets.bottom + 14, padding: 8, borderRadius: 24, borderCurve: "continuous", borderWidth: 1, borderColor: colors.line, backgroundColor: "rgba(255,255,255,0.96)", boxShadow: "0 18px 40px rgba(14, 65, 115, 0.18)" }}>
          <Tabs current={screen} onChange={setScreen} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
