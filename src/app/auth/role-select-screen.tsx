import { Pressable, Text, View } from "react-native";
import { ScreenView } from "../../components/layout/screen";
import { colors } from "../../constants/theme";
import type { Role } from "../../types/domain";

const roleOptions: Array<{ value: Role; label: string; description: string }> = [
  { value: "patient", label: "Patient", description: "Track your medical records, emergency access, and hospital connections." },
  { value: "doctor", label: "Doctor", description: "Access patient charts, request lab tests, and approve care plans." },
  { value: "hospital_admin", label: "Hospital Admin", description: "Manage hospital approvals, clinician access, and patient connections." },
  { value: "laboratory", label: "Laboratory", description: "Receive lab requests, submit results, and manage diagnostics." },
  { value: "emergency_staff", label: "Emergency Staff", description: "Access emergency patient information and coordinate urgent care." }
];

export function RoleSelectScreen({
  selectedRole,
  onSelectRole,
  onBack
}: {
  selectedRole: Role;
  onSelectRole: (role: Role) => void;
  onBack?: () => void;
}) {
  return (
    <ScreenView title="Create your HealthBridge account" subtitle="Choose the account type that fits your role before signing up." onBack={onBack}>
      <View style={{ gap: 12, padding: 16 }}>
        {roleOptions.map((option) => {
          const active = option.value === selectedRole;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelectRole(option.value)}
              style={{
                padding: 18,
                borderRadius: 16,
                backgroundColor: active ? colors.teal + "15" : colors.surface,
                borderWidth: 1,
                borderColor: active ? colors.teal : colors.line
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "900", color: colors.ink }}>{option.label}</Text>
              <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>{option.description}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScreenView>
  );
}
