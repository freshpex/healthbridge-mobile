import { useState, useEffect } from "react";
import { ScrollView, Text, TextInput, View, Pressable, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ScreenView } from "../../components/layout/screen";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { colors, shadow } from "../../constants/theme";
import { healthbridgeApi } from "../../services/healthbridge-api";
import * as Location from "expo-location";

interface HospitalResult {
  id: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  specialties?: string[];
  distance?: number;
  contactEmail?: string;
}

export function HospitalFinderScreen({ token }: { token: string }) {
  const [hospitals, setHospitals] = useState<HospitalResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useLocation, setUseLocation] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const specialties = ["General", "Emergency", "Cardiology", "Orthopedics", "Pediatrics"];

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const response = await healthbridgeApi.hospitals();
      setHospitals(response.map((h) => ({
        id: h.id,
        name: h.name,
        city: h.city,
        state: h.state || "",
        specialties: h.specialties
      })));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError("");

    try {
      let results: Array<{ id: string; name: string; city: string; state: string; address?: string; specialties?: string[]; distance?: number; contactEmail?: string }>;
      
      if (useLocation && latitude && longitude) {
        results = await healthbridgeApi.findNearbyHospitals(latitude, longitude, undefined, specialty || undefined, token);
      } else if (searchQuery) {
        results = await healthbridgeApi.searchHospitals(searchQuery, specialty || undefined, undefined, token);
      } else {
        const hospitals = await healthbridgeApi.hospitals();
        results = hospitals.map((h) => ({
          id: h.id,
          name: h.name,
          city: h.city,
          state: h.state || "",
          specialties: h.specialties
        }));
      }
      
      setHospitals(results.map((h) => ({
        id: h.id,
        name: h.name,
        city: h.city,
        state: h.state || "",
        address: h.address,
        specialties: h.specialties,
        distance: h.distance,
        contactEmail: h.contactEmail
      })));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      setUseLocation(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not get location");
    }
  };

  return (
    <ScreenView title="Hospital Finder" subtitle="Find specialized care near you">
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 112 }}>
        <StatusBar style={colors.background === "#061221" ? "light" : "dark"} />

        {/* Header Info */}
        <View style={{ gap: 8, paddingBottom: 8 }}>
          <Text style={{ color: colors.navy, fontSize: 16, fontWeight: "900" }}>Find the Right Care</Text>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18 }}>Search for hospitals by specialty and location. Connect to your preferred facilities to enable secure record sharing.</Text>
        </View>

        {/* Search Form */}
        <View style={{ gap: 10, padding: 14, borderRadius: 8, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
          <TextInput
            style={{ padding: 10, borderRadius: 6, borderWidth: 1, borderColor: colors.line, fontSize: 12, color: colors.ink, backgroundColor: colors.field }}
            placeholder="Search by name or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={!useLocation}
            placeholderTextColor={colors.muted}
          />

          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: "600", color: colors.muted, marginBottom: 4 }}>Specialty</Text>
              <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>
                {specialties.map((spec) => (
                  <Pressable
                    key={spec}
                    onPress={() => setSpecialty(specialty === spec ? "" : spec)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: specialty === spec ? colors.blue : colors.line,
                      backgroundColor: specialty === spec ? colors.blueSoft : colors.background
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "600", color: specialty === spec ? colors.blue : colors.muted }}>
                      {spec}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable
              onPress={() => {
                setUseLocation(!useLocation);
                if (!useLocation && !latitude) requestLocation();
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: colors.line,
                alignItems: "center"
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 12, color: useLocation ? colors.blue : colors.muted }}>
                📍 {useLocation ? "Using Location" : "Use My Location"}
              </Text>
            </Pressable>
            <PrimaryButton label="Search" onPress={handleSearch} disabled={loading} />
          </View>
        </View>

        {error && <Text style={{ color: colors.danger, fontWeight: "600", fontSize: 12 }}>⚠️ {error}</Text>}

        {/* Hospitals List */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.blue} />
        ) : hospitals.length === 0 ? (
          <Text style={{ textAlign: "center", color: colors.muted, fontWeight: "600" }}>No hospitals found</Text>
        ) : (
          <View style={{ gap: 10 }}>
            {hospitals.map((hospital) => (
              <View
                key={hospital.id}
                style={{
                  gap: 8,
                  padding: 12,
                  borderRadius: 8,
                  borderCurve: "continuous",
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.line,
                  boxShadow: shadow
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Text style={{ fontSize: 14, fontWeight: "900", color: colors.ink, flex: 1 }}>{hospital.name}</Text>
                  {hospital.distance && (
                    <Text style={{ fontSize: 11, fontWeight: "700", color: colors.green, backgroundColor: colors.successSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                      {hospital.distance} km
                    </Text>
                  )}
                </View>

                <Text style={{ fontSize: 11, fontWeight: "600", color: colors.muted }}>
                  📍 {hospital.city}, {hospital.state}
                </Text>

                {hospital.address && <Text style={{ fontSize: 10, fontWeight: "500", color: colors.muted }}>{hospital.address}</Text>}

                {hospital.specialties && hospital.specialties.length > 0 && (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                    {hospital.specialties.slice(0, 2).map((spec) => (
                      <Text key={spec} style={{ fontSize: 10, fontWeight: "600", color: colors.blue, backgroundColor: colors.blueSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
                        {spec}
                      </Text>
                    ))}
                    {hospital.specialties.length > 2 && <Text style={{ fontSize: 10, color: colors.muted, fontWeight: "600" }}>+{hospital.specialties.length - 2}</Text>}
                  </View>
                )}

                <Pressable style={{ marginTop: 8, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.blue, alignItems: "center" }}>
                  <Text style={{ color: colors.blue, fontWeight: "900", fontSize: 12 }}>View Details</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenView>
  );
}
