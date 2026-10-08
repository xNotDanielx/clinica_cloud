import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, CalendarDays, Check, ChevronDown, MapPin, Menu, Minus, Plus, ShieldCheck, Sparkles, X } from "lucide-react";
import "../public.css";
import ProcedureGuide from "./ProcedureGuide";
import Feedback from "./Feedback";
import RequestTracking from "./RequestTracking";

type Procedure = { id: number; nombre: string; descripcion: string };
type Props = { procedures: Procedure[]; selected: string[]; onToggle: (name: string) => void; onBooking: () => void; onGuidedBooking: (names: string[]) => void; selectionFeedback: ReactNode; catalogError: string; onRetry: () => void };
const categories = ["Todos", "Rostro", "Busto", "Cuerpo"];
function category(name: string) {
  if (/papada/i.test(name)) return "Rostro";
  if (/mamario|mastopexia/i.test(name)) return "Busto";
  return "Cuerpo";
}

export default function PublicExperience({ procedures, selected, onToggle, onBooking, onGuidedBooking, selectionFeedback, catalogError, onRetry }: Props) {
  const [filter, setFilter] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState(false);
  const [compare, setCompare] = useState(false);
  const visible = procedures.filter(p => filter === "Todos" || category(p.nombre) === filter);
  const chosen = procedures.filter(p => selected.includes(p.nombre));
  return (
    <div className="renacer-public">
      <div className="r-topline"><span>Estética con atención personal.</span><span>Providencia, Santiago <MapPin size={13} /></span></div>
      <header className="r-header">
        <a href="#inicio" className="r-brand" aria-label="Renacer, inicio"><span className="r-monogram">r.</span><span>renacer<small>CLÍNICA ESTÉTICA</small></span></a>
        <nav aria-label="Navegación principal" className={menuOpen ? "r-nav is-open" : "r-nav"}>
          {[["procedimientos", "Procedimientos"], ["experiencia", "Tu experiencia"], ["preguntas", "Preguntas"], ["contacto", "Contacto"], ["mi-solicitud", "Mi solicitud"]].map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <button className="r-button r-header-cta" onClick={onBooking}><CalendarDays size={16} /> Agendar valoración</button>
        <button className="r-menu" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>
      <main>
        <section className="r-hero" id="inicio">
          <img className="r-hero-image" src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=2200&q=85" alt="Retrato editorial de bienestar" />
          <div className="r-hero-shade" />
          <div className="r-hero-content"><p className="r-eyebrow">TU BIENESTAR, A TU RITMO</p><h1>Clínica<br /><em>Renacer.</em></h1><p>Un espacio para escucharte.<br />Una valoración para decidir con confianza.</p><button className="r-button r-button-light" onClick={onBooking}>Mi primera valoración <ArrowRight size={18} /></button><a className="r-hero-link" href="#procedimientos">Explorar procedimientos <ArrowDown size={16} /></a></div>
          <span className="r-photo-note">Fotografía editorial de referencia</span>
          <div className="r-hero-foot"><span>01 / UN NUEVO COMIENZO</span><span>Atención individual · Dr. Miguel Mendoza</span></div>
        </section>
        <div className="r-principles"><span><ShieldCheck size={21} /> Valoración antes de decidir</span><span><Sparkles size={21} /> Objetivos personales</span><span><CalendarDays size={21} /> Solicitud de cita en línea</span></div>

        <ProcedureGuide procedures={procedures} onBooking={onGuidedBooking}/>
        <section className="r-section" id="procedimientos">
          <div className="r-section-heading"><div><p className="r-eyebrow">EXPLORA TUS OPCIONES</p><h2>El primer paso<br /><em>es conocerte.</em></h2></div><p>Cada persona tiene una historia y un objetivo diferente. Descubre nuestros procedimientos y conversa tus opciones en una valoración.</p></div>
          <div className="r-catalog-toolbar"><div className="r-tabs" role="group" aria-label="Zona del procedimiento">{categories.map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div><span>{visible.length} procedimientos</span></div>
          <div className="r-procedures">{visible.map(p => <article className={`r-procedure ${selected.includes(p.nombre) ? "is-selected" : ""}`} key={p.id}>
            <div className="r-procedure-top"><span className="r-category">{category(p.nombre)}</span><span className="r-procedure-number">{String(procedures.indexOf(p) + 1).padStart(2, "0")}</span></div><h3>{p.nombre}</h3><p>{p.descripcion}</p><div className="r-procedure-bottom"><span>Valoración personalizada</span><button title={selected.includes(p.nombre) ? `Quitar ${p.nombre}` : `Seleccionar ${p.nombre}`} aria-label={selected.includes(p.nombre) ? `Quitar ${p.nombre}` : `Seleccionar ${p.nombre}`} aria-pressed={selected.includes(p.nombre)} onClick={() => onToggle(p.nombre)}>{selected.includes(p.nombre) ? <Check size={20} /> : <Plus size={20} />}</button></div>
          </article>)}</div>
          {catalogError ? <Feedback title="No se pudo cargar el catálogo"><p>{catalogError}</p><div className="feedback-actions"><button onClick={onRetry}>Reintentar</button></div></Feedback> : !procedures.length && <Feedback tone="info">No hay procedimientos disponibles en este momento.</Feedback>}
          {selectionFeedback}
          <div className="r-selection"><div><p className="r-eyebrow">TU SELECCIÓN · {selected.length}/2</p><p>{selected.length ? selected.join(" + ") : "¿Qué te gustaría conversar en tu valoración?"}</p></div><div className="r-selection-actions"><button className="r-button r-button-outline" disabled={chosen.length !== 2} onClick={() => setCompare(!compare)} aria-expanded={compare}>Comparar {compare ? <Minus size={16} /> : <Plus size={16} />}</button><button className="r-button" onClick={onBooking}>Solicitar cita <ArrowRight size={17} /></button></div></div>
          {compare && chosen.length === 2 && <div className="r-comparison" role="region" aria-label="Comparación de procedimientos"><h3>Tus opciones, lado a lado</h3><div className="r-compare-grid">{chosen.map(p => <div key={p.id}><span className="r-category">{category(p.nombre)}</span><h4>{p.nombre}</h4><p>{p.descripcion}</p><dl><dt>Precio</dt><dd>Se define en valoración</dd><dt>Indicación y recuperación</dt><dd>Requieren evaluación individual</dd></dl></div>)}</div></div>}
        </section>

        <section className="r-experience" id="experiencia"><div className="r-section"><div className="r-section-heading"><div><p className="r-eyebrow">CONTIGO, PASO A PASO</p><h2>Decisiones informadas.<br /><em>Atención cercana.</em></h2></div><p>Tu proceso comienza con una conversación con el Dr. Miguel Mendoza. La valoración permite resolver dudas y evaluar tus opciones.</p></div><div className="r-steps">{[["01", "Cuéntanos tu objetivo", "Explora el catálogo y elige los procedimientos que te interesan."], ["02", "Encuentra tu momento", "Consulta horarios disponibles y envía tu solicitud de valoración."], ["03", "Decide con información", "La clínica revisa tu solicitud. En consulta podrás conversar expectativas, costos y cuidados."]].map(([n, title, copy]) => <div key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></div>)}</div></div></section>
        <section className="r-section r-faq" id="preguntas"><div><p className="r-eyebrow">ANTES DE TU VISITA</p><h2>Espacio para<br /><em>tus preguntas.</em></h2><p>Una buena decisión empieza con información clara.</p></div><div>{[["¿Dónde se encuentra Clínica Renacer?", "Estamos en Hernando de Aguirre 128, Consultorio 805, Providencia, Santiago de Chile, cerca del Metro Tobalaba."], ["¿Cómo es la primera valoración?", "Comenzamos con una conversación sobre tus objetivos y antecedentes. Después, el profesional evalúa tus opciones y resuelve tus dudas antes de acordar los siguientes pasos."], ["¿Qué debo llevar a mi primera visita?", "Trae tu documento de identificación y, si los tienes, exámenes o antecedentes médicos relevantes. También puedes preparar las preguntas que quieras conversar con el profesional."], ["¿Puedo asistir con un acompañante?", "Sí, puedes venir con una persona de confianza a tu valoración. Si necesitas apoyo de accesibilidad, avísanos antes de tu visita para coordinar la atención."], ["¿Cuándo conoceré el presupuesto?", "Después de la valoración recibirás una propuesta según tus necesidades. Podrás revisar sus alcances y resolver tus dudas antes de tomar una decisión."]].map(([q, a]) => <details key={q}><summary>{q}<ChevronDown size={18} /></summary><p>{a}</p></details>)}</div></section>
        <RequestTracking/>
        <section className="r-contact" id="contacto"><div className="r-section"><div><p className="r-eyebrow">NOS ENCONTRAMOS EN PROVIDENCIA</p><h2>Tu próximo paso,<br /><em>más cerca.</em></h2><p>Hernando de Aguirre 128, Consultorio 805.<br />Edificio Copiapó · Santiago de Chile.<br />Cerca del Metro Tobalaba.</p><a href="https://www.google.com/maps/search/?api=1&query=Hernando+de+Aguirre+128+Providencia+Santiago" target="_blank" rel="noreferrer" className="r-map-link"><MapPin size={17} /> Ver ubicación <ArrowRight size={16} /></a></div><div className="r-contact-action"><span className="r-contact-mark" aria-hidden="true">r.</span><p>Comienza con una conversación.</p><button className="r-button r-button-light" onClick={onBooking}>Agendar valoración <ArrowRight size={18} /></button></div></div></section>
      </main>
      <footer className="r-footer"><a className="r-brand" href="#inicio">renacer<span className="r-footer-dot">.</span></a><span>Clínica estética · Santiago de Chile</span><a href="#admin">Acceso administración <ArrowRight size={14} /></a></footer>
    </div>
  );
}
