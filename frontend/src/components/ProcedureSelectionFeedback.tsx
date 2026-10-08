import { useEffect, useRef } from "react";
import { ArrowLeftRight, X } from "lucide-react";
import Feedback from "./Feedback";

type Props = { selected: string[]; pending: string | null; onReplace: (name: string) => void; onCancel: () => void };
export default function ProcedureSelectionFeedback({ selected, pending, onReplace, onCancel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pending) {
      ref.current?.focus({ preventScroll: true });
      ref.current?.scrollIntoView({ block: "nearest", behavior: "auto" });
    }
  }, [pending]);
  if (selected.length < 2) return null;
  return <div ref={ref} tabIndex={-1} className="selection-feedback">
    <Feedback tone={pending ? "warning" : "info"} title={pending ? "Ya seleccionaste dos procedimientos" : "Selección completa: 2 de 2"}>
      {pending ? <><p>Para añadir <strong>{pending}</strong>, elige cuál sustituir. No cambiaremos tu selección hasta que lo confirmes.</p>
        <div className="feedback-actions">{selected.map(name => <button type="button" key={name} onClick={() => onReplace(name)}><ArrowLeftRight size={16}/> Sustituir {name}</button>)}
          <button type="button" onClick={onCancel}><X size={16}/> Mantener mi selección</button></div></>
        : <p>Puedes quitar uno de los seleccionados o elegir otro para sustituirlo.</p>}
    </Feedback>
  </div>;
}
