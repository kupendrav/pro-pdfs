import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { currentTask, nextTask } from '../lib/guardrails';

function isTyping(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
  );
}

/**
 * Global keyboard shortcuts. Never fire while typing; Esc always works.
 *   d → Today   t → Tasks   j → Jobs   a → Analytics   r → Roadmap
 *   n → focus next task   f → toggle focus overlay   Space → start/pause focus
 *   Esc → close overlays/modals
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const store = useStore.getState();
      if (e.key === 'Escape') {
        if (store.ui.focusOverlay) {
          store.setFocusOverlay(false);
          e.preventDefault();
        }
        return;
      }
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

      const k = e.key.toLowerCase();
      if (k === ' ') {
        const f = store.focus;
        if (f) {
          e.preventDefault();
          if (f.running) store.pauseFocus();
          else store.resumeFocus();
        }
        return;
      }
      if (e.repeat) return;
      switch (k) {
        case 'd':
          store.setSection('today');
          break;
        case 't':
          store.setSection('tasks');
          break;
        case 'j':
          store.setSection('jobs');
          break;
        case 'a':
          store.setSection('analytics');
          break;
        case 'r':
          store.setSection('roadmap');
          break;
        case 'f': {
          if (store.focus) store.setFocusOverlay(!store.ui.focusOverlay);
          else {
            const cur = currentTask(store) ?? nextTask(store);
            if (cur && cur.category !== 'break') {
              store.startFocus({ taskId: cur.id });
              store.setFocusOverlay(true);
            }
          }
          break;
        }
        case 'n': {
          const nx = nextTask(store);
          if (nx) {
            store.toast(`Next → ${nx.title} at ${nx.start}`, 'default');
            store.setSection('today');
          }
          break;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
