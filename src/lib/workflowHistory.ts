export interface WorkflowRecord {
  id: string;
  toolId: string;
  toolName: string;
  action: string;
  details?: string;
  timestamp: number;
  itemCount?: number;
  status: 'success' | 'warning' | 'error';
}

const STORAGE_KEY = 'toolbox_workflow_history';
const MAX_RECORDS = 40;

export function getWorkflowHistory(): WorkflowRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordWorkflow(entry: Omit<WorkflowRecord, 'id' | 'timestamp'>): WorkflowRecord {
  const newRecord: WorkflowRecord = {
    ...entry,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `wf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
  };

  if (typeof window !== 'undefined') {
    try {
      const history = getWorkflowHistory();
      const updated = [newRecord, ...history].slice(0, MAX_RECORDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('toolbox:workflow_recorded', { detail: newRecord }));
    } catch {
      // Ignore storage quota or disabled errors
    }
  }

  return newRecord;
}

export function clearWorkflowHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('toolbox:workflow_cleared'));
  } catch {
    // Ignore
  }
}
