import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { ScreenView } from "../../components/layout/screen";
import { colors } from "../../constants/theme";
import { demoPassword, hospitals, users } from "../../constants/demo-data";
import { homeForRole } from "../../utilities/rbac";
import type { Screen, User } from "../../types/domain";

export function SignInScreen({ setScreen, setUser }: { setScreen: (screen: Screen) => void; setUser: (user: User) => void }) {
  const [email, setEmail] = useState("patient@healthbridge.test");
  const [password, setPassword] = useState(demoPassword);
  const [selectedHospitals, setSelectedHospitals] = useState(["h-mercy"]);
  const [error, setError] = useState("");

  const signIn = () => {
    const user = users.find((candidate) => candidate.email === email);
    if (!user || password !== demoPassword) {
      setError("Invalid seeded credentials");
      return;
    }
    setUser(user);
    setScreen(homeForRole[user.role]);
  };

  return (
    <ScreenView title="Sign in" subtitle="Use seeded credentials or tap a persona for presentation mode.">
      <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="Email" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
        {error ? <Text selectable style={{ color: colors.danger }}>{error}</Text> : null}
        <PrimaryButton label="Sign in securely" onPress={signIn} />
      </View>
      <View style={{ gap: 10 }}>
        <Text style={{ fontWeight: "900", fontSize: 18 }}>Hospital connection during signup</Text>
        {hospitals.filter((hospital) => hospital.status === "approved").map((hospital) => {
          const checked = selectedHospitals.includes(hospital.id);
          return (
            <Pressable key={hospital.id} onPress={() => setSelectedHospitals((current) => checked ? current.filter((id) => id !== hospital.id) : [...current, hospital.id])} style={{ padding: 14, borderRadius: 10, borderWidth: 1, borderColor: checked ? colors.teal : colors.line, backgroundColor: colors.surface }}>
              <Text style={{ fontWeight: "800" }}>{checked ? "[x] " : "[ ] "}{hospital.name}</Text>
              <Text style={{ color: colors.muted }}>{hospital.city} | {hospital.specialties.join(", ")}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ gap: 8 }}>
        {users.map((candidate) => (
          <PrimaryButton key={candidate.id} label={`${candidate.name} - ${candidate.role.replace("_", " ")}`} tone="light" onPress={() => { setUser(candidate); setScreen(homeForRole[candidate.role]); }} />
        ))}
      </View>
    </ScreenView>
  );
}
