import { useMemo, useState } from 'react';
import { Briefcase, Plus, Trash2, Pencil, ShieldCheck, ExternalLink, BellRing } from 'lucide-react';
import { useStore } from '../store/useStore';
import { todayStr, weekStart, prettyDate } from '../lib/dates';
import { applicationsThisWeek, interviewsCount, activeApplications } from '../lib/stats';
import { JOB_STATUSES } from '../lib/defaults';
import type { JobApp, JobStatus } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Field, Input, Select, Textarea } from '../components/ui/inputs';
import { EmptyState, StatChip } from '../components/ui/misc';
import { toMin, nowMinutes } from '../lib/time';

const statusMeta = (s: JobStatus) => JOB_STATUSES.find((j) => j.value === s)!;

const emptyApp = (): Omit<JobApp, 'id' | 'createdAt' | 'updatedAt'> => ({
  company: '',
  role: '',
  portal: '',
  dateApplied: todayStr(),
  status: 'applied',
  resumeVersion: '',
  coverNote: '',
  followUpDate: '',
  notes: '',
});

function AppModal({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: JobApp | null }) {
  const addJob = useStore((s) => s.addJob);
  const updateJob = useStore((s) => s.updateJob);
  const toast = useStore((s) => s.toast);
  const [form, setForm] = useState(emptyApp());
  const [seededFor, setSeededFor] = useState<string | null>(null);

  if (open && seededFor !== (editing?.id ?? 'new')) {
    setSeededFor(editing?.id ?? 'new');
    setForm(editing ? { ...editing } : emptyApp());
  }
  if (!open && seededFor !== null) setSeededFor(null);

  const set = (patch: Partial<JobApp>) => setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    if (!form.company.trim() || !form.role.trim()) {
      toast('Company and role are enough — keep it quick.', 'warn');
      return;
    }
    if (editing) updateJob(editing.id, form);
    else addJob(form);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit application' : 'New application'}
      sub="Quality over volume — tailored beats templated"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>{editing ? 'Save application' : 'Add to tracker'}</Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Company">
            <Input value={form.company} onChange={(e) => set({ company: e.target.value })} placeholder="e.g. Stripe" autoFocus />
          </Field>
          <Field label="Role">
            <Input value={form.role} onChange={(e) => set({ role: e.target.value })} placeholder="e.g. ML Engineer" />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Portal / source">
            <Input value={form.portal} onChange={(e) => set({ portal: e.target.value })} placeholder="LinkedIn, referral…" />
          </Field>
          <Field label="Date applied">
            <Input type="date" value={form.dateApplied} onChange={(e) => set({ dateApplied: e.target.value })} />
          </Field>
          <Field label="Resume version">
            <Input value={form.resumeVersion} onChange={(e) => set({ resumeVersion: e.target.value })} placeholder="v3-ml-focus" />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Status">
            <Select value={form.status} onChange={(e) => set({ status: e.target.value as JobStatus })}>
              {JOB_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </Field>
          <Field label="Follow-up date" hint="optional">
            <Input type="date" value={form.followUpDate} onChange={(e) => set({ followUpDate: e.target.value })} />
          </Field>
        </div>
        <Field label="Cover letter / message" hint="one line summary is fine">
          <Textarea value={form.coverNote} onChange={(e) => set({ coverNote: e.target.value })} rows={2} placeholder="What you said, briefly" />
        </Field>
        <Field label="Notes" hint="optional">
          <Textarea value={form.notes} onChange={(e) => set({ notes: e.target.value })} rows={2} placeholder="Referral, JD link, salary range…" />
        </Field>
      </div>
    </Modal>
  );
}

export function JobsSection() {
  const state = useStore();
  const setJobStatus = useStore((s) => s.setJobStatus);
  const deleteJob = useStore((s) => s.deleteJob);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JobApp | null>(null);
  const [filter, setFilter] = useState<'all' | 'pipeline' | 'interviews'>('all');
  const [query, setQuery] = useState('');

  const today = todayStr();
  const apps = useMemo(() => {
    const list = Object.values(state.jobs).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    const q = query.trim().toLowerCase();
    return list.filter((a) => {
      if (q && !`${a.company} ${a.role} ${a.portal}`.toLowerCase().includes(q)) return false;
      if (filter === 'pipeline') return !['rejected', 'ghosted', 'saved'].includes(a.status);
      if (filter === 'interviews') return ['assessment', 'interview', 'technical', 'hr', 'offer'].includes(a.status);
      return true;
    });
  }, [state.jobs, filter, query]);

  const appsToday = Object.values(state.jobs).filter((j) => j.dateApplied === today).length;
  const target = state.settings.targets.applications;
  const inJobBlock = useMemo(() => {
    return Object.values(state.tasks).some(
      (t) => t.date === today && t.category === 'job' && t.start !== '' && toMin(t.start) <= nowMinutes() && nowMinutes() < toMin(t.end),
    );
  }, [state.tasks, today]);

  const followUpsDue = Object.values(state.jobs).filter(
    (j) => j.followUpDate && j.followUpDate <= today && !['rejected', 'ghosted', 'offer'].includes(j.status),
  );

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 pb-24 pt-5 lg:px-7 lg:pb-10">
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatChip icon={<Briefcase size={15} />} label="Today" value={`${appsToday}`} sub={`target ${target} quality apps`} />
        <StatChip icon={<Briefcase size={15} />} label="This week" value={`${applicationsThisWeek(state)}`} />
        <StatChip icon={<Briefcase size={15} />} label="Interviews" value={`${interviewsCount(state)}`} sub="assessment → offer" />
        <StatChip icon={<Briefcase size={15} />} label="Active" value={`${activeApplications(state)}`} sub="in pipeline" />
      </div>

      <Card className="mb-4 border-acc/25 bg-acc/[0.04] p-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold">
          <ShieldCheck size={15} className="text-acc" /> Applications get one block a day — 7:30 PM, focused
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-mute">
          Quality applications &gt; random applications. {target} tailored applications inside the block; the rest of the
          day belongs to learning. {inJobBlock ? 'You are in the block now — make each one count.' : `Next block: 7:30 PM.`}
        </p>
      </Card>

      {followUpsDue.length > 0 && (
        <Card className="mb-4 border-warn/30 bg-warn/[0.05] p-4">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-warn">
            <BellRing size={14} /> {followUpsDue.length} follow-up{followUpsDue.length > 1 ? 's' : ''} due
          </p>
          <p className="mt-1 text-[12px] text-mute">
            {followUpsDue.slice(0, 4).map((j) => `${j.company} (${prettyDate(j.followUpDate)})`).join(' · ')}
            {followUpsDue.length > 4 ? ' …' : ''}
          </p>
        </Card>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {(['all', 'pipeline', 'interviews'] as const).map((f) => (
            <Button key={f} variant={filter === f ? 'soft' : 'ghost'} size="sm" onClick={() => setFilter(f)}>
              {f[0].toUpperCase() + f.slice(1)}
            </Button>
          ))}
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="!w-40 !py-1.5 text-[12px]"
            aria-label="Search applications"
          />
        </div>
        <Button variant="primary" size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus size={13} /> Add application
        </Button>
      </div>

      {Object.keys(state.jobs).length === 0 ? (
        <EmptyState
          icon={<Briefcase size={18} />}
          title="No applications tracked yet"
          body="During the 7:30 PM block, add each application as you send it — 20 seconds each. Follow-ups and statuses live here too."
          action={<Button variant="soft" size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>Add your first</Button>}
        />
      ) : (
        <Card className="divide-y divide-line overflow-hidden">
          {apps.length === 0 && <p className="px-4 py-6 text-center text-[12.5px] text-faint">No matches.</p>}
          {apps.map((j) => {
            const meta = statusMeta(j.status);
            return (
              <div key={j.id} className="group flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-panel2/40">
                <div className="min-w-[180px] flex-1">
                  <p className="flex items-center gap-2 text-[13.5px] font-medium">
                    {j.company}
                    <span className="text-faint">·</span>
                    <span className="truncate text-mute">{j.role}</span>
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-faint">
                    {j.portal && <span>{j.portal}</span>}
                    <span>applied {prettyDate(j.dateApplied)}</span>
                    {j.resumeVersion && <span>· {j.resumeVersion}</span>}
                    {j.followUpDate && (
                      <span className={j.followUpDate <= today && !['rejected', 'ghosted', 'offer'].includes(j.status) ? 'text-warn' : ''}>
                        · follow-up {prettyDate(j.followUpDate)}
                      </span>
                    )}
                  </p>
                  {j.notes && <p className="mt-1 line-clamp-1 text-[11.5px] text-mute">{j.notes}</p>}
                </div>
                <select
                  value={j.status}
                  onChange={(e) => setJobStatus(j.id, e.target.value as JobStatus)}
                  className="cursor-pointer rounded-lg border px-2.5 py-1.5 text-[12px] font-medium"
                  style={{ color: meta.tone, borderColor: `${meta.tone}55`, background: `${meta.tone}14` }}
                  aria-label={`Status for ${j.company}`}
                >
                  {JOB_STATUSES.map((s) => <option key={s.value} value={s.value} className="bg-panel text-ink">{s.label}</option>)}
                </select>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => { setEditing(j); setModalOpen(true); }}
                    className="rounded-md p-1.5 text-faint opacity-0 transition-all hover:bg-panel2 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
                    aria-label={`Edit ${j.company}`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => deleteJob(j.id)}
                    className="rounded-md p-1.5 text-faint opacity-0 transition-all hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                    aria-label={`Delete ${j.company}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <div className="mt-4 text-center">
        <a
          href="https://neetcode.io/practice"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-faint transition-colors hover:text-mute"
        >
          <ExternalLink size={10} /> tip: update statuses right after the 9:00 PM tracking block
        </a>
      </div>
      <p className="sr-only">Applications this week: {applicationsThisWeek(state)}. Week start: {weekStart(today)}.</p>

      <AppModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </div>
  );
}
