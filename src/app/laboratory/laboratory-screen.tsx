import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { colors, shadow } from "../../constants/theme";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { Hospital, LabRequest, User } from "../../types/domain";

const initials = (name: string) => name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

export function LaboratoryScreen({
  token,
  user,
  onLogout
}: {
  token: string;
  user?: User;
  onLogout: () => Promise<void>;
}) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadCount, setUploadCount] = useState(0);
  const [requests, setRequests] = useState<LabRequest[]>([]);
  const [resultText, setResultText] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const items = await healthbridgeApi.hospitals();
        if (!alive) return;
        setHospitals(items.filter((h) => h.status === "approved"));

        const [labRequests, labResults] = await Promise.all([
          healthbridgeApi.getLabRequests(token),
          healthbridgeApi.getLabResults(token)
        ]);
        if (alive) {
          setRequests(labRequests);
          setUploadCount(labResults.length);
        }
      } catch (caught) {
        if (alive) {
          console.error(caught instanceof Error ? caught.message : "Could not load hospitals");
        }
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [token]);

  const refreshLabWork = async () => {
    const [labRequests, labResults] = await Promise.all([
      healthbridgeApi.getLabRequests(token),
      healthbridgeApi.getLabResults(token)
    ]);
    setRequests(labRequests);
    setUploadCount(labResults.length);
  };

  const firstActionableRequest = requests.find((request) => request.status !== "completed" && request.status !== "rejected");

  const updateRequest = async (request: LabRequest, status: LabRequest["status"]) => {
    try {
      await healthbridgeApi.updateLabRequestStatus(token, request._id, { status });
      await refreshLabWork();
    } catch (caught) {
      Alert.alert("Request update failed", caught instanceof Error ? caught.message : "Please try again.");
    }
  };

  const uploadResult = async () => {
    if (!firstActionableRequest || !resultText.trim()) return;
    try {
      await healthbridgeApi.uploadLabResult(token, { requestId: firstActionableRequest._id, result: resultText.trim(), status: "normal" });
      setResultText("");
      await refreshLabWork();
      Alert.alert("Result uploaded", "The lab request has been completed.");
    } catch (caught) {
      Alert.alert("Upload failed", caught instanceof Error ? caught.message : "Please try again.");
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 112 }}>
      <StatusBar style={colors.background === "#061221" ? "light" : "dark"} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 12 }}>
        <View>
          <Text style={{ color: colors.ink, fontSize: 12, fontWeight: "700" }}>Welcome back,</Text>
          <Text style={{ color: colors.navy, fontSize: 24, fontWeight: "900" }}>{user?.name?.split(" ")[0] ?? "Lab"}</Text>
        </View>
        <View style={{ width: 52, height: 52, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: colors.purpleSoft, borderWidth: 3, borderColor: colors.surface, boxShadow: shadow }}>
          <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 18 }}>{initials(user?.name ?? "LS")}</Text>
        </View>
      </View>
      <View style={{ gap: 10, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
        <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Laboratory Portal</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <InfoCard label="Uploaded" value={String(uploadCount)} />
          <InfoCard label="Requests" value={String(requests.length)} tone="teal" />
        </View>
      </View>

      <View style={{ gap: 8, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.warningSoft, borderWidth: 1, borderColor: colors.warningLine }}>
        <Text style={{ fontWeight: "900", color: colors.amber, fontSize: 14 }}>Pending Approval</Text>
        <Text style={{ color: colors.amber, fontSize: 13, lineHeight: 18 }}>Your laboratory registration is under review. You'll receive a confirmation email once approved.</Text>
      </View>

      <View style={{ gap: 12, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
        <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Assigned Requests</Text>
        {requests.length === 0 ? (
          <Text style={{ color: colors.muted }}>No assigned lab requests yet.</Text>
        ) : (
          requests.slice(0, 4).map((request) => (
            <View key={request._id} style={{ gap: 8, padding: 12, borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.line }}>
              <Text style={{ fontWeight: "800", fontSize: 14, color: colors.navy }}>{request.testName}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{request.status.replace("_", " ")} · {request.priority}</Text>
              {request.status === "requested" ? <PrimaryButton label="Accept" onPress={() => updateRequest(request, "accepted")} /> : null}
              {request.status === "accepted" ? <PrimaryButton label="Mark In Progress" onPress={() => updateRequest(request, "in_progress")} tone="light" /> : null}
            </View>
          ))
        )}
      </View>

      <View style={{ gap: 12, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
        <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Upload Result</Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>{firstActionableRequest ? `For ${firstActionableRequest.testName}` : "No open request selected"}</Text>
        <TextInput
          value={resultText}
          onChangeText={setResultText}
          placeholder="Enter verified result"
          multiline
          placeholderTextColor={colors.muted}
          style={{ minHeight: 80, padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.field, color: colors.ink }}
        />
        <PrimaryButton label="Upload Test Result" onPress={uploadResult} />
      </View>

      <View style={{ gap: 10, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
        <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Associated Hospital</Text>
        {loading ? (
          <ActivityIndicator color={colors.teal} />
        ) : hospitals.length > 0 ? (
          <View style={{ gap: 10 }}>
            {hospitals.slice(0, 2).map((hospital) => (
              <View key={hospital.id} style={{ padding: 12, borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.line }}>
                <Text style={{ fontWeight: "800", fontSize: 14, color: colors.navy }}>{hospital.name}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{[hospital.city, hospital.state].filter(Boolean).join(", ")}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: colors.muted }}>No hospitals available</Text>
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><PrimaryButton label="Sign out" tone="light" onPress={onLogout} /></View>
      </View>
    </ScrollView>
  );
}
