import { useState } from "react";
import { ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ScreenView } from "../../components/layout/screen";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { colors, shadow } from "../../constants/theme";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { Screen } from "../../types/domain";

interface SymptomCheckerResult {
  assessment: {
    conditions: string[];
    urgency: "low" | "medium" | "high";
    recommendations: string[];
  };
}

export function SymptomsScreen({ token, setScreen }: { token: string; setScreen: (screen: Screen) => void }) {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<SymptomCheckerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addSymptom = () => {
    if (inputValue.trim() && !symptoms.includes(inputValue.trim())) {
      setSymptoms([...symptoms, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter((s) => s !== symptom));
  };

  const assessSymptoms = async () => {
    if (symptoms.length === 0) {
      setError("Please add at least one symptom");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await healthbridgeApi.assessSymptoms(token, symptoms);
      setResult({
        assessment: response.assessment
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to assess symptoms");
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors = {
    low: { bg: colors.successSoft, text: colors.green, border: colors.green },
    medium: { bg: colors.warningSoft, text: colors.warning, border: colors.warning },
    high: { bg: colors.dangerSoft, text: colors.danger, border: colors.danger }
  };

  if (result) {
    const colors_variant = urgencyColors[result.assessment.urgency];
    return (
      <ScreenView title="Assessment Results" subtitle={`Urgency: ${result.assessment.urgency}`}>
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 112 }}>
          <StatusBar style="dark" />

          {/* Urgency Card */}
          <View style={{ gap: 10, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors_variant.bg, borderWidth: 2, borderColor: colors_variant.border, boxShadow: shadow }}>
            <Text style={{ color: colors_variant.text, fontSize: 18, fontWeight: "900" }}>
              {result.assessment.urgency === "high" && "🚨 Urgent - Seek Immediate Care"}
              {result.assessment.urgency === "medium" && "⚠️ Moderate - Visit Healthcare Facility"}
              {result.assessment.urgency === "low" && "✓ Low - Monitor and Consult"}
            </Text>
            <Text style={{ color: colors_variant.text, fontSize: 12, fontWeight: "600" }}>
              {result.assessment.urgency === "high" && "These symptoms require immediate medical attention. Call emergency services if needed."}
              {result.assessment.urgency === "medium" && "Visit an urgent care center or hospital soon."}
              {result.assessment.urgency === "low" && "Monitor your symptoms. Schedule an appointment if they persist."}
            </Text>
          </View>

          {/* Possible Conditions */}
          {result.assessment.conditions.length > 0 && (
            <View style={{ gap: 10, padding: 14, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
              <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 14 }}>Possible Conditions</Text>
              {result.assessment.conditions.map((condition) => (
                <Text key={condition} style={{ color: colors.ink, fontSize: 12, fontWeight: "600", paddingLeft: 10 }}>
                  • {condition}
                </Text>
              ))}
            </View>
          )}

          {/* Recommendations */}
          {result.assessment.recommendations.length > 0 && (
            <View style={{ gap: 10, padding: 14, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
              <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 14 }}>Recommended Next Steps</Text>
              {result.assessment.recommendations.map((rec, idx) => (
                <Text key={idx} style={{ color: colors.ink, fontSize: 12, fontWeight: "600", paddingLeft: 10 }}>
                  {idx + 1}. {rec}
                </Text>
              ))}
            </View>
          )}

          {/* Disclaimer */}
          <View style={{ gap: 10, padding: 14, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger, boxShadow: shadow }}>
            <Text style={{ color: colors.danger, fontWeight: "900", fontSize: 12 }}>⚠️ Important Disclaimer</Text>
            <Text style={{ color: colors.danger, fontSize: 11, fontWeight: "600" }}>
              This assessment is not a medical diagnosis. It's AI-assisted guidance only. Always consult with a qualified healthcare provider for proper diagnosis and treatment.
            </Text>
          </View>

          {/* Find Hospital Button */}
          <PrimaryButton
            label="Find a Hospital"
            onPress={() => setScreen("hospital-finder")}
          />

          {/* Start Over */}
          <Pressable onPress={() => setResult(null)} style={{ padding: 14, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: colors.line }}>
            <Text style={{ color: colors.blue, fontWeight: "900" }}>Start New Assessment</Text>
          </Pressable>
        </ScrollView>
      </ScreenView>
    );
  }

  return (
    <ScreenView title="Symptom Checker" subtitle="Describe your symptoms to get guidance">
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 112 }}>
        <StatusBar style="dark" />

        {/* Symptom Input */}
        <View style={{ gap: 10, padding: 14, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
          <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 14 }}>Add Symptoms</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              style={{ flex: 1, padding: 10, borderRadius: 6, borderWidth: 1, borderColor: colors.line, fontSize: 12 }}
              placeholder="e.g., headache, fever..."
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={addSymptom}
              placeholderTextColor={colors.muted}
            />
            <Pressable
              onPress={addSymptom}
              style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, backgroundColor: colors.blue, justifyContent: "center" }}
            >
              <Text style={{ color: "white", fontWeight: "900", fontSize: 12 }}>Add</Text>
            </Pressable>
          </View>

          {/* Symptom Tags */}
          {symptoms.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {symptoms.map((symptom) => (
                <View
                  key={symptom}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: colors.blueSoft,
                    borderWidth: 1,
                    borderColor: colors.blue
                  }}
                >
                  <Text style={{ color: colors.blue, fontWeight: "600", fontSize: 12 }}>{symptom}</Text>
                  <Pressable onPress={() => removeSymptom(symptom)}>
                    <Text style={{ color: colors.blue, fontWeight: "900", fontSize: 14 }}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 12 }}>Additional Details (Optional)</Text>
          <TextInput
            style={{ padding: 10, borderRadius: 6, borderWidth: 1, borderColor: colors.line, fontSize: 12, height: 80, textAlignVertical: "top" }}
            placeholder="When did symptoms start? Any other details?"
            placeholderTextColor={colors.muted}
            multiline
          />
        </View>

        {error && <Text style={{ color: colors.danger, fontWeight: "600", fontSize: 12 }}>⚠️ {error}</Text>}

        {/* Assess Button */}
        <PrimaryButton
          label={loading ? "Analyzing..." : "Analyze Symptoms"}
          onPress={assessSymptoms}
          disabled={loading || symptoms.length === 0}
        />
      </ScrollView>
    </ScreenView>
  );
}
