import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Plus, CheckCircle, Circle } from 'lucide-react';
import {
  subscribeTasks,
  createTask,
  updateTask,
  type Task,
} from '@fleetrentals/shared';

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: format(new Date(), 'yyyy-MM-dd'), priority: 'medium' as const });

  useEffect(() => subscribeTasks(setTasks), []);

  const handleAdd = async () => {
    if (!form.title) return;
    await createTask({
      title: form.title,
      description: form.description,
      dueDate: form.dueDate,
      status: 'pending',
      priority: form.priority,
      createdAt: Date.now(),
    });
    setShowForm(false);
    setForm({ title: '', description: '', dueDate: format(new Date(), 'yyyy-MM-dd'), priority: 'medium' });
  };

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    await updateTask(task.id, { status: newStatus });
  };

  const pending = tasks.filter((t) => t.status !== 'done');
  const done = tasks.filter((t) => t.status === 'done');

  const priorityColor = { low: 'text-slate-400', medium: 'text-yellow-400', high: 'text-red-400' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={18} /> Add Task
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-bold">New Task</h3>
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Clean vehicle, schedule service..." />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Due Date</label>
              <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as 'low' | 'medium' | 'high' })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="btn-primary">Save Task</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-bold mb-3">Pending ({pending.length})</h3>
        <div className="space-y-2">
          {pending.map((task) => (
            <div key={task.id} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-xl">
              <button onClick={() => toggleTask(task)} className="mt-0.5">
                <Circle size={20} className="text-slate-400" />
              </button>
              <div className="flex-1">
                <p className="font-medium">{task.title}</p>
                {task.description && <p className="text-sm text-slate-400">{task.description}</p>}
                <div className="flex gap-3 mt-1 text-xs">
                  <span className="text-slate-500">Due: {format(new Date(task.dueDate), 'MMM d')}</span>
                  <span className={priorityColor[task.priority]}>{task.priority}</span>
                </div>
              </div>
            </div>
          ))}
          {pending.length === 0 && <p className="text-slate-400 text-sm">No pending tasks</p>}
        </div>
      </div>

      {done.length > 0 && (
        <div className="card">
          <h3 className="font-bold mb-3 text-slate-400">Completed ({done.length})</h3>
          <div className="space-y-2">
            {done.slice(0, 10).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl opacity-60">
                <button onClick={() => toggleTask(task)}>
                  <CheckCircle size={20} className="text-green-400" />
                </button>
                <p className="line-through">{task.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
