import { useMemo, useState } from 'react';
import { CalendarCheck2, Save, Sparkles, TrendingUp, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { day, summarizeWeek, streaks, weekDates } from '../lib/stats';
import { addDaysStr, todayStr, weekStart, prettyDate, prettyDateLong, isSunday } from '../lib/dates';
import { Card, CardHead, SectionTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field, Input, Textarea } from '../components/ui/inputs';
import { Badge } from '../components/ui/misc';
import type { WeeklyReview, WeekTargets } from '../types';

const defaultTargets = (dsa: number, apps: number): WeekTargets => ({
  aimlTopics: 5,
  bookTopics: 6,
  projects: 1,
  dsa,
  applications: apps * 6,
  personal: [],
});

export function ReviewSection() {
  const state = useStore();
  const saveWeeklyReview = useStore((s) => s.saveWeeklyReview);
  const generateNextWeek = useStore((s) => s.generateNextWeek);
  const toast = useStore((s) => s.toast);
  const today = todayStr();
  const thisWeekStart = weekStart(today);
  const nextWeekStart = addDaysStr(thisWeekStart, 7);
  const [weekOffset, setWeekOffset] = useState(0);

  const ws = addDaysStr(thisWeekStart, 7 * weekOffset);
  const isCurrentWeek = ws === thisWeekStart;
  const dates = useMemo(() => weekDates(ws).filter((d) => d <= today || !isCurrentWeek), [ws, today, isCurrentWeek]);
  const computed = useMemo(() => dates.map((d) => day(state, d)), [state, dates]);
  const sum = useMemo(() => summarizeWeek(computed), [computed]);

  const dsaSolved = state.dsa.filter((d) => d.date >= ws && d.date <= addDaysStr(ws, 6)).length;
  const apps = Object.values(state.jobs).filter((j) => j.dateApplied >= ws && j.dateApplied <= addDaysStr(ws, 6)).length;
  const interviews = Object.values(state.jobs).filter(
    (j) => ['assessment', 'interview', 'technical', 'hr', 'offer'].includes(j.status) && j.dateApplied >= ws,
  ).length;
  const sleepTimes = dates
    .map((d) => state.sessions[d]?.review?.sleepTime)
    .filter((x): x is string => Boolean(x));
  const dsaTarget = state.settings.targets.dsaCount * 6;
  const appsTarget = state.settings.targets.applications * 6;

  const st = useMemo(() => streaks(state), [state]);

  // form (always for NEXT week's plan; review fields for the viewed week)
  const existing: WeeklyReview | undefined = state.reviews[nextWeekStart];
  const [win, setWin] = useState('');
  const [problem, setProblem] = useState('');
  const [change, setChange] = useState('');
  const [targets, setTargets] = useState<WeekTargets>(defaultTargets(state.settings.targets.dsaCount, state.settings.targets.applications));
  const [personal, setPersonal] = useState('');
  const [seeded, setSeeded] = useState(false);
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);

  if (!seeded && existing) {
    setSeeded(true);
    setWin(existing.win); setProblem(existing.problem); setChange(existing.change); setTargets(existing.targets);
  }

  const stats: Array<[string, string, string?]> = [
    ['Learning', `${sum.learningH.toFixed(1)}h`],
    ['Building', `${sum.buildingH.toFixed(1)}h`],
    ['Reading', `${sum.readingH.toFixed(1)}h`],
    ['DSA', `${dsaSolved}/${dsaTarget || 6}`],
    ['Applications', `${apps}`, `target ${appsTarget}`],
    ['Interviews', `${interviews}`],
    ['Avg focus / day', `${sum.avgFocusH.toFixed(1)}h`],
    ['Avg score', `${Math.round(sum.avgScore)}`],
    ['Tasks completed', `${Math.round(sum.completion * 100)}%`],
    ['Sleep declared', sleepTimes.length > 0 ? `${sleepTimes.length}/7 nights` : '—'],
  ];

  const generate = () => {
    const personalList = personal.split('\n').map((x) => x.trim()).filter(Boolean);
    generateNextWeek(
      { weekStart: nextWeekStart, win, problem, change, targets: { ...targets, personal: personalList }, savedAt: Date.now() },
      personalList,
    );
    toast(`Week of ${prettyDate(nextWeekStart)} is planned. Rest well on Sunday.`, 'success');
  };

  const pastReviews = Object.values(state.reviews).sort((a, b) => b.weekStart.localeCompare(a.weekStart));

  return (
    <div className="mx-auto w-full max-w-[980px] px-4 pb-24 pt-5 lg:px-7 lg:pb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Weekly Review</h1>
          <p className="mt-0.5 text-[12.5px] text-mute">
            {prettyDateLong(ws)} → {prettyDate(addDaysStr(ws, 6))}
            {isCurrentWeek && isSunday(today) && ' · Sunday is planning day'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset((o) => o - 1)}>←</Button>
          <Button variant={weekOffset === 0 ? 'soft' : 'ghost'} size="sm" onClick={() => setWeekOffset(0)}>This week</Button>
          <Button variant="ghost" size="sm" disabled={weekOffset >= 0} onClick={() => setWeekOffset((o) => Math.min(0, o + 1))}>→</Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {stats.map(([label, value, sub]) => (
          <div key={label} className="rounded-xl border border-line bg-panel px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-faint">{label}</p>
            <p className="tnum mt-0.5 font-mono text-[15px] font-semibold">{value}</p>
            {sub && <p className="text-[10px] text-faint">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead title="Close the week honestly" sub="Three lines, no essays" icon={<TrendingUp size={14} />} />
          <div className="space-y-3 px-4 pb-4">
            <Field label="Biggest win">
              <Textarea value={win} onChange={(e) => setWin(e.target.value)} rows={2} placeholder="What made you proud?" />
            </Field>
            <Field label="Biggest problem">
              <Textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={2} placeholder="What kept breaking?" />
            </Field>
            <Field label="What to change next week">
              <Textarea value={change} onChange={(e) => setChange(e.target.value)} rows={2} placeholder="One system change, not a guilt trip" />
            </Field>
            <Button variant="outline" size="sm" onClick={() => { saveWeeklyReview({ weekStart: nextWeekStart, win, problem, change, targets, savedAt: Date.now() }); toast('Review saved.', 'success'); }}>
              <Save size={13} /> Save review
            </Button>
          </div>
        </Card>

        <Card>
          <CardHead
            title={`Plan week of ${prettyDate(nextWeekStart)}`}
            sub="Targets the dashboard will hold you to"
            icon={<Sparkles size={14} />}
          />
          <div className="space-y-3 px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="AI/ML topics">
                <Input type="number" min={0} value={targets.aimlTopics} onChange={(e) => setTargets((t) => ({ ...t, aimlTopics: +e.target.value }))} />
              </Field>
              <Field label="Book topics">
                <Input type="number" min={0} value={targets.bookTopics} onChange={(e) => setTargets((t) => ({ ...t, bookTopics: +e.target.value }))} />
              </Field>
              <Field label="Projects / builds">
                <Input type="number" min={0} value={targets.projects} onChange={(e) => setTargets((t) => ({ ...t, projects: +e.target.value }))} />
              </Field>
              <Field label="DSA problems">
                <Input type="number" min={0} value={targets.dsa} onChange={(e) => setTargets((t) => ({ ...t, dsa: +e.target.value }))} />
              </Field>
              <Field label="Applications">
                <Input type="number" min={0} value={targets.applications} onChange={(e) => setTargets((t) => ({ ...t, applications: +e.target.value }))} />
              </Field>
            </div>
            <Field label="Important personal tasks" hint="one per line">
              <Textarea value={personal} onChange={(e) => setPersonal(e.target.value)} rows={3} placeholder={'Renew ID\nDentist appointment'} />
            </Field>
            <Button variant="primary" onClick={generate}>
              <CalendarCheck2 size={14} /> Generate next week's plan
            </Button>
            <p className="text-[11px] leading-relaxed text-faint">
              Generates the schedule from your template for all 7 days and spreads personal tasks across weekdays —
              editable anytime in Tasks.
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <SectionTitle hint={`${pastReviews.length} saved`}>Review history</SectionTitle>
        {pastReviews.length === 0 ? (
          <Card className="p-4 text-[12.5px] text-faint">
            No saved reviews yet. Streak snapshot for now — Overall {st.overall.current}d (best {st.overall.best}) · DSA{' '}
            {st.dsa.current}d · Learning {st.learning.current}d.
          </Card>
        ) : (
          <div className="space-y-2">
            {pastReviews.map((r) => (
              <Card key={r.weekStart}>
                <button className="flex w-full items-center gap-3 px-4 py-3 text-left" onClick={() => setHistoryOpen(historyOpen === r.weekStart ? null : r.weekStart)} aria-expanded={historyOpen === r.weekStart}>
                  <ChevronDown size={14} className={`text-faint transition-transform ${historyOpen === r.weekStart ? 'rotate-180' : ''}`} />
                  <span className="flex-1 text-[13px] font-medium">Week of {prettyDate(r.weekStart)}</span>
                  <Badge color="#818cf8">{r.targets.dsa} DSA · {r.targets.applications} apps</Badge>
                </button>
                {historyOpen === r.weekStart && (
                  <div className="space-y-2 border-t border-line px-4 py-3 text-[12.5px] leading-relaxed text-mute">
                    {r.win && <p><span className="font-semibold text-ok">Win:</span> {r.win}</p>}
                    {r.problem && <p><span className="font-semibold text-warn">Problem:</span> {r.problem}</p>}
                    {r.change && <p><span className="font-semibold text-acc">Change:</span> {r.change}</p>}
                    {r.targets.personal.length > 0 && (
                      <p className="flex flex-wrap gap-1.5 pt-1">
                        {r.targets.personal.map((p, i) => <Badge key={i}>{p}</Badge>)}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
