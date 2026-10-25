import React, { forwardRef } from "react";
import { searchTerms } from "./model.ts";

export function Row({
  label,
  description,
  children,
  disabled,
  disabledReason,
  note,
  stacked,
  badge,
}: {
  label: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  disabled?: boolean;
  disabledReason?: string;
  note?: string;
  stacked?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div className={`sl-sp-row${disabled ? " sl-sp-row--disabled" : ""}${stacked ? " sl-sp-row--stacked" : ""}`}>
      <div className="sl-sp-label-wrap">
        <span className="sl-sp-label">{label}{badge}</span>
        {description && <span className="sl-sp-description">{description}</span>}
        {disabledReason && <span className="sl-sp-reason">{disabledReason}</span>}
        {note && <span className="sl-sp-reason">{note}</span>}
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
  const valueLabel = `${value}${unit ? ` ${unit}` : ""}`;
  return (
    <div className="sl-sp-slider">
      <input
        type="range"
        aria-label={label}
        aria-valuetext={valueLabel}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        disabled={disabled}
      />
      <output>{valueLabel}</output>
      {defaultValue !== undefined && value !== defaultValue && !disabled && (
        <button type="button" onClick={() => onChange(defaultValue)}>Reset</button>
      )}
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
