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
};

const roleDescriptions: Record<Role, string> = {
  patient: "Create a personal record account and connect securely with approved hospitals.",
  doctor: "Register as a clinician to access patient charts, review lab results, and coordinate care.",
  hospital_admin: "Join as a hospital admin to manage approvals, clinician access, and patient connections.",
  laboratory: "Register your lab to receive test requests and submit diagnostics.",
  emergency_staff: "Sign up as emergency staff to access urgent patient information and coordinate care.",
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
  selectedRole: Role;
  onRoleChange?: (role: Role) => void;
  onSession: (session: AuthSession) => Promise<void>;
  setError: (message: string) => void;
  onSwitchToSignin: () => void;
  onBack?: () => void;
}) {
  const [role, setRole] = useState<Role>(selectedRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>(hospitals.slice(0, 1).map((hospital) => hospital.id));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRole) {
      setRole(selectedRole);
      onRoleChange?.(selectedRole);
    }
  }, [selectedRole, onRoleChange]);

  const submit = async () => {
    if (selectedHospitals.length === 0) {
      setError("Select at least one approved hospital.");
      return;
    }

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
      title={`Create ${roleLabels[role]} account`}
      subtitle={roleDescriptions[role]}
      onBack={onBack}
    >
      <View style={{ gap: 12, padding: 16, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE8F5" }}>
        <Text style={{ color: colors.ink, fontSize: 18, fontWeight: "900" }}>Signing up as {roleLabels[role]}</Text>
        <Text style={{ color: colors.muted, lineHeight: 22 }}>Complete the details below and connect your account with approved hospitals to finish registration.</Text>
      </View>

      <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={role === "patient" ? "Full name" : "Full name or organization name"}
          style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }}
        />
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
        <Text style={{ fontWeight: "900", fontSize: 16 }}>Connect to approved hospitals</Text>
        {hospitals.length === 0 ? (
          <Text style={{ color: colors.muted }}>No approved hospitals are available yet. You can still register and connect once hospitals appear.</Text>
        ) : (
          hospitals.map((hospital) => {
            const checked = selectedHospitals.includes(hospital.id);
            return (
              <Pressable
                key={hospital.id}
                onPress={() => setSelectedHospitals((current) => (checked ? current.filter((id) => id !== hospital.id) : [...current, hospital.id]))}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: checked ? colors.teal : colors.line,
                  backgroundColor: checked ? colors.teal + "15" : colors.surface
                }}
              >
                <Text style={{ fontWeight: "800" }}>{checked ? "[x] " : "[ ] "}{hospital.name}</Text>
                <Text style={{ color: colors.muted }}>{hospital.city} | {hospital.specialties.join(", ")}</Text>
              </Pressable>
            );
          })
        )}
      </View>

      <PrimaryButton
        label={loading ? "Creating account..." : `Create ${roleLabels[role]} account`}
        onPress={submit}
      />

      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Pressable onPress={onSwitchToSignin} style={{ padding: 10 }}>
          <Text style={{ color: colors.blue, fontWeight: "700" }}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </ScreenView>
  );
}
