import { useMemo, useState } from 'react';
import {
  Route,
  Plus,
  ChevronDown,
  Trash2,
  Crosshair,
  BookText,
  Hammer,
  Dumbbell,
  RefreshCw,
  Speech,
  CheckCheck,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Ring, ProgressBar, Badge, EmptyState } from '../components/ui/misc';
import { Input, Textarea, Field } from '../components/ui/inputs';
import { Modal } from '../components/ui/Modal';
import type { Stage } from '../types';

const STAGE_META: Array<{ id: Stage; label: string; icon: typeof BookText; hint: string }> = [
  { id: 'learn', label: 'Learn', icon: BookText, hint: 'Watch / study the concept' },
  { id: 'build', label: 'Build', icon: Hammer, hint: 'Build something with it' },
  { id: 'practice', label: 'Practice', icon: Dumbbell, hint: 'Practice deliberately' },
  { id: 'revise', label: 'Revise', icon: RefreshCw, hint: 'Revisit and consolidate' },
  { id: 'teach', label: 'Teach myself', icon: Speech, hint: 'Explain it without looking' },
];

function TopicRow({ topicId }: { topicId: string }) {
  const topic = useStore((s) => s.roadmap.topics.find((t) => t.id === topicId));
  const toggleStage = useStore((s) => s.toggleStage);
  const setCurrentTopic = useStore((s) => s.setCurrentTopic);
  const updateTopic = useStore((s) => s.updateTopic);
  const deleteTopic = useStore((s) => s.deleteTopic);
  const [open, setOpen] = useState(false);
  if (!topic) return null;

  const doneCount = Object.values(topic.stages).filter(Boolean).length;
  const complete = doneCount === 5;

  return (
    <div
      className={`rounded-xl border transition-colors ${
        topic.isCurrent ? 'border-acc/40 bg-acc/[0.05]' : complete ? 'border-ok/25 bg-ok/[0.03]' : 'border-line bg-panel'
      }`}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <button
          onClick={() => setCurrentTopic(topic.id)}
          className={`rounded-md p-1.5 transition-colors ${topic.isCurrent ? 'text-acc' : 'text-faint hover:text-acc'}`}
          aria-label={`Set "${topic.title}" as current topic`}
          title={topic.isCurrent ? 'Current topic' : 'Set as current'}
        >
          <Crosshair size={14} />
        </button>
        <button onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 text-left">
          <span className={`block truncate text-[13.5px] font-medium ${complete ? 'text-mute' : ''}`}>
            {topic.title}
          </span>
          {topic.isCurrent && <span className="text-[10px] font-semibold uppercase tracking-wider text-acc">current</span>}
        </button>

        <div className="flex shrink-0 items-center gap-1">
          {STAGE_META.map((s) => {
            const on = topic.stages[s.id];
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => toggleStage(topic.id, s.id)}
                title={`${s.label} — ${s.hint}${topic.stageDates[s.id] ? ` (done ${topic.stageDates[s.id]})` : ''}`}
                aria-label={`${s.label}: ${on ? 'done' : 'not done'} for ${topic.title}`}
                aria-pressed={on}
                className={`grid h-6 w-6 place-items-center rounded-md border transition-all duration-150 ${
                  on ? 'border-acc/50 bg-acc/15 text-acc' : 'border-line text-faint hover:border-acc/40 hover:text-mute'
                }`}
              >
                <Icon size={11.5} />
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-1 text-faint transition-all hover:text-ink"
          aria-label={`${open ? 'Collapse' : 'Expand'} ${topic.title}`}
          aria-expanded={open}
        >
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-line/70 px-3.5 py-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Project / artifact" hint="optional">
              <Input
                value={topic.project}
                onChange={(e) => updateTopic(topic.id, { project: e.target.value })}
                placeholder="repo, notebook, demo…"
              />
            </Field>
            <Field label="Revision status">
              <p className="rounded-lg border border-line bg-panel2 px-3 py-2 text-[12px] text-mute">
                {topic.stageDates.revise
                  ? `Last revised ${topic.stageDates.revise}`
                  : topic.stages.learn
                    ? 'Learned — needs a revision pass'
                    : 'Not started'}
              </p>
            </Field>
          </div>
          <Field label="Notes" hint="concise — what clicked, what didn't">
            <Textarea
              value={topic.notes}
              onChange={(e) => updateTopic(topic.id, { notes: e.target.value })}
              rows={2}
              placeholder="The one insight I want to remember…"
            />
          </Field>
          <div className="flex justify-between">
            <button
              onClick={() => deleteTopic(topic.id)}
              className="flex items-center gap-1 text-[11.5px] text-faint transition-colors hover:text-danger"
            >
              <Trash2 size={11} /> remove topic
            </button>
            {doneCount > 0 && !complete && (
              <button
                onClick={() => STAGE_META.forEach((s) => !topic.stages[s.id] && toggleStage(topic.id, s.id))}
                className="flex items-center gap-1 text-[11.5px] text-faint transition-colors hover:text-ok"
              >
                <CheckCheck size={11} /> complete all stages
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function RoadmapSection() {
  const state = useStore();
  const addMilestone = useStore((s) => s.addMilestone);
  const addTopic = useStore((s) => s.addTopic);
  const [addOpen, setAddOpen] = useState<'topic' | 'milestone' | null>(null);
  const [value, setValue] = useState('');
  const [milestoneFor, setMilestoneFor] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const { milestones, topics } = state.roadmap;
  const current = topics.find((t) => t.isCurrent) ?? topics.find((t) => !Object.values(t.stages).every(Boolean));
  const stagesDone = useMemo(
    () => topics.reduce((s, t) => s + Object.values(t.stages).filter(Boolean).length, 0),
    [topics],
  );
  const pct = topics.length > 0 ? stagesDone / (topics.length * 5) : 0;
  const currentMilestone = milestones.find((m) => m.id === current?.milestoneId);
  const nextUp = topics.find((t) => !t.stages.learn && t.id !== current?.id);

  return (
    <div className="mx-auto w-full max-w-[980px] px-4 pb-24 pt-5 lg:px-7 lg:pb-10">
      <Card className="hero-glow mb-4 p-5">
        <div className="flex flex-wrap items-center gap-6">
          <Ring value={pct} size={110} stroke={9}>
            <span className="tnum font-mono text-xl font-bold">{Math.round(pct * 100)}%</span>
            <span className="text-[9.5px] uppercase tracking-wider text-faint">complete</span>
          </Ring>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Current focus</p>
            <h2 className="mt-1 truncate text-xl font-semibold tracking-tight">
              {current ? current.title : 'Pick a topic'}
            </h2>
            <p className="mt-1 text-[12.5px] text-mute">
              {currentMilestone ? `${currentMilestone.title} · ` : ''}
              {stagesDone}/{topics.length * 5} stages done
              {nextUp && ` · next up: ${nextUp.title}`}
            </p>
            <div className="mt-3">
              <ProgressBar value={pct} />
            </div>
            <p className="mt-2.5 text-[11.5px] text-faint">
              Loop: <span className="text-mute">Learn → Build → Practice → Revise → Teach myself</span> — one topic at a
              time.
            </p>
          </div>
        </div>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Milestones</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setAddOpen('milestone'); setValue(''); }}>
            <Plus size={13} /> Milestone
          </Button>
          <Button variant="soft" size="sm" onClick={() => { setAddOpen('topic'); setValue(''); setMilestoneFor(milestones[0]?.id ?? ''); }}>
            <Plus size={13} /> Topic
          </Button>
        </div>
      </div>

      {milestones.length === 0 ? (
        <EmptyState icon={<Route size={18} />} title="No milestones yet" body="Add your first milestone to start tracking the roadmap." />
      ) : (
        <div className="space-y-2.5">
          {milestones.map((m) => {
            const msTopics = topics.filter((t) => t.milestoneId === m.id);
            const msDone = msTopics.filter((t) => Object.values(t.stages).every(Boolean)).length;
            const isCollapsed = collapsed[m.id];
            return (
              <Card key={m.id}>
                <button
                  onClick={() => setCollapsed((c) => ({ ...c, [m.id]: !c[m.id] }))}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  aria-expanded={!isCollapsed}
                >
                  <ChevronDown size={14} className={`text-faint transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                  <span className="flex-1 text-[13.5px] font-semibold tracking-tight">{m.title}</span>
                  <Badge color={msDone === msTopics.length && msTopics.length > 0 ? '#34d399' : undefined}>
                    {msDone}/{msTopics.length} topics
                  </Badge>
                </button>
                {!isCollapsed && (
                  <div className="space-y-1.5 px-3.5 pb-3.5">
                    {msTopics.length === 0 ? (
                      <p className="px-1 py-2 text-[12px] text-faint">No topics yet — add one.</p>
                    ) : (
                      msTopics.map((t) => <TopicRow key={t.id} topicId={t.id} />)
                    )}
                    <button
                      onClick={() => { setAddOpen('topic'); setValue(''); setMilestoneFor(m.id); }}
                      className="ml-1 mt-1 text-[11.5px] text-faint underline decoration-dotted transition-colors hover:text-acc"
                    >
                      + add topic to {m.title}
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={addOpen !== null}
        onClose={() => setAddOpen(null)}
        title={addOpen === 'milestone' ? 'New milestone' : 'New roadmap topic'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!value.trim()) return;
                if (addOpen === 'milestone') addMilestone(value.trim());
                else if (milestoneFor) addTopic(milestoneFor, value.trim());
                setAddOpen(null);
              }}
            >
              Add
            </Button>
          </>
        }
      >
        {addOpen === 'topic' && (
          <Field label="Milestone">
            <select
              value={milestoneFor}
              onChange={(e) => setMilestoneFor(e.target.value)}
              className="w-full rounded-lg border border-line bg-panel2 px-3 py-2 text-[13px]"
            >
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </Field>
        )}
        <div className="mt-3">
          <Field label={addOpen === 'milestone' ? 'Milestone name' : 'Topic name'}>
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={addOpen === 'milestone' ? 'e.g. Computer Vision' : 'e.g. Diffusion models'} autoFocus />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
