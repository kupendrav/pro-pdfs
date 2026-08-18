import { useState } from 'react';
import { Sun, Moon, MonitorSmartphone, ArrowRight, Check, Rocket } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ACCENTS } from '../lib/defaults';
import { todayStr } from '../lib/dates';
import { Button } from '../components/ui/Button';
import { Field, Input, Toggle } from '../components/ui/inputs';
import type { ThemeMode } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** First-run setup: ~60 seconds, then the week generates itself. */
export function Onboarding() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const applyPacking = useStore((s) => s.applyPackingToTemplate);
  const resetTemplate = useStore((s) => s.resetScheduleTemplate);
  const ensureDay = useStore((s) => s.ensureDay);
  const toast = useStore((s) => s.toast);
  const [step, setStep] = useState(0);

  const finish = () => {
    applyPacking();
    resetTemplate();
    update({ onboarded: true });
    ensureDay(todayStr());
    toast('Welcome. Your first week is ready — start with Start My Day.', 'success');
  };

  const steps = [
    // 1 — identity + theme
    <div key="s1" className="space-y-4">
      <Field label="What should I call you?">
        <Input value={settings.name} onChange={(e) => update({ name: e.target.value })} placeholder="Kupendra" autoFocus />
      </Field>
      <div>
        <p className="mb-2 text-xs font-medium text-mute">Theme</p>
        <div className="flex gap-2">
          {(['dark', 'light', 'system'] as ThemeMode[]).map((t) => {
            const Icon = t === 'dark' ? Moon : t === 'light' ? Sun : MonitorSmartphone;
            const active = settings.theme === t;
            return (
              <button
                key={t}
                onClick={() => update({ theme: t })}
                aria-pressed={active}
                className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border text-[12.5px] font-medium capitalize ${
                  active ? 'border-acc/50 bg-acc/12 text-acc' : 'border-line text-mute'
                }`}
              >
                <Icon size={13} /> {t}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-mute">Accent</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ACCENTS).map(([key, a]) => (
            <button
              key={key}
              onClick={() => update({ accent: key })}
              aria-label={a.label}
              aria-pressed={settings.accent === key}
              className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${settings.accent === key ? 'ring-2 ring-offset-2 ring-offset-panel' : ''}`}
              style={{ background: `linear-gradient(135deg, rgb(${a.acc}), rgb(${a.acc2}))` }}
            />
          ))}
        </div>
      </div>
    </div>,

    // 2 — rhythm
    <div key="s2" className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Target wake time"><Input type="time" value={settings.wake} onChange={(e) => update({ wake: e.target.value })} /></Field>
        <Field label="Target sleep time"><Input type="time" value={settings.sleep} onChange={(e) => update({ sleep: e.target.value })} /></Field>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-mute">Packing days</p>
        <div className="flex flex-wrap gap-1.5">
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => {
                const days = settings.packingDays.includes(i)
                  ? settings.packingDays.filter((x) => x !== i)
                  : [...settings.packingDays, i].sort();
                update({ packingDays: days });
              }}
              aria-pressed={settings.packingDays.includes(i)}
              className={`h-9 w-[52px] rounded-lg border text-[12px] font-medium ${
                settings.packingDays.includes(i) ? 'border-warn/50 bg-warn/15 text-warn' : 'border-line text-faint'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-faint">Default Mon–Sat, 11:00–11:30 — Sunday stays free.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Packing start"><Input type="time" value={settings.packingStart} onChange={(e) => update({ packingStart: e.target.value })} /></Field>
        <Field label="Packing end"><Input type="time" value={settings.packingEnd} onChange={(e) => update({ packingEnd: e.target.value })} /></Field>
      </div>
    </div>,

    // 3 — targets + focus
    <div key="s3" className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="AI/ML learning (min/day)"><Input type="number" min={0} value={settings.targets.aimlMin} onChange={(e) => update({ targets: { ...settings.targets, aimlMin: +e.target.value } })} /></Field>
        <Field label="DSA problems / day"><Input type="number" min={0} value={settings.targets.dsaCount} onChange={(e) => update({ targets: { ...settings.targets, dsaCount: +e.target.value } })} /></Field>
        <Field label="Book topics / day"><Input type="number" min={0} value={settings.targets.bookTopics} onChange={(e) => update({ targets: { ...settings.targets, bookTopics: +e.target.value } })} /></Field>
        <Field label="Applications / day" hint="quality cap"><Input type="number" min={0} value={settings.targets.applications} onChange={(e) => update({ targets: { ...settings.targets, applications: +e.target.value } })} /></Field>
      </div>
      <Field label="Default focus session">
        <div className="flex gap-2">
          {[25, 45, 60, 90].map((m) => (
            <button
              key={m}
              onClick={() => update({ focusPresetMin: m })}
              aria-pressed={settings.focusPresetMin === m}
              className={`h-9 flex-1 rounded-lg border text-[12.5px] font-medium ${
                settings.focusPresetMin === m ? 'border-acc/50 bg-acc/12 text-acc' : 'border-line text-mute'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </Field>
      <div className="flex items-center justify-between rounded-lg border border-line bg-panel2/40 px-3 py-2.5">
        <span className="text-[12.5px] text-mute">Gentle chime when a focus session ends</span>
        <Toggle checked={settings.sound} onChange={(v) => update({ sound: v })} label="Completion chime" />
      </div>
      <p className="rounded-lg border border-acc/25 bg-acc/[0.06] px-3 py-2.5 text-[11.5px] leading-relaxed text-mute">
        We'll generate your full weekday schedule (7:30 AM deep work → 10:30 PM wind-down) plus a lighter Sunday for
        review and planning. Everything is editable later in Settings.
      </p>
    </div>,
  ];

  const titles = [
    ['Welcome to your Command Center', 'A calm daily operating system for the job hunt. Two minutes to set up.'],
    ['Your rhythm', 'Consistent sleep and the fixed packing block come first — everything else fits around them.'],
    ['Daily targets', 'Small, honest targets. The score rewards consistency, never overwork.'],
  ];

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="hero-glow w-full max-w-lg rounded-2xl border border-line bg-panel p-7 shadow-soft animate-rise-in sm:p-9">
        <div className="mb-6 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-acc' : 'bg-line'}`}
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={3}
            />
          ))}
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
          Step {step + 1} of 3
        </p>
        <h1 className="mt-2 text-[22px] font-semibold tracking-tight">{titles[step][0]}</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-mute">{titles[step][1]}</p>

        <div className="mt-6">{steps[step]}</div>

        <div className="mt-7 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < 2 ? (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight size={14} />
            </Button>
          ) : (
            <Button variant="primary" size="lg" onClick={finish}>
              <Rocket size={15} /> Generate my week
            </Button>
          )}
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-faint">
          <Check size={11} className="text-ok" /> Local-first · zero accounts · your data stays on this device
        </p>
      </div>
    </div>
  );
}
