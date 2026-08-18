import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Field, Input, Select, Textarea } from './ui/inputs';
import { CATEGORY_META, PRIORITY_META } from '../lib/defaults';
import { useStore } from '../store/useStore';
import type { Category, Priority, Task } from '../types';
import { addDaysStr, todayStr } from '../lib/dates';
import { Trash2, Lock } from 'lucide-react';

const CATEGORIES: Category[] = ['aiml', 'build', 'revision', 'book', 'dsa', 'job', 'admin', 'personal', 'packing', 'break'];

/** Create / edit a task. One modal, everything editable, time optional. */
export function TaskEditModal() {
  const editingId = useStore((s) => s.ui.editingTaskId);
  const preset = useStore((s) => s.ui.newTaskPreset);
  const tasks = useStore((s) => s.tasks);
  const close = useStore((s) => s.closeTaskEditor);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const toast = useStore((s) => s.toast);

  const existing: Task | null = editingId ? tasks[editingId] : null;
  const open = editingId !== null || preset !== null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('personal');
  const [priority, setPriority] = useState<Priority>('normal');
  const [date, setDate] = useState(todayStr());
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [notes, setNotes] = useState('');
  const [seeded, setSeeded] = useState(false);

  // seed form when target changes
  if (open && !seeded) {
    setSeeded(true);
    const base = existing ?? preset ?? null;
    setTitle(base?.title ?? '');
    setCategory(base?.category ?? 'personal');
    setPriority(base?.priority ?? 'normal');
    setDate(base?.date ?? todayStr());
    setStart(base?.start ?? '');
    setEnd(base?.end ?? '');
    setNotes(base?.notes ?? '');
  }
  if (!open && seeded) setSeeded(false);

  const save = () => {
    if (!title.trim()) {
      toast('Give the task a short title.', 'warn');
      return;
    }
    if (existing) {
      updateTask(existing.id, { title: title.trim(), category, priority, date, start, end, notes });
      toast('Task updated.', 'success');
    } else {
      addTask({ title: title.trim(), category, priority, date, start, end, notes });
      toast('Task added.', 'success');
    }
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={existing ? 'Edit task' : 'New task'}
      sub={existing?.fixed ? 'Fixed responsibility — times are protected' : 'Ad-hoc task · leave times empty for "anytime"'}
      footer={
        <>
          {existing && !existing.fixed && (
            <Button variant="ghost" className="mr-auto text-danger hover:text-danger" onClick={() => { deleteTask(existing.id); close(); }}>
              <Trash2 size={13} /> Delete
            </Button>
          )}
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save}>
            {existing ? 'Save' : 'Add task'}
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <Field label="Title">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Transformers — attention from scratch"
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_META[c].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {Object.entries(PRIORITY_META).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start" hint="optional">
            <Input
              type="time"
              value={start}
              disabled={existing?.fixed}
              onChange={(e) => setStart(e.target.value)}
            />
          </Field>
          <Field label="End" hint="optional">
            <Input
              type="time"
              value={end}
              disabled={existing?.fixed}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Field>
        </div>
        {existing?.fixed && (
          <p className="flex items-center gap-1.5 rounded-lg border border-warn/25 bg-warn/10 px-3 py-2 text-[11.5px] text-warn">
            <Lock size={12} /> The packing block is fixed — change it in Settings → Packing.
          </p>
        )}
        <Field label="Notes" hint="short is fine">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Outcome, link, or reminder" />
        </Field>
        <div className="flex gap-2 text-[11px] text-faint">
          <button className="underline decoration-dotted hover:text-mute" onClick={() => setDate(addDaysStr(date, 1))}>
            push to tomorrow
          </button>
        </div>
      </div>
    </Modal>
  );
}
