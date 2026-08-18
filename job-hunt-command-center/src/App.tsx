import { useEffect, lazy, Suspense } from 'react';
import { useStore } from './store/useStore';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Sidebar, MobileNav } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Toasts } from './components/Toasts';
import { FocusOverlay, FocusCompleteDialog, FocusWatcher } from './components/FocusOverlay';
import { TaskEditModal } from './components/TaskEditModal';
import { TodaySection } from './sections/Today';
import { TasksSection } from './sections/TasksSection';
import { RoadmapSection } from './sections/RoadmapSection';
import { BooksSection } from './sections/BooksSection';
import { DsaSection } from './sections/DsaSection';
import { JobsSection } from './sections/JobsSection';
const AnalyticsSection = lazy(() => import('./sections/AnalyticsSection').then((m) => ({ default: m.AnalyticsSection })));
import { ReviewSection } from './sections/ReviewSection';
import { SettingsSection } from './sections/SettingsSection';
import { Onboarding } from './sections/Onboarding';
import { todayStr } from './lib/dates';

export default function App() {
  useTheme();
  useKeyboardShortcuts();
  const section = useStore((s) => s.ui.section);
  const onboarded = useStore((s) => s.settings.onboarded);
  const ensureDay = useStore((s) => s.ensureDay);

  // Generate today's plan on load (and after midnight if the app stays open).
  useEffect(() => {
    if (!onboarded) return;
    ensureDay(todayStr());
    const iv = setInterval(() => {
      if (!useStore.getState().settings.onboarded) return;
      ensureDay(todayStr());
    }, 60_000);
    const onVisible = () => document.visibilityState === 'visible' && ensureDay(todayStr());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [onboarded, ensureDay]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [section]);

  if (!onboarded) {
    return (
      <>
        <Onboarding />
        <Toasts />
      </>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1" aria-live="off">
          {section === 'today' && <TodaySection />}
          {section === 'tasks' && <TasksSection />}
          {section === 'roadmap' && <RoadmapSection />}
          {section === 'books' && <BooksSection />}
          {section === 'dsa' && <DsaSection />}
          {section === 'jobs' && <JobsSection />}
          {section === 'analytics' && (
            <Suspense fallback={<div className="p-10 text-center text-[12px] text-faint">Loading analytics…</div>}>
              <AnalyticsSection />
            </Suspense>
          )}
          {section === 'review' && <ReviewSection />}
          {section === 'settings' && <SettingsSection />}
        </main>
      </div>

      <MobileNav />
      <FocusWatcher />
      <FocusOverlay />
      <FocusCompleteDialog />
      <TaskEditModal />
      <Toasts />
    </div>
  );
}
