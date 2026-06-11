import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { ScreenView } from "../../components/layout/screen";
import { colors } from "../../constants/theme";
import { healthbridgeApi, type AuthSession } from "../../services/healthbridge-api";

export function SignInScreen({
  onSession,
  setError,
  onSwitchToSignup
}: {
  onSession: (session: AuthSession) => Promise<void>;
  setError: (message: string) => void;
  onSwitchToSignup: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const session = await healthbridgeApi.login(email, password);
      await onSession(session);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenView title="Sign in to HealthBridge" subtitle="Use your patient account to access emergency access, records, and hospital connections.">
      <ScrollView contentContainerStyle={{ gap: 18 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 12, padding: 16, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE8F5" }}>
          <Text style={{ fontSize: 16, fontWeight: "900", color: colors.ink }}>Welcome back</Text>
          <Text style={{ color: colors.muted, lineHeight: 22 }}>Enter your email and password to continue. If you don’t have an account yet, create one and connect with approved hospitals.</Text>
        </View>

        <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
          <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
        </View>

        <PrimaryButton label={loading ? "Signing in..." : "Sign in securely"} onPress={submit} />

        <View style={{ alignItems: "center", paddingTop: 8 }}>
          <Pressable onPress={onSwitchToSignup} style={{ padding: 10 }}>
            <Text style={{ color: colors.blue, fontWeight: "700" }}>New here? Create an account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenView>
  );
}
