export type Procedure = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string | number;
  url_imagen?: string | null;
  activo: boolean;
  fecha_ultima_actualizacion: string;
};
