import { useEffect, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, CalendarDays, ListChecks } from 'lucide-react';
import { useStore, tasksForDate } from '../store/useStore';
import { addDaysStr, prettyDateLong, todayStr, isToday, isSunday } from '../lib/dates';
import { Timeline } from '../components/Timeline';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/misc';
import { day } from '../lib/stats';

export function TasksSection() {
  const state = useStore();
  const date = state.ui.taskDate;
  const setTaskDate = useStore((s) => s.setTaskDate);
  const ensureDay = useStore((s) => s.ensureDay);
  const openTaskEditor = useStore((s) => s.openTaskEditor);

  // materialize a day the first time it is viewed
  useEffect(() => {
    ensureDay(date);
  }, [date, ensureDay]);

  const tasks = useMemo(() => tasksForDate(state, date), [state, date]);
  const d = useMemo(() => day(state, date), [state, date]);
  const scored = tasks.filter((t) => t.category !== 'break' && t.status !== 'moved');

  return (
    <div className="mx-auto w-full max-w-[980px] px-4 pb-24 pt-5 lg:px-7 lg:pb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setTaskDate(addDaysStr(date, -1))} aria-label="Previous day">
            <ChevronLeft size={15} />
          </Button>
          <div className="min-w-[190px] text-center">
            <p className="text-[14.5px] font-semibold tracking-tight">{prettyDateLong(date)}</p>
            <p className="text-[11px] text-faint">
              {isToday(date) ? 'Today' : isSunday(date) ? 'Sunday — light mode' : 'Weekday'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setTaskDate(addDaysStr(date, 1))} aria-label="Next day">
            <ChevronRight size={15} />
          </Button>
          <Button variant={isToday(date) ? 'soft' : 'ghost'} size="sm" onClick={() => setTaskDate(todayStr())}>
            <CalendarDays size={13} /> Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {scored.length > 0 && (
            <span className="tnum rounded-full border border-line bg-panel px-3 py-1 font-mono text-[11px] text-mute">
              {d.tasksDone}/{d.tasksTotal} done · score {d.score}
            </span>
          )}
          <Button variant="primary" size="sm" onClick={() => openTaskEditor(null, { date })}>
            <Plus size={13} /> Add task
          </Button>
        </div>
      </div>

      <Card className="p-4">
        {tasks.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={18} />}
            title="No tasks for this day"
            body="This day hasn't been generated from your schedule yet — add a task or open it from Today."
            action={
              <Button variant="soft" size="sm" onClick={() => ensureDay(date)}>
                Generate from schedule
              </Button>
            }
          />
        ) : (
          <Timeline tasks={tasks} />
        )}
      </Card>
    </div>
  );
}
