import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { ScreenView } from "../../components/layout/screen";
import { colors } from "../../constants/theme";
import { healthbridgeApi, type AuthSession } from "../../services/healthbridge-api";
import type { Hospital } from "../../types/domain";

type SignUpRole = "patient" | "doctor" | "hospital" | "laboratory" | "emergency";

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
  const [signupRole, setSignupRole] = useState<SignUpRole>("patient");
  const [labType, setLabType] = useState<"standalone" | "affiliated">("standalone");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>(hospitals.slice(0, 1).map((hospital) => hospital.id));
  const [labName, setLabName] = useState("");
  const [certificationNumber, setCertificationNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [testCapabilities, setTestCapabilities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const testTypes = [
    "Blood Tests",
    "Urinalysis",
    "Chemistry",
    "Hematology",
    "Microbiology",
    "Immunology",
    "Pathology",
    "Toxicology",
    "Histology",
    "Cytology"
  ];

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

  const handleTestCapabilityChange = (test: string) => {
    setTestCapabilities((current) =>
      current.includes(test)
        ? current.filter((t) => t !== test)
        : [...current, test]
    );
  };

  return (
    <ScreenView title={mode === "signin" ? "Welcome back" : `Register as ${signupRole === "hospital" ? "hospital" : signupRole}`} subtitle="Secure access for patients, hospitals, doctors, admins, and emergency teams.">
      <ScrollView contentContainerStyle={{ gap: 12 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <PrimaryButton label="Sign in" tone={mode === "signin" ? "teal" : "light"} onPress={() => setMode("signin")} />
          <PrimaryButton label="Sign up" tone={mode === "signup" ? "teal" : "light"} onPress={() => setMode("signup")} />
        </View>

        {mode === "signup" && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "900", fontSize: 16 }}>I want to register as:</Text>
            <View style={{ gap: 8, flexDirection: "row", flexWrap: "wrap" }}>
              {(["patient", "doctor", "hospital", "laboratory", "emergency"] as SignUpRole[]).map((role) => (
                <Pressable
                  key={role}
                  onPress={() => setSignupRole(role)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: signupRole === role ? colors.teal : colors.line,
                    backgroundColor: signupRole === role ? colors.teal + "15" : colors.surface
                  }}
                >
                  <Text style={{ fontWeight: signupRole === role ? "900" : "600", fontSize: 13, color: signupRole === role ? colors.teal : colors.text }}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {mode === "signup" && signupRole === "laboratory" && (
          <View style={{ gap: 10 }}>
            <Text style={{ fontWeight: "900", fontSize: 16 }}>Laboratory type:</Text>
            <View style={{ gap: 8, flexDirection: "row" }}>
              <Pressable
                onPress={() => setLabType("standalone")}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: labType === "standalone" ? colors.teal : colors.line,
                  backgroundColor: labType === "standalone" ? colors.teal + "15" : colors.surface
                }}
              >
                <Text style={{ fontWeight: labType === "standalone" ? "900" : "600", fontSize: 13, color: labType === "standalone" ? colors.teal : colors.text }}>
                  Standalone
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Independent</Text>
              </Pressable>
              <Pressable
                onPress={() => setLabType("affiliated")}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: labType === "affiliated" ? colors.teal : colors.line,
                  backgroundColor: labType === "affiliated" ? colors.teal + "15" : colors.surface
                }}
              >
                <Text style={{ fontWeight: labType === "affiliated" ? "900" : "600", fontSize: 13, color: labType === "affiliated" ? colors.teal : colors.text }}>
                  Hospital Affiliated
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Under hospital</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
          {mode === "signup" ? <TextInput value={name} onChangeText={setName} placeholder="Full name" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} /> : null}
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
          <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />

          {mode === "signup" && signupRole === "laboratory" && (
            <>
              <TextInput value={labName} onChangeText={setLabName} placeholder="Laboratory name" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
              <TextInput value={certificationNumber} onChangeText={setCertificationNumber} placeholder="Certification number" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
              <TextInput value={department} onChangeText={setDepartment} placeholder="Department" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14 }} />
              
              {labType === "affiliated" && hospitals.length > 0 && (
                <View>
                  <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: "600" }}>Select hospital:</Text>
                  <Pressable
                    onPress={() => setSelectedHospital(selectedHospital === "" ? hospitals[0].id : "")}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.line,
                      borderRadius: 10,
                      padding: 12,
                      backgroundColor: colors.surface
                    }}
                  >
                    <Text style={{ fontWeight: "600" }}>
                      {selectedHospital ? hospitals.find(h => h.id === selectedHospital)?.name || "Select hospital" : "Select hospital"}
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          )}

          <PrimaryButton label={loading ? "Please wait..." : mode === "signin" ? "Sign in securely" : "Create account"} onPress={submit} />
        </View>

      {mode === "signup" && signupRole !== "laboratory" && (
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
      )}

        {mode === "signup" && signupRole === "laboratory" && (
          <View style={{ gap: 10 }}>
            <Text style={{ fontWeight: "900", fontSize: 16 }}>Select test capabilities:</Text>
            <View style={{ gap: 8 }}>
              {testTypes.map((test) => (
                <Pressable
                  key={test}
                  onPress={() => handleTestCapabilityChange(test)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: testCapabilities.includes(test) ? colors.teal : colors.line,
                    backgroundColor: testCapabilities.includes(test) ? colors.teal + "15" : colors.surface
                  }}
                >
                  <Text style={{ fontWeight: testCapabilities.includes(test) ? "900" : "600", color: testCapabilities.includes(test) ? colors.teal : colors.text }}>
                    {testCapabilities.includes(test) ? "[✓] " : "[ ] "}{test}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {mode === "signup" && signupRole === "laboratory" ? (
          <View style={{ padding: 16, borderRadius: 12, backgroundColor: "#FBF5F0", borderWidth: 1, borderColor: "#FDCCC8" }}>
            <Text selectable style={{ color: "#6D4C41", fontSize: 13 }}>Your laboratory registration will be verified by our team before activation.</Text>
          </View>
        ) : null}

        {mode === "signin" ? (
          <View style={{ padding: 16, borderRadius: 12, backgroundColor: "#E9F9F2" }}>
            <Text selectable style={{ color: "#09643D" }}>Use the account credentials issued by your hospital or created during registration.</Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenView>
  );
}
