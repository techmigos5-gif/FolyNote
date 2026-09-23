import { supabase } from '../lib/supabase';
import { TaskItem } from '../types';

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  notes: string;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

function rowToTask(r: TaskRow): TaskItem {
  return {
    id: r.id,
    title: r.title,
    notes: r.notes,
    column: (r.status as TaskItem['column']) || 'backlog',
    priority: (r.priority as TaskItem['priority']) || 'medium',
    dueDate: r.due_date ?? undefined,
    completedAt: r.completed_at,
    createdAt: r.created_at,
  };
}

function taskToRow(task: TaskItem, userId: string) {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    notes: task.notes,
    status: task.column,
    priority: task.priority,
    due_date: task.dueDate ?? null,
    completed_at: task.completedAt ?? null,
    created_at: task.createdAt,
  };
}

export const tasksApi = {
  async listAll(): Promise<TaskItem[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Load tasks failed: ${error.message}`);
    return (data ?? []).map(rowToTask);
  },

  async upsert(task: TaskItem, userId: string): Promise<boolean> {
    const { error } = await supabase.from('tasks').upsert(taskToRow(task, userId));
    if (error) {
      console.warn('tasks.upsert failed:', error.message);
      return false;
    }
    return true;
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.warn('tasks.remove failed:', error.message);
      return false;
    }
    return true;
  },
};
