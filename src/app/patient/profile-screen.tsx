import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { ScreenView } from "../../components/layout/screen";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { NotificationPreferences, PatientDashboard, User } from "../../types/domain";
import { colors } from "../../constants/theme";

const splitList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
const dateOnly = (value?: string) => value ? value.slice(0, 10) : "";
const contactText = (contact: PatientDashboard["profile"]["emergencyContact"]) =>
  typeof contact === "string" ? contact : [contact?.name, contact?.relationship, contact?.phone].filter(Boolean).join(", ");

type PreferenceKey = keyof NotificationPreferences;

function Field({ label, value, onChangeText, placeholder, secureTextEntry = false, multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; secureTextEntry?: boolean; multiline?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.ink, fontWeight: "800" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, minHeight: multiline ? 78 : 48, backgroundColor: colors.surface }}
      />
    </View>
  );
}

function PreferenceToggle({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.surface }}>
      <Text style={{ color: colors.ink, fontWeight: "700" }}>{label}</Text>
      <Text style={{ color: enabled ? colors.teal : colors.muted, fontWeight: "900" }}>{enabled ? "On" : "Off"}</Text>
    </Pressable>
  );
}

export function ProfileScreen({ token, user, dashboard, refresh }: { token?: string; user?: User; dashboard?: PatientDashboard; refresh: () => Promise<void> }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEmail(user?.email ?? "");
    setPhone(user?.phone ?? "");
    setAvatarUrl(user?.avatarUrl ?? "");
    setNotificationPreferences(user?.notificationPreferences ?? {});
  }, [user]);

  useEffect(() => {
    if (!dashboard) return;
    const contact = dashboard.profile.emergencyContact;
    setFullName(dashboard.profile.fullName);
    setDateOfBirth(dateOnly(dashboard.profile.dateOfBirth));
    setGender(dashboard.profile.gender ?? "");
    setAddress(dashboard.profile.address ?? "");
    setBloodGroup(dashboard.profile.bloodGroup);
    setAllergies(dashboard.profile.allergies.join(", "));
    setConditions(dashboard.profile.chronicConditions.join(", "));
    setMedications(dashboard.profile.currentMedications.join(", "));
    setEmergencyName(typeof contact === "object" ? contact.name ?? "" : contact ?? "");
    setEmergencyRelationship(typeof contact === "object" ? contact.relationship ?? "" : "");
    setEmergencyPhone(typeof contact === "object" ? contact.phone ?? "" : "");
  }, [dashboard]);

  const togglePreference = (key: PreferenceKey) => {
    setNotificationPreferences((current) => ({ ...current, [key]: !current[key] }));
  };

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await healthbridgeApi.updatePatientAccountProfile(token, {
        name: fullName,
        email,
        phone,
        avatarUrl: avatarUrl || undefined,
        notificationPreferences,
        patientProfile: {
          fullName,
          dateOfBirth: dateOfBirth || undefined,
          gender,
          address,
          bloodGroup,
          allergies: splitList(allergies),
          chronicConditions: splitList(conditions),
          currentMedications: splitList(medications),
          emergencyContact: { name: emergencyName, relationship: emergencyRelationship, phone: emergencyPhone }
        }
      });
      setMessage("Profile, account, security preferences, and notification settings saved.");
      await refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!token || !currentPassword || !newPassword) return;
    try {
      await healthbridgeApi.changePassword(token, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password changed.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not change password");
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
    <ScreenView title="Profile settings" subtitle="Update account details, critical medical profile data, security, notifications, and emergency access.">
      {!dashboard ? <Text selectable>Loading profile...</Text> : null}
      {message ? <View style={{ padding: 14, borderRadius: 12, backgroundColor: "#E9F9F2" }}><Text selectable style={{ color: "#09643D" }}>{message}</Text></View> : null}
      {dashboard ? (
        <>
          <View style={{ gap: 10, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
            <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{dashboard.profile.fullName}</Text>
            {avatarUrl ? <Text selectable>Avatar: {avatarUrl}</Text> : <Text selectable style={{ color: colors.muted }}>No avatar URL set</Text>}
            <Text selectable>Hospitals: {dashboard.profile.hospitalIds?.map((hospital) => hospital.name).join(", ") || dashboard.profile.connectedHospitalIds.length}</Text>
            <Text selectable>Emergency contact: {contactText(dashboard.profile.emergencyContact) || "Not set"}</Text>
            <Text selectable>Emergency code: {dashboard.profile.emergencyCode ?? "Not enabled"}</Text>
          </View>

          <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line }}>
            <Text selectable style={{ fontWeight: "900", fontSize: 16 }}>Account and contact</Text>
            <Field label="Full name" value={fullName} onChangeText={setFullName} />
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="patient@example.com" />
            <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 555 0100" />
            <Field label="Avatar URL" value={avatarUrl} onChangeText={setAvatarUrl} placeholder="https://example.com/avatar.png" />
          </View>

          <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line }}>
            <Text selectable style={{ fontWeight: "900", fontSize: 16 }}>Medical profile</Text>
            <Field label="Date of birth" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" />
            <Field label="Gender" value={gender} onChangeText={setGender} />
            <Field label="Address" value={address} onChangeText={setAddress} multiline />
            <Field label="Blood group" value={bloodGroup} onChangeText={setBloodGroup} placeholder="O+" />
            <Field label="Allergies" value={allergies} onChangeText={setAllergies} placeholder="Peanuts, penicillin" multiline />
            <Field label="Chronic conditions" value={conditions} onChangeText={setConditions} placeholder="Asthma, diabetes" multiline />
            <Field label="Current medications" value={medications} onChangeText={setMedications} placeholder="Medication and dosage" multiline />
          </View>

          <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line }}>
            <Text selectable style={{ fontWeight: "900", fontSize: 16 }}>Emergency contact</Text>
            <Field label="Contact name" value={emergencyName} onChangeText={setEmergencyName} />
            <Field label="Relationship" value={emergencyRelationship} onChangeText={setEmergencyRelationship} />
            <Field label="Contact phone" value={emergencyPhone} onChangeText={setEmergencyPhone} />
          </View>

          <View style={{ gap: 10, padding: 16, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line }}>
            <Text selectable style={{ fontWeight: "900", fontSize: 16 }}>Notification preferences</Text>
            <PreferenceToggle label="Email notifications" enabled={!!notificationPreferences.email} onToggle={() => togglePreference("email")} />
            <PreferenceToggle label="SMS notifications" enabled={!!notificationPreferences.sms} onToggle={() => togglePreference("sms")} />
            <PreferenceToggle label="Push notifications" enabled={!!notificationPreferences.push} onToggle={() => togglePreference("push")} />
            <PreferenceToggle label="Clinical alerts" enabled={!!notificationPreferences.clinicalAlerts} onToggle={() => togglePreference("clinicalAlerts")} />
            <PreferenceToggle label="Appointment reminders" enabled={!!notificationPreferences.appointmentReminders} onToggle={() => togglePreference("appointmentReminders")} />
          </View>

          <PrimaryButton label={saving ? "Saving..." : "Save profile and settings"} onPress={save} disabled={saving} />

          <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line }}>
            <Text selectable style={{ fontWeight: "900", fontSize: 16 }}>Security</Text>
            <Field label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
            <Field label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
            <PrimaryButton label="Change password" tone="light" onPress={changePassword} disabled={!currentPassword || !newPassword} />
          </View>

          <PrimaryButton label="Upload medical document" tone="teal" onPress={uploadDocument} />
          <PrimaryButton label="Generate emergency code" tone="light" onPress={enableEmergency} />
          {dashboard.uploads.length > 0 ? (
            <View style={{ gap: 8, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
              <Text selectable style={{ fontWeight: "900" }}>Uploaded documents</Text>
              {dashboard.uploads.map((upload) => <Text selectable key={upload._id}>{upload.fileName} | {upload.provider} | {upload.category}</Text>)}
            </View>
          ) : <Text selectable style={{ color: colors.muted }}>No personal documents uploaded yet.</Text>}
        </>
      ) : null}
    </ScreenView>
  );
}
