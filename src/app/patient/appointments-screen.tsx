import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { ScreenView } from "../../components/layout/screen";
import { colors, shadow } from "../../constants/theme";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { Appointment, AppointmentStatus, Hospital, PatientDashboard, Role } from "../../types/domain";

const statusLabels: Record<AppointmentStatus, string> = {
  requested: "Requested",
  scheduled: "Scheduled",
  accepted: "Accepted",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
  reschedule_requested: "Reschedule requested"
};

const statusColor = (status: AppointmentStatus) => {
  if (["accepted", "scheduled", "completed"].includes(status)) return colors.green;
  if (["requested", "reschedule_requested"].includes(status)) return colors.amber;
  return colors.danger;
};

const dateText = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const appointmentId = (appointment: Appointment) => appointment.id ?? appointment._id;

export function AppointmentsScreen({ token, dashboard, hospitals, refresh }: { token?: string; dashboard?: PatientDashboard; hospitals: Hospital[]; refresh: () => Promise<void> }) {
  const [hospitalId, setHospitalId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [reason, setReason] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState("");
  const [doctorOptions, setDoctorOptions] = useState<Array<{ id: string; name: string; role: Role }>>([]);
  const [rescheduleById, setRescheduleById] = useState<Record<string, string>>({});

  const selectableHospitals = useMemo(() => {
    const connected = dashboard?.profile.hospitalIds?.length
      ? dashboard.profile.hospitalIds
      : hospitals.filter((hospital) => dashboard?.profile.connectedHospitalIds.includes(hospital.id));
    return connected ?? [];
  }, [dashboard, hospitals]);

  useEffect(() => {
    if (!hospitalId && selectableHospitals[0]?.id) setHospitalId(selectableHospitals[0].id);
  }, [hospitalId, selectableHospitals]);

  useEffect(() => {
    let alive = true;
    setDoctorId("");
    setDoctorOptions([]);
    if (!hospitalId) return;
    healthbridgeApi.getHospitalDetails(hospitalId)
      .then((details) => {
        if (!alive) return;
        setDoctorOptions(details.staff.filter((staff) => staff.role === "doctor").map((staff) => ({ id: staff.id ?? staff._id ?? "", name: staff.name, role: staff.role })).filter((staff) => staff.id));
      })
      .catch(() => {
        if (alive) setDoctorOptions([]);
      });
    return () => {
      alive = false;
    };
  }, [hospitalId]);

  const createAppointment = async () => {
    if (!token) return setMessage("Please sign in again before booking.");
    if (!hospitalId) return setMessage("Select a hospital before requesting an appointment.");
    if (!reason.trim() || !scheduledAt) return setMessage("Add a reason and preferred date/time in YYYY-MM-DDTHH:mm format.");
    try {
      await healthbridgeApi.createAppointment(token, { hospitalId, doctorId: doctorId || undefined, reason: reason.trim(), scheduledAt: new Date(scheduledAt).toISOString() });
      setReason("");
      setScheduledAt("");
      setDoctorId("");
      setMessage("Appointment request sent.");
      await refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not request appointment");
    }
  };

  const updateAppointment = async (appointment: Appointment, payload: { status?: "cancelled" | "reschedule_requested"; scheduledAt?: string }) => {
    if (!token) return setMessage("Please sign in again before updating.");
    try {
      await healthbridgeApi.updateAppointment(token, appointmentId(appointment), payload);
      setMessage(payload.status === "cancelled" ? "Appointment cancelled." : "Reschedule request sent.");
      await refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not update appointment");
    }
  };

  return (
    <ScreenView title="Appointments" subtitle="Request, reschedule, and cancel visits with connected providers.">
      {message ? <View style={{ padding: 14, borderRadius: 12, backgroundColor: message.includes("Could not") || message.includes("Select") || message.includes("Add") ? colors.dangerSoft : colors.successSoft }}><Text selectable style={{ color: colors.ink }}>{message}</Text></View> : null}
      <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
        <Text selectable style={{ color: colors.ink, fontWeight: "900", fontSize: 18 }}>Request an appointment</Text>
        {selectableHospitals.length === 0 ? <Text selectable style={{ color: colors.muted }}>Connect with a hospital before booking an appointment.</Text> : null}
        <Text style={{ color: colors.muted, fontWeight: "800" }}>Hospital</Text>
        {selectableHospitals.map((hospital) => (
          <Pressable key={hospital.id} onPress={() => setHospitalId(hospital.id)} style={{ padding: 12, borderRadius: 10, borderWidth: 1, borderColor: hospitalId === hospital.id ? colors.blue : colors.line, backgroundColor: hospitalId === hospital.id ? colors.blueSoft : "#FFFFFF" }}>
            <Text selectable style={{ color: colors.ink, fontWeight: "900" }}>{hospital.name}</Text>
            <Text selectable style={{ color: colors.muted }}>{[hospital.city, hospital.state].filter(Boolean).join(", ")}</Text>
          </Pressable>
        ))}
        <Text style={{ color: colors.muted, fontWeight: "800" }}>Doctor where available</Text>
        {doctorOptions.length === 0 ? <Text selectable style={{ color: colors.muted }}>No listed doctors for this hospital. The hospital can assign one.</Text> : null}
        {doctorOptions.map((doctor) => (
          <Pressable key={doctor.id} onPress={() => setDoctorId(doctorId === doctor.id ? "" : doctor.id)} style={{ padding: 10, borderRadius: 999, borderWidth: 1, borderColor: doctorId === doctor.id ? colors.teal : colors.line, alignSelf: "flex-start" }}>
            <Text selectable style={{ color: doctorId === doctor.id ? colors.teal : colors.ink, fontWeight: "800" }}>{doctor.name}</Text>
          </Pressable>
        ))}
        <TextInput value={scheduledAt} onChangeText={setScheduledAt} placeholder="Preferred time: YYYY-MM-DDTHH:mm" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, color: colors.ink, backgroundColor: "#FBFDFF" }} />
        <TextInput value={reason} onChangeText={setReason} placeholder="Reason for visit" multiline style={{ minHeight: 80, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, color: colors.ink, backgroundColor: "#FBFDFF" }} />
        <PrimaryButton label="Send request" onPress={createAppointment} />
      </View>

      {!dashboard ? <Text selectable>Loading appointments...</Text> : null}
      {dashboard?.appointments.length === 0 ? <Text selectable style={{ color: colors.muted }}>No appointments are scheduled.</Text> : null}
      {dashboard?.appointments.map((appointment) => {
        const id = appointmentId(appointment);
        const requestedTime = rescheduleById[id] ?? toDateTimeLocal(appointment.scheduledAt);
        return (
          <View key={id} style={{ gap: 10, padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text selectable style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>{appointment.reason}</Text>
                <Text selectable style={{ color: colors.muted }}>{dateText(appointment.scheduledAt)}</Text>
              </View>
              <Text style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: "hidden", backgroundColor: "#F1F5F9", color: statusColor(appointment.status), fontSize: 11, fontWeight: "900" }}>{statusLabels[appointment.status] ?? appointment.status}</Text>
            </View>
            <TextInput value={requestedTime} onChangeText={(value) => setRescheduleById((current) => ({ ...current, [id]: value }))} placeholder="New time: YYYY-MM-DDTHH:mm" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 10, color: colors.ink }} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}><PrimaryButton label="Cancel" tone="light" onPress={() => updateAppointment(appointment, { status: "cancelled" })} /></View>
              <View style={{ flex: 1 }}><PrimaryButton label="Reschedule" tone="teal" onPress={() => updateAppointment(appointment, { status: "reschedule_requested", scheduledAt: new Date(requestedTime).toISOString() })} /></View>
            </View>
          </View>
        );
      })}
    </ScreenView>
  );
}
