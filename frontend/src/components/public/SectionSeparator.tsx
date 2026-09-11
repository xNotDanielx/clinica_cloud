type SectionSeparatorProps = {
  glow?: "cyan" | "violet";
};

export default function SectionSeparator({ glow = "cyan" }: SectionSeparatorProps) {
  const glowClass =
    glow === "cyan"
      ? "from-cyan-400/35 via-cyan-300/15 to-transparent"
      : "from-violet-400/35 via-violet-300/15 to-transparent";

  return (
    <div className="relative my-8 h-28 w-full overflow-visible" aria-hidden="true">
      <div className={`absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r ${glowClass}`} />
      <div
        className={`absolute inset-x-[4%] top-1/2 h-20 -translate-y-1/2 bg-gradient-to-r ${glowClass} blur-3xl opacity-70`}
      />
      <div className="absolute inset-x-[14%] top-1/2 h-12 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute inset-x-[8%] top-1/2 h-px -translate-y-1/2 bg-white/10" />
    </div>
  );
}
