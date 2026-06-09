import { useState } from "react";
import { Text, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { ScreenView } from "../../components/layout/screen";
import { hospitals, patient, records } from "../../constants/demo-data";

export function HospitalScreen() {
  const [handled, setHandled] = useState(false);
  return (
    <ScreenView title="Hospital portal" subtitle="Verify connected patients, manage staff, upload records, and handle sync requests.">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <InfoCard label="Hospital" value={hospitals[0].status} />
        <InfoCard label="Connected patients" value="12.8k" tone="teal" />
        <InfoCard label="Uploaded records" value={String(records.length)} tone="green" />
      </View>
      <View style={{ gap: 10 }}>
        <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{patient.fullName}</Text>
        <Text selectable>Connection verified with Mercy General Hospital.</Text>
        <PrimaryButton label={handled ? "Request in review" : "Handle record sync request"} onPress={() => setHandled(true)} />
        <PrimaryButton label="Add lab result" tone="light" onPress={() => setHandled(true)} />
      </View>
    </ScreenView>
  );
}
