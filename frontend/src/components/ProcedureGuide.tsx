import { useState } from "react";
import { ArrowRight, Compass } from "lucide-react";
import Feedback from "./Feedback";
import ProcedureSelectionFeedback from "./ProcedureSelectionFeedback";
import { toggleSelection, replaceSelection } from "./procedureSelection";

type Procedure = { id: number; nombre: string; descripcion: string };
const goals = [
  { zone: "Rostro", options: [{ label: "Conocer opciones para la papada", pattern: /papada/i }] },
  { zone: "Busto", options: [{ label: "Consultar sobre volumen", pattern: /aumento mamario/i }, { label: "Consultar sobre elevación", pattern: /mastopexia/i }] },
  { zone: "Cuerpo", options: [{ label: "Explorar abdomen y cintura", pattern: /lipoabdomino|lipoescultura/i }, { label: "Consultar sobre transferencia glútea", pattern: /transferencia/i }] },
];

export default function ProcedureGuide({ procedures, onBooking }: { procedures: Procedure[]; onBooking: (names: string[]) => void }) {
  const [pending, setPending] = useState<string | null>(null);
  const [zone, setZone] = useState("");
  const [goal, setGoal] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const options = goals.find(item => item.zone === zone)?.options ?? [];
  const objective = options.find(item => item.label === goal);
  const matches = objective ? procedures.filter(item => objective.pattern.test(item.nombre)) : [];
  return <section className="r-guide r-section" id="orientador" aria-labelledby="guide-title">
    <div className="r-guide-heading"><Compass size={24}/><div><p className="r-eyebrow">ANTES DE ELEGIR</p><h2 id="guide-title">¿Por dónde empezar?</h2><p>Explora el catálogo según el tema que quieres conversar en tu valoración.</p></div></div>
    <div className="r-guide-questions">
      <fieldset><legend>1. ¿Qué zona te interesa?</legend><div>{goals.map(item => <label key={item.zone}><input type="radio" name="guide-zone" checked={zone === item.zone} onChange={() => {setZone(item.zone);setGoal("");setSelected([]);setPending(null);}}/><span>{item.zone}</span></label>)}</div></fieldset>
      {zone && <fieldset><legend>2. ¿Qué quieres consultar?</legend><div>{options.map(item => <label key={item.label}><input type="radio" name="guide-goal" checked={goal === item.label} onChange={() => {setGoal(item.label);setSelected([]);setPending(null);}}/><span>{item.label}</span></label>)}</div></fieldset>}
    </div>
    {objective && <div className="r-guide-results" aria-live="polite"><h3>Opciones del catálogo para conversar</h3>
      <Feedback tone="info">No es una recomendación médica ni una evaluación de si un procedimiento es adecuado para ti.</Feedback>
      {!matches.length && <Feedback tone="warning">No hay opciones disponibles para ese tema en el catálogo actual.</Feedback>}
      <div>{matches.map(item => <label className="r-guide-result" key={item.id}><input type="checkbox" checked={selected.includes(item.nombre)} onChange={() => {const next = toggleSelection(selected, item.nombre);setSelected(next.selected);setPending(next.pending);}}/><span><strong>{item.nombre}</strong><span>{item.descripcion}</span></span></label>)}</div>
      <ProcedureSelectionFeedback selected={selected} pending={pending} onCancel={() => setPending(null)} onReplace={name => {if (pending) setSelected(current => replaceSelection(current, name, pending));setPending(null);}}/>
      <button className="r-button" disabled={!selected.length} onClick={() => onBooking(selected)}>Consultar disponibilidad <ArrowRight size={17}/></button>
    </div>}
  </section>;
}
