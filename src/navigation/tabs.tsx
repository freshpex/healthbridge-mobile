import { Pressable, Text, View } from "react-native";
import { Activity, Ambulance, Bell, Building2, CalendarDays, ClipboardList, FlaskConical, Home, MessageCircle, ShieldCheck, Stethoscope, UserRound, UsersRound, SearchCheck } from "lucide-react-native";
import { colors } from "../constants/theme";
import type { Role, Screen } from "../types/domain";

type TabItem = { screen: Screen; label: string; icon: typeof Home };

export const roleTabs: Record<Role, TabItem[]> = {
  patient: [
    { screen: "patient", label: "Home", icon: Home },
    { screen: "records", label: "Records", icon: ClipboardList },
    { screen: "patient-appointments", label: "Visits", icon: CalendarDays },
    { screen: "symptoms", label: "Symptoms", icon: SearchCheck },
    { screen: "emergency-card", label: "Emergency", icon: Ambulance },
    { screen: "profile", label: "Profile", icon: UserRound }
  ],
  doctor: [
    { screen: "doctor", label: "Dashboard", icon: Activity },
    { screen: "doctor-appointments", label: "Schedule", icon: CalendarDays },
    { screen: "doctor-patients", label: "Patients", icon: UsersRound },
    { screen: "doctor-messages", label: "Messages", icon: MessageCircle },
    { screen: "doctor-profile", label: "Profile", icon: UserRound }
  ],
  hospital_admin: [
    { screen: "hospital", label: "Dashboard", icon: Building2 },
    { screen: "hospital-staff", label: "Staff", icon: Stethoscope },
    { screen: "hospital-patients", label: "Patients", icon: UsersRound },
    { screen: "hospital-appointments", label: "Ops", icon: CalendarDays },
    { screen: "hospital-profile", label: "Profile", icon: UserRound }
  ],
  super_admin: [
    { screen: "admin", label: "Dashboard", icon: ShieldCheck },
    { screen: "admin-users", label: "Users", icon: UsersRound },
    { screen: "admin-hospitals", label: "Hospitals", icon: Building2 },
    { screen: "admin-operations", label: "Ops", icon: Activity },
    { screen: "admin-profile", label: "Profile", icon: UserRound }
  ],
  laboratory: [
    { screen: "laboratory", label: "Dashboard", icon: FlaskConical },
    { screen: "laboratory-requests", label: "Requests", icon: ClipboardList },
    { screen: "laboratory-results", label: "Results", icon: Activity },
    { screen: "laboratory-patients", label: "Patients", icon: UsersRound },
    { screen: "laboratory-profile", label: "Profile", icon: UserRound }
  ],
  emergency_staff: [
    { screen: "emergency-dashboard", label: "Dashboard", icon: Ambulance },
    { screen: "emergency-requests", label: "Requests", icon: ClipboardList },
    { screen: "emergency-cases", label: "Cases", icon: Activity },
    { screen: "emergency-notifications", label: "Alerts", icon: Bell },
    { screen: "emergency-profile", label: "Profile", icon: UserRound }
  ]
};

export function Tabs({ role, current, onChange }: { role: Role; current: Screen; onChange: (screen: Screen) => void }) {
  const items = roleTabs[role];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      {items.map(({ screen, label, icon: Icon }) => {
        const active = current === screen;
        return (
          <Pressable key={screen} onPress={() => onChange(screen)} style={{ flex: 1, paddingVertical: 9, borderRadius: 14, alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: active ? colors.blueSoft : "transparent" }}>
            <Icon color={active ? colors.blue : colors.muted} size={21} />
            <Text style={{ color: active ? colors.blue : colors.muted, fontWeight: "800", fontSize: 10 }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
