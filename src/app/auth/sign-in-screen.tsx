import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { ScreenView } from "../../components/layout/screen";
import { colors } from "../../constants/theme";
import { healthbridgeApi, type AuthSession } from "../../services/healthbridge-api";
import type { Hospital } from "../../types/domain";

export function SignInScreen({
  hospitals,
  onSession,
  setError
}: {
  hospitals: Hospital[];
  onSession: (session: AuthSession) => Promise<void>;
  setError: (message: string) => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("New Patient");
  const [email, setEmail] = useState("patient@healthbridge.test");
  const [password, setPassword] = useState("Password123!");
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>(hospitals.slice(0, 1).map((hospital) => hospital.id));
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const session = mode === "signin"
        ? await healthbridgeApi.login(email, password)
        : await healthbridgeApi.signup({ name, email, password, hospitalIds: selectedHospitals });
      await onSession(session);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenView title={mode === "signin" ? "Sign in" : "Create patient account"} subtitle="Connect securely to the HealthBridge backend API.">
      <View style={{ flexDirection: "row", gap: 8 }}>
        <PrimaryButton label="Sign in" tone={mode === "signin" ? "teal" : "light"} onPress={() => setMode("signin")} />
        <PrimaryButton label="Sign up" tone={mode === "signup" ? "teal" : "light"} onPress={() => setMode("signup")} />
      </View>
      <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
        {mode === "signup" ? <TextInput value={name} onChangeText={setName} placeholder="Full name" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} /> : null}
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
        <PrimaryButton label={loading ? "Please wait..." : mode === "signin" ? "Sign in securely" : "Create account"} onPress={submit} />
      </View>
      {mode === "signup" ? (
        <View style={{ gap: 10 }}>
          <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>Hospital connection during signup</Text>
          {hospitals.length === 0 ? <Text selectable style={{ color: colors.muted }}>No approved hospitals are currently available.</Text> : null}
          {hospitals.map((hospital) => {
            const checked = selectedHospitals.includes(hospital.id);
            return (
              <Pressable key={hospital.id} onPress={() => setSelectedHospitals((current) => checked ? current.filter((id) => id !== hospital.id) : [...current, hospital.id])} style={{ padding: 14, borderRadius: 10, borderWidth: 1, borderColor: checked ? colors.teal : colors.line, backgroundColor: colors.surface }}>
                <Text selectable style={{ fontWeight: "800" }}>{checked ? "[x] " : "[ ] "}{hospital.name}</Text>
                <Text selectable style={{ color: colors.muted }}>{hospital.city} | {hospital.specialties.join(", ")}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={{ padding: 16, borderRadius: 12, backgroundColor: "#E9F9F2" }}>
          <Text selectable style={{ color: "#09643D" }}>Seeded password: Password123!. Try patient@healthbridge.test, doctor@mercy.test, admin@mercy.test, superadmin@healthbridge.test, or emt@healthbridge.test.</Text>
        </View>
      )}
    </ScreenView>
  );
}
