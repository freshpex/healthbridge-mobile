import { useEffect, useState } from "react";
import { ScrollView, Text, View, Pressable, Image, Share, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ScreenView } from "../../components/layout/screen";
import { colors, shadow } from "../../constants/theme";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { User } from "../../types/domain";
import * as Clipboard from "expo-clipboard";

export function EmergencyCardScreen({ token, user }: { token: string; user: User }) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user.role === "patient") void loadQRCode();
    else { setError("Emergency cards are available only for patient accounts."); setLoading(false); }
  }, [user.role]);

  const loadQRCode = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await healthbridgeApi.getEmergencyQRCode(token).catch(async () => {
        await healthbridgeApi.enableEmergency(token);
        return healthbridgeApi.getEmergencyQRCode(token);
      });
      setCode(response.code);
      setQrCode(response.qrCodeUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not load your emergency card right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (code) {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareCode = async () => {
    if (code) {
      try {
        await Share.share({
          message: `My HealthBridge Emergency Code: ${code}\n\nEmergency responders can use this code to access my critical medical information.`
        });
      } catch (caught) {
        console.error(caught);
      }
    }
  };

  if (loading) {
    return (
      <ScreenView title="Emergency Card" subtitle="Your emergency access code">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      </ScreenView>
    );
  }

  return (
    <ScreenView title="Emergency Card" subtitle="Share with emergency staff">
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 112 }}>
        <StatusBar style={colors.background === "#061221" ? "light" : "dark"} />

        {/* Instructions */}
        <View style={{ gap: 10, padding: 14, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger, boxShadow: shadow }}>
          <Text style={{ color: colors.danger, fontWeight: "900", fontSize: 14 }}>🚨 Emergency Access Card</Text>
          <Text style={{ color: colors.danger, fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
            In an emergency, responders scan this QR code or enter your code to instantly access your critical medical information: blood type, allergies, medications, emergency contacts, and recent critical records. Every access is logged for your privacy protection.
          </Text>
        </View>

        {/* QR Code Card */}
        {qrCode ? (
          <View style={{ gap: 14, padding: 16, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.line, alignItems: "center", boxShadow: shadow }}>
            <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 14 }}>Scan with Emergency App</Text>

            {/* QR Code Image */}
            <Image
              source={{ uri: qrCode }}
              style={{
                width: 200,
                height: 200,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: colors.line
              }}
            />

            <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600", textAlign: "center" }}>
              Save or screenshot this card. Show it to emergency responders.
            </Text>
          </View>
        ) : !error ? (
          <View style={{ gap: 10, padding: 14, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
            <Text style={{ color: colors.ink, fontWeight: "900" }}>Emergency QR is not ready</Text>
            <Text style={{ color: colors.muted }}>Generate an emergency code or try again to create your QR card.</Text>
            <Pressable onPress={loadQRCode} style={{ paddingVertical: 8, alignItems: "center", borderRadius: 6, borderWidth: 1, borderColor: colors.blue }}>
              <Text style={{ color: colors.blue, fontWeight: "900", fontSize: 12 }}>Try Again</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Emergency Code */}
        {code && (
          <View style={{ gap: 10, padding: 14, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.danger, boxShadow: shadow }}>
            <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 12 }}>Or Enter This Code Manually</Text>

            {/* Code Display */}
            <View
              style={{
                padding: 14,
                borderRadius: 6,
                backgroundColor: colors.dangerSoft,
                borderWidth: 1,
                borderColor: colors.danger,
                alignItems: "center"
              }}
            >
              <Text style={{ color: colors.danger, fontSize: 28, fontWeight: "900", letterSpacing: 1, fontVariant: ["tabular-nums"] }}>
                {code.split("-").join(" ")}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={copyCode}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 6,
                  backgroundColor: copied ? colors.green : colors.blue,
                  alignItems: "center"
                }}
              >
              <Text style={{ color: colors.onPrimary, fontWeight: "900", fontSize: 12 }}>
                  {copied ? "✓ Copied" : "Copy Code"}
                </Text>
              </Pressable>

              <Pressable
                onPress={shareCode}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: colors.blue,
                  alignItems: "center"
                }}
              >
                <Text style={{ color: colors.blue, fontWeight: "900", fontSize: 12 }}>Share</Text>
              </Pressable>
            </View>
          </View>
        )}

        {error && (
          <View style={{ gap: 10, padding: 14, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger }}>
            <Text style={{ color: colors.danger, fontWeight: "900", fontSize: 12 }}>⚠️ Error</Text>
            <Text style={{ color: colors.danger, fontSize: 11, fontWeight: "600" }}>{error}</Text>
            <Pressable onPress={loadQRCode} style={{ paddingVertical: 8, alignItems: "center", borderRadius: 6, borderWidth: 1, borderColor: colors.danger }}>
              <Text style={{ color: colors.danger, fontWeight: "900", fontSize: 12 }}>Try Again</Text>
            </Pressable>
          </View>
        )}

        {/* Your Medical Info Summary */}
        <View style={{ gap: 10, padding: 14, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
          <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 14 }}>Critical Information Accessible</Text>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>Name</Text>
              <Text style={{ color: colors.ink, fontSize: 12, fontWeight: "900" }}>{user.name ?? "Patient"}</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>Status</Text>
              <Text style={{ color: colors.green, fontSize: 12, fontWeight: "900", backgroundColor: colors.successSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                Active
              </Text>
            </View>

            <View style={{ paddingVertical: 8 }}>
              <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600" }}>
                Every access to this code is logged and visible to you. You can disable emergency access anytime in your profile settings.
              </Text>
            </View>
          </View>
        </View>

        {/* Print Instructions */}
        <View style={{ gap: 10, padding: 14, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
          <Text style={{ color: colors.ink, fontWeight: "900", fontSize: 12 }}>💡 Pro Tips</Text>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", lineHeight: 18 }}>
            • Keep this card accessible in your wallet or phone case{"\n"}• Screenshot and share with emergency contacts{"\n"}• Print this card and laminate it{"\n"}• Update emergency contacts regularly
          </Text>
        </View>
      </ScrollView>
    </ScreenView>
  );
}
