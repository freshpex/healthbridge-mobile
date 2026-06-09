import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { ScreenView } from "../../components/layout/screen";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { PatientDashboard } from "../../types/domain";
import { colors } from "../../constants/theme";

const splitList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
const contactText = (contact: PatientDashboard["profile"]["emergencyContact"]) =>
  typeof contact === "string" ? contact : [contact?.name, contact?.relationship, contact?.phone].filter(Boolean).join(", ");

export function ProfileScreen({ token, dashboard, refresh }: { token?: string; dashboard?: PatientDashboard; refresh: () => Promise<void> }) {
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!dashboard) return;
    setBloodGroup(dashboard.profile.bloodGroup);
    setAllergies(dashboard.profile.allergies.join(", "));
    setConditions(dashboard.profile.chronicConditions.join(", "));
    setMedications(dashboard.profile.currentMedications.join(", "));
  }, [dashboard]);

  const save = async () => {
    if (!token) return;
    try {
      await healthbridgeApi.updateProfile(token, {
        bloodGroup,
        allergies: splitList(allergies),
        chronicConditions: splitList(conditions),
        currentMedications: splitList(medications),
        emergencyContact: typeof dashboard?.profile.emergencyContact === "object" ? dashboard.profile.emergencyContact : undefined
      });
      setMessage("Profile updated.");
      await refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not update profile");
    }
  };

  const enableEmergency = async () => {
    if (!token) return;
    try {
      const result = await healthbridgeApi.enableEmergency(token);
      setMessage(`Emergency code generated: ${result.code}`);
      await refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not generate emergency code");
    }
  };

  const uploadDocument = async () => {
    if (!token) return;
    try {
      const picked = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
      if (picked.canceled) return;
      const asset = picked.assets[0];
      await healthbridgeApi.uploadDocument(token, { uri: asset.uri, name: asset.name, mimeType: asset.mimeType });
      setMessage("Document uploaded.");
      await refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not upload document");
    }
  };

  return (
    <ScreenView title="Profile settings" subtitle="Update critical medical profile data and emergency access.">
      {!dashboard ? <Text selectable>Loading profile...</Text> : null}
      {message ? <View style={{ padding: 14, borderRadius: 12, backgroundColor: "#E9F9F2" }}><Text selectable style={{ color: "#09643D" }}>{message}</Text></View> : null}
      {dashboard ? (
        <>
          <View style={{ gap: 10, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
            <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{dashboard.profile.fullName}</Text>
            <Text selectable>Hospitals: {dashboard.profile.hospitalIds?.map((hospital) => hospital.name).join(", ") || dashboard.profile.connectedHospitalIds.length}</Text>
            <Text selectable>Emergency contact: {contactText(dashboard.profile.emergencyContact) || "Not set"}</Text>
            <Text selectable>Emergency code: {dashboard.profile.emergencyCode ?? "Not enabled"}</Text>
          </View>
          <TextInput value={bloodGroup} onChangeText={setBloodGroup} placeholder="Blood group" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, backgroundColor: colors.surface }} />
          <TextInput value={allergies} onChangeText={setAllergies} placeholder="Allergies, comma separated" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, backgroundColor: colors.surface }} />
          <TextInput value={conditions} onChangeText={setConditions} placeholder="Chronic conditions" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, backgroundColor: colors.surface }} />
          <TextInput value={medications} onChangeText={setMedications} placeholder="Current medications" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, backgroundColor: colors.surface }} />
          <PrimaryButton label="Save profile" onPress={save} />
          <PrimaryButton label="Upload medical document" tone="teal" onPress={uploadDocument} />
          <PrimaryButton label="Generate emergency code" tone="light" onPress={enableEmergency} />
          {dashboard.uploads.length > 0 ? (
            <View style={{ gap: 8, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
              <Text selectable style={{ fontWeight: "900" }}>Uploaded documents</Text>
              {dashboard.uploads.map((upload) => <Text selectable key={upload._id}>{upload.fileName} | {upload.provider}</Text>)}
            </View>
          ) : <Text selectable style={{ color: colors.muted }}>No personal documents uploaded yet.</Text>}
        </>
      ) : null}
    </ScreenView>
  );
}
