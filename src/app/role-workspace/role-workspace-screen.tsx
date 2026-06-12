import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../../components/buttons/primary-button";
import { InfoCard } from "../../components/cards/info-card";
import { colors, shadow } from "../../constants/theme";
import { healthbridgeApi } from "../../services/healthbridge-api";
import type { AdminOperations, Appointment, EmergencyCase, LabRequest, Role, Screen, User, WorkspacePayload } from "../../types/domain";

const roleName: Record<Role, string> = {
  patient: "Patient",
  doctor: "Doctor",
  hospital_admin: "Hospital",
  super_admin: "Admin",
  emergency_staff: "Emergency",
  laboratory: "Laboratory"
};

type WorkspaceTab = "laboratory-requests" | "emergency-requests" | "emergency-cases" | "admin-operations";
type SectionState<T> = { data: T; loading: boolean; error: string };

type RoleWorkspaceProps = { token?: string; user?: User; screen: Screen; logout?: () => Promise<void> };

const requestStatuses: LabRequest["status"][] = ["accepted", "in_progress", "completed"];
const caseStatuses: EmergencyCase["status"][] = ["triaged", "en_route", "arrived", "resolved"];
const dispatchStatuses: Array<NonNullable<EmergencyCase["dispatchStatus"]>> = ["assigned", "dispatched", "arrived", "cleared"];

const titleize = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const objectName = (value: unknown, fallback: string) => (typeof value === "object" && value ? ((value as { fullName?: string; name?: string; labName?: string }).fullName ?? (value as { name?: string }).name ?? (value as { labName?: string }).labName ?? fallback) : fallback);
const objectId = (value: unknown) => (typeof value === "object" && value ? ((value as { _id?: string; id?: string })._id ?? (value as { id?: string }).id ?? "") : String(value ?? ""));

const isProfileScreen = (screen: Screen) => screen.endsWith("profile") || screen === "profile";
const isAppointmentsScreen = (screen: Screen) => screen.includes("appointments");
const isPatientsScreen = (screen: Screen) => screen.includes("patients");
const isMessagesScreen = (screen: Screen) => screen.includes("messages") || screen === "sharing";
const isNotificationsScreen = (screen: Screen) => screen.includes("notifications");
const isResultsScreen = (screen: Screen) => screen.includes("results");
const isStaffScreen = (screen: Screen) => screen.includes("staff") || screen.includes("users");
const isHospitalsScreen = (screen: Screen) => screen.includes("hospitals");
const isOperationalScreen = (screen: Screen): screen is WorkspaceTab => ["laboratory-requests", "emergency-requests", "emergency-cases", "admin-operations"].includes(screen);

const sectionShell = { gap: 10, padding: 16, borderRadius: 12, borderCurve: "continuous" as const, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow };

function SectionLoader({ label }: { label: string }) {
  return <View style={{ padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: 10 }}><ActivityIndicator color={colors.teal} /><Text style={{ color: colors.muted, textAlign: "center" }}>{label}</Text></View>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <View style={{ padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}><Text style={{ color: colors.ink, fontWeight: "900" }}>{title}</Text><Text style={{ color: colors.muted, marginTop: 6 }}>{detail}</Text></View>;
}

function SectionStatus({ loading, error, empty, emptyLabel }: { loading: boolean; error: string; empty: boolean; emptyLabel: string }) {
  if (loading) return <SectionLoader label="Loading section..." />;
  if (error) return <Text selectable style={{ color: colors.danger }}>{error}</Text>;
  if (empty) return <EmptyState title={emptyLabel} detail="This section will update as soon as matching backend records are available." />;
  return null;
}

function TabButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: active ? colors.blue : colors.surface, borderWidth: 1, borderColor: active ? colors.blue : colors.line }}><Text style={{ color: active ? "#FFFFFF" : colors.ink, fontWeight: "900", fontSize: 12 }}>{label}</Text></Pressable>;
}

function AppointmentList({ token, appointments, refresh }: { token?: string; appointments: Appointment[]; refresh: () => Promise<void> }) {
  const [busyId, setBusyId] = useState("");
  const update = async (id: string, status: Appointment["status"]) => {
    if (!token) return;
    setBusyId(id);
    try { await healthbridgeApi.updateAppointment(token, id, { status }); await refresh(); } finally { setBusyId(""); }
  };
  if (!appointments.length) return <EmptyState title="No appointments scheduled" detail="Appointment requests and care operations will appear here as soon as they are created." />;
  return <View style={{ gap: 10 }}>{appointments.map((appointment) => <View key={appointment._id} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: 8 }}><Text style={{ color: colors.ink, fontWeight: "900" }}>{appointment.reason}</Text><Text style={{ color: colors.muted }}>{new Date(appointment.scheduledAt).toLocaleString()} · {appointment.status}</Text><View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}><Pressable disabled={busyId === appointment._id} onPress={() => update(appointment._id, "accepted")} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.blueSoft }}><Text style={{ color: colors.blue, fontWeight: "800" }}>Accept</Text></Pressable><Pressable disabled={busyId === appointment._id} onPress={() => update(appointment._id, "completed")} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#ECFDF5" }}><Text style={{ color: "#047857", fontWeight: "800" }}>Complete</Text></Pressable><Pressable disabled={busyId === appointment._id} onPress={() => update(appointment._id, "cancelled")} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#FEF2F2" }}><Text style={{ color: colors.danger, fontWeight: "800" }}>Cancel</Text></Pressable></View></View>)}</View>;
}

function ProfileEditor({ token, user, data, refresh, logout }: { token?: string; user?: User; data?: WorkspacePayload; refresh: () => Promise<void>; logout?: () => Promise<void> }) {
  const profile = data?.profile;
  const [name, setName] = useState(profile?.account?.name ?? user?.name ?? "");
  const [phone, setPhone] = useState(profile?.account?.phone ?? "");
  const [email, setEmail] = useState(profile?.account?.email ?? user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => { setName(profile?.account?.name ?? user?.name ?? ""); setPhone(profile?.account?.phone ?? ""); setEmail(profile?.account?.email ?? user?.email ?? ""); }, [profile?.account?.email, profile?.account?.name, profile?.account?.phone, user?.email, user?.name]);
  const save = async () => { if (!token) return; setMessage(""); await healthbridgeApi.updateAccountProfile(token, { name, phone, email }); await refresh(); setMessage("Profile updated securely."); };
  const changePassword = async () => { if (!token) return; setMessage(""); await healthbridgeApi.changePassword(token, currentPassword, newPassword); setCurrentPassword(""); setNewPassword(""); setMessage("Password changed. Sign in again on other devices."); };
  return <View style={{ gap: 14 }}><View style={sectionShell}><Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Account details</Text><TextInput value={name} onChangeText={setName} placeholder="Full name" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12 }} /><TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12 }} /><TextInput value={phone} onChangeText={setPhone} placeholder="Phone" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12 }} /><PrimaryButton label="Save profile" onPress={() => void save()} /></View><View style={sectionShell}><Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Security</Text><TextInput value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" secureTextEntry style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12 }} /><TextInput value={newPassword} onChangeText={setNewPassword} placeholder="New password" secureTextEntry style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12 }} /><PrimaryButton label="Change password" tone="light" onPress={() => void changePassword()} />{logout ? <PrimaryButton label="Sign out" tone="light" onPress={() => void logout()} /> : null}</View>{message ? <Text style={{ color: colors.teal }}>{message}</Text> : null}</View>;
}

function OperationalWorkspace({ token, user, initialTab, logout }: { token: string; user?: User; initialTab: WorkspaceTab; logout?: () => Promise<void> }) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);
  const [labRequests, setLabRequests] = useState<SectionState<LabRequest[]>>({ data: [], loading: false, error: "" });
  const [emergencyCases, setEmergencyCases] = useState<SectionState<EmergencyCase[]>>({ data: [], loading: false, error: "" });
  const [adminOperations, setAdminOperations] = useState<SectionState<AdminOperations | undefined>>({ data: undefined, loading: false, error: "" });
  const [actionMessage, setActionMessage] = useState("");

  const loadLaboratoryRequests = useCallback(async () => {
    setLabRequests((current) => ({ ...current, loading: true, error: "" }));
    try { setLabRequests({ data: await healthbridgeApi.labRequests(token), loading: false, error: "" }); } catch (caught) { setLabRequests({ data: [], loading: false, error: caught instanceof Error ? caught.message : "Could not load assigned lab requests" }); }
  }, [token]);

  const loadEmergencyCases = useCallback(async () => {
    setEmergencyCases((current) => ({ ...current, loading: true, error: "" }));
    try { setEmergencyCases({ data: await healthbridgeApi.emergencyCases(token), loading: false, error: "" }); } catch (caught) { setEmergencyCases({ data: [], loading: false, error: caught instanceof Error ? caught.message : "Could not load assigned emergency cases" }); }
  }, [token]);

  const loadAdminOperations = useCallback(async () => {
    setAdminOperations((current) => ({ ...current, loading: true, error: "" }));
    try { setAdminOperations({ data: await healthbridgeApi.adminOperations(token), loading: false, error: "" }); } catch (caught) { setAdminOperations({ data: undefined, loading: false, error: caught instanceof Error ? caught.message : "Could not load admin operations" }); }
  }, [token]);

  const handleLaboratoryRequests = () => { setActiveTab("laboratory-requests"); void loadLaboratoryRequests(); };
  const handleEmergencyRequests = () => { setActiveTab("emergency-requests"); void loadEmergencyCases(); };
  const handleEmergencyCases = () => { setActiveTab("emergency-cases"); void loadEmergencyCases(); };
  const handleAdminOperations = () => { setActiveTab("admin-operations"); void loadAdminOperations(); };

  useEffect(() => {
    if (activeTab === "laboratory-requests") void loadLaboratoryRequests();
    if (activeTab === "emergency-requests" || activeTab === "emergency-cases") void loadEmergencyCases();
    if (activeTab === "admin-operations") void loadAdminOperations();
  }, [activeTab, loadAdminOperations, loadEmergencyCases, loadLaboratoryRequests]);

  const tabs = useMemo(() => {
    const visible: Array<{ tab: WorkspaceTab; label: string; onPress: () => void }> = [];
    if (user?.role === "laboratory" || user?.role === "hospital_admin" || user?.role === "super_admin") visible.push({ tab: "laboratory-requests", label: "Lab requests", onPress: handleLaboratoryRequests });
    if (user?.role === "emergency_staff" || user?.role === "super_admin") {
      visible.push({ tab: "emergency-requests", label: "Emergency requests", onPress: handleEmergencyRequests });
      visible.push({ tab: "emergency-cases", label: "Emergency cases", onPress: handleEmergencyCases });
    }
    if (user?.role === "super_admin") visible.push({ tab: "admin-operations", label: "Admin operations", onPress: handleAdminOperations });
    if (!visible.some((item) => item.tab === activeTab)) visible.push({ tab: activeTab, label: titleize(activeTab), onPress: () => setActiveTab(activeTab) });
    return visible;
  }, [activeTab, user?.role]);

  const mutateLab = async (id: string, action: "accept" | "reject" | "status", status?: LabRequest["status"]) => {
    setActionMessage("");
    if (action === "accept") await healthbridgeApi.acceptLabRequest(token, id);
    if (action === "reject") await healthbridgeApi.rejectLabRequest(token, id, "Rejected from mobile workspace");
    if (action === "status" && status) await healthbridgeApi.updateLabRequestStatus(token, id, status);
    setActionMessage("Laboratory request updated.");
    await loadLaboratoryRequests();
  };

  const mutateEmergency = async (item: EmergencyCase, action: "status" | "dispatch", status: EmergencyCase["status"] | NonNullable<EmergencyCase["dispatchStatus"]>) => {
    const id = item._id ?? item.id;
    setActionMessage("");
    if (action === "status") await healthbridgeApi.updateEmergencyCaseStatus(token, id, status as EmergencyCase["status"]);
    if (action === "dispatch") await healthbridgeApi.updateEmergencyDispatch(token, id, status as EmergencyCase["dispatchStatus"]);
    setActionMessage("Emergency case updated.");
    await loadEmergencyCases();
  };

  const approvePending = async (kind: "hospital" | "laboratory", id: string) => {
    setActionMessage("");
    if (kind === "hospital") await healthbridgeApi.approveHospital(token, id);
    if (kind === "laboratory") await healthbridgeApi.approveLaboratory(token, id);
    setActionMessage("Approval updated.");
    await loadAdminOperations();
  };

  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 112 }}><View style={sectionShell}><Text style={{ color: colors.ink, fontWeight: "900", fontSize: 18 }}>{titleize(activeTab)}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>Action-oriented workspace connected to HealthBridge backend services.</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>{tabs.map((tab) => <TabButton key={tab.tab} active={activeTab === tab.tab} label={tab.label} onPress={tab.onPress} />)}</View>{actionMessage ? <Text selectable style={{ color: colors.teal, marginTop: 8 }}>{actionMessage}</Text> : null}</View>
    {activeTab === "laboratory-requests" ? <View style={sectionShell}><Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Assigned laboratory requests</Text><SectionStatus loading={labRequests.loading} error={labRequests.error} empty={labRequests.data.length === 0} emptyLabel="No assigned lab requests" />{labRequests.data.map((item) => <View key={item._id ?? item.id} style={{ gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line }}><Text selectable style={{ color: colors.ink, fontWeight: "900" }}>{item.testName}</Text><Text selectable style={{ color: colors.muted }}>{objectName(item.patientId, "Patient")} • {objectName(item.hospitalId, "Hospital")}</Text><Text selectable style={{ color: colors.ink }}>Priority: {titleize(item.priority)} • Status: {titleize(item.status)}</Text>{item.clinicalNotes || item.notes ? <Text selectable style={{ color: colors.muted }}>{item.clinicalNotes ?? item.notes}</Text> : null}<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}><PrimaryButton label="Accept" onPress={() => void mutateLab(item._id ?? item.id, "accept")} /><PrimaryButton label="Reject" tone="light" onPress={() => void mutateLab(item._id ?? item.id, "reject")} />{requestStatuses.map((status) => <PrimaryButton key={status} label={titleize(status)} tone="light" onPress={() => void mutateLab(item._id ?? item.id, "status", status)} />)}</View></View>)}</View> : null}
    {activeTab === "emergency-requests" || activeTab === "emergency-cases" ? <View style={sectionShell}><Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>{activeTab === "emergency-requests" ? "Assigned emergency requests" : "Assigned emergency cases"}</Text><SectionStatus loading={emergencyCases.loading} error={emergencyCases.error} empty={emergencyCases.data.length === 0} emptyLabel="No assigned emergency cases" />{emergencyCases.data.map((item) => <View key={item._id ?? item.id} style={{ gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line }}><Text selectable style={{ color: colors.ink, fontWeight: "900" }}>{item.chiefComplaint ?? item.reason ?? "Emergency case"}</Text><Text selectable style={{ color: colors.muted }}>{objectName(item.patientId, "Patient")} • {objectName(item.hospitalId, "No hospital assigned")}</Text><Text selectable style={{ color: colors.ink }}>Severity: {titleize(item.severity ?? "high")} • Status: {titleize(item.status)} • Dispatch: {titleize(item.dispatchStatus ?? "unassigned")}</Text>{item.location ? <Text selectable style={{ color: colors.muted }}>Location: {item.location}</Text> : null}<Text selectable style={{ color: colors.muted }}>Responder: {objectName(item.assignedResponderId, objectId(item.assignedStaffUserIds?.[0]) || "Unassigned")}</Text><Text style={{ fontWeight: "900", color: colors.ink }}>Status updates</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{caseStatuses.map((status) => <PrimaryButton key={status} label={titleize(status)} tone="light" onPress={() => void mutateEmergency(item, "status", status)} />)}</View><Text style={{ fontWeight: "900", color: colors.ink }}>Dispatch updates</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{dispatchStatuses.map((status) => <PrimaryButton key={status} label={titleize(status)} tone="light" onPress={() => void mutateEmergency(item, "dispatch", status)} />)}</View></View>)}</View> : null}
    {activeTab === "admin-operations" ? <View style={{ gap: 12 }}><View style={sectionShell}><Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Platform and hospital operations</Text><SectionStatus loading={adminOperations.loading} error={adminOperations.error} empty={!adminOperations.data} emptyLabel="No operational data" />{adminOperations.data ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}><InfoCard label="Users" value={String(adminOperations.data.statistics.totalUsers)} /><InfoCard label="Active" value={String(adminOperations.data.statistics.activeUsers)} tone="teal" /><InfoCard label="Hospitals" value={String(adminOperations.data.statistics.hospitals)} /><InfoCard label="Pending" value={String(adminOperations.data.statistics.pendingApprovals)} tone="amber" /></View> : null}</View>{adminOperations.data ? <><View style={sectionShell}><Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Pending approvals</Text><SectionStatus loading={false} error="" empty={adminOperations.data.pendingApprovals.hospitals.length + adminOperations.data.pendingApprovals.laboratories.length === 0} emptyLabel="No pending approvals" />{adminOperations.data.pendingApprovals.hospitals.map((hospital) => <View key={hospital.id ?? hospital._id} style={{ gap: 6 }}><Text selectable style={{ fontWeight: "900" }}>{hospital.name}</Text><PrimaryButton label="Approve hospital" onPress={() => void approvePending("hospital", hospital.id ?? hospital._id ?? "")} /></View>)}{adminOperations.data.pendingApprovals.laboratories.map((lab) => <View key={lab.id ?? lab._id} style={{ gap: 6 }}><Text selectable style={{ fontWeight: "900" }}>{lab.labName}</Text><PrimaryButton label="Approve lab" onPress={() => void approvePending("laboratory", lab.id ?? lab._id ?? "")} /></View>)}</View><View style={sectionShell}><Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Staff and users</Text><SectionStatus loading={false} error="" empty={adminOperations.data.users.length === 0} emptyLabel="No users found" />{adminOperations.data.users.slice(0, 8).map((staff) => <Text selectable key={staff.id ?? staff.email} style={{ color: colors.ink }}>{staff.name} • {staff.email} • {titleize(staff.role)}</Text>)}</View><View style={sectionShell}><Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Hospitals</Text><SectionStatus loading={false} error="" empty={adminOperations.data.hospitals.length === 0} emptyLabel="No hospitals found" />{adminOperations.data.hospitals.slice(0, 8).map((hospital) => <Text selectable key={hospital.id ?? hospital._id} style={{ color: colors.ink }}>{hospital.name} • {[hospital.city, hospital.state].filter(Boolean).join(", ")} • {titleize(hospital.status)}</Text>)}</View><View style={sectionShell}><Text style={{ color: colors.ink, fontWeight: "900", fontSize: 16 }}>Appointment summaries</Text><SectionStatus loading={false} error="" empty={adminOperations.data.appointments.length === 0 && adminOperations.data.statistics.appointmentsByStatus.length === 0} emptyLabel="No appointment summaries found" />{adminOperations.data.statistics.appointmentsByStatus.map((item) => <Text selectable key={item._id} style={{ color: colors.ink }}>{titleize(item._id)}: {item.count}</Text>)}{adminOperations.data.appointments.slice(0, 5).map((appointment) => <Text selectable key={appointment._id} style={{ color: colors.muted }}>{appointment.reason} • {appointment.status} • {new Date(appointment.scheduledAt).toLocaleString()}</Text>)}</View></> : null}</View> : null}
    {logout ? <PrimaryButton label="Sign out" tone="light" onPress={() => void logout()} /> : null}
  </ScrollView>;
}

export function RoleWorkspaceScreen({ token, user, screen, logout }: RoleWorkspaceProps) {
  const [data, setData] = useState<WorkspacePayload>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = async () => { if (!token) return; setError(""); setData(await healthbridgeApi.workspace(token)); };
  useEffect(() => { let alive = true; if (!token || isOperationalScreen(screen)) return; setLoading(true); healthbridgeApi.workspace(token).then((next) => { if (alive) setData(next); }).catch((caught) => { if (alive) setError(caught instanceof Error ? caught.message : "Workspace could not be loaded"); }).finally(() => { if (alive) setLoading(false); }); return () => { alive = false; }; }, [screen, token]);

  const title = useMemo(() => `${roleName[user?.role ?? "patient"]} ${isProfileScreen(screen) ? "Profile" : isAppointmentsScreen(screen) ? "Appointments" : isPatientsScreen(screen) ? "Patients" : isMessagesScreen(screen) ? "Messages" : isNotificationsScreen(screen) ? "Notifications" : isResultsScreen(screen) ? "Results" : isStaffScreen(screen) ? "Staff" : isHospitalsScreen(screen) ? "Hospitals" : "Dashboard"}`, [screen, user?.role]);

  if (token && isOperationalScreen(screen)) return <OperationalWorkspace token={token} user={user} initialTab={screen} logout={logout} />;
  const patients = data?.patients ?? [];
  const appointments = data?.appointments ?? [];
  const notifications = data?.notifications ?? [];
  const labResults = data?.labResults ?? [];
  const staff = data?.staff ?? [];
  const hospitals = data?.hospitals ?? [];
  const messages = data?.messages ?? [];

  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 112 }}><View style={{ padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, boxShadow: shadow }}><Text style={{ color: colors.ink, fontWeight: "900", fontSize: 18 }}>{title}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>Connected to HealthBridge backend services with role-based access controls.</Text></View>{error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}{loading ? <SectionLoader label="Loading workspace sections without blocking navigation" /> : isProfileScreen(screen) ? <ProfileEditor token={token} user={user} data={data} refresh={refresh} logout={logout} /> : isAppointmentsScreen(screen) ? <AppointmentList token={token} appointments={appointments} refresh={refresh} /> : isPatientsScreen(screen) ? (patients.length ? <View style={{ gap: 10 }}>{patients.map((patient) => <View key={patient.id ?? patient._id} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}><Text style={{ color: colors.ink, fontWeight: "900" }}>{patient.fullName}</Text><Text style={{ color: colors.muted }}>{patient.bloodGroup} · {patient.chronicConditions?.join(", ") || "No chronic conditions recorded"}</Text></View>)}</View> : <EmptyState title="No patients assigned" detail="Patients linked to this role and organization will be listed here." />) : isMessagesScreen(screen) ? (messages.length ? <View style={{ gap: 10 }}>{messages.map((message) => <View key={message._id} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}><Text style={{ color: colors.ink }}>{message.body}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{new Date(message.createdAt).toLocaleString()}</Text></View>)}</View> : <EmptyState title="No care messages" detail="Secure consultation messages will appear here when conversations begin." />) : isNotificationsScreen(screen) ? (notifications.length ? <View style={{ gap: 10 }}>{notifications.map((item) => <View key={item._id} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}><Text style={{ color: colors.ink, fontWeight: "900" }}>{item.title}</Text><Text style={{ color: colors.muted }}>{item.body}</Text></View>)}</View> : <EmptyState title="No active notifications" detail="Clinical, appointment, and system notifications will appear here." />) : isResultsScreen(screen) ? (labResults.length ? <View style={{ gap: 10 }}>{labResults.map((result) => <View key={result._id} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}><Text style={{ color: colors.ink, fontWeight: "900" }}>{result.testName}</Text><Text style={{ color: colors.muted }}>{result.result} · {result.status}</Text></View>)}</View> : <EmptyState title="No lab results" detail="Uploaded and authorized lab results will appear here." />) : isStaffScreen(screen) ? (staff.length ? <View style={{ gap: 10 }}>{staff.map((member) => <View key={member.id} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}><Text style={{ color: colors.ink, fontWeight: "900" }}>{member.name}</Text><Text style={{ color: colors.muted }}>{member.role} · {member.email}</Text></View>)}</View> : <EmptyState title="No staff records" detail="Staff and provider accounts in your authorized scope will appear here." />) : isHospitalsScreen(screen) ? (hospitals.length ? <View style={{ gap: 10 }}>{hospitals.map((hospital) => <View key={hospital.id ?? hospital._id} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}><Text style={{ color: colors.ink, fontWeight: "900" }}>{hospital.name}</Text><Text style={{ color: colors.muted }}>{hospital.city}, {hospital.state} · {hospital.status}</Text></View>)}</View> : <EmptyState title="No hospitals in scope" detail="Hospitals available to your administrative role will appear here." />) : <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}><InfoCard label="Patients" value={String(patients.length)} /><InfoCard label="Appointments" value={String(appointments.length)} tone="amber" /><InfoCard label="Lab results" value={String(labResults.length)} /><InfoCard label="Notifications" value={String(notifications.length)} tone="amber" /></View>}</ScrollView>;
}
