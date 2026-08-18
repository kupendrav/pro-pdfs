import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Brain, Hammer, BookOpen, Code2, Briefcase, Timer, Trophy, Target } from 'lucide-react';
import { useStore } from '../store/useStore';
import { day, streaks, firstActivityDate, weekDates } from '../lib/stats';
import { addDaysStr, todayStr, weekStart, prettyDate } from '../lib/dates';
import { fmtDur } from '../lib/time';
import { Card, SectionTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatChip } from '../components/ui/misc';

const AXIS = { fontSize: 10, fill: 'rgb(var(--c-faint))' };

function ChartCard({ title, sub, children, height = 240 }: { title: string; sub?: string; children: React.ReactNode; height?: number }) {
  return (
    <Card className="p-4">
      <p className="text-[13px] font-semibold tracking-tight">{title}</p>
      {sub && <p className="mb-2 mt-0.5 text-[11.5px] text-faint">{sub}</p>}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function AnalyticsSection() {
  const state = useStore();
  const [tab, setTab] = useState<'daily' | 'weekly' | 'longterm'>('daily');
  const today = todayStr();

  const last14 = useMemo(() => {
    return Array.from({ length: 14 }, (_, i): string => addDaysStr(today, i - 13)).map((d) => {
      const c = day(state, d);
      return {
        date: d,
        label: prettyDate(d).replace(/^[A-Za-z]{3}, /, ''),
        focusH: Math.round((c.focusSec / 3600) * 10) / 10,
        score: c.score,
        active: c.flags.hasActivity,
      };
    });
  }, [state, today]);

  interface WeekRow {
    label: string;
    ws: string;
    learning: number;
    building: number;
    reading: number;
    dsa: number;
    jobs: number;
    applications: number;
    dsaSolved: number;
  }

  const weeks = useMemo<WeekRow[]>(() => {
    const rows: WeekRow[] = [];
    for (let i = 0; i < 6; i++) {
      const ws = weekStart(addDaysStr(today, -7 * (5 - i)));
      const days = weekDates(ws).filter((d) => d <= today);
      const computed = days.map((d) => day(state, d));
      const cat = (c: string) => computed.reduce((s, x) => s + (x.categoryFocus[c as keyof typeof x.categoryFocus] ?? 0), 0) / 3600;
      rows.push({
        label: prettyDate(ws).replace(/^[A-Za-z]{3}, /, ''),
        ws,
        learning: Math.round(cat('aiml') * 10) / 10,
        building: Math.round(cat('build') * 10) / 10,
        reading: Math.round(cat('book') * 10) / 10,
        dsa: Math.round(cat('dsa') * 10) / 10,
        jobs: Math.round(cat('job') * 10) / 10,
        applications: Object.values(state.jobs).filter((j) => j.dateApplied >= ws && j.dateApplied <= addDaysStr(ws, 6)).length,
        dsaSolved: state.dsa.filter((x) => x.date >= ws && x.date <= addDaysStr(ws, 6)).length,
      });
    }
    return rows;
  }, [state, today]);

  const st = useMemo(() => streaks(state), [state]);
  const weeksTracked = useMemo(() => {
    const first = firstActivityDate(state);
    if (!first) return 1;
    return Math.max(1, Math.ceil((Date.now() - new Date(`${first}T00:00:00`).getTime()) / 604800000));
  }, [state]);
  const totalLearningH =
    Object.values(state.tasks).reduce((s, t) => s + (t.category === 'aiml' ? t.focusSec : 0), 0) / 3600 +
    Object.values(state.tasks).reduce((s, t) => s + (t.category === 'build' ? t.focusSec : 0), 0) / 3600;
  const roadmapDone = state.roadmap.topics.filter((t) => Object.values(t.stages).every(Boolean)).length;
  const avgFocus14 = last14.reduce((s, d) => s + d.focusH, 0) / 14;

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 pb-24 pt-5 lg:px-7 lg:pb-10">
      <div className="mb-4 flex items-center gap-1.5">
        {(['daily', 'weekly', 'longterm'] as const).map((t) => (
          <Button key={t} variant={tab === t ? 'soft' : 'ghost'} size="sm" onClick={() => setTab(t)}>
            {t === 'longterm' ? 'Long-term' : t[0].toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      {tab === 'daily' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Focused hours — last 14 days" sub={`Average ${avgFocus14.toFixed(1)}h · deeper learning beats longer days`}>
            <BarChart data={last14} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid stroke="rgb(var(--c-line))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} unit="h" />
              <RTooltip
                cursor={{ fill: 'rgb(var(--c-acc) / 0.06)' }}
                contentStyle={{ background: 'rgb(var(--c-panel))', border: '1px solid rgb(var(--c-line))', borderRadius: 12, fontSize: 12 }}
              />
              <ReferenceLine y={avgFocus14} stroke="rgb(var(--c-faint))" strokeDasharray="6 4" />
              <Bar dataKey="focusH" name="focus (h)" fill="rgb(var(--c-acc))" radius={[4, 4, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ChartCard>

          <ChartCard title="Daily score — last 14 days" sub="50+ keeps your overall streak alive">
            <LineChart data={last14} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid stroke="rgb(var(--c-line))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} domain={[0, 100]} />
              <RTooltip
                contentStyle={{ background: 'rgb(var(--c-panel))', border: '1px solid rgb(var(--c-line))', borderRadius: 12, fontSize: 12 }}
              />
              <ReferenceLine y={50} stroke="rgb(var(--c-warn) / 0.5)" strokeDasharray="6 4" />
              <Line dataKey="score" name="score" stroke="rgb(var(--c-acc2))" strokeWidth={2} dot={{ r: 2.5, fill: 'rgb(var(--c-acc2))' }} />
            </LineChart>
          </ChartCard>
        </div>
      )}

      {tab === 'weekly' && (
        <div className="grid gap-4">
          <ChartCard title="Hours by area — last 6 weeks" sub="Learning should lead; applications stay contained" height={280}>
            <BarChart data={weeks} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid stroke="rgb(var(--c-line))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} unit="h" />
              <RTooltip
                cursor={{ fill: 'rgb(var(--c-acc) / 0.06)' }}
                contentStyle={{ background: 'rgb(var(--c-panel))', border: '1px solid rgb(var(--c-line))', borderRadius: 12, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="learning" name="Learning" stackId="a" fill="#818cf8" radius={[0, 0, 0, 0]} maxBarSize={34} />
              <Bar dataKey="building" name="Building" stackId="a" fill="#fbbf24" maxBarSize={34} />
              <Bar dataKey="reading" name="Reading" stackId="a" fill="#38bdf8" maxBarSize={34} />
              <Bar dataKey="dsa" name="DSA" stackId="a" fill="#34d399" maxBarSize={34} />
              <Bar dataKey="jobs" name="Applications" stackId="a" fill="#a78bfa" radius={[4, 4, 0, 0]} maxBarSize={34} />
            </BarChart>
          </ChartCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Applications per week" sub="Steady and contained — not a spray">
              <BarChart data={weeks} margin={{ top: 8, right: 8, left: -26, bottom: 0 }}>
                <CartesianGrid stroke="rgb(var(--c-line))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
                <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
                <RTooltip cursor={{ fill: 'rgb(var(--c-acc) / 0.06)' }} contentStyle={{ background: 'rgb(var(--c-panel))', border: '1px solid rgb(var(--c-line))', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="applications" name="applications" fill="#a78bfa" radius={[4, 4, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ChartCard>
            <ChartCard title="DSA problems per week" sub="7/7 is a perfect week">
              <BarChart data={weeks} margin={{ top: 8, right: 8, left: -26, bottom: 0 }}>
                <CartesianGrid stroke="rgb(var(--c-line))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
                <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
                <RTooltip cursor={{ fill: 'rgb(var(--c-acc) / 0.06)' }} contentStyle={{ background: 'rgb(var(--c-panel))', border: '1px solid rgb(var(--c-line))', borderRadius: 12, fontSize: 12 }} />
                <ReferenceLine y={7} stroke="rgb(var(--c-ok) / 0.5)" strokeDasharray="6 4" />
                <Bar dataKey="dsaSolved" name="solved" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ChartCard>
          </div>
        </div>
      )}

      {tab === 'longterm' && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatChip icon={<Brain size={15} />} label="Learning + building" value={`${totalLearningH.toFixed(1)}h`} sub="all time" />
            <StatChip icon={<Code2 size={15} />} label="DSA solved" value={state.dsa.length} sub={`${state.dsaCatalog.filter((p) => p.solved).length}/150 checklist`} />
            <StatChip icon={<Briefcase size={15} />} label="Applications" value={Object.keys(state.jobs).length} sub={`${Object.values(state.jobs).filter((j) => ['assessment', 'interview', 'technical', 'hr', 'offer'].includes(j.status)).length} reached interviews`} />
            <StatChip icon={<BookOpen size={15} />} label="Book topics" value={state.books.length} sub={`${state.books.filter((b) => b.canExplain).length} can explain`} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatChip icon={<Trophy size={15} />} label="Best streaks" value={`${st.overall.best} days`} sub={`overall · DSA ${st.dsa.best}`} />
            <StatChip icon={<Target size={15} />} label="Roadmap" value={`${roadmapDone}/${state.roadmap.topics.length}`} sub="topics complete" />
            <StatChip icon={<Timer size={15} />} label="Total focus" value={fmtDur(Object.values(state.tasks).reduce((s, t) => s + t.focusSec, 0))} sub="all time" />
            <StatChip icon={<Hammer size={15} />} label="Weeks tracked" value={weeksTracked} sub="keep showing up" />
          </div>
          <Card className="mt-4 p-4">
            <p className="text-[12px] leading-relaxed text-mute">
              <strong className="text-ink">Reading these charts:</strong> if Learning bars shrink while Applications grow,
              rebalance — skills win jobs. If DSA flatlines, shrink the problem difficulty, not the habit. Score trend
              dipping with high focus hours? You're working on the wrong weights — check the breakdown on Today.
            </p>
          </Card>
        </>
      )}

      <div className="mt-6">
        <SectionTitle>Decision guide</SectionTitle>
        <Card className="p-4 text-[12px] leading-relaxed text-mute">
          Every chart here answers one question: <span className="text-ink">"What should I change this week?"</span> No
          vanity metrics, no hour-shaming. A calm 6 focused hours with DSA + reading done beats a chaotic 12.
        </Card>
      </div>
    </div>
  );
}
