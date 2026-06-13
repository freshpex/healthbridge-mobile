import { useState } from "react";
import { View, Text, TextInput, FlatList } from "react-native";
import { ScreenView } from "../../components/layout/screen";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { colors } from "../../constants/theme";
import { healthbridgeApi } from "../../services/healthbridge-api";

export function AiChatScreen({ token, onBack, onSymptomChecker }: { token?: string; onBack?: () => void; onSymptomChecker?: () => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ id: string; role: string; text: string; fallback?: boolean }[]>([]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { id: String(Date.now()), role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await healthbridgeApi.aiChat(token, [{ role: "user", content: userMsg.text }]);
      setMessages((m) => [...m, { id: res.id, role: "assistant", text: res.reply }]);
    } catch {
      setMessages((m) => [...m, { id: String(Date.now() + 1), role: "assistant", text: "The HealthBridge Assistant is unavailable right now. For guided triage, please use the symptom checker instead.", fallback: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenView title="HealthBridge Assistant" subtitle="Ask about your records, appointments, or general health questions." onBack={onBack}>
      <View style={{ gap: 12 }}>
        <FlatList data={messages} keyExtractor={(i) => i.id} renderItem={({ item }) => (
          <View style={{ padding: 10, backgroundColor: item.role === "user" ? colors.surface : "#F3F7FF", borderRadius: 8, marginBottom: 8 }}>
            <Text style={{ fontWeight: "800" }}>{item.role === "user" ? "You" : "Assistant"}</Text>
            <Text style={{ color: colors.ink }}>{item.text}</Text>
            {item.fallback && onSymptomChecker ? <PrimaryButton label="Open symptom checker" tone="light" onPress={onSymptomChecker} /> : null}
          </View>
        )} />

        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <TextInput value={input} onChangeText={setInput} placeholder="Ask the assistant..." style={{ flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 10 }} />
          <PrimaryButton label={loading ? "Sending..." : "Send"} onPress={send} />
        </View>
      </View>
    </ScreenView>
  );
}
