import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { ScreenView } from "../../components/layout/screen";
import { colors } from "../../constants/theme";
import { healthbridgeApi, type AuthSession } from "../../services/healthbridge-api";
import type { Hospital, Role } from "../../types/domain";

const roleLabels: Record<Role, string> = {
  patient: "Patient",
  doctor: "Doctor",
  hospital_admin: "Hospital admin",
  laboratory: "Laboratory",
  emergency_staff: "Emergency staff",
  super_admin: "Super admin"
};

export function SignUpScreen({
  hospitals,
  selectedRole,
  onRoleChange,
  onSession,
  setError,
  onSwitchToSignin,
  onBack
}: {
  hospitals: Hospital[];
  selectedRole?: Role;
  onRoleChange?: (role: Role) => void;
  onSession: (session: AuthSession) => Promise<void>;
  setError: (message: string) => void;
  onSwitchToSignin: () => void;
  onBack?: () => void;
}) {
  const [role, setRole] = useState<Role>(selectedRole ?? "patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>(hospitals.slice(0, 1).map((hospital) => hospital.id));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRole) {
      setRole(selectedRole);
    }
  }, [selectedRole]);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const session = await healthbridgeApi.signup({ name, email, password, hospitalIds: selectedHospitals, role });
      await onSession(session);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenView
      title={`Create your ${roleLabels[role]} account`}
      subtitle={`Sign up as a ${roleLabels[role].toLowerCase()} and connect securely with approved hospitals.`}
      onBack={onBack}
    >
      <View style={{ gap: 14, padding: 16, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE8F5" }}>
        <Text style={{ fontSize: 16, fontWeight: "900", color: colors.ink }}>Join HealthBridge</Text>
        <Text style={{ color: colors.muted, lineHeight: 22 }}>
          Enter your information below to create a secure account. You can manage emergency access, consent sharing, and hospital connections from your phone.
        </Text>
      </View>

      <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
        <TextInput value={name} onChangeText={setName} placeholder="Full name" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
        <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingRight: 12, backgroundColor: colors.surface }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Password"
            style={{ flex: 1, padding: 14 }}
          />
          <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={10}>
            {showPassword ? <EyeOff color={colors.muted} size={18} /> : <Eye color={colors.muted} size={18} />}
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontWeight: "900", fontSize: 16 }}>Register as</Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {(["patient", "doctor", "hospital_admin", "laboratory", "emergency_staff"] as const).map((r) => (
            <Pressable
              key={r}
              onPress={() => {
                setRole(r);
                onRoleChange?.(r);
              }}
              style={{
                padding: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: role === r ? colors.teal : colors.line,
                backgroundColor: role === r ? colors.teal + "15" : colors.surface
              }}
            >
              <Text style={{ fontWeight: "800", textTransform: "capitalize" }}>{roleLabels[r]}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ fontWeight: "900", fontSize: 16 }}>Connect to approved hospitals</Text>
        {hospitals.length === 0 ? (
          <Text style={{ color: colors.muted }}>No approved hospitals are available yet. You can still register and connect once hospitals are available.</Text>
        ) : (
          hospitals.map((hospital) => {
            const checked = selectedHospitals.includes(hospital.id);
            return (
              <Pressable
                key={hospital.id}
                onPress={() => setSelectedHospitals((current) => (checked ? current.filter((id) => id !== hospital.id) : [...current, hospital.id]))}
                style={{ padding: 14, borderRadius: 10, borderWidth: 1, borderColor: checked ? colors.teal : colors.line, backgroundColor: checked ? colors.teal + "15" : colors.surface }}
              >
                <Text style={{ fontWeight: "800" }}>{checked ? "[x] " : "[ ] "}{hospital.name}</Text>
                <Text style={{ color: colors.muted }}>{hospital.city} | {hospital.specialties.join(", ")}</Text>
              </Pressable>
            );
          })
        )}
      </View>

      <PrimaryButton label={loading ? "Please wait..." : `Create ${roleLabels[role]} account`} onPress={submit} />

      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Pressable onPress={onSwitchToSignin} style={{ padding: 10 }}>
          <Text style={{ color: colors.blue, fontWeight: "700" }}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </ScreenView>
  );
}
