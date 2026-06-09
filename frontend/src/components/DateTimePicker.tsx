import { useMemo } from 'react';
import './DateTimePicker.css';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
  displayLabel?: string;
  showPresets?: boolean;
  showRelative?: boolean;
  relativeMode?: 'deadline' | 'event';
}

interface Preset {
  id: string;
  label: string;
  getValue: () => string;
}

function toDatetimeLocal(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function setTimeOnDate(base: Date, hours: number, minutes: number): Date {
  const d = new Date(base);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function buildPresets(): Preset[] {
  return [
    {
      id: 'tomorrow-7',
      label: 'Tomorrow · 7 PM',
      getValue: () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return toDatetimeLocal(setTimeOnDate(d, 19, 0));
      },
    },
    {
      id: '3days-6',
      label: 'In 3 days · 6 PM',
      getValue: () => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return toDatetimeLocal(setTimeOnDate(d, 18, 0));
      },
    },
    {
      id: '1week-6',
      label: 'In 1 week · 6 PM',
      getValue: () => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return toDatetimeLocal(setTimeOnDate(d, 18, 0));
      },
    },
    {
      id: '2weeks-8',
      label: 'In 2 weeks · 8 PM',
      getValue: () => {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        return toDatetimeLocal(setTimeOnDate(d, 20, 0));
      },
    },
  ];
}

function formatFriendly(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Pick a date and time';
  return date.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatRelative(value: string, mode: 'deadline' | 'event' = 'deadline'): string {
  const target = new Date(value);
  const now = new Date();
  if (Number.isNaN(target.getTime())) return '';

  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return mode === 'event' ? 'Event time is in the past' : 'Deadline is in the past';
  }

  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 60) {
    const suffix = diffMins === 1 ? '' : 's';
    return mode === 'event'
      ? `In ${diffMins} minute${suffix}`
      : `Closes in ${diffMins} minute${suffix}`;
  }

  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 48) {
    const suffix = diffHours === 1 ? '' : 's';
    return mode === 'event'
      ? `In ${diffHours} hour${suffix}`
      : `Closes in ${diffHours} hour${suffix}`;
  }

  const diffDays = Math.round(diffHours / 24);
  const suffix = diffDays === 1 ? '' : 's';
  return mode === 'event'
    ? `In ${diffDays} day${suffix}`
    : `Closes in ${diffDays} day${suffix}`;
}

const PRESETS = buildPresets();

export function defaultExpiry(): string {
  return PRESETS.find((p) => p.id === '1week-6')!.getValue();
}

export function defaultEventAt(): string {
  return PRESETS.find((p) => p.id === '2weeks-8')!.getValue();
}

export function DateTimePicker({
  value,
  onChange,
  idPrefix = 'rsvp-deadline',
  displayLabel = 'RSVP closes',
  showPresets = true,
  showRelative = true,
  relativeMode = 'deadline',
}: DateTimePickerProps) {
  const [datePart, timePart] = value.split('T');

  const activePresetId = useMemo(() => {
    if (!showPresets) return null;
    return PRESETS.find((preset) => preset.getValue() === value)?.id ?? null;
  }, [value, showPresets]);

  const handleDateChange = (newDate: string) => {
    onChange(`${newDate}T${timePart || '18:00'}`);
  };

  const handleTimeChange = (newTime: string) => {
    onChange(`${datePart || toDatetimeLocal(new Date()).slice(0, 10)}T${newTime}`);
  };

  return (
    <div className="datetime-picker">
      <div className="datetime-display">
        <div className="datetime-display-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
          </svg>
        </div>
        <div className="datetime-display-text">
          <p className="datetime-display-label">{displayLabel}</p>
          <p className="datetime-display-value">{formatFriendly(value)}</p>
          <div className="datetime-inputs">
            <div className="datetime-field">
              <label htmlFor={`${idPrefix}-date`}>Date</label>
              <input
                id={`${idPrefix}-date`}
                type="date"
                value={datePart}
                min={toDatetimeLocal(new Date()).slice(0, 10)}
                onChange={(e) => handleDateChange(e.target.value)}
                required
              />
            </div>
            <div className="datetime-field">
              <label htmlFor={`${idPrefix}-time`}>Time</label>
              <input
                id={`${idPrefix}-time`}
                type="time"
                value={timePart}
                onChange={(e) => handleTimeChange(e.target.value)}
                required
              />
            </div>
          </div>
          {showPresets && (
            <div className="datetime-quick-select">
              <div className="datetime-presets">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`datetime-preset ${activePresetId === preset.id ? 'active' : ''}`}
                    onClick={() => onChange(preset.getValue())}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {showRelative && (
            <p className="datetime-display-relative">{formatRelative(value, relativeMode)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
