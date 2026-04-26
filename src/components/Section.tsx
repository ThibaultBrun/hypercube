import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}

export default function Section({
  title,
  children,
  defaultOpen = true,
  badge,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-white/[0.02] transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/85 font-mono group-hover:text-white">
            {title}
          </span>
          {badge && (
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-white/60 font-mono">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-white/40 transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
        />
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </section>
  );
}
