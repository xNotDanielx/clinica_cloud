import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  createPatient,
  deletePatient,
  getPatients,
  searchPatients,
  updatePatient,
} from "../services/patients.service";
import type { TabKey } from "../types/admin";
import type { CreatePatientFormData, EditPatientFormData, Patient } from "../types/patient";
import { formatDateTimeLocal } from "../utils/formatters";

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

export function usePatients(activeTab: TabKey, loggedIn: boolean) {
  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);

  const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] = useState(false);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [createPatientForm, setCreatePatientForm] = useState(initialCreatePatientForm);
  const [editPatientForm, setEditPatientForm] = useState(initialEditPatientForm);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [createPatientError, setCreatePatientError] = useState("");
  const [editPatientError, setEditPatientError] = useState("");
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [isEditingPatient, setIsEditingPatient] = useState(false);

  const loadPatients = async () => {
    try {
      setPatients(await getPatients());
    } catch (error) {
      console.error(error);
    }
  };

  const findPatients = async (query: string) => {
    try {
      setPatients(await searchPatients(query));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (loggedIn) loadPatients();
  }, [loggedIn]);

  useEffect(() => {
    if (activeTab !== "Pacientes") return;

    const timeout = setTimeout(() => {
      if (patientQuery.trim() === "") {
        loadPatients();
      } else {
        findPatients(patientQuery);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [patientQuery, activeTab]);

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

  const handleCreatePatientInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = event.target;
    const { name, value, type } = target;

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

    if (type === "checkbox" && target instanceof HTMLInputElement) {
      const checked = target.checked;

      setCreatePatientForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setCreatePatientForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditPatientInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = event.target;
    const { name, value, type } = target;

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

    if (type === "checkbox" && target instanceof HTMLInputElement) {
      const checked = target.checked;

      setEditPatientForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setEditPatientForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePatient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatePatientError("");

    try {
      setIsCreatingPatient(true);
      await createPatient(createPatientForm);
      closeCreatePatientModal();
      await loadPatients();
    } catch (error) {
      console.error(error);
      setCreatePatientError("No se pudo crear el paciente.");
    } finally {
      setIsCreatingPatient(false);
    }
  };

  const handleEditPatient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPatientId) return;

    setEditPatientError("");

    try {
      setIsEditingPatient(true);
      await updatePatient(selectedPatientId, editPatientForm);
      closeEditPatientModal();
      await loadPatients();
    } catch (error) {
      console.error(error);
      setEditPatientError("No se pudo actualizar el paciente.");
    } finally {
      setIsEditingPatient(false);
    }
  };

  const removePatient = async (identificacion: string) => {
    try {
      await deletePatient(identificacion);
      await loadPatients();
    } catch (error) {
      console.error(error);
    }
  };

  return {
    patientQuery,
    setPatientQuery,
    patients,
    isCreatePatientModalOpen,
    isEditPatientModalOpen,
    createPatientForm,
    editPatientForm,
    selectedPatientId,
    createPatientError,
    editPatientError,
    isCreatingPatient,
    isEditingPatient,
    openCreatePatientModal,
    closeCreatePatientModal,
    openEditPatientModal,
    closeEditPatientModal,
    handleCreatePatientInputChange,
    handleEditPatientInputChange,
    handleCreatePatient,
    handleEditPatient,
    removePatient,
  };
}
