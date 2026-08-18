import {
  LayoutDashboard,
  ListChecks,
  Route,
  BookOpen,
  Code2,
  Briefcase,
  BarChart3,
  CalendarCheck2,
  Settings,
  MoonStar,
} from 'lucide-react';
import type { Section } from '../types';
import { useStore } from '../store/useStore';
import { todayStr } from '../lib/dates';

const NAV: Array<{ id: Section; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'today', label: 'Today', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'roadmap', label: 'Roadmap', icon: Route },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'dsa', label: 'DSA', icon: Code2 },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'review', label: 'Review', icon: CalendarCheck2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const section = useStore((s) => s.ui.section);
  const setSection = useStore((s) => s.setSection);
  const sleep = useStore((s) => s.settings.sleep);
  const session = useStore((s) => s.sessions[todayStr()]);

  return (
    <aside className="hidden w-[218px] shrink-0 flex-col border-r border-line bg-panel/40 lg:flex">
      <div className="flex items-center gap-2.5 px-5 pb-4 pt-5">
        <img src="/favicon.svg" alt="" className="h-7 w-7" />
        <div className="leading-tight">
          <p className="text-[13px] font-semibold tracking-tight">Command Center</p>
          <p className="text-[10.5px] text-faint">Job hunt OS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-2.5" aria-label="Main navigation">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = section === id;
          return (
            <button
              key={id}
              onClick={() => setSection(id)}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-colors ${
                active ? 'bg-acc/12 text-ink' : 'text-mute hover:bg-panel2 hover:text-ink'
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-full bg-acc transition-opacity ${
                  active ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <Icon size={15} className={active ? 'text-acc' : 'text-faint group-hover:text-mute'} />
              {label}
              {id === 'review' && !session?.endedAt && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-acc/60" />}
            </button>
          );
        })}
      </nav>

      <div className="px-4 pb-4 pt-3">
        <div className="rounded-lg border border-line bg-panel2/60 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-mute">
            <MoonStar size={12} className="text-acc" /> Sleep target {sleep}
          </p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-faint">
            Consistency beats intensity. Protect the routine — the job follows.
          </p>
        </div>
      </div>
    </aside>
  );
}

/** Mobile bottom navigation (scrollable icon bar). */
export function MobileNav() {
  const section = useStore((s) => s.ui.section);
  const setSection = useStore((s) => s.setSection);
  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t border-line px-2 py-1.5 lg:hidden"
      aria-label="Main navigation"
    >
      {NAV.map(({ id, label, icon: Icon }) => {
        const active = section === id;
        return (
          <button
            key={id}
            onClick={() => setSection(id)}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
            className={`flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
              active ? 'text-acc' : 'text-faint'
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
