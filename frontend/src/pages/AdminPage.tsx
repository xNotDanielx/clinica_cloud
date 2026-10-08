import Feedback from "../components/Feedback";
import { useEffect, useRef, useState } from "react";
import AdminAssistantWidget from "../components/AdminAssistantWidget";
import AdminLogin from "../components/AdminLogin";
import AdminOverview from "../components/AdminOverview";
import AdminModal from "../components/AdminModal";
import { PatientList, AppointmentList, type Patient, type Appointment, type ListState } from "../components/AdminRecords";
import { Activity, ArrowUpRight, CalendarDays, ClipboardCheck, LayoutDashboard, LogOut, Users, X } from "lucide-react";
import "../admin.css";
import { apiFetch, apiErrorMessage } from "../components/api";

type TabKey = "Inicio" | "Pacientes" | "Citas" | "Autorizar Citas";

const navigationIcons = { Inicio: LayoutDashboard, Pacientes: Users, Citas: CalendarDays, "Autorizar Citas": ClipboardCheck };
const sidebarItems: TabKey[] = ["Inicio", "Pacientes", "Citas", "Autorizar Citas"];

type Procedure = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string | number;
  url_imagen?: string | null;
  activo: boolean;
  fecha_ultima_actualizacion: string;
};

type CreatePatientFormData = {
  identificacion: string;
  tipo_identificacion: string;
  nombre_completo: string;
  telefono: string;
  email: string;
  direccion: string;
  sexo: string;
  activo: boolean;
};

type EditPatientFormData = {
  tipo_identificacion: string;
  nombre_completo: string;
  telefono: string;
  email: string;
  direccion: string;
  sexo: string;
  nacionalidad: string;
  genero: string;
  fecha_nacimiento: string;
  altura: string;
  peso: string;
  activo: boolean;
};

type CreateAppointmentFormData = {
  id_paciente: string;
  fecha_programada: string;
  hora_inicio: string;
  hora_fin: string;
  nota: string;
  estado: string;
  procedimiento_ids: number[];
  valor_consulta: string;
  id_codigo_promocional: string;
};

type EditAppointmentFormData = {
  id_paciente: string;
  fecha_programada: string;
  hora_inicio: string;
  hora_fin: string;
  nota: string;
  estado: string;
  procedimiento_ids: number[];
  valor_consulta: string;
  id_codigo_promocional: string;
};

const initialCreatePatientForm: CreatePatientFormData = {
  identificacion: "",
  tipo_identificacion: "cedula_chilena",
  nombre_completo: "",
  telefono: "",
  email: "",
  direccion: "",
  sexo: "masculino",
  activo: true,
};

const initialEditPatientForm: EditPatientFormData = {
  tipo_identificacion: "cedula_chilena",
  nombre_completo: "",
  telefono: "",
  email: "",
  direccion: "",
  sexo: "masculino",
  nacionalidad: "",
  genero: "",
  fecha_nacimiento: "",
  altura: "",
  peso: "",
  activo: true,
};

const initialCreateAppointmentForm: CreateAppointmentFormData = {
  id_paciente: "",
  fecha_programada: "",
  hora_inicio: "",
  hora_fin: "",
  nota: "",
  estado: "pendiente_aprobacion",
  procedimiento_ids: [],
  valor_consulta: "0",
  id_codigo_promocional: "",
};

const initialEditAppointmentForm: EditAppointmentFormData = {
  id_paciente: "",
  fecha_programada: "",
  hora_inicio: "",
  hora_fin: "",
  nota: "",
  estado: "aprobada",
  procedimiento_ids: [],
  valor_consulta: "0",
  id_codigo_promocional: "",
};

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("Inicio");

  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [notice, setNotice] = useState("");
  const [procedureLoadError, setProcedureLoadError] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ title: string; description: string; run: () => Promise<void> } | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [lists, setLists] = useState<Record<"patients" | "appointments" | "pending", ListState>>({
    patients: { loading: true, error: "" }, appointments: { loading: true, error: "" }, pending: { loading: true, error: "" },
  });
  const loadIds = useRef({ patients: 0, appointments: 0, pending: 0 });
  async function refreshList<T>(key: keyof typeof lists, endpoint: string, update: (items: T[]) => void) {
    const id = ++loadIds.current[key];
    setLists(previous => ({ ...previous, [key]: { loading: true, error: "" } }));
    try {
      const data = await apiFetch(endpoint);
      if (id !== loadIds.current[key]) return;
      update(data);
      setLists(previous => ({ ...previous, [key]: { loading: false, error: "" } }));
    } catch (error) {
      if (id !== loadIds.current[key]) return;
      setLists(previous => ({ ...previous, [key]: { loading: false, error: apiErrorMessage(error, "No se pudo cargar la lista.") } }));
    }
  }
  function requestAction(title: string, description: string, run: () => Promise<void>) {
    setActionError("");
    setConfirmAction({ title, description, run });
  }
  async function executeAction() {
    if (!confirmAction || actionBusy) return;
    setActionBusy(true);
    setActionError("");
    try {
      await confirmAction.run();
      setConfirmAction(null);
      setNotice("Operación realizada correctamente.");
    } catch (error) {
      setActionError(apiErrorMessage(error, "No se pudo completar la operación. Inténtalo de nuevo."));
    } finally { setActionBusy(false); }
  }

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] = useState(false);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [isCreateAppointmentModalOpen, setIsCreateAppointmentModalOpen] = useState(false);
  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] = useState(false);

  const [createPatientForm, setCreatePatientForm] =
    useState<CreatePatientFormData>(initialCreatePatientForm);
  const [editPatientForm, setEditPatientForm] =
    useState<EditPatientFormData>(initialEditPatientForm);

  const [createAppointmentForm, setCreateAppointmentForm] =
    useState<CreateAppointmentFormData>(initialCreateAppointmentForm);
  const [editAppointmentForm, setEditAppointmentForm] =
    useState<EditAppointmentFormData>(initialEditAppointmentForm);

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);

  const [createPatientError, setCreatePatientError] = useState("");
  const [editPatientError, setEditPatientError] = useState("");
  const [createAppointmentError, setCreateAppointmentError] = useState("");
  const [editAppointmentError, setEditAppointmentError] = useState("");

  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);

  const cargarCitas = () => refreshList<Appointment>("appointments", "/citas/todas", setAppointments);
  const cargarPendientes = () => refreshList<Appointment>("pending", "/citas/pendientes-aprobacion", setPendingAppointments);
  const cargarPacientes = () => refreshList<Patient>("patients", "/pacientes", setPatients);
  const eliminarCita = async (id: number) => {
    await apiFetch(`/citas/${id}`, { method: "DELETE" });
    await Promise.all([cargarCitas(), cargarPendientes()]);
  };

  const cargarProcedimientos = async () => {
    setProcedureLoadError("");
    try {
      const data = await apiFetch("/procedimientos/activos");
      setProcedures(data);
    } catch (e) {
      setProcedureLoadError(apiErrorMessage(e, "No se pudo cargar el catálogo de procedimientos."));
    }
  };

  const eliminarPaciente = async (id: string) => {
    await apiFetch(`/pacientes/${encodeURIComponent(id)}`, { method: "DELETE" });
    await cargarPacientes();
  };
  const autorizarCita = async (id: number) => {
    await apiFetch(`/citas/${id}/aprobar`, { method: "PATCH" });
    await Promise.all([cargarCitas(), cargarPendientes()]);
  };
  const rechazarCita = async (id: number) => {
    await apiFetch(`/citas/${id}/rechazar`, { method: "PATCH" });
    await Promise.all([cargarCitas(), cargarPendientes()]);
  };

  useEffect(() => {
    if (loggedIn) {
      cargarCitas();
      cargarPendientes();
      cargarPacientes();
      cargarProcedimientos();
    }
  }, [loggedIn]);

  const formatDateTimeLocal = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  };

  const formatDateInput = (value?: string | null) => {
    if (!value) return "";
    return String(value).slice(0, 10);
  };

  const formatTimeInput = (value?: string | null) => {
    if (!value) return "";
    return String(value).slice(0, 5);
  };

  const formatCurrency = (value?: string | number | null) => {
    if (value == null || value === "") return "$0";
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return `$${value}`;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(numberValue);
  };

  const openCreatePatientModal = () => {
    setCreatePatientForm(initialCreatePatientForm);
    setCreatePatientError("");
    setIsCreatePatientModalOpen(true);
  };

  const closeCreatePatientModal = () => {
    setIsCreatePatientModalOpen(false);
    setCreatePatientError("");
  };

  const openEditPatientModal = (patient: Patient) => {
    setSelectedPatientId(patient.identificacion);
    setEditPatientError("");
    setEditPatientForm({
      tipo_identificacion: patient.tipo_identificacion ?? "cedula_chilena",
      nombre_completo: patient.nombre_completo ?? "",
      telefono: patient.telefono ?? "",
      email: patient.email ?? "",
      direccion: patient.direccion ?? "",
      sexo: patient.sexo ?? "masculino",
      nacionalidad: patient.nacionalidad ?? "",
      genero: patient.genero ?? "",
      fecha_nacimiento: formatDateTimeLocal(patient.fecha_nacimiento),
      altura: patient.altura != null ? String(patient.altura) : "",
      peso: patient.peso != null ? String(patient.peso) : "",
      activo: Boolean(patient.activo),
    });
    setIsEditPatientModalOpen(true);
  };

  const closeEditPatientModal = () => {
    setIsEditPatientModalOpen(false);
    setEditPatientError("");
    setSelectedPatientId(null);
  };

  const openCreateAppointmentModal = () => {
    setCreateAppointmentForm(initialCreateAppointmentForm);
    setCreateAppointmentError("");
    setIsCreateAppointmentModalOpen(true);
  };

  const closeCreateAppointmentModal = () => {
    setIsCreateAppointmentModalOpen(false);
    setCreateAppointmentError("");
  };

  const openEditAppointmentModal = (appointment: Appointment) => {
    setSelectedAppointmentId(appointment.id);
    setEditAppointmentError("");
    setEditAppointmentForm({
      id_paciente: appointment.id_paciente ?? "",
      fecha_programada: formatDateInput(appointment.fecha_programada),
      hora_inicio: formatTimeInput(appointment.hora_inicio),
      hora_fin: formatTimeInput(appointment.hora_fin),
      nota: appointment.nota ?? "",
      estado: appointment.estado ?? "aprobada",
      procedimiento_ids: Array.isArray(appointment.procedimiento_ids)
        ? appointment.procedimiento_ids
        : [],
      valor_consulta: "0",
      id_codigo_promocional:
        appointment.id_codigo_promocional != null
          ? String(appointment.id_codigo_promocional)
          : "",
    });
    setIsEditAppointmentModalOpen(true);
  };

  const closeEditAppointmentModal = () => {
    setIsEditAppointmentModalOpen(false);
    setEditAppointmentError("");
    setSelectedAppointmentId(null);
  };

  const handleCreatePatientInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;

    if (name === "nombre_completo") {
      setCreatePatientForm((prev) => ({
        ...prev,
        nombre_completo: value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""),
      }));
      return;
    }

    if (name === "identificacion" || name === "telefono") {
      setCreatePatientForm((prev) => ({
        ...prev,
        [name]: value.replace(/[^\d+]/g, "").slice(0, 20),
      }));
      return;
    }

    if (type === "checkbox" && event.target instanceof HTMLInputElement) {
      const checked = event.target.checked;
      setCreatePatientForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setCreatePatientForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditPatientInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;

    if (name === "nombre_completo") {
      setEditPatientForm((prev) => ({
        ...prev,
        nombre_completo: value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""),
      }));
      return;
    }

    if (name === "telefono") {
      setEditPatientForm((prev) => ({
        ...prev,
        telefono: value.replace(/[^\d+]/g, "").slice(0, 20),
      }));
      return;
    }

    if (type === "checkbox" && event.target instanceof HTMLInputElement) {
      const checked = event.target.checked;
      setEditPatientForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setEditPatientForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateAppointmentInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setCreateAppointmentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditAppointmentInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setEditAppointmentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleCreateAppointmentProcedure = (procedureId: number) => {
    setCreateAppointmentForm((prev) => ({
      ...prev,
      procedimiento_ids: prev.procedimiento_ids.includes(procedureId)
        ? prev.procedimiento_ids.filter((id) => id !== procedureId)
        : [...prev.procedimiento_ids, procedureId],
    }));
  };

  const toggleEditAppointmentProcedure = (procedureId: number) => {
    setEditAppointmentForm((prev) => ({
      ...prev,
      procedimiento_ids: prev.procedimiento_ids.includes(procedureId)
        ? prev.procedimiento_ids.filter((id) => id !== procedureId)
        : [...prev.procedimiento_ids, procedureId],
    }));
  };

  const handleCreatePatient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatePatientError("");

    try {
      setIsCreatingPatient(true);

      await apiFetch("/pacientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identificacion: createPatientForm.identificacion.trim(),
          tipo_identificacion: createPatientForm.tipo_identificacion,
          nombre_completo: createPatientForm.nombre_completo.trim(),
          telefono: createPatientForm.telefono.trim(),
          email: createPatientForm.email.trim(),
          direccion: createPatientForm.direccion.trim(),
          sexo: createPatientForm.sexo,
          nacionalidad: null,
          genero: null,
          fecha_nacimiento: null,
          altura: null,
          peso: null,
          activo: createPatientForm.activo,
        }),
      });

      closeCreatePatientModal();
      setNotice("Paciente guardado correctamente.");
      await cargarPacientes();
    } catch (error) {
      console.error(error);
      setCreatePatientError(apiErrorMessage(error, "No se pudo crear el paciente."));
    } finally {
      setIsCreatingPatient(false);
    }
  };

  const handleEditPatient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPatientId) return;

    setEditPatientError("");

    try {
      setIsEditingPatient(true);

      await apiFetch(`/pacientes/${selectedPatientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo_identificacion: editPatientForm.tipo_identificacion,
          nombre_completo: editPatientForm.nombre_completo.trim(),
          telefono: editPatientForm.telefono.trim(),
          email: editPatientForm.email.trim(),
          direccion: editPatientForm.direccion.trim(),
          sexo: editPatientForm.sexo,
          nacionalidad: editPatientForm.nacionalidad.trim() || null,
          genero: editPatientForm.genero.trim() || null,
          fecha_nacimiento: editPatientForm.fecha_nacimiento || null,
          altura: editPatientForm.altura ? Number(editPatientForm.altura) : null,
          peso: editPatientForm.peso ? Number(editPatientForm.peso) : null,
          activo: editPatientForm.activo,
        }),
      });

      closeEditPatientModal();
      setNotice("Paciente guardado correctamente.");
      await cargarPacientes();
    } catch (error) {
      console.error(error);
      setEditPatientError(apiErrorMessage(error, "No se pudo actualizar el paciente."));
    } finally {
      setIsEditingPatient(false);
    }
  };

  const handleCreateAppointment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateAppointmentError("");

    try {
      setIsCreatingAppointment(true);

      await apiFetch("/citas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_paciente: createAppointmentForm.id_paciente,
          fecha_programada: createAppointmentForm.fecha_programada,
          hora_inicio: createAppointmentForm.hora_inicio,
          hora_fin: createAppointmentForm.hora_fin,
          nota: createAppointmentForm.nota.trim() || null,
          estado: createAppointmentForm.estado,
          procedimiento_ids: createAppointmentForm.procedimiento_ids,
          valor_consulta: Number(createAppointmentForm.valor_consulta || 0),
          id_codigo_promocional: createAppointmentForm.id_codigo_promocional
            ? Number(createAppointmentForm.id_codigo_promocional)
            : null,
        }),
      });

      closeCreateAppointmentModal();
      setNotice("Cita guardada correctamente.");
      await cargarCitas();
      await cargarPendientes();
    } catch (error) {
      console.error(error);
      setCreateAppointmentError(apiErrorMessage(error, "No se pudo crear la cita."));
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  const handleEditAppointment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAppointmentId) return;

    setEditAppointmentError("");

    try {
      setIsEditingAppointment(true);

      await apiFetch(`/citas/${selectedAppointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_paciente: editAppointmentForm.id_paciente,
          fecha_programada: editAppointmentForm.fecha_programada,
          hora_inicio: editAppointmentForm.hora_inicio,
          hora_fin: editAppointmentForm.hora_fin,
          nota: editAppointmentForm.nota.trim() || null,
          estado: editAppointmentForm.estado,
          procedimiento_ids: editAppointmentForm.procedimiento_ids,
          valor_consulta: Number(editAppointmentForm.valor_consulta || 0),
          id_codigo_promocional: editAppointmentForm.id_codigo_promocional
            ? Number(editAppointmentForm.id_codigo_promocional)
            : null,
        }),
      });

      closeEditAppointmentModal();
      setNotice("Cita guardada correctamente.");
      await cargarCitas();
      await cargarPendientes();
    } catch (error) {
      console.error(error);
      setEditAppointmentError(apiErrorMessage(error, "No se pudo actualizar la cita."));
    } finally {
      setIsEditingAppointment(false);
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoggingIn) return;
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000"}/administradores/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: username.trim(), contrasena: password }),
      });
      if (!response.ok) {
        setLoginError(response.status === 401 ? "Usuario o contraseña incorrectos." : "No se pudo iniciar sesión. Inténtalo de nuevo.");
        return;
      }
      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      setPassword("");
      setNotice("");
      setLoggedIn(true);
    } catch {
      setLoginError("No se pudo conectar con el servidor. Comprueba la conexión.");
    } finally { setIsLoggingIn(false); }
  };

  if (!loggedIn) {
    return (
      <AdminLogin
        username={username}
        password={password}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
        error={loginError}
        isLoading={isLoggingIn}
      />
    );
  }

  return (
    <div className="a-admin">
      <header className="a-header">
        <a href="#" className="a-brand">renacer<span>.</span><small>ADMINISTRACIÓN</small></a>
        <div className="a-header-right"><a href="#">Ver sitio <ArrowUpRight size={14}/></a><span className="a-user"><span>{username.slice(0,1).toUpperCase()}</span>{username}</span></div>
      </header>
      <div className="a-layout">
        <aside className="a-sidebar">
          <p>ESPACIO DE TRABAJO</p>
          <nav aria-label="Administración">{sidebarItems.map(item => { const Icon = navigationIcons[item]; return <button key={item} onClick={()=>setActiveTab(item)} aria-current={activeTab === item ? "page" : undefined}><Icon size={18}/>{item === "Autorizar Citas" ? "Solicitudes" : item}</button>; })}</nav>
          <div className="a-session"><Activity size={16}/><span>Sesión administrativa</span></div>
          <button className="a-logout" onClick={()=>{localStorage.removeItem("access_token"); setLoggedIn(false);setPassword("");setActiveTab("Inicio");}}><LogOut size={17}/> Cerrar sesión</button>
        </aside>
        <div className="a-content">
          {procedureLoadError && <Feedback title="Catálogo no disponible"><p>{procedureLoadError}</p><div className="feedback-actions"><button onClick={cargarProcedimientos}>Reintentar</button></div></Feedback>}
          {notice && <Feedback tone="success" title="Operación completada"><p>{notice}</p><div className="feedback-actions"><button aria-label="Cerrar aviso" title="Cerrar aviso" onClick={() => setNotice("")}><X size={16}/> Cerrar aviso</button></div></Feedback>}
          <main className="space-y-6">
            {activeTab === "Inicio" && (
              <AdminOverview onPending={() => { setActiveTab("Autorizar Citas"); }} onAppointments={() => { setActiveTab("Citas"); }} onCreate={openCreateAppointmentModal} />
            )}

            {activeTab === "Pacientes" && <PatientList patients={patients} state={lists.patients} onReload={cargarPacientes} onCreate={openCreatePatientModal} onEdit={openEditPatientModal}
              onDelete={patient => requestAction("Eliminar paciente", `¿Eliminar a ${patient.nombre_completo} (${patient.identificacion})?`, () => eliminarPaciente(patient.identificacion))} />}
            {(activeTab === "Citas" || activeTab === "Autorizar Citas") && <AppointmentList key={activeTab}
              pending={activeTab === "Autorizar Citas"} appointments={activeTab === "Citas" ? appointments : pendingAppointments}
              state={activeTab === "Citas" ? lists.appointments : lists.pending} onReload={activeTab === "Citas" ? cargarCitas : cargarPendientes}
              onCreate={openCreateAppointmentModal} onEdit={openEditAppointmentModal}
              onDelete={cita => requestAction("Eliminar cita", `¿Eliminar la cita #${cita.id} de ${cita.nombre_paciente || cita.id_paciente}?`, () => eliminarCita(cita.id))}
              onApprove={cita => requestAction("Aprobar solicitud", `¿Aprobar la cita #${cita.id} del ${cita.fecha_programada} a las ${cita.hora_inicio.slice(0, 5)}?`, () => autorizarCita(cita.id))}
              onReject={cita => requestAction("Rechazar solicitud", `¿Rechazar la cita #${cita.id} de ${cita.nombre_paciente || cita.id_paciente}?`, () => rechazarCita(cita.id))}
            />}
          </main>
        </div>
      </div>

      {confirmAction && <AdminModal title={confirmAction.title} busy={actionBusy} onClose={() => setConfirmAction(null)}>
        <div className="a-modal-heading"><h2 className="a-modal-title">{confirmAction.title}</h2></div>
        <div className="a-confirm-body"><Feedback tone="warning" title="Confirma antes de continuar">{confirmAction.description}</Feedback>
          {actionError && <Feedback>{actionError}</Feedback>}
          <div className="a-form-actions"><button className="a-secondary" disabled={actionBusy} onClick={() => setConfirmAction(null)}>Cancelar</button><button className="a-primary" disabled={actionBusy} onClick={executeAction}>{actionBusy ? "Procesando..." : "Confirmar"}</button></div>
        </div>
      </AdminModal>}
      <AdminAssistantWidget />

      {isCreatePatientModalOpen && (
        <AdminModal title="Agregar paciente" busy={isCreatingPatient} onClose={closeCreatePatientModal}>
            <div className="a-modal-heading">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="a-kicker">Pacientes</p>
                  <h2 className="a-modal-title">Agregar paciente</h2>
                  <p className="a-modal-description">
                    Registra solo los datos necesarios del paciente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCreatePatientModal} disabled={isCreatingPatient}
                  aria-label="Cerrar formulario" title="Cerrar formulario"
                  className="a-icon a-modal-close"
                >
                  <X size={19}/>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreatePatient} onInvalidCapture={() => setCreatePatientError("Revisa los campos obligatorios y el formato de los datos.")} className="a-record-form">
              <fieldset disabled={isCreatingPatient}>
              <div className="a-form-grid">
                <div>
                  <label htmlFor="create-patient-1" className="a-field-label">Identificación</label>
                  <input id="create-patient-1"
                    name="identificacion" required
                    value={createPatientForm.identificacion}
                    onChange={handleCreatePatientInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="create-patient-2" className="a-field-label">Tipo de identificación</label>
                  <select id="create-patient-2"
                    name="tipo_identificacion"
                    value={createPatientForm.tipo_identificacion}
                    onChange={handleCreatePatientInputChange}
                    className="a-field"
                  >
                    <option value="cedula_chilena">Cédula chilena</option>
                    <option value="cedula_extranjero">Cédula extranjero</option>
                    <option value="pasaporte_chileno">Pasaporte chileno</option>
                    <option value="pasaporte_extranjero">Pasaporte extranjero</option>
                    <option value="documento_extranjero">Documento extranjero</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="create-patient-3" className="a-field-label">Nombre completo</label>
                  <input id="create-patient-3"
                    name="nombre_completo" required
                    value={createPatientForm.nombre_completo}
                    onChange={handleCreatePatientInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="create-patient-4" className="a-field-label">Teléfono</label>
                  <input id="create-patient-4"
                    name="telefono" required
                    value={createPatientForm.telefono}
                    onChange={handleCreatePatientInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="create-patient-5" className="a-field-label">Email</label>
                  <input id="create-patient-5"
                    name="email" required
                    type="email"
                    value={createPatientForm.email}
                    onChange={handleCreatePatientInputChange}
                    className="a-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="create-patient-6" className="a-field-label">Dirección</label>
                  <input id="create-patient-6"
                    name="direccion" required
                    value={createPatientForm.direccion}
                    onChange={handleCreatePatientInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="create-patient-7" className="a-field-label">Sexo</label>
                  <select id="create-patient-7"
                    name="sexo"
                    value={createPatientForm.sexo}
                    onChange={handleCreatePatientInputChange}
                    className="a-field"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="a-checkbox-field">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={createPatientForm.activo}
                      onChange={handleCreatePatientInputChange}
                    />
                    Paciente activo
                  </label>
                </div>
              </div>

              {createPatientError && <Feedback>{createPatientError}</Feedback>}

              <div className="a-form-actions">
                <button
                  type="submit"
                  disabled={isCreatingPatient}
                  className="a-primary"
                >
                  {isCreatingPatient ? "Guardando..." : "Guardar paciente"}
                </button>
                <button
                  type="button"
                  onClick={closeCreatePatientModal} disabled={isCreatingPatient}
                  className="a-secondary"
                >
                  Cancelar
                </button>
              </div>
              </fieldset>
            </form>
        </AdminModal>
      )}

      {isEditPatientModalOpen && (
        <AdminModal title="Editar paciente" busy={isEditingPatient} onClose={closeEditPatientModal}>
            <div className="a-modal-heading">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="a-kicker">Pacientes</p>
                  <h2 className="a-modal-title">Editar paciente</h2>
                  <p className="a-modal-description">
                    Actualiza la información completa del paciente seleccionado.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditPatientModal} disabled={isEditingPatient}
                  aria-label="Cerrar formulario" title="Cerrar formulario"
                  className="a-icon a-modal-close"
                >
                  <X size={19}/>
                </button>
              </div>
            </div>

            <form onSubmit={handleEditPatient} onInvalidCapture={() => setEditPatientError("Revisa los campos obligatorios y el formato de los datos.")} className="a-record-form">
              <fieldset disabled={isEditingPatient}>
              <div className="a-form-grid">
                <div className="md:col-span-2">
                  <label htmlFor="edit-patient-1" className="a-field-label">Identificación</label>
                  <input id="edit-patient-1"
                    value={selectedPatientId ?? ""}
                    disabled
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="edit-patient-2" className="a-field-label">Tipo de identificación</label>
                  <select id="edit-patient-2"
                    name="tipo_identificacion"
                    value={editPatientForm.tipo_identificacion}
                    onChange={handleEditPatientInputChange}
                    className="a-field"
                  >
                    <option value="cedula_chilena">Cédula chilena</option>
                    <option value="cedula_extranjero">Cédula extranjero</option>
                    <option value="pasaporte_chileno">Pasaporte chileno</option>
                    <option value="pasaporte_extranjero">Pasaporte extranjero</option>
                    <option value="documento_extranjero">Documento extranjero</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-patient-3" className="a-field-label">Sexo</label>
                  <select id="edit-patient-3"
                    name="sexo"
                    value={editPatientForm.sexo}
                    onChange={handleEditPatientInputChange}
                    className="a-field"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="edit-patient-4" className="a-field-label">Nombre completo</label>
                  <input id="edit-patient-4"
                    name="nombre_completo" required
                    value={editPatientForm.nombre_completo}
                    onChange={handleEditPatientInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="edit-patient-5" className="a-field-label">Teléfono</label>
                  <input id="edit-patient-5"
                    name="telefono" required
                    value={editPatientForm.telefono}
                    onChange={handleEditPatientInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="edit-patient-6" className="a-field-label">Email</label>
                  <input id="edit-patient-6"
                    name="email" required
                    type="email"
                    value={editPatientForm.email}
                    onChange={handleEditPatientInputChange}
                    className="a-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="edit-patient-7" className="a-field-label">Dirección</label>
                  <input id="edit-patient-7"
                    name="direccion" required
                    value={editPatientForm.direccion}
                    onChange={handleEditPatientInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="edit-patient-8" className="a-field-label">Nacionalidad</label>
                  <input id="edit-patient-8"
                    name="nacionalidad"
                    value={editPatientForm.nacionalidad}
                    onChange={handleEditPatientInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="edit-patient-9" className="a-field-label">Género</label>
                  <input id="edit-patient-9"
                    name="genero"
                    value={editPatientForm.genero}
                    onChange={handleEditPatientInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="edit-patient-10" className="a-field-label">Fecha de nacimiento</label>
                  <input id="edit-patient-10"
                    name="fecha_nacimiento"
                    type="datetime-local"
                    value={editPatientForm.fecha_nacimiento}
                    onChange={handleEditPatientInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="edit-patient-11" className="a-field-label">Altura</label>
                  <input id="edit-patient-11"
                    name="altura"
                    type="number"
                    step="0.01"
                    value={editPatientForm.altura}
                    onChange={handleEditPatientInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="edit-patient-12" className="a-field-label">Peso</label>
                  <input id="edit-patient-12"
                    name="peso"
                    type="number"
                    step="0.01"
                    value={editPatientForm.peso}
                    onChange={handleEditPatientInputChange}
                    className="a-field"
                  />
                </div>

                <div className="flex items-end">
                  <label className="a-checkbox-field">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={editPatientForm.activo}
                      onChange={handleEditPatientInputChange}
                    />
                    Paciente activo
                  </label>
                </div>
              </div>

              {editPatientError && <Feedback>{editPatientError}</Feedback>}

              <div className="a-form-actions">
                <button
                  type="submit"
                  disabled={isEditingPatient}
                  className="a-primary"
                >
                  {isEditingPatient ? "Guardando..." : "Actualizar paciente"}
                </button>
                <button
                  type="button"
                  onClick={closeEditPatientModal} disabled={isEditingPatient}
                  className="a-secondary"
                >
                  Cancelar
                </button>
              </div>
              </fieldset>
            </form>
        </AdminModal>
      )}

      {isCreateAppointmentModalOpen && (
        <AdminModal title="Agregar cita" busy={isCreatingAppointment} onClose={closeCreateAppointmentModal}>
            <div className="a-modal-heading">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="a-kicker">Citas</p>
                  <h2 className="a-modal-title">Agregar cita</h2>
                </div>
                <button
                  type="button"
                  onClick={closeCreateAppointmentModal} disabled={isCreatingAppointment}
                  aria-label="Cerrar formulario" title="Cerrar formulario"
                  className="a-icon a-modal-close"
                >
                  <X size={19}/>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAppointment} onInvalidCapture={() => setCreateAppointmentError("Revisa los campos obligatorios y el formato de los datos.")} className="a-record-form">
              <fieldset disabled={isCreatingAppointment}>
              <div className="a-form-grid">
                <div className="md:col-span-2">
                  <label htmlFor="create-appointment-1" className="a-field-label">Paciente</label>
                  <select id="create-appointment-1"
                    name="id_paciente" required
                    value={createAppointmentForm.id_paciente}
                    onChange={handleCreateAppointmentInputChange}
                    className="a-field"
                  >
                    <option value="">Selecciona un paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.identificacion} value={patient.identificacion}>
                        {patient.nombre_completo} - {patient.identificacion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="create-appointment-2" className="a-field-label">Fecha</label>
                  <input id="create-appointment-2"
                    type="date"
                    name="fecha_programada" required
                    value={createAppointmentForm.fecha_programada}
                    onChange={handleCreateAppointmentInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="create-appointment-3" className="a-field-label">Estado</label>
                  <select id="create-appointment-3"
                    name="estado"
                    value={createAppointmentForm.estado}
                    onChange={handleCreateAppointmentInputChange}
                    className="a-field"
                  >
                    <option value="pendiente_aprobacion">Pendiente aprobación</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="create-appointment-4" className="a-field-label">Hora inicio</label>
                  <input id="create-appointment-4"
                    type="time"
                    name="hora_inicio" required
                    value={createAppointmentForm.hora_inicio}
                    onChange={handleCreateAppointmentInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="create-appointment-5" className="a-field-label">Hora fin</label>
                  <input id="create-appointment-5"
                    type="time"
                    name="hora_fin" required
                    value={createAppointmentForm.hora_fin}
                    onChange={handleCreateAppointmentInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="create-appointment-6" className="a-field-label">Valor consulta</label>
                  <input id="create-appointment-6"
                    type="number"
                    step="0.01"
                    name="valor_consulta"
                    value={createAppointmentForm.valor_consulta}
                    onChange={handleCreateAppointmentInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="create-appointment-7" className="a-field-label">Código promocional</label>
                  <input id="create-appointment-7"
                    type="number"
                    name="id_codigo_promocional"
                    value={createAppointmentForm.id_codigo_promocional}
                    onChange={handleCreateAppointmentInputChange}
                    className="a-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="create-appointment-8" className="a-field-label">Nota</label>
                  <textarea id="create-appointment-8"
                    name="nota"
                    value={createAppointmentForm.nota}
                    onChange={handleCreateAppointmentInputChange}
                    rows={4}
                    className="a-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="a-field-label">Procedimientos</label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {procedures.map((procedure) => (
                      <label
                        key={procedure.id}
                        className="a-procedure-choice"
                      >
                        <input
                          type="checkbox"
                          checked={createAppointmentForm.procedimiento_ids.includes(procedure.id)}
                          onChange={() => toggleCreateAppointmentProcedure(procedure.id)}
                          className="mt-1"
                        />
                        <div>
                          <p className="a-choice-title">{procedure.nombre}</p>
                          <p className="a-choice-description">{procedure.descripcion}</p>
                          <p className="a-choice-price">{formatCurrency(procedure.precio)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {createAppointmentError && (
                <Feedback>{createAppointmentError}</Feedback>
              )}

              <div className="a-form-actions">
                <button
                  type="submit"
                  disabled={isCreatingAppointment}
                  className="a-primary"
                >
                  {isCreatingAppointment ? "Guardando..." : "Guardar cita"}
                </button>
                <button
                  type="button"
                  onClick={closeCreateAppointmentModal} disabled={isCreatingAppointment}
                  className="a-secondary"
                >
                  Cancelar
                </button>
              </div>
              </fieldset>
            </form>
        </AdminModal>
      )}

      {isEditAppointmentModalOpen && (
        <AdminModal title="Editar cita" busy={isEditingAppointment} onClose={closeEditAppointmentModal}>
            <div className="a-modal-heading">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="a-kicker">Citas</p>
                  <h2 className="a-modal-title">Editar cita</h2>
                </div>
                <button
                  type="button"
                  onClick={closeEditAppointmentModal} disabled={isEditingAppointment}
                  aria-label="Cerrar formulario" title="Cerrar formulario"
                  className="a-icon a-modal-close"
                >
                  <X size={19}/>
                </button>
              </div>
            </div>

            <form onSubmit={handleEditAppointment} onInvalidCapture={() => setEditAppointmentError("Revisa los campos obligatorios y el formato de los datos.")} className="a-record-form">
              <fieldset disabled={isEditingAppointment}>
              <div className="a-form-grid">
                <div className="md:col-span-2">
                  <label htmlFor="edit-appointment-1" className="a-field-label">Paciente</label>
                  <select id="edit-appointment-1"
                    name="id_paciente" required
                    value={editAppointmentForm.id_paciente}
                    onChange={handleEditAppointmentInputChange}
                    className="a-field"
                  >
                    <option value="">Selecciona un paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.identificacion} value={patient.identificacion}>
                        {patient.nombre_completo} - {patient.identificacion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-appointment-2" className="a-field-label">Fecha</label>
                  <input id="edit-appointment-2"
                    type="date"
                    name="fecha_programada" required
                    value={editAppointmentForm.fecha_programada}
                    onChange={handleEditAppointmentInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="edit-appointment-3" className="a-field-label">Estado</label>
                  <select id="edit-appointment-3"
                    name="estado"
                    value={editAppointmentForm.estado}
                    onChange={handleEditAppointmentInputChange}
                    className="a-field"
                  >
                    <option value="pendiente_aprobacion">Pendiente aprobación</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-appointment-4" className="a-field-label">Hora inicio</label>
                  <input id="edit-appointment-4"
                    type="time"
                    name="hora_inicio" required
                    value={editAppointmentForm.hora_inicio}
                    onChange={handleEditAppointmentInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="edit-appointment-5" className="a-field-label">Hora fin</label>
                  <input id="edit-appointment-5"
                    type="time"
                    name="hora_fin" required
                    value={editAppointmentForm.hora_fin}
                    onChange={handleEditAppointmentInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="edit-appointment-6" className="a-field-label">Valor consulta</label>
                  <input id="edit-appointment-6"
                    type="number"
                    step="0.01"
                    name="valor_consulta"
                    value={editAppointmentForm.valor_consulta}
                    onChange={handleEditAppointmentInputChange}
                    className="a-field"
                  />
                </div>

                <div>
                  <label htmlFor="edit-appointment-7" className="a-field-label">Código promocional</label>
                  <input id="edit-appointment-7"
                    type="number"
                    name="id_codigo_promocional"
                    value={editAppointmentForm.id_codigo_promocional}
                    onChange={handleEditAppointmentInputChange}
                    className="a-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="edit-appointment-8" className="a-field-label">Nota</label>
                  <textarea id="edit-appointment-8"
                    name="nota"
                    value={editAppointmentForm.nota}
                    onChange={handleEditAppointmentInputChange}
                    rows={4}
                    className="a-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="a-field-label">Procedimientos</label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {procedures.map((procedure) => (
                      <label
                        key={procedure.id}
                        className="a-procedure-choice"
                      >
                        <input
                          type="checkbox"
                          checked={editAppointmentForm.procedimiento_ids.includes(procedure.id)}
                          onChange={() => toggleEditAppointmentProcedure(procedure.id)}
                          className="mt-1"
                        />
                        <div>
                          <p className="a-choice-title">{procedure.nombre}</p>
                          <p className="a-choice-description">{procedure.descripcion}</p>
                          <p className="a-choice-price">{formatCurrency(procedure.precio)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {editAppointmentError && (
                <Feedback>{editAppointmentError}</Feedback>
              )}

              <div className="a-form-actions">
                <button
                  type="submit"
                  disabled={isEditingAppointment}
                  className="a-primary"
                >
                  {isEditingAppointment ? "Guardando..." : "Actualizar cita"}
                </button>
                <button
                  type="button"
                  onClick={closeEditAppointmentModal} disabled={isEditingAppointment}
                  className="a-secondary"
                >
                  Cancelar
                </button>
              </div>
              </fieldset>
            </form>
        </AdminModal>
      )}
    </div>
  );
}
