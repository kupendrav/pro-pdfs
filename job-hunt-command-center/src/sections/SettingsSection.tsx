import { useMemo, useRef, useState } from 'react';
import {
  Sun,
  Moon,
  MonitorSmartphone,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Plus,
  Lock,
  Volume2,
  BellRing,
  Palette,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ACCENTS, CATEGORY_META, PRIORITY_META } from '../lib/defaults';
import { requestNotifyPermission } from '../lib/sound';
import { Card, SectionTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Toggle } from '../components/ui/inputs';
import { Modal } from '../components/ui/Modal';
import type { Block, Category, Priority, ThemeMode } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function BlockEditor({ kind }: { kind: 'weekdays' | 'sunday' }) {
  const blocks = useStore((s) => s.settings.template[kind]);
  const updateTemplate = useStore((s) => s.updateTemplate);
  const toast = useStore((s) => s.toast);
  const [addOpen, setAddOpen] = useState(false);
  const [nb, setNb] = useState({ title: '', category: 'personal' as Category, start: '12:00', end: '13:00', priority: 'normal' as Priority });

  const set = (id: string, patch: Partial<Block>) =>
    updateTemplate(kind, blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const remove = (b: Block) => {
    if (b.kind === 'packing') {
      toast('Packing is fixed — change its days/time below instead.', 'warn');
      return;
    }
    updateTemplate(kind, blocks.filter((x) => x.id !== b.id));
  };

  return (
    <div className="space-y-1.5">
      {[...blocks]
        .sort((a, b) => a.start.localeCompare(b.start))
        .map((b) => (
          <div key={b.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel2/40 px-2.5 py-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: CATEGORY_META[b.category].color }} />
            <Input
              value={b.title}
              onChange={(e) => set(b.id, { title: e.target.value })}
              className="!w-auto min-w-[130px] flex-1 !border-transparent !bg-transparent !px-1 !py-0.5 text-[12px]"
              aria-label="Block title"
            />
            <Input type="time" value={b.start} disabled={b.kind === 'packing'} onChange={(e) => set(b.id, { start: e.target.value })} className="!w-[92px] !px-1.5 !py-0.5 text-[11.5px]" aria-label="Start time" />
            <Input type="time" value={b.end} disabled={b.kind === 'packing'} onChange={(e) => set(b.id, { end: e.target.value })} className="!w-[92px] !px-1.5 !py-0.5 text-[11.5px]" aria-label="End time" />
            <Select value={b.category} onChange={(e) => set(b.id, { category: e.target.value as Category })} className="!w-[104px] !px-1.5 !py-0.5 text-[11.5px]" aria-label="Category">
              {Object.entries(CATEGORY_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
            </Select>
            <Select value={b.priority} onChange={(e) => set(b.id, { priority: e.target.value as Priority })} className="!w-[96px] !px-1.5 !py-0.5 text-[11.5px]" aria-label="Priority">
              {Object.entries(PRIORITY_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
            </Select>
            {b.kind === 'packing' ? (
              <Lock size={12} className="shrink-0 text-warn" aria-label="Fixed block" />
            ) : (
              <button onClick={() => remove(b)} className="rounded p-1 text-faint hover:text-danger" aria-label={`Remove ${b.title}`}>
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}>
        <Plus size={12} /> Add block
      </Button>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="New schedule block"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!nb.title.trim()) return;
                updateTemplate(kind, [...blocks, { id: crypto.randomUUID(), ...nb }]);
                setNb({ ...nb, title: '' });
                setAddOpen(false);
              }}
            >
              Add block
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Title">
            <Input value={nb.title} onChange={(e) => setNb((x) => ({ ...x, title: e.target.value }))} placeholder="e.g. Side project sprint" autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start"><Input type="time" value={nb.start} onChange={(e) => setNb((x) => ({ ...x, start: e.target.value }))} /></Field>
            <Field label="End"><Input type="time" value={nb.end} onChange={(e) => setNb((x) => ({ ...x, end: e.target.value }))} /></Field>
            <Field label="Category">
              <Select value={nb.category} onChange={(e) => setNb((x) => ({ ...x, category: e.target.value as Category }))}>
                {Object.entries(CATEGORY_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={nb.priority} onChange={(e) => setNb((x) => ({ ...x, priority: e.target.value as Priority }))}>
                {Object.entries(PRIORITY_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
              </Select>
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function SettingsSection() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const resetTemplate = useStore((s) => s.resetScheduleTemplate);
  const applyPacking = useStore((s) => s.applyPackingToTemplate);
  const importData = useStore((s) => s.importData);
  const resetAll = useStore((s) => s.resetAll);
  const state = useStore();
  const toast = useStore((s) => s.toast);
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportJson = useMemo(() => {
    const { settings: s, sessions, tasks, roadmap, books, dsa, dsaCatalog, jobs, reviews } = state;
    return JSON.stringify({ settings: s, sessions, tasks, roadmap, books, dsa, dsaCatalog, jobs, reviews }, null, 2);
  }, [state]);

  const doExport = () => {
    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-hunt-command-center-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Backup downloaded.', 'success');
  };

  const togglePackingDay = (d: number) => {
    const days = settings.packingDays.includes(d)
      ? settings.packingDays.filter((x) => x !== d)
      : [...settings.packingDays, d].sort();
    update({ packingDays: days });
  };

  return (
    <div className="mx-auto w-full max-w-[860px] space-y-6 px-4 pb-24 pt-5 lg:px-7 lg:pb-10">
      {/* Profile & rhythm */}
      <div>
        <SectionTitle>Profile & rhythm</SectionTitle>
        <Card className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Name"><Input value={settings.name} onChange={(e) => update({ name: e.target.value })} /></Field>
            <Field label="Target wake time"><Input type="time" value={settings.wake} onChange={(e) => update({ wake: e.target.value })} /></Field>
            <Field label="Target sleep time" hint="protect it"><Input type="time" value={settings.sleep} onChange={(e) => update({ sleep: e.target.value })} /></Field>
          </div>
          <Field label="Wind-down time" hint="late-night guardrail kicks in">
            <Input type="time" value={settings.windDown} onChange={(e) => update({ windDown: e.target.value })} className="!w-40" />
          </Field>
        </Card>
      </div>

      {/* Packing */}
      <div>
        <SectionTitle hint="fixed responsibility">Packing</SectionTitle>
        <Card className="space-y-4 p-4">
          <div>
            <p className="mb-2 text-xs font-medium text-mute">Packing days (per week)</p>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  onClick={() => togglePackingDay(i)}
                  aria-pressed={settings.packingDays.includes(i)}
                  className={`h-8 w-14 rounded-lg border text-[11.5px] font-medium transition-colors ${
                    settings.packingDays.includes(i)
                      ? 'border-warn/50 bg-warn/15 text-warn'
                      : 'border-line text-faint hover:text-mute'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Start"><Input type="time" value={settings.packingStart} onChange={(e) => { update({ packingStart: e.target.value }); applyPacking(); }} /></Field>
            <Field label="End"><Input type="time" value={settings.packingEnd} onChange={(e) => { update({ packingEnd: e.target.value }); applyPacking(); }} /></Field>
          </div>
          <p className="text-[11.5px] leading-relaxed text-faint">
            The block appears automatically on selected days, locked at its time so nothing else can take it.
          </p>
        </Card>
      </div>

      {/* Daily targets */}
      <div>
        <SectionTitle>Daily targets</SectionTitle>
        <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="AI/ML minutes"><Input type="number" min={0} value={settings.targets.aimlMin} onChange={(e) => update({ targets: { ...settings.targets, aimlMin: +e.target.value } })} /></Field>
          <Field label="DSA problems"><Input type="number" min={0} value={settings.targets.dsaCount} onChange={(e) => update({ targets: { ...settings.targets, dsaCount: +e.target.value } })} /></Field>
          <Field label="Book topics"><Input type="number" min={0} value={settings.targets.bookTopics} onChange={(e) => update({ targets: { ...settings.targets, bookTopics: +e.target.value } })} /></Field>
          <Field label="Applications" hint="quality cap"><Input type="number" min={0} value={settings.targets.applications} onChange={(e) => update({ targets: { ...settings.targets, applications: +e.target.value } })} /></Field>
        </Card>
      </div>

      {/* Focus timer */}
      <div>
        <SectionTitle>Focus timer</SectionTitle>
        <Card className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Default preset">
              <Select value={settings.focusPresetMin} onChange={(e) => update({ focusPresetMin: +e.target.value })}>
                {[25, 45, 60, 90].map((m) => <option key={m} value={m}>{m} minutes</option>)}
              </Select>
            </Field>
            <Field label="Break length">
              <Select value={settings.breakMin} onChange={(e) => update({ breakMin: +e.target.value })}>
                {[15, 20, 30, 45].map((m) => <option key={m} value={m}>{m} minutes</option>)}
              </Select>
            </Field>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-line bg-panel2/40 px-3 py-2.5">
            <span className="flex items-center gap-2 text-[12.5px] text-mute"><Volume2 size={13} /> Completion chime</span>
            <Toggle checked={settings.sound} onChange={(v) => update({ sound: v })} label="Completion chime" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-line bg-panel2/40 px-3 py-2.5">
            <span className="flex items-center gap-2 text-[12.5px] text-mute">
              <BellRing size={13} /> Browser notifications
              {settings.notifications && <span className="text-[10.5px] text-faint">(one gentle ping per session)</span>}
            </span>
            <Toggle
              checked={settings.notifications}
              label="Browser notifications"
              onChange={async (v) => {
                if (v) {
                  const ok = await requestNotifyPermission();
                  update({ notifications: ok });
                  if (!ok) toast('Notifications were blocked by the browser.', 'warn');
                } else update({ notifications: false });
              }}
            />
          </div>
        </Card>
      </div>

      {/* Schedule template */}
      <div>
        <SectionTitle hint="edits apply to future days only">Schedule template — Mon–Sat</SectionTitle>
        <Card className="p-4">
          <BlockEditor kind="weekdays" />
        </Card>
      </div>
      <div>
        <SectionTitle hint="review · plan · light revision">Schedule template — Sunday</SectionTitle>
        <Card className="p-4">
          <BlockEditor kind="sunday" />
          <div className="mt-3">
            <Button variant="ghost" size="sm" onClick={() => { resetTemplate(); toast('Template reset to defaults.', 'success'); }}>
              <RotateCcw size={12} /> Reset both templates to defaults
            </Button>
          </div>
        </Card>
      </div>

      {/* Appearance */}
      <div>
        <SectionTitle>Appearance</SectionTitle>
        <Card className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['dark', 'light', 'system'] as ThemeMode[]).map((t) => {
              const Icon = t === 'dark' ? Moon : t === 'light' ? Sun : MonitorSmartphone;
              const active = settings.theme === t;
              return (
                <button
                  key={t}
                  onClick={() => update({ theme: t })}
                  aria-pressed={active}
                  className={`flex h-9 items-center gap-2 rounded-lg border px-3.5 text-[12.5px] font-medium capitalize transition-colors ${
                    active ? 'border-acc/50 bg-acc/12 text-acc' : 'border-line text-mute hover:text-ink'
                  }`}
                >
                  <Icon size={13} /> {t}
                </button>
              );
            })}
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-mute"><Palette size={12} /> Accent</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ACCENTS).map(([key, a]) => (
                <button
                  key={key}
                  onClick={() => update({ accent: key })}
                  aria-label={`Accent ${a.label}`}
                  aria-pressed={settings.accent === key}
                  className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${settings.accent === key ? 'ring-2 ring-offset-2 ring-offset-panel' : ''}`}
                  style={{ background: `linear-gradient(135deg, rgb(${a.acc}), rgb(${a.acc2}))` }}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Data */}
      <div>
        <SectionTitle hint="local-first — your data never leaves this device">Data</SectionTitle>
        <Card className="flex flex-wrap items-center gap-2 p-4">
          <Button variant="outline" onClick={doExport}>
            <Download size={13} /> Export backup
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload size={13} /> Import backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              importData(await f.text());
              e.target.value = '';
            }}
          />
          <Button variant="danger" className="ml-auto" onClick={() => setConfirmReset(true)}>
            <Trash2 size={13} /> Reset everything
          </Button>
        </Card>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset everything?"
        sub="Deletes all tasks, logs, applications, and settings on this device."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>Keep my data</Button>
            <Button variant="danger" onClick={() => { resetAll(); setConfirmReset(false); toast('Fresh start. You got this.', 'default'); }}>
              Yes, reset
            </Button>
          </>
        }
      >
        <p className="text-[12.5px] leading-relaxed text-mute">
          Consider exporting a backup first. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
