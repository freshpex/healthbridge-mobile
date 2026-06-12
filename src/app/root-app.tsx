import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { MessageCircle } from "lucide-react-native";
import { OnboardingScreen } from "./auth/onboarding-screen";
import { SignInScreen } from "./auth/sign-in-screen";
import { SignUpScreen } from "./auth/sign-up-screen";
import { RoleSelectScreen } from "./auth/role-select-screen";
import { AppointmentsScreen } from "./patient/appointments-screen";
import { EmergencyCasesScreen } from "./emergency/emergency-cases-screen";
import { PatientHomeScreen } from "./patient/patient-home-screen";
import { AiChatScreen } from "./patient/ai-chat-screen";
import { AuditScreen } from "./patient/audit-screen";
import { RecordsScreen } from "./patient/records-screen";
import { SharingScreen } from "./patient/sharing-screen";
import { SymptomsScreen } from "./patient/symptoms-screen";
import { HospitalFinderScreen } from "./patient/hospital-finder-screen";
import { EmergencyCardScreen } from "./patient/emergency-card-screen";
import { ProfileScreen } from "./patient/profile-screen";
import { EmergencyScreen } from "./emergency/emergency-screen";
import { RoleWorkspaceScreen } from "./role-workspace/role-workspace-screen";
import { AuthenticatedHeader } from "../components/layout/authenticated-header";
import { Tabs } from "../navigation/tabs";
import { healthbridgeApi, type AuthSession } from "../services/healthbridge-api";
import type { Hospital, PatientDashboard, Role, Screen, User } from "../types/domain";
import { colors } from "../constants/theme";
import { homeForRole } from "../utilities/rbac";

const accessKey = "healthbridge-mobile-access-token";
const refreshKey = "healthbridge-mobile-refresh-token";
const authScreens: Screen[] = ["onboarding", "signin", "signup", "role-select"];
const patientLegacyScreens: Screen[] = ["patient", "patient-appointments", "records", "sharing", "emergency", "emergency-card", "emergency-cases", "symptoms", "hospital-finder", "audit", "profile"];
const screenTitles: Partial<Record<Screen, string>> = {
  patient: "Patient dashboard",
  "patient-appointments": "Appointments",
  records: "Medical records",
  sharing: "Consultations and sharing",
  emergency: "Emergency access",
  "emergency-card": "Emergency card",
  "emergency-cases": "Emergency cases",
  symptoms: "Symptom checker",
  "hospital-finder": "Hospital finder",
  audit: "Audit history",
  profile: "Profile and settings",
  doctor: "Doctor dashboard",
  "doctor-appointments": "Doctor appointments",
  "doctor-patients": "Assigned patients",
  "doctor-messages": "Consultations",
  "doctor-profile": "Doctor profile",
  hospital: "Hospital dashboard",
  "hospital-staff": "Staff and doctors",
  "hospital-patients": "Hospital patients",
  "hospital-appointments": "Operations",
  "hospital-profile": "Hospital profile",
  laboratory: "Laboratory dashboard",
  "laboratory-requests": "Test requests",
  "laboratory-results": "Lab results",
  "laboratory-patients": "Patient records",
  "laboratory-profile": "Lab profile",
  "emergency-dashboard": "Emergency dashboard",
  "emergency-requests": "Emergency requests",
  "emergency-notifications": "Emergency notifications",
  notifications: "Notifications",
  "emergency-profile": "Emergency profile",
  admin: "Admin dashboard",
  "admin-users": "Users",
  "admin-hospitals": "Hospitals",
  "admin-operations": "Operations",
  "admin-profile": "Admin profile"
};

export function RootApp() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [user, setUser] = useState<User | undefined>();
  const [token, setToken] = useState<string | undefined>();
  const [dashboard, setDashboard] = useState<PatientDashboard | undefined>();
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role>("patient");
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const insets = useSafeAreaInsets();

  const persistSession = async (session: AuthSession) => {
    setUser(session.user);
    setToken(session.accessToken);
    await Promise.all([SecureStore.setItemAsync(accessKey, session.accessToken), SecureStore.setItemAsync(refreshKey, session.refreshToken)]);
  };

  const loadDashboard = async (nextToken = token) => {
    if (!nextToken) return;
    setDashboardLoading(true);
    try { setDashboard(await healthbridgeApi.patientDashboard(nextToken)); } finally { setDashboardLoading(false); }
  };

  useEffect(() => {
    let alive = true;
    const boot = async () => {
      try {
        const [storedAccess, storedRefresh, nextHospitals] = await Promise.all([SecureStore.getItemAsync(accessKey), SecureStore.getItemAsync(refreshKey), healthbridgeApi.hospitals()]);
        if (!alive) return;
        setHospitals(nextHospitals.filter((hospital) => hospital.status === "approved"));
        if (storedAccess) {
          const nextUser = await healthbridgeApi.me(storedAccess);
          if (!alive) return;
          setUser(nextUser);
          setToken(storedAccess);
          setScreen(homeForRole[nextUser.role]);
          if (nextUser.role === "patient") void loadDashboard(storedAccess);
        } else if (storedRefresh) {
          const session = await healthbridgeApi.refresh(storedRefresh);
          if (!alive) return;
          await persistSession(session);
          setScreen(homeForRole[session.user.role]);
          if (session.user.role === "patient") void loadDashboard(session.accessToken);
        }
      } catch {
        await Promise.all([SecureStore.deleteItemAsync(accessKey), SecureStore.deleteItemAsync(refreshKey)]);
      } finally {
        if (alive) setBooting(false);
      }
    };
    void boot();
    return () => { alive = false; };
  }, []);

  const onSession = async (session: AuthSession) => {
    setError("");
    await persistSession(session);
    setScreen(homeForRole[session.user.role]);
    if (session.user.role === "patient") void loadDashboard(session.accessToken);
  };

  const logout = async () => {
    await Promise.all([SecureStore.deleteItemAsync(accessKey), SecureStore.deleteItemAsync(refreshKey)]);
    setUser(undefined);
    setToken(undefined);
    setDashboard(undefined);
    setScreen("signin");
  };

  const showAuthenticatedUi = !!user && !authScreens.includes(screen);
  const showAiButton = showAuthenticatedUi && screen !== "ai-chat";
  const title = useMemo(() => screenTitles[screen] ?? "HealthBridge", [screen]);

  if (booting) {
    return <SafeAreaView style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, justifyContent: "center", alignItems: "center", backgroundColor: colors.background, gap: 12 }}><ActivityIndicator color={colors.teal} /><Text selectable style={{ color: colors.muted }}>Checking HealthBridge session...</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {showAuthenticatedUi ? <AuthenticatedHeader title={title} dark={dark} onToggleTheme={() => setDark((value) => !value)} onNotifications={() => setScreen(user?.role === "emergency_staff" ? "emergency-notifications" : "notifications")} onLogout={() => void logout()} /> : null}
      <View style={{ flex: 1 }}>
        {screen === "onboarding" ? <OnboardingScreen setScreen={setScreen} /> : null}
        {screen === "signin" ? <SignInScreen onSession={onSession} setError={setError} onSwitchToSignup={() => setScreen("role-select")} onBack={() => setScreen("onboarding")} /> : null}
        {screen === "role-select" ? <RoleSelectScreen selectedRole={selectedRole} onSelectRole={(role) => { setSelectedRole(role); setScreen("signup"); }} onBack={() => setScreen("onboarding")} /> : null}
        {screen === "signup" ? <SignUpScreen hospitals={hospitals} selectedRole={selectedRole} onRoleChange={setSelectedRole} onSession={onSession} setError={setError} onSwitchToSignin={() => setScreen("signin")} onBack={() => setScreen("role-select")} /> : null}
        {error ? <Text selectable style={{ color: colors.danger, paddingHorizontal: 18, paddingTop: 8 }}>{error}</Text> : null}
        {screen === "patient" ? <PatientHomeScreen dashboard={dashboard} refresh={loadDashboard} setScreen={setScreen} logout={logout} loading={dashboardLoading} /> : null}
        {screen === "patient-appointments" ? <AppointmentsScreen token={token} dashboard={dashboard} hospitals={hospitals} refresh={loadDashboard} /> : null}
        {screen === "ai-chat" ? <AiChatScreen token={token} onBack={() => setScreen(homeForRole[user?.role ?? "patient"])} /> : null}
        {screen === "records" ? <RecordsScreen dashboard={dashboard} loading={dashboardLoading} /> : null}
        {screen === "sharing" ? <SharingScreen token={token} dashboard={dashboard} hospitals={hospitals} refresh={loadDashboard} /> : null}
        {screen === "emergency" ? <EmergencyScreen token={token} dashboard={dashboard} refresh={loadDashboard} setScreen={setScreen} /> : null}
        {screen === "emergency-card" ? token && user ? <EmergencyCardScreen token={token} user={user} /> : null : null}
        {screen === "emergency-cases" ? <EmergencyCasesScreen token={token} /> : null}
        {screen === "symptoms" ? token ? <SymptomsScreen token={token} setScreen={setScreen} /> : null : null}
        {screen === "hospital-finder" ? token ? <HospitalFinderScreen token={token} /> : null : null}
        {screen === "audit" ? <AuditScreen dashboard={dashboard} loading={dashboardLoading} /> : null}
        {user?.role === "patient" && screen === "profile" ? <ProfileScreen token={token} user={user} dashboard={dashboard} refresh={loadDashboard} /> : null}
        {showAuthenticatedUi && user && !patientLegacyScreens.includes(screen) && screen !== "ai-chat" ? <RoleWorkspaceScreen token={token} user={user} screen={screen} logout={logout} /> : null}
      </View>
      {showAiButton ? <Pressable onPress={() => setScreen("ai-chat")} style={{ position: "absolute", right: 18, bottom: insets.bottom + 94, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.blue, alignItems: "center", justifyContent: "center", shadowColor: "#0A1F44", shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}><MessageCircle color="#FFFFFF" size={24} /></Pressable> : null}
      {showAuthenticatedUi && user ? <View style={{ position: "absolute", left: 14, right: 14, bottom: insets.bottom + 14, padding: 8, borderRadius: 24, borderCurve: "continuous", borderWidth: 1, borderColor: colors.line, backgroundColor: "rgba(255,255,255,0.96)", boxShadow: "0 18px 40px rgba(14, 65, 115, 0.18)" }}><Tabs role={user.role} current={screen} onChange={setScreen} /></View> : null}
    </SafeAreaView>
  );
}
