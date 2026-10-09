export type Appointment = {
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

export type CreateAppointmentFormData = {
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

export type EditAppointmentFormData = CreateAppointmentFormData;
