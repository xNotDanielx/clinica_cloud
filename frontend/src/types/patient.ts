export type Patient = {
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

export type CreatePatientFormData = {
  identificacion: string;
  tipo_identificacion: string;
  nombre_completo: string;
  telefono: string;
  email: string;
  direccion: string;
  sexo: string;
  activo: boolean;
};

export type EditPatientFormData = {
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
