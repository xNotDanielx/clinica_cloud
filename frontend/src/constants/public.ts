import type { GalleryPair, PublicAppointmentForm, PublicProcedure } from "../types/public";

export const DOCTOR_WHATSAPP = "573175697927";

export const CONTACT_MESSAGE =
  "Hola, me gustaría tener más información sobre las citas y procedimientos en la Clínica Renacer";

export const FALLBACK_PROCEDURES: PublicProcedure[] = [
  {
    id: 1,
    nombre: "Procedimiento A",
    descripcion: "Descripción genérica del procedimiento.",
    url_imagen: "",
  },
  {
    id: 2,
    nombre: "Procedimiento B",
    descripcion: "Descripción genérica del procedimiento.",
    url_imagen: "",
  },
  {
    id: 3,
    nombre: "Procedimiento C",
    descripcion: "Descripción genérica del procedimiento.",
    url_imagen: "",
  },
];

export const GALLERY_PAIRS: GalleryPair[] = Array.from({ length: 9 }).map((_, index) => ({
  before: `Antes ${index + 1}`,
  after: `Después ${index + 1}`,
  beforeImage: `https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80&sig=${index + 1}`,
  afterImage: `https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80&sig=${index + 20}`,
}));

export const HERO_FEATURES = [
  ["Experiencia", "Atención profesional con enfoque en resultados naturales."],
  ["Seguridad", "Valoración previa y acompañamiento médico en cada proceso."],
  ["Acompañamiento", "Seguimiento cercano antes y después de la cirugía."],
  ["Confianza", "Información clara para ayudarte a tomar la mejor decisión."],
] as const;

export const INITIAL_PUBLIC_APPOINTMENT_FORM: PublicAppointmentForm = {
  nombre: "",
  tipoDocumento: "cedula_chilena",
  documento: "",
  prefijo: "56",
  celular: "",
  email: "",
  direccion: "",
  sexo: "",
  fecha: "",
  hora: "",
  procedimiento1: "",
  procedimiento2: "",
  mensaje: "",
};
