import { useMemo, useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Field, Input, Textarea } from './ui/inputs';
import { Ring } from './ui/misc';
import { useStore } from '../store/useStore';
import { todayStr } from '../lib/dates';
import { day } from '../lib/stats';
import { fmtDur } from '../lib/time';
import { chime } from '../lib/sound';

export function EndDayModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const today = todayStr();
  const session = useStore((s) => s.sessions[today]);
  const state = useStore();
  const endDay = useStore((s) => s.endDay);
  const settings = useStore((s) => s.settings);
  const [wentWell, setWell] = useState('');
  const [wentWrong, setWrong] = useState('');
  const [improve, setImprove] = useState('');
  const [sleepTime, setSleep] = useState(settings.sleep);

  const d = useMemo(() => day(state, today), [state, today, open]);

  if (!session || session.endedAt) return null;

  const closeDay = () => {
    endDay({ wentWell, wentWrong, improve, sleepTime });
    if (settings.sound) chime();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Close your day"
      sub="Two honest minutes — then rest. Tomorrow is another consistent day."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Not yet
          </Button>
          <Button variant="primary" onClick={closeDay}>
            Log out & close day
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-5 rounded-xl border border-line bg-panel2/50 p-4">
          <Ring value={d.score / 100} size={92} stroke={8}>
            <span className="tnum font-mono text-xl font-bold">{d.score}</span>
            <span className="text-[10px] uppercase tracking-wider text-faint">score</span>
          </Ring>
          <div className="min-w-0 flex-1 space-y-1.5">
            {d.breakdown.map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-2 text-[11.5px]">
                <span className="truncate text-mute">
                  {c.label} <span className="text-faint">· {Math.round(c.weight * 100)}%</span>
                </span>
                <span className="tnum font-mono font-semibold">{Math.round(c.value * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg border border-line bg-panel2/50 px-2 py-2.5">
            <p className="tnum font-mono text-[15px] font-semibold">{fmtDur(d.focusSec)}</p>
            <p className="text-[10.5px] text-faint">focus time</p>
          </div>
          <div className="rounded-lg border border-line bg-panel2/50 px-2 py-2.5">
            <p className="tnum font-mono text-[15px] font-semibold">
              {d.tasksDone}/{d.tasksTotal}
            </p>
            <p className="text-[10.5px] text-faint">tasks done</p>
          </div>
        </div>

        <div className="space-y-3">
          <Field label="What went well?">
            <Textarea value={wentWell} onChange={(e) => setWell(e.target.value)} placeholder="One honest line is enough" rows={2} />
          </Field>
          <Field label="What didn't?">
            <Textarea value={wentWrong} onChange={(e) => setWrong(e.target.value)} placeholder="No judgment — just facts" rows={2} />
          </Field>
          <Field label="What should you improve tomorrow?">
            <Textarea value={improve} onChange={(e) => setImprove(e.target.value)} placeholder="One small change" rows={2} />
          </Field>
          <Field label="Actual sleep time tonight" hint="protect the routine">
            <Input type="time" value={sleepTime} onChange={(e) => setSleep(e.target.value)} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
