interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export default function ColorField({ label, value, onChange }: Props) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[11px] uppercase tracking-[0.14em] text-white/55 font-mono">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-white/80 tabular-nums">
          {value.toUpperCase()}
        </span>
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div
            className="w-7 h-7 rounded-md border border-white/15 shadow-inner"
            style={{
              background: value,
              boxShadow: `0 0 16px ${value}66, inset 0 0 0 1px rgba(255,255,255,0.08)`,
            }}
          />
        </div>
      </div>
    </label>
  );
}
