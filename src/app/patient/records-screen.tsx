import { Text, View } from "react-native";
import { ScreenView } from "../../components/layout/screen";
import { colors } from "../../constants/theme";
import { records } from "../../constants/demo-data";

export function RecordsScreen() {
  return (
    <ScreenView title="Medical records" subtitle="History, lab results, prescriptions, diagnoses, appointments, and uploaded documents.">
      {records.map((record) => (
        <View key={record.id} style={{ gap: 8, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: record.critical ? "#FFDCA1" : colors.line }}>
          <Text selectable style={{ fontWeight: "900", fontSize: 18 }}>{record.title}</Text>
          <Text selectable style={{ color: colors.muted }}>{record.type} | {record.date}</Text>
          <Text selectable style={{ lineHeight: 22 }}>{record.summary}</Text>
        </View>
      ))}
    </ScreenView>
  );
}
