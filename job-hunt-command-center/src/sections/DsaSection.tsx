import { useMemo, useState } from 'react';
import { Code2, Plus, Flame, Trash2, ExternalLink, CheckCircle2, Filter } from 'lucide-react';
import { useStore } from '../store/useStore';
import { todayStr, prettyDate, addDaysStr } from '../lib/dates';
import { streaks } from '../lib/stats';
import { Card, CardHead, SectionTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Field, Input, Select, Textarea } from '../components/ui/inputs';
import { EmptyState, StatChip, ProgressBar, Badge } from '../components/ui/misc';
import type { Difficulty } from '../types';

const DIFF_COLOR: Record<string, string> = { Easy: '#34d399', Medium: '#fbbf24', Hard: '#f43f5e' };

function QuickLogModal({ open, onClose, date }: { open: boolean; onClose: () => void; date: string }) {
  const addDsa = useStore((s) => s.addDsa);
  const [problem, setProblem] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [topic, setTopic] = useState('Arrays & Hashing');
  const [minutes, setMinutes] = useState('25');
  const [independent, setIndependent] = useState(true);
  const [hints, setHints] = useState(false);
  const [insight, setInsight] = useState('');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');

  const topics = useMemo(() => {
    const set = new Set(useStore.getState().dsaCatalog.map((p) => p.topic));
    return [...set];
  }, []);

  const save = () => {
    if (!problem.trim()) return;
    addDsa({
      date,
      problem: problem.trim(),
      difficulty,
      topic,
      minutes: minutes ? parseInt(minutes, 10) : 0,
      independent,
      hints,
      insight: insight.trim(),
      notes: notes.trim(),
      link: link.trim(),
    });
    setProblem(''); setInsight(''); setNotes(''); setLink('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log today's problem"
      sub="One problem, truly understood — that's the whole target"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={!problem.trim()}>Save solve</Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Problem name">
            <Input value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="e.g. Longest Consecutive Sequence" autoFocus />
          </Field>
          <Field label="Link" hint="optional">
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="leetcode.com/problems/…" />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Difficulty">
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
              {['Easy', 'Medium', 'Hard'].map((d) => <option key={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Topic">
            <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
              {topics.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Time taken (min)">
            <Input value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ''))} inputMode="numeric" />
          </Field>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            onClick={() => setIndependent(!independent)}
            className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-[12.5px] transition-colors ${independent ? 'border-ok/40 bg-ok/[0.07] text-ok' : 'border-line text-mute'}`}
            role="switch" aria-checked={independent}
          >
            Solved independently {independent && <CheckCircle2 size={14} />}
          </button>
          <button
            onClick={() => setHints(!hints)}
            className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-[12.5px] transition-colors ${hints ? 'border-warn/40 bg-warn/[0.07] text-warn' : 'border-line text-mute'}`}
            role="switch" aria-checked={hints}
          >
            Needed hints {hints && <CheckCircle2 size={14} />}
          </button>
        </div>
        <Field label="Main insight" hint="the one thing to remember">
          <Input value={insight} onChange={(e) => setInsight(e.target.value)} placeholder="e.g. use a set for O(1) lookups, check sequence starts only" />
        </Field>
        <Field label="Solution notes" hint="optional">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="approach, complexity, edge cases" />
        </Field>
      </div>
    </Modal>
  );
}

function Catalog() {
  const catalog = useStore((s) => s.dsaCatalog);
  const toggle = useStore((s) => s.toggleCatalogSolved);
  const [topicFilter, setTopicFilter] = useState('all');
  const [hideSolved, setHideSolved] = useState(false);

  const topics = useMemo(() => [...new Set(catalog.map((p) => p.topic))], [catalog]);
  const groups = useMemo(() => {
    const filtered = catalog.filter(
      (p) => (topicFilter === 'all' || p.topic === topicFilter) && (!hideSolved || !p.solved),
    );
    const map = new Map<string, typeof filtered>();
    for (const p of filtered) {
      if (!map.has(p.topic)) map.set(p.topic, [] as typeof filtered);
      map.get(p.topic)!.push(p);
    }
    return [...map.entries()];
  }, [catalog, topicFilter, hideSolved]);

  const solved = catalog.filter((p) => p.solved).length;

  return (
    <Card>
      <CardHead
        title="NeetCode 150 checklist"
        sub={`${solved}/150 solved · auto-checks when you log a matching solve`}
        icon={<Filter size={14} />}
        right={
          <div className="flex items-center gap-2">
            <Select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} className="!w-auto !py-1.5 text-[11.5px]" aria-label="Filter by topic">
              <option value="all">All topics</option>
              {topics.map((t) => <option key={t}>{t}</option>)}
            </Select>
            <Button variant={hideSolved ? 'soft' : 'ghost'} size="sm" onClick={() => setHideSolved((v) => !v)}>
              {hideSolved ? 'show all' : 'hide solved'}
            </Button>
          </div>
        }
      />
      <div className="px-4 pb-2">
        <ProgressBar value={solved / 150} />
      </div>
      <div className="max-h-[560px] space-y-4 overflow-y-auto px-4 pb-4 pt-1">
        {groups.map(([topic, problems]) => (
          <div key={topic}>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
              {topic} <span className="ml-1 font-mono normal-case">{problems.filter((p) => p.solved).length}/{problems.length}</span>
            </p>
            <div className="space-y-1">
              {problems.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] transition-colors hover:bg-panel2/60 ${p.solved ? 'opacity-55' : ''}`}
                  aria-pressed={p.solved}
                >
                  <span
                    className={`grid h-[17px] w-[17px] shrink-0 place-items-center rounded-[5px] border transition-colors ${p.solved ? 'border-ok bg-ok text-white' : 'border-line'}`}
                  >
                    {p.solved && <CheckCircle2 size={10} strokeWidth={2.5} />}
                  </span>
                  <span className={`flex-1 truncate ${p.solved ? 'line-through decoration-faint' : ''}`}>{p.name}</span>
                  <span className="shrink-0 text-[10.5px] font-medium" style={{ color: DIFF_COLOR[p.difficulty] }}>
                    {p.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DsaSection() {
  const state = useStore();
  const deleteDsa = useStore((s) => s.deleteDsa);
  const today = todayStr();
  const [logOpen, setLogOpen] = useState(false);
  const st = useMemo(() => streaks(state), [state]);
  const todayEntry = state.dsa.find((d) => d.date === today);
  const weekCount = state.dsa.filter((d) => d.date >= addDaysStr(today, -6)).length;

  return (
    <div className="mx-auto w-full max-w-[980px] px-4 pb-24 pt-5 lg:px-7 lg:pb-10">
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatChip icon={<Flame size={15} className="text-warn" />} label="DSA streak" value={`${st.dsa.current} days`} sub={`best ${st.dsa.best}`} />
        <StatChip icon={<Code2 size={15} />} label="Solved total" value={state.dsa.length} sub={`${state.dsaCatalog.filter((p) => p.solved).length}/150 in checklist`} />
        <StatChip icon={<Code2 size={15} />} label="Last 7 days" value={`${weekCount}/7`} />
        <StatChip icon={<ExternalLink size={15} />} label="Practice list" value="NeetCode 150" sub="neetcode.io/practice" />
      </div>

      <Card className="mb-4">
        <CardHead
          title={todayEntry ? `Today: ${todayEntry.problem} ✓` : "Today's problem — not logged yet"}
          sub={
            todayEntry
              ? `${todayEntry.difficulty} · ${todayEntry.topic} · ${todayEntry.minutes}m${todayEntry.independent ? ' · solved independently' : ''}`
              : 'One LeetCode problem a day. Understanding beats speed.'
          }
          icon={<Code2 size={14} />}
          right={
            <Button variant={todayEntry ? 'outline' : 'primary'} size="sm" onClick={() => setLogOpen(true)}>
              <Plus size={13} /> {todayEntry ? 'Log another' : 'Log solve'}
            </Button>
          }
        />
        {todayEntry?.insight && (
          <p className="mx-4 mb-4 rounded-lg border border-line bg-panel2/50 px-3 py-2.5 text-[12.5px] italic leading-relaxed text-mute">
            <Badge color="#818cf8">insight</Badge> {todayEntry.insight}
          </p>
        )}
      </Card>

      <SectionTitle hint={`${state.dsa.length} solves logged`}>Recent solves</SectionTitle>
      {state.dsa.length === 0 ? (
        <EmptyState
          icon={<Code2 size={18} />}
          title="No problems logged yet"
          body="Your 5:30 PM block is the moment. Solve one, log it in 30 seconds — the insight field is your future revision gold."
          action={<Button variant="soft" size="sm" onClick={() => setLogOpen(true)}>Log your first solve</Button>}
        />
      ) : (
        <div className="mb-6 space-y-2">
          {state.dsa.slice(0, 15).map((d) => (
            <Card key={d.id} className="group px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-medium">
                    {d.problem}
                    <span className="text-[10.5px] font-semibold" style={{ color: DIFF_COLOR[d.difficulty] }}>{d.difficulty}</span>
                    <span className="text-[10.5px] text-faint">{d.topic}</span>
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-faint">
                    {prettyDate(d.date)} · {d.minutes}m
                    {d.independent ? ' · independent' : ' · with help'}
                    {d.hints ? ' · hints used' : ''}
                  </p>
                  {d.insight && <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-mute">{d.insight}</p>}
                  {d.link && (
                    <a href={d.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11.5px] text-acc hover:underline">
                      <ExternalLink size={10} /> open problem
                    </a>
                  )}
                </div>
                <button
                  onClick={() => deleteDsa(d.id)}
                  className="rounded-md p-1.5 text-faint opacity-0 transition-all hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                  aria-label={`Delete ${d.problem}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Catalog />
      <QuickLogModal open={logOpen} onClose={() => setLogOpen(false)} date={today} />
    </div>
  );
}
