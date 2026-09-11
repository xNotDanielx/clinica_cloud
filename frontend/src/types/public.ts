export type CountryPrefix = {
  code: string;
  label: string;
  dial: string;
};

export type CatalogsResponse = {
  sexos: string[];
  generos: string[];
  tipos_documento: string[];
  prefijos_telefonicos: CountryPrefix[];
};

export type PublicProcedure = {
  id: number;
  nombre: string;
  descripcion: string;
  url_imagen?: string | null;
};

export type PublicAppointmentForm = {
  nombre: string;
  tipoDocumento: string;
  documento: string;
  prefijo: string;
  celular: string;
  email: string;
  direccion: string;
  sexo: string;
  fecha: string;
  hora: string;
  procedimiento1: string;
  procedimiento2: string;
  mensaje: string;
};

export type PublicAppointmentPayload = {
  nombre_completo: string;
  tipo_identificacion: string;
  identificacion: string;
  telefono: string;
  email: string;
  direccion: string;
  sexo: string;
  fecha_programada: string;
  hora: string;
  procedimiento_ids: number[];
  nota: string | null;
  valor_consulta: string;
};

export type GalleryPair = {
  before: string;
  after: string;
  beforeImage: string;
  afterImage: string;
};
