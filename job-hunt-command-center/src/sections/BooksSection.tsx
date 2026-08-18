import { useMemo, useState } from 'react';
import { BookOpen, Plus, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { todayStr, prettyDate, addDaysStr } from '../lib/dates';
import { Card, CardHead, SectionTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Field, Input, Textarea, Toggle } from '../components/ui/inputs';
import { EmptyState, StatChip, Badge } from '../components/ui/misc';

function LogModal({ open, onClose, date }: { open: boolean; onClose: () => void; date: string }) {
  const addBook = useStore((s) => s.addBook);
  const [book, setBook] = useState('');
  const [topic, setTopic] = useState('');
  const [pages, setPages] = useState('');
  const [keyConcepts, setKeyConcepts] = useState('');
  const [learned, setLearned] = useState('');
  const [notes, setNotes] = useState('');
  const [canExplain, setCanExplain] = useState(false);

  const save = () => {
    if (!topic.trim()) return;
    addBook({
      date,
      book: book.trim() || 'Unnamed book',
      topic: topic.trim(),
      pages: pages ? parseInt(pages, 10) : null,
      keyConcepts: keyConcepts.trim(),
      learned: learned.trim(),
      notes: notes.trim(),
      canExplain,
    });
    setTopic(''); setPages(''); setKeyConcepts(''); setLearned(''); setNotes(''); setCanExplain(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log a reading session"
      sub="One meaningful topic — short notes beat long notes"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={!topic.trim()}>Save topic</Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Book">
            <Input value={book} onChange={(e) => setBook(e.target.value)} placeholder="e.g. Hands-On ML" />
          </Field>
          <Field label="Pages read" hint="optional">
            <Input value={pages} onChange={(e) => setPages(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="12" />
          </Field>
        </div>
        <Field label="Chapter / topic">
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Ch. 4 — Training Models" autoFocus />
        </Field>
        <Field label="Key concepts" hint="2–3 bullets max">
          <Input value={keyConcepts} onChange={(e) => setKeyConcepts(e.target.value)} placeholder="regularization tradeoff, early stopping" />
        </Field>
        <Field label="What I learned" hint="one sentence">
          <Textarea value={learned} onChange={(e) => setLearned(e.target.value)} rows={2} placeholder="In my own words…" />
        </Field>
        <Field label="Notes" hint="optional">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </Field>
        <div className="flex items-center justify-between rounded-lg border border-line bg-panel2/50 px-3 py-2.5">
          <span className="text-[12.5px] text-mute">I can explain this without opening the book</span>
          <Toggle checked={canExplain} onChange={setCanExplain} label="Can explain without the book" />
        </div>
      </div>
    </Modal>
  );
}

export function BooksSection() {
  const state = useStore();
  const deleteBook = useStore((s) => s.deleteBook);
  const today = todayStr();
  const [logOpen, setLogOpen] = useState(false);

  const todayEntries = state.books.filter((b) => b.date === today);
  const weekStartStr = addDaysStr(today, -6);
  const weekEntries = state.books.filter((b) => b.date >= weekStartStr);
  const booksAgg = useMemo(() => {
    const m = new Map<string, { topics: number; pages: number; last: string; explains: number }>();
    for (const b of state.books) {
      const cur = m.get(b.book) ?? { topics: 0, pages: 0, last: b.date, explains: 0 };
      cur.topics += 1;
      cur.pages += b.pages ?? 0;
      if (b.date > cur.last) cur.last = b.date;
      if (b.canExplain) cur.explains += 1;
      m.set(b.book, cur);
    }
    return [...m.entries()].sort((a, b) => b[1].last.localeCompare(a[1].last));
  }, [state.books]);

  return (
    <div className="mx-auto w-full max-w-[980px] px-4 pb-24 pt-5 lg:px-7 lg:pb-10">
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatChip icon={<BookOpen size={15} />} label="Today" value={todayEntries.length > 0 ? `${todayEntries.length} topic ✓` : 'pending'} sub="target: 1 meaningful topic" />
        <StatChip icon={<Sparkles size={15} />} label="This week" value={`${weekEntries.length} topics`} />
        <StatChip icon={<CheckCircle2 size={15} />} label="Can explain" value={`${state.books.filter((b) => b.canExplain).length}/${state.books.length || 0}`} sub="without the book" />
        <StatChip icon={<BookOpen size={15} />} label="Books" value={booksAgg.length} sub={`${state.books.reduce((s, b) => s + (b.pages ?? 0), 0)} pages total`} />
      </div>

      <Card className="mb-4">
        <CardHead
          title={todayEntries.length > 0 ? "Today's reading — done ✓" : 'Read one meaningful topic today'}
          sub={todayEntries.length > 0 ? todayEntries.map((b) => `${b.book} · ${b.topic}`).join('  ·  ') : 'Sumatra PDF open, one topic, truly understood.'}
          icon={<BookOpen size={14} />}
          right={
            <Button variant="primary" size="sm" onClick={() => setLogOpen(true)}>
              <Plus size={13} /> Log topic
            </Button>
          }
        />
      </Card>

      <SectionTitle hint={`${state.books.length} entries`}>Reading log</SectionTitle>
      {state.books.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={18} />}
          title="No reading sessions yet"
          body="After your 2:00 PM book block, log the topic in 30 seconds. Concise notes only — the goal is understanding, not transcription."
          action={<Button variant="soft" size="sm" onClick={() => setLogOpen(true)}>Log your first topic</Button>}
        />
      ) : (
        <div className="space-y-2">
          {state.books.slice(0, 30).map((b) => (
            <Card key={b.id} className="group px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-medium">
                    {b.topic}
                    {b.canExplain && <Badge color="#34d399">can explain</Badge>}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-faint">
                    {b.book} · {prettyDate(b.date)}
                    {b.pages ? ` · ${b.pages} pages` : ''}
                  </p>
                  {(b.keyConcepts || b.learned) && (
                    <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-mute">
                      {b.learned || b.keyConcepts}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteBook(b.id)}
                  className="rounded-md p-1.5 text-faint opacity-0 transition-all hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                  aria-label={`Delete ${b.topic}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {booksAgg.length > 0 && (
        <>
          <div className="mt-6" />
          <SectionTitle>Books</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {booksAgg.map(([name, s]) => (
              <Card key={name} className="px-4 py-3">
                <p className="text-[13px] font-semibold tracking-tight">{name}</p>
                <p className="mt-1 text-[11.5px] text-mute">
                  {s.topics} topics · {s.pages} pages · {s.explains} explainable
                </p>
              </Card>
            ))}
          </div>
        </>
      )}

      <LogModal open={logOpen} onClose={() => setLogOpen(false)} date={today} />
    </div>
  );
}
