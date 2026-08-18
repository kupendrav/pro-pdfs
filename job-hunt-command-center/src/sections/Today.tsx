import { useMemo } from 'react';
import { Plus, CalendarCheck2, CheckCircle2, RotateCcw } from 'lucide-react';
import { useStore, tasksForDate } from '../store/useStore';
import { todayStr, isSunday, weekStart } from '../lib/dates';
import { day } from '../lib/stats';
import { fmtDur } from '../lib/time';
import { Card, SectionTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Ring } from '../components/ui/misc';
import { NowCard } from '../components/NowCard';
import { Timeline } from '../components/Timeline';
import { ScoreCard, StreaksCard, QuickStatsCard } from '../components/StatCards';
import { StartDayHero } from '../components/StartDayHero';
import { GuardrailBanners } from '../components/GuardrailBanners';

function SundayBanner() {
  const setSection = useStore((s) => s.setSection);
  const reviews = useStore((s) => s.reviews);
  const ws = weekStart(todayStr());
  const planned = reviews[ws];
  return (
    <Card className="border-acc/25 bg-acc/[0.05] p-4">
      <p className="flex items-center gap-2 text-[13px] font-semibold">
        <CalendarCheck2 size={15} className="text-acc" /> Sunday mode — review, plan, rest
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-mute">
        No application grind today. Close last week honestly, set next week's targets, revise lightly, and protect your
        energy.
      </p>
      <Button variant="soft" size="sm" className="mt-3" onClick={() => setSection('review')}>
        {planned ? 'Open weekly review' : 'Start weekly review'} →
      </Button>
    </Card>
  );
}

function DayCompleteCard() {
  const state = useStore();
  const today = todayStr();
  const session = state.sessions[today];
  const d = useMemo(() => day(state, today), [state, today]);
  const reopen = useStore((s) => s.reopenDay);
  if (!session?.endedAt) return null;
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center gap-6">
        <Ring value={d.score / 100} size={110} stroke={9}>
          <span className="tnum font-mono text-2xl font-bold">{d.score}</span>
          <span className="text-[10px] uppercase tracking-wider text-faint">daily score</span>
        </Ring>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[15px] font-semibold">
            <CheckCircle2 size={16} className="text-ok" /> Day closed — rest well
          </p>
          <p className="mt-1 text-[12.5px] text-mute">
            {fmtDur(d.focusSec)} focused · {d.tasksDone}/{d.tasksTotal} tasks · sleep target{' '}
            {session.review?.sleepTime ?? state.settings.sleep}
          </p>
          {session.review?.improve && (
            <p className="mt-2 rounded-lg border border-line bg-panel2/50 px-3 py-2 text-[12px] italic text-mute">
              Tomorrow, improve: {session.review.improve}
            </p>
          )}
          <button
            onClick={reopen}
            className="mt-3 flex items-center gap-1 text-[11.5px] text-faint underline decoration-dotted transition-colors hover:text-mute"
          >
            <RotateCcw size={11} /> reopen the day
          </button>
        </div>
      </div>
    </Card>
  );
}

export function TodaySection() {
  const state = useStore();
  const today = todayStr();
  const openTaskEditor = useStore((s) => s.openTaskEditor);
  const session = state.sessions[today];
  const tasks = useMemo(() => tasksForDate(state, today), [state, today]);
  const sunday = isSunday(today);

  if (!state.settings.onboarded) return null;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-24 pt-5 lg:px-7 lg:pb-10">
      {!session ? (
        <StartDayHero />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-4">
            {session.endedAt ? (
              <DayCompleteCard />
            ) : (
              <>
                <NowCard />
                <div>
                  <SectionTitle hint="drag to swap times · packing stays fixed">Today's timeline</SectionTitle>
                  <Timeline tasks={tasks} />
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            {sunday && <SundayBanner />}
            {!session.endedAt && <GuardrailBanners />}
            <ScoreCard />
            <QuickStatsCard />
            <StreaksCard />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => openTaskEditor(null, { date: today })}
            >
              <Plus size={14} /> Add ad-hoc task
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
