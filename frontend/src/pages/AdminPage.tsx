import { useEffect, useMemo, useState } from "react";
import AdminLogin from "../components/AdminLogin";
import { apiFetch } from "../components/api";

type TabKey = "Inicio" | "Pacientes" | "Citas" | "Autorizar Citas";

const tabs: TabKey[] = ["Inicio", "Pacientes", "Citas", "Autorizar Citas"];
const sidebarItems: TabKey[] = ["Inicio", "Pacientes", "Citas", "Autorizar Citas"];

const statusClasses = {
  pendiente_aprobacion: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  aprobada: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  cancelada: "bg-red-500/10 text-red-300 border-red-500/20",
  Pendiente: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  Confirmada: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  Cancelada: "bg-red-500/10 text-red-300 border-red-500/20",
};

type Patient = {
  identificacion: string;
  tipo_identificacion: string;
  nombre_completo: string;
  telefono: string;
  email: string;
  direccion: string;
  sexo: string;
  nacionalidad?: string | null;
  genero?: string | null;
  fecha_nacimiento?: string | null;
  altura?: number | null;
  peso?: number | null;
  activo: boolean;
};

type Procedure = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string | number;
  url_imagen?: string | null;
  activo: boolean;
  fecha_ultima_actualizacion: string;
};

type Appointment = {
  id: number;
  id_paciente: string;
  nombre_paciente?: string | null;
  id_codigo_promocional?: number | null;
  fecha_programada: string;
  hora_inicio: string;
  hora_fin: string;
  monto_base?: string | number | null;
  monto_descuento?: string | number | null;
  monto_final?: string | number | null;
  nota?: string | null;
  notas_asesoria?: string | null;
  razon_rechazo?: string | null;
  estado: string;
  fecha_ultima_actualizacion?: string;
  procedimiento_ids?: number[];
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

  const [patientQuery, setPatientQuery] = useState("");
  const [appointmentQuery, setAppointmentQuery] = useState("");

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

  const authorizations = useMemo(
    () =>
      pendingAppointments.filter((appointment) =>
        [
          appointment.id_paciente,
          appointment.nombre_paciente,
          appointment.fecha_programada,
          appointment.hora_inicio,
          appointment.estado,
        ]
          .join(" ")
          .toLowerCase()
          .includes(appointmentQuery.toLowerCase())
      ),
    [pendingAppointments, appointmentQuery]
  );

  const cargarCitas = async () => {
    try {
      const data = await apiFetch("/citas/todas");
      setAppointments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const buscarCitas = async (query: string) => {
    try {
      const data = await apiFetch(`/citas/filtrar?buscar=${encodeURIComponent(query)}`);
      setAppointments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const eliminarCita = async (cita_id: number) => {
    try {
      await apiFetch(`/citas/${cita_id}`, {
        method: "DELETE",
      });
      cargarCitas();
      cargarPendientes();
    } catch (e) {
      console.error(e);
    }
  };

  const cargarPendientes = async () => {
    try {
      const data = await apiFetch("/citas/pendientes-aprobacion");
      setPendingAppointments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const cargarPacientes = async () => {
    try {
      const data = await apiFetch("/pacientes");
      setPatients(data);
    } catch (e) {
      console.error(e);
    }
  };

  const buscarPacientes = async (query: string) => {
    try {
      const data = await apiFetch(`/pacientes/filtrar?buscar=${encodeURIComponent(query)}`);
      setPatients(data);
    } catch (e) {
      console.error(e);
    }
  };

  const cargarProcedimientos = async () => {
    try {
      const data = await apiFetch("/procedimientos/activos");
      setProcedures(data);
    } catch (e) {
      console.error(e);
    }
  };

  const eliminarPaciente = async (identificacion: string) => {
    try {
      await apiFetch(`/pacientes/${identificacion}`, {
        method: "DELETE",
      });
      cargarPacientes();
    } catch (e) {
      console.error(e);
    }
  };

  const autorizarCita = async (cita_id: number) => {
    try {
      await apiFetch(`/citas/${cita_id}/aprobar`, {
        method: "PATCH",
      });
      cargarPendientes();
      cargarCitas();
    } catch (error) {
      console.error(error);
    }
  };

  const rechazarCita = async (cita_id: number) => {
    try {
      await apiFetch(`/citas/${cita_id}/rechazar`, {
        method: "PATCH",
      });
      cargarPendientes();
      cargarCitas();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      cargarCitas();
      cargarPendientes();
      cargarPacientes();
      cargarProcedimientos();
    }
  }, [loggedIn]);

  useEffect(() => {
    if (activeTab !== "Citas") return;

    const timeout = setTimeout(() => {
      if (appointmentQuery.trim() === "") {
        cargarCitas();
      } else {
        buscarCitas(appointmentQuery);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [appointmentQuery, activeTab]);

  useEffect(() => {
    if (activeTab !== "Autorizar Citas") return;

    const timeout = setTimeout(() => {
      if (appointmentQuery.trim() === "") {
        cargarPendientes();
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [appointmentQuery, activeTab]);

  useEffect(() => {
    if (activeTab !== "Pacientes") return;

    const timeout = setTimeout(() => {
      if (patientQuery.trim() === "") {
        cargarPacientes();
      } else {
        buscarPacientes(patientQuery);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [patientQuery, activeTab]);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCreatePatientModalOpen(false);
        setIsEditPatientModalOpen(false);
        setIsCreateAppointmentModalOpen(false);
        setIsEditAppointmentModalOpen(false);
      }
    };

    if (
      isCreatePatientModalOpen ||
      isEditPatientModalOpen ||
      isCreateAppointmentModalOpen ||
      isEditAppointmentModalOpen
    ) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onEsc);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [
    isCreatePatientModalOpen,
    isEditPatientModalOpen,
    isCreateAppointmentModalOpen,
    isEditAppointmentModalOpen,
  ]);

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
      setCreatePatientForm((prev) => ({
        ...prev,
        [name]: event.target.checked,
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
      setEditPatientForm((prev) => ({
        ...prev,
        [name]: event.target.checked,
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
      await cargarPacientes();
    } catch (error) {
      console.error(error);
      setCreatePatientError("No se pudo crear el paciente.");
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
      await cargarPacientes();
    } catch (error) {
      console.error(error);
      setEditPatientError("No se pudo actualizar el paciente.");
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
      await cargarCitas();
      await cargarPendientes();
    } catch (error) {
      console.error(error);
      setCreateAppointmentError("No se pudo crear la cita.");
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
      await cargarCitas();
      await cargarPendientes();
    } catch (error) {
      console.error(error);
      setEditAppointmentError("No se pudo actualizar la cita.");
    } finally {
      setIsEditingAppointment(false);
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/administradores/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: username,
          contrasena: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      setLoggedIn(true);
    } catch (error) {
      console.error(error);
      alert("Usuario o contraseña incorrectos");
    }
  };

  if (!loggedIn) {
    return (
      <AdminLogin
        username={username}
        password={password}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
        onForgotPassword={() => {}}
      />
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050816] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.22),transparent_30%),radial-gradient(circle_at_right,rgba(56,189,248,0.16),transparent_28%),linear-gradient(180deg,#050816_0%,#090b1a_100%)]" />
      <div className="fixed inset-0 -z-10 opacity-25 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-3 rounded-3xl bg-violet-600/10 px-4 py-2 text-sm text-violet-200 ring-1 ring-violet-500/20">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 text-lg">
                  R
                </span>
                <span className="font-semibold">Clínica Renacer</span>
              </div>
              <p className="text-2xl font-black tracking-tight">Panel de administración</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                      activeTab === tab
                        ? "bg-violet-500 text-slate-950"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/10 px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white">
                  A
                </span>
                <div>
                  <p className="text-sm text-slate-300">Administrador</p>
                  <p className="text-sm font-semibold text-white">Usuario</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Navegación</p>
                <div className="space-y-2">
                  {sidebarItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => setActiveTab(item)}
                      className={`flex w-full items-center justify-between rounded-3xl border px-4 py-4 text-left text-sm font-semibold transition ${
                        activeTab === item
                          ? "border-cyan-400/30 bg-cyan-500/10 text-white"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/20 hover:bg-white/10"
                      }`}
                    >
                      <span>{item}</span>
                      {activeTab === item ? <span>·</span> : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Estado</p>
                <p className="mt-3 text-lg font-semibold text-white">Panel activo</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Usa esta página para gestionar pacientes, citas y autorizaciones desde la administración.
                </p>
              </div>

              <button
                className="w-full rounded-3xl bg-red-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-red-400"
                type="button"
                onClick={() => {
                  setLoggedIn(false);
                  setPassword("");
                  setActiveTab("Inicio");
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </aside>

          <main className="space-y-6">
            {activeTab === "Inicio" && (
              <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Bienvenido</p>
                    <h1 className="mt-3 text-4xl font-black text-white">Hola, Administrador</h1>
                    <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                      Bienvenido al panel de administración. Desde aquí puedes gestionar pacientes, citas y autorizaciones.
                    </p>
                  </div>
                  <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-violet-500/10 text-3xl text-violet-300">
                      👋
                    </div>
                    <p className="mt-5 text-sm uppercase tracking-[0.28em] text-cyan-300">Administración</p>
                    <p className="mt-2 text-xl font-bold text-white">Dashboard</p>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "Pacientes" && (
              <section className="space-y-6">
                <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Pacientes</p>
                    <h2 className="mt-2 text-3xl font-black text-white">Lista de pacientes</h2>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      placeholder="Buscar paciente..."
                      value={patientQuery}
                      onChange={(event) => setPatientQuery(event.target.value)}
                      className="w-full min-w-[220px] rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                    <button onClick={openCreatePatientModal} className="whitespace-nowrap rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-400">
                      Agregar paciente
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-slate-950/70 text-left text-sm uppercase tracking-[0.2em] text-slate-400">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Nombre</th>
                        <th className="px-6 py-4">Teléfono</th>
                        <th className="px-6 py-4">Correo</th>
                        <th className="px-6 py-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-slate-950/70 text-sm text-slate-200">
                      {patients.map((patient) => (
                        <tr key={patient.identificacion}>
                          <td className="px-6 py-4 font-semibold text-cyan-300">{patient.identificacion}</td>
                          <td className="px-6 py-4">{patient.nombre_completo}</td>
                          <td className="px-6 py-4">{patient.telefono}</td>
                          <td className="px-6 py-4">{patient.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditPatientModal(patient)}
                                className="rounded-2xl bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/20"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarPaciente(patient.identificacion)}
                                className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {patients.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                            No hay pacientes para mostrar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === "Citas" && (
              <section className="space-y-6">
                <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Citas</p>
                    <h2 className="mt-2 text-3xl font-black text-white">Agenda de citas</h2>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      placeholder="Buscar cita..."
                      value={appointmentQuery}
                      onChange={(event) => setAppointmentQuery(event.target.value)}
                      className="w-full min-w-[220px] rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                    <button
                      className="whitespace-nowrap rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-400"
                      onClick={openCreateAppointmentModal}
                    >
                      Agregar cita
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-slate-950/70 text-left text-sm uppercase tracking-[0.2em] text-slate-400">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Paciente</th>
                        <th className="px-6 py-4">Fecha</th>
                        <th className="px-6 py-4">Hora</th>
                        <th className="px-6 py-4">Monto final</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-slate-950/70 text-sm text-slate-200">
                      {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 font-semibold text-cyan-300">{appointment.id}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-white">{appointment.nombre_paciente || "Sin nombre"}</p>
                              <p className="text-xs text-slate-400">{appointment.id_paciente}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">{appointment.fecha_programada}</td>
                          <td className="px-6 py-4">
                            {appointment.hora_inicio} - {appointment.hora_fin}
                          </td>
                          <td className="px-6 py-4">{formatCurrency(appointment.monto_final)}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                statusClasses[appointment.estado as keyof typeof statusClasses] ||
                                "bg-gray-500/10 text-gray-300 border-gray-500/20"
                              }`}
                            >
                              {appointment.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                className="rounded-2xl bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-200 hover:bg-violet-500/20"
                                onClick={() => openEditAppointmentModal(appointment)}
                              >
                                Editar
                              </button>
                              <button
                                className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20"
                                onClick={() => eliminarCita(appointment.id)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                            No hay citas para mostrar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === "Autorizar Citas" && (
              <section className="space-y-6">
                <div className="rounded-[2rem] border border-white/10 bg-cyan-500/5 p-6 shadow-2xl backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Autorizar citas</p>
                  <h2 className="mt-2 text-3xl font-black text-white">Revisa las citas pendientes</h2>
                  <p className="mt-3 text-slate-300">
                    Revisa las citas pendientes y autorízalas para que sean confirmadas.
                  </p>
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-slate-950/70 text-left text-sm uppercase tracking-[0.2em] text-slate-400">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Paciente</th>
                        <th className="px-6 py-4">Fecha</th>
                        <th className="px-6 py-4">Hora</th>
                        <th className="px-6 py-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-slate-950/70 text-sm text-slate-200">
                      {authorizations.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 font-semibold text-cyan-300">{item.id}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-white">{item.nombre_paciente || "Sin nombre"}</p>
                              <p className="text-xs text-slate-400">{item.id_paciente}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">{item.fecha_programada}</td>
                          <td className="px-6 py-4">
                            {item.hora_inicio} - {item.hora_fin}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => autorizarCita(item.id)}
                                className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20"
                              >
                                Autorizar
                              </button>
                              <button
                                onClick={() => rechazarCita(item.id)}
                                className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20"
                              >
                                Rechazar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {authorizations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                            No hay citas pendientes.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {isCreatePatientModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
          onClick={closeCreatePatientModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/10 bg-white/5 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Pacientes</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Agregar paciente</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Registra solo los datos necesarios del paciente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCreatePatientModal}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl text-white transition hover:bg-white/20"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleCreatePatient} className="px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Identificación</label>
                  <input
                    name="identificacion"
                    value={createPatientForm.identificacion}
                    onChange={handleCreatePatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Tipo de identificación</label>
                  <select
                    name="tipo_identificacion"
                    value={createPatientForm.tipo_identificacion}
                    onChange={handleCreatePatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="cedula_chilena">Cédula chilena</option>
                    <option value="cedula_extranjero">Cédula extranjero</option>
                    <option value="pasaporte_chileno">Pasaporte chileno</option>
                    <option value="pasaporte_extranjero">Pasaporte extranjero</option>
                    <option value="documento_extranjero">Documento extranjero</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-200">Nombre completo</label>
                  <input
                    name="nombre_completo"
                    value={createPatientForm.nombre_completo}
                    onChange={handleCreatePatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Teléfono</label>
                  <input
                    name="telefono"
                    value={createPatientForm.telefono}
                    onChange={handleCreatePatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={createPatientForm.email}
                    onChange={handleCreatePatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-200">Dirección</label>
                  <input
                    name="direccion"
                    value={createPatientForm.direccion}
                    onChange={handleCreatePatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Sexo</label>
                  <select
                    name="sexo"
                    value={createPatientForm.sexo}
                    onChange={handleCreatePatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
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

              {createPatientError && <p className="mt-4 text-sm text-rose-300">{createPatientError}</p>}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isCreatingPatient}
                  className="w-full rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingPatient ? "Guardando..." : "Guardar paciente"}
                </button>
                <button
                  type="button"
                  onClick={closeCreatePatientModal}
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditPatientModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
          onClick={closeEditPatientModal}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/10 bg-white/5 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Pacientes</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Editar paciente</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Actualiza la información completa del paciente seleccionado.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditPatientModal}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl text-white transition hover:bg-white/20"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleEditPatient} className="max-h-[85vh] overflow-y-auto px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-200">Identificación</label>
                  <input
                    value={selectedPatientId ?? ""}
                    disabled
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Tipo de identificación</label>
                  <select
                    name="tipo_identificacion"
                    value={editPatientForm.tipo_identificacion}
                    onChange={handleEditPatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="cedula_chilena">Cédula chilena</option>
                    <option value="cedula_extranjero">Cédula extranjero</option>
                    <option value="pasaporte_chileno">Pasaporte chileno</option>
                    <option value="pasaporte_extranjero">Pasaporte extranjero</option>
                    <option value="documento_extranjero">Documento extranjero</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Sexo</label>
                  <select
                    name="sexo"
                    value={editPatientForm.sexo}
                    onChange={handleEditPatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-200">Nombre completo</label>
                  <input
                    name="nombre_completo"
                    value={editPatientForm.nombre_completo}
                    onChange={handleEditPatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Teléfono</label>
                  <input
                    name="telefono"
                    value={editPatientForm.telefono}
                    onChange={handleEditPatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={editPatientForm.email}
                    onChange={handleEditPatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-200">Dirección</label>
                  <input
                    name="direccion"
                    value={editPatientForm.direccion}
                    onChange={handleEditPatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Nacionalidad</label>
                  <input
                    name="nacionalidad"
                    value={editPatientForm.nacionalidad}
                    onChange={handleEditPatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Género</label>
                  <input
                    name="genero"
                    value={editPatientForm.genero}
                    onChange={handleEditPatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Fecha de nacimiento</label>
                  <input
                    name="fecha_nacimiento"
                    type="datetime-local"
                    value={editPatientForm.fecha_nacimiento}
                    onChange={handleEditPatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Altura</label>
                  <input
                    name="altura"
                    type="number"
                    step="0.01"
                    value={editPatientForm.altura}
                    onChange={handleEditPatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Peso</label>
                  <input
                    name="peso"
                    type="number"
                    step="0.01"
                    value={editPatientForm.peso}
                    onChange={handleEditPatientInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
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

              {editPatientError && <p className="mt-4 text-sm text-rose-300">{editPatientError}</p>}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isEditingPatient}
                  className="w-full rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isEditingPatient ? "Guardando..." : "Actualizar paciente"}
                </button>
                <button
                  type="button"
                  onClick={closeEditPatientModal}
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateAppointmentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
          onClick={closeCreateAppointmentModal}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/10 bg-white/5 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Citas</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Agregar cita</h2>
                </div>
                <button
                  type="button"
                  onClick={closeCreateAppointmentModal}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl text-white transition hover:bg-white/20"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAppointment} className="max-h-[85vh] overflow-y-auto px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-200">Paciente</label>
                  <select
                    name="id_paciente"
                    value={createAppointmentForm.id_paciente}
                    onChange={handleCreateAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
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
                  <label className="mb-2 block text-sm font-medium text-slate-200">Fecha</label>
                  <input
                    type="date"
                    name="fecha_programada"
                    value={createAppointmentForm.fecha_programada}
                    onChange={handleCreateAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Estado</label>
                  <select
                    name="estado"
                    value={createAppointmentForm.estado}
                    onChange={handleCreateAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="pendiente_aprobacion">Pendiente aprobación</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Hora inicio</label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={createAppointmentForm.hora_inicio}
                    onChange={handleCreateAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Hora fin</label>
                  <input
                    type="time"
                    name="hora_fin"
                    value={createAppointmentForm.hora_fin}
                    onChange={handleCreateAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Valor consulta</label>
                  <input
                    type="number"
                    step="0.01"
                    name="valor_consulta"
                    value={createAppointmentForm.valor_consulta}
                    onChange={handleCreateAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Código promocional</label>
                  <input
                    type="number"
                    name="id_codigo_promocional"
                    value={createAppointmentForm.id_codigo_promocional}
                    onChange={handleCreateAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-200">Nota</label>
                  <textarea
                    name="nota"
                    value={createAppointmentForm.nota}
                    onChange={handleCreateAppointmentInputChange}
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-slate-200">Procedimientos</label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {procedures.map((procedure) => (
                      <label
                        key={procedure.id}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={createAppointmentForm.procedimiento_ids.includes(procedure.id)}
                          onChange={() => toggleCreateAppointmentProcedure(procedure.id)}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-white">{procedure.nombre}</p>
                          <p className="text-slate-400">{procedure.descripcion}</p>
                          <p className="mt-1 text-cyan-300">{formatCurrency(procedure.precio)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {createAppointmentError && (
                <p className="mt-4 text-sm text-rose-300">{createAppointmentError}</p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isCreatingAppointment}
                  className="w-full rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingAppointment ? "Guardando..." : "Guardar cita"}
                </button>
                <button
                  type="button"
                  onClick={closeCreateAppointmentModal}
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditAppointmentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
          onClick={closeEditAppointmentModal}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/10 bg-white/5 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Citas</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Editar cita</h2>
                </div>
                <button
                  type="button"
                  onClick={closeEditAppointmentModal}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl text-white transition hover:bg-white/20"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleEditAppointment} className="max-h-[85vh] overflow-y-auto px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-200">Paciente</label>
                  <select
                    name="id_paciente"
                    value={editAppointmentForm.id_paciente}
                    onChange={handleEditAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
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
                  <label className="mb-2 block text-sm font-medium text-slate-200">Fecha</label>
                  <input
                    type="date"
                    name="fecha_programada"
                    value={editAppointmentForm.fecha_programada}
                    onChange={handleEditAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Estado</label>
                  <select
                    name="estado"
                    value={editAppointmentForm.estado}
                    onChange={handleEditAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="pendiente_aprobacion">Pendiente aprobación</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Hora inicio</label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={editAppointmentForm.hora_inicio}
                    onChange={handleEditAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Hora fin</label>
                  <input
                    type="time"
                    name="hora_fin"
                    value={editAppointmentForm.hora_fin}
                    onChange={handleEditAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Valor consulta</label>
                  <input
                    type="number"
                    step="0.01"
                    name="valor_consulta"
                    value={editAppointmentForm.valor_consulta}
                    onChange={handleEditAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Código promocional</label>
                  <input
                    type="number"
                    name="id_codigo_promocional"
                    value={editAppointmentForm.id_codigo_promocional}
                    onChange={handleEditAppointmentInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-200">Nota</label>
                  <textarea
                    name="nota"
                    value={editAppointmentForm.nota}
                    onChange={handleEditAppointmentInputChange}
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-slate-200">Procedimientos</label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {procedures.map((procedure) => (
                      <label
                        key={procedure.id}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={editAppointmentForm.procedimiento_ids.includes(procedure.id)}
                          onChange={() => toggleEditAppointmentProcedure(procedure.id)}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-white">{procedure.nombre}</p>
                          <p className="text-slate-400">{procedure.descripcion}</p>
                          <p className="mt-1 text-cyan-300">{formatCurrency(procedure.precio)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {editAppointmentError && (
                <p className="mt-4 text-sm text-rose-300">{editAppointmentError}</p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isEditingAppointment}
                  className="w-full rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isEditingAppointment ? "Guardando..." : "Actualizar cita"}
                </button>
                <button
                  type="button"
                  onClick={closeEditAppointmentModal}
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}