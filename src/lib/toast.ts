export type ToastKind = 'success' | 'info' | 'error';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();
let nextId = 1;

function emit() {
  for (const l of listeners) l([...toasts]);
}

/** Fire a global toast notification (rendered by <ToastHost/>). */
export function toast(message: string, kind: ToastKind = 'info'): void {
  const t: Toast = { id: nextId++, kind, message };
  toasts = [...toasts, t];
  emit();
  window.setTimeout(() => dismiss(t.id), 4200);
}

export function dismiss(id: number): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener([...toasts]);
  return () => listeners.delete(listener);
}
