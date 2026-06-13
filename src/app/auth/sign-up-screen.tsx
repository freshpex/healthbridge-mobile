import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { ScreenView } from "../../components/layout/screen";
import { colors } from "../../constants/theme";
import { healthbridgeApi, type AuthSession } from "../../services/healthbridge-api";
import type { Hospital, Role } from "../../types/domain";

type SignupRole = Exclude<Role, "super_admin">;

const roleLabels: Record<SignupRole, string> = {
  patient: "Patient",
  doctor: "Doctor",
  hospital_admin: "Hospital admin",
  laboratory: "Laboratory",
  emergency_staff: "Emergency staff"
};

const roleDescriptions: Record<SignupRole, string> = {
  patient: "Create a personal record account and connect securely with approved hospitals.",
  doctor: "Register as a clinician to access patient charts, review lab results, and coordinate care.",
  hospital_admin: "Join as a hospital admin to manage approvals, clinician access, and patient connections.",
  laboratory: "Register your lab to receive test requests and submit diagnostics.",
  emergency_staff: "Sign up as emergency staff to access urgent patient information and coordinate care."
};

const isSignupRole = (role: Role): role is SignupRole => role !== "super_admin";

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
  const [role, setRole] = useState<SignupRole>(isSignupRole(selectedRole) ? selectedRole : "patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>(hospitals.slice(0, 1).map((hospital) => hospital.id));
  const [labMode, setLabMode] = useState<"standalone" | "hospital">("standalone");
  const [certificationNumber, setCertificationNumber] = useState("");
  const [department, setDepartment] = useState("Diagnostics");
  const [capabilities, setCapabilities] = useState("CBC, Chemistry panel");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignupRole(selectedRole)) {
      setRole(selectedRole);
      onRoleChange?.(selectedRole);
    }
  }, [selectedRole, onRoleChange]);

  const submit = async () => {
    if (role === "patient" && selectedHospitals.length === 0) {
      setError("Select at least one approved hospital.");
      return;
    }
    if (role === "laboratory" && (!certificationNumber.trim() || !department.trim())) {
      setError("Enter the laboratory certification number and department.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const session = await healthbridgeApi.signup({
        name,
        email,
        password,
        role,
        hospitalIds: role === "patient" ? selectedHospitals : [],
        hospitalId: role === "laboratory" && labMode === "hospital" ? selectedHospitals[0] : undefined,
        labName: role === "laboratory" ? name : undefined,
        certificationNumber: role === "laboratory" ? certificationNumber.trim() : undefined,
        department: role === "laboratory" ? department.trim() : undefined,
        testCapabilities: role === "laboratory" ? capabilities.split(",").map((item) => item.trim()).filter(Boolean) : undefined
      });
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
        <Text style={{ color: colors.muted, lineHeight: 22 }}>{role === "laboratory" ? "Register as an independent laboratory or connect to a hospital when your lab operates inside a hospital network." : "Complete the details below and connect your account with approved hospitals to finish registration."}</Text>
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

      {role === "laboratory" ? (
        <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          <Text style={{ fontWeight: "900", fontSize: 16, color: colors.ink }}>Laboratory setup</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["standalone", "hospital"] as const).map((mode) => <Pressable key={mode} onPress={() => setLabMode(mode)} style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: labMode === mode ? colors.teal : colors.line, backgroundColor: labMode === mode ? colors.teal + "15" : colors.surface }}><Text style={{ fontWeight: "900", color: labMode === mode ? colors.teal : colors.ink }}>{mode === "standalone" ? "Standalone lab" : "Hospital-connected"}</Text><Text style={{ color: colors.muted, fontSize: 11 }}>{mode === "standalone" ? "Independent lab; no hospital required." : "Operates under a selected hospital."}</Text></Pressable>)}
          </View>
          <TextInput value={certificationNumber} onChangeText={setCertificationNumber} placeholder="Certification number" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
          <TextInput value={department} onChangeText={setDepartment} placeholder="Department" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
          <TextInput value={capabilities} onChangeText={setCapabilities} placeholder="Test capabilities, comma-separated" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
        </View>
      ) : null}

      {(role === "patient" || (role === "laboratory" && labMode === "hospital")) ? <View style={{ gap: 10 }}>
        <Text style={{ fontWeight: "900", fontSize: 16 }}>{role === "laboratory" ? "Select connected hospital" : "Connect to approved hospitals"}</Text>
        {hospitals.length === 0 ? (
          <Text style={{ color: colors.muted }}>No approved hospitals are available yet.</Text>
        ) : (
          hospitals.map((hospital) => {
            const checked = selectedHospitals.includes(hospital.id);
            return <Pressable key={hospital.id} onPress={() => setSelectedHospitals((current) => role === "laboratory" ? [hospital.id] : (checked ? current.filter((id) => id !== hospital.id) : [...current, hospital.id]))} style={{ padding: 14, borderRadius: 10, borderWidth: 1, borderColor: checked ? colors.teal : colors.line, backgroundColor: checked ? colors.teal + "15" : colors.surface }}><Text style={{ fontWeight: "800" }}>{checked ? "[x] " : "[ ] "}{hospital.name}</Text><Text style={{ color: colors.muted }}>{hospital.city} | {hospital.specialties.join(", ")}</Text></Pressable>;
          })
        )}
      </View> : null}

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
