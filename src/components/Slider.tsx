interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}

export default function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  unit,
  format,
  onChange,
}: Props) {
  const display = format
    ? format(value)
    : `${value.toFixed(Math.abs(step) >= 1 ? 0 : 2)}${unit ?? ""}`;
  return (
    <label className="block">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[11px] uppercase tracking-[0.14em] text-white/55 font-mono">
          {label}
        </span>
        <span className="text-[11px] font-mono text-white tabular-nums">
          {display}
        </span>
      </div>
      <input
        type="range"
        className="neon"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}
