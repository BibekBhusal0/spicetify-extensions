import React, { forwardRef } from "react";
import { searchTerms } from "./model.ts";

export function Row({
  label,
  description,
  children,
  stacked,
}: {
  label: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  stacked?: boolean;
}) {
  return (
    <div className={`sl-sp-row${stacked ? " sl-sp-row--stacked" : ""}`}>
      <div className="sl-sp-label-wrap">
        <span className="sl-sp-label">{label}</span>
        {description && <span className="sl-sp-description">{description}</span>}
      </div>
      <div className="sl-sp-control">{children}</div>
    </div>
  );
}

export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = searchTerms(query);
  if (!terms.length) return <>{text}</>;
  const pattern = new RegExp(`(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return <>{text.split(pattern).map((part, index) => index % 2 ? <mark key={index}>{part}</mark> : part)}</>;
}

export function Toggle({
  checked,
  onChange,
  locked,
  busy,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  locked?: boolean;
  onLockedPress?: () => void;
  busy?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <input
      className="sl-sp-toggle"
      type="checkbox"
      role="switch"
      aria-label={label}
      checked={checked}
      disabled={locked || busy || disabled}
      onChange={(event) => onChange(event.currentTarget.checked)}
    />
  );
}

export function Select({
  value,
  options,
  labels,
  onChange,
  disabled,
  label,
}: {
  value: string;
  options: string[];
  labels?: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.currentTarget.value)} disabled={disabled}>
      {options.map((option, index) => <option key={option} value={option}>{labels?.[index] ?? option}</option>)}
    </select>
  );
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  defaultValue,
  unit,
  onChange,
  disabled,
  label,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
}) {
  // Keep in sync with the thumb width in settings-panel.css.
  const THUMB = 16;
  const range = max - min || 1;
  const clamped = Math.min(max, Math.max(min, value));
  const frac = (clamped - min) / range;
  const isBipolar = min < 0 && max > 0;
  const zeroFrac = ((isBipolar ? 0 : min) - min) / range;

  // Positions a fraction along the track, compensating for the thumb width so
  // the fill and centre tick line up with the native thumb at both ends.
  const posFor = (f: number) =>
    `calc(${(f * 100).toFixed(4)}% + ${((0.5 - f) * THUMB).toFixed(3)}px)`;

  const fillFrom = Math.min(zeroFrac, frac);
  const fillSpan = Math.abs(frac - zeroFrac);

  // A bipolar fill grows out of the centre tick; a one-sided fill starts at the
  // track's left edge, where anchoring to the thumb's centre would leave a stub.
  const fillStyle = isBipolar
    ? {
        left: posFor(fillFrom),
        width: `calc(${(fillSpan * 100).toFixed(4)}% - ${(fillSpan * THUMB).toFixed(3)}px)`,
      }
    : { left: "0px", width: posFor(frac) };

  const sign = isBipolar && clamped > 0 ? "+" : "";
  const valueLabel = `${sign}${clamped}${unit ? ` ${unit}` : ""}`;

  return (
    <div className={`sl-sp-slider${disabled ? " sl-sp-slider--disabled" : ""}`}>
      <div className="sl-sp-slider-track-wrap">
        <span className="sl-sp-slider-track" />
        <span className="sl-sp-slider-fill" style={fillStyle} />
        {isBipolar && (
          <span className="sl-sp-slider-center" style={{ left: posFor(zeroFrac) }} />
        )}
        <input
          type="range"
          className="sl-sp-slider-input"
          aria-label={label}
          aria-valuetext={valueLabel}
          min={min}
          max={max}
          step={step}
          value={clamped}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
          disabled={disabled}
        />
      </div>
      <div className="sl-sp-slider-meta">
        <span className="sl-sp-slider-value">{valueLabel}</span>
        {defaultValue !== undefined && clamped !== defaultValue && !disabled && (
          <button
            type="button"
            className="sl-sp-slider-reset"
            onClick={() => onChange(defaultValue)}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export const SearchBar = forwardRef<
  HTMLInputElement,
  { value: string; onChange: (value: string) => void; onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void; placeholder?: string }
>(function SearchBar({ value, onChange, onKeyDown, placeholder = "Search settings" }, ref) {
  return (
    <input
      ref={ref}
      type="search"
      aria-label="Search all settings"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      onKeyDown={onKeyDown}
      spellCheck={false}
    />
  );
});
