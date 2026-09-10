import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  approveAppointment,
  createAppointment,
  deleteAppointment,
  getAppointments,
  getPendingAppointments,
  rejectAppointment,
  searchAppointments,
  updateAppointment,
} from "../services/appointments.service";
import { getActiveProcedures } from "../services/procedures.service";
import type { TabKey } from "../types/admin";
import type { Appointment, CreateAppointmentFormData, EditAppointmentFormData } from "../types/appointment";
import type { Procedure } from "../types/procedure";
import { formatDateInput, formatTimeInput } from "../utils/formatters";

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

export function useAppointments(activeTab: TabKey, loggedIn: boolean) {
  const [appointmentQuery, setAppointmentQuery] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  const [isCreateAppointmentModalOpen, setIsCreateAppointmentModalOpen] = useState(false);
  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] = useState(false);
  const [createAppointmentForm, setCreateAppointmentForm] = useState(initialCreateAppointmentForm);
  const [editAppointmentForm, setEditAppointmentForm] = useState(initialEditAppointmentForm);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [createAppointmentError, setCreateAppointmentError] = useState("");
  const [editAppointmentError, setEditAppointmentError] = useState("");
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

  const loadAppointments = async () => {
    try {
      setAppointments(await getAppointments());
    } catch (error) {
      console.error(error);
    }
  };

  const loadPendingAppointments = async () => {
    try {
      setPendingAppointments(await getPendingAppointments());
    } catch (error) {
      console.error(error);
    }
  };

  const loadProcedures = async () => {
    try {
      setProcedures(await getActiveProcedures());
    } catch (error) {
      console.error(error);
    }
  };

  const findAppointments = async (query: string) => {
    try {
      setAppointments(await searchAppointments(query));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!loggedIn) return;
    loadAppointments();
    loadPendingAppointments();
    loadProcedures();
  }, [loggedIn]);

  useEffect(() => {
    if (activeTab !== "Citas") return;

    const timeout = setTimeout(() => {
      if (appointmentQuery.trim() === "") {
        loadAppointments();
      } else {
        findAppointments(appointmentQuery);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [appointmentQuery, activeTab]);

  useEffect(() => {
    if (activeTab !== "Autorizar Citas") return;

    const timeout = setTimeout(() => {
      if (appointmentQuery.trim() === "") {
        loadPendingAppointments();
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [appointmentQuery, activeTab]);

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

  const handleCreateAppointmentInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setCreateAppointmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditAppointmentInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setEditAppointmentForm((prev) => ({ ...prev, [name]: value }));
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

  const handleCreateAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateAppointmentError("");

    try {
      setIsCreatingAppointment(true);
      await createAppointment(createAppointmentForm);
      closeCreateAppointmentModal();
      await loadAppointments();
      await loadPendingAppointments();
    } catch (error) {
      console.error(error);
      setCreateAppointmentError("No se pudo crear la cita.");
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  const handleEditAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAppointmentId) return;

    setEditAppointmentError("");

    try {
      setIsEditingAppointment(true);
      await updateAppointment(selectedAppointmentId, editAppointmentForm);
      closeEditAppointmentModal();
      await loadAppointments();
      await loadPendingAppointments();
    } catch (error) {
      console.error(error);
      setEditAppointmentError("No se pudo actualizar la cita.");
    } finally {
      setIsEditingAppointment(false);
    }
  };

  const removeAppointment = async (appointmentId: number) => {
    try {
      await deleteAppointment(appointmentId);
      await loadAppointments();
      await loadPendingAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  const approve = async (appointmentId: number) => {
    try {
      await approveAppointment(appointmentId);
      await loadPendingAppointments();
      await loadAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  const reject = async (appointmentId: number) => {
    try {
      await rejectAppointment(appointmentId);
      await loadPendingAppointments();
      await loadAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  return {
    appointmentQuery,
    setAppointmentQuery,
    appointments,
    authorizations,
    procedures,
    isCreateAppointmentModalOpen,
    isEditAppointmentModalOpen,
    createAppointmentForm,
    editAppointmentForm,
    createAppointmentError,
    editAppointmentError,
    isCreatingAppointment,
    isEditingAppointment,
    openCreateAppointmentModal,
    closeCreateAppointmentModal,
    openEditAppointmentModal,
    closeEditAppointmentModal,
    handleCreateAppointmentInputChange,
    handleEditAppointmentInputChange,
    toggleCreateAppointmentProcedure,
    toggleEditAppointmentProcedure,
    handleCreateAppointment,
    handleEditAppointment,
    removeAppointment,
    approve,
    reject,
  };
}
