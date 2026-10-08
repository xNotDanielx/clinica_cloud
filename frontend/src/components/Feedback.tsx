import { type ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import "../feedback.css";

type Props = { children: ReactNode; tone?: "error" | "warning" | "success" | "info"; title?: string; id?: string };
export default function Feedback({ children, tone = "error", title, id }: Props) {
  const Icon = { error: AlertCircle, warning: AlertTriangle, success: CheckCircle2, info: Info }[tone];
  return <div id={id} className={`feedback feedback-${tone}`} role={tone === "error" ? "alert" : "status"}>
    <Icon size={19} aria-hidden="true"/>
    <div className="feedback-content">{title && <strong>{title}</strong>}{children}</div>
  </div>;
}
