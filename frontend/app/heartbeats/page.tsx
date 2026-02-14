'use client';

import { useState } from 'react';
import { useI18n } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Heart,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  RefreshCw,
  Clock,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/common';
import { toast } from 'sonner';

type TaskStatus = 'running' | 'stopped' | 'error';

interface HeartbeatTask {
  id: string;
  name: string;
  description: string;
  cronExpression: string;
  action: string;
  status: TaskStatus;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
}

// Mock data for heartbeat tasks
const mockTasks: HeartbeatTask[] = [
  {
    id: '1',
    name: 'Daily Report',
    description: 'Generate and send daily summary report',
    cronExpression: '0 9 * * *',
    action: 'generate_daily_report',
    status: 'running',
    enabled: true,
    lastRun: '2024-01-20T09:00:00Z',
    nextRun: '2024-01-21T09:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Cache Cleanup',
    description: 'Clean up expired cache entries every hour',
    cronExpression: '0 * * * *',
    action: 'cleanup_cache',
    status: 'running',
    enabled: true,
    lastRun: '2024-01-20T15:00:00Z',
    nextRun: '2024-01-20T16:00:00Z',
    createdAt: '2024-01-10T08:30:00Z',
  },
  {
    id: '3',
    name: 'Weekly Backup',
    description: 'Create weekly backup of all data',
    cronExpression: '0 2 * * 0',
    action: 'create_backup',
    status: 'stopped',
    enabled: false,
    lastRun: '2024-01-14T02:00:00Z',
    nextRun: '2024-01-21T02:00:00Z',
    createdAt: '2024-01-01T12:00:00Z',
  },
  {
    id: '4',
    name: 'Health Check',
    description: 'Check system health every 5 minutes',
    cronExpression: '*/5 * * * *',
    action: 'health_check',
    status: 'running',
    enabled: true,
    lastRun: '2024-01-20T15:30:00Z',
    nextRun: '2024-01-20T15:35:00Z',
    createdAt: '2024-01-05T14:20:00Z',
  },
  {
    id: '5',
    name: 'Log Rotation',
    description: 'Rotate and compress old log files daily',
    cronExpression: '0 0 * * *',
    action: 'rotate_logs',
    status: 'error',
    enabled: true,
    lastRun: '2024-01-20T00:00:00Z',
    createdAt: '2024-01-08T09:15:00Z',
  },
];

const statusColors: Record<TaskStatus, string> = {
  running: 'bg-green-500/10 text-green-500 border-green-500/20',
  stopped: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
};

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
}

function parseCronExpression(expression: string): string {
  // Simple cron expression parser for display
  const parts = expression.split(' ');
  if (parts.length !== 5) return expression;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Common patterns
  if (minute === '0' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every hour';
  }
  if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Daily at midnight';
  }
  if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Daily at 9:00 AM';
  }
  if (minute.startsWith('*/')) {
    return `Every ${minute.slice(2)} minutes`;
  }
  if (dayOfWeek === '0' && hour === '2' && minute === '0') {
    return 'Weekly on Sunday at 2:00 AM';
  }

  return expression;
}

export default function HeartbeatsPage() {
  const { t } = useI18n();
  const [tasks, setTasks] = useState<HeartbeatTask[]>(mockTasks);
  const [isLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HeartbeatTask | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cronExpression: '0 * * * *',
    action: '',
    enabled: true,
  });

  const pageTexts = {
    title: t('heartbeats.title') || 'Heartbeats',
    pageDescription: t('heartbeats.pageDescription') || 'Manage scheduled tasks and automated heartbeats',
    addTask: t('heartbeats.addTask') || 'Add Task',
    editTask: t('heartbeats.editTask') || 'Edit Task',
    taskName: t('heartbeats.taskName') || 'Task Name',
    taskNamePlaceholder: t('heartbeats.taskNamePlaceholder') || 'Enter task name',
    taskDescription: t('heartbeats.taskDescription') || 'Description',
    descriptionPlaceholder: t('heartbeats.descriptionPlaceholder') || 'Describe what this task does',
    cronExpression: t('heartbeats.cronExpression') || 'Cron Expression',
    cronPlaceholder: t('heartbeats.cronPlaceholder') || 'e.g., 0 * * * * (every hour)',
    action: t('heartbeats.action') || 'Action',
    actionPlaceholder: t('heartbeats.actionPlaceholder') || 'Action to execute',
    enabled: t('heartbeats.enabled') || 'Enabled',
    running: t('heartbeats.running') || 'Running',
    stopped: t('heartbeats.stopped') || 'Stopped',
    error: t('heartbeats.error') || 'Error',
    lastRun: t('heartbeats.lastRun') || 'Last Run',
    nextRun: t('heartbeats.nextRun') || 'Next Run',
    schedule: t('heartbeats.schedule') || 'Schedule',
    noTasks: t('heartbeats.noTasks') || 'No tasks configured',
    noTasksDesc: t('heartbeats.noTasksDesc') || 'Create a task to get started',
    cancel: t('common.cancel') || 'Cancel',
    save: t('common.save') || 'Save',
    delete: t('common.delete') || 'Delete',
    edit: t('common.edit') || 'Edit',
    start: t('heartbeats.start') || 'Start',
    stop: t('heartbeats.stop') || 'Stop',
    executeNow: t('heartbeats.executeNow') || 'Execute Now',
    cronHelp: t('heartbeats.cronHelp') || 'Format: minute hour day-of-month month day-of-week',
  };

  // Pagination
  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const paginatedTasks = tasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenDialog = (task?: HeartbeatTask) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        name: task.name,
        description: task.description,
        cronExpression: task.cronExpression,
        action: task.action,
        enabled: task.enabled,
      });
    } else {
      setEditingTask(null);
      setFormData({
        name: '',
        description: '',
        cronExpression: '0 * * * *',
        action: '',
        enabled: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
    setFormData({
      name: '',
      description: '',
      cronExpression: '0 * * * *',
      action: '',
      enabled: true,
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Task name is required');
      return;
    }
    if (!formData.action.trim()) {
      toast.error('Action is required');
      return;
    }

    if (editingTask) {
      // Update existing task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                ...formData,
              }
            : t
        )
      );
      toast.success('Task updated successfully');
    } else {
      // Create new task
      const newTask: HeartbeatTask = {
        id: Date.now().toString(),
        ...formData,
        status: formData.enabled ? 'running' : 'stopped',
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, newTask]);
      toast.success('Task created successfully');
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success('Task deleted successfully');
  };

  const handleToggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newEnabled = !t.enabled;
          return {
            ...t,
            enabled: newEnabled,
            status: newEnabled ? 'running' : 'stopped',
          };
        }
        return t;
      })
    );
    const task = tasks.find((t) => t.id === id);
    toast.success(task?.enabled ? 'Task stopped' : 'Task started');
  };

  const handleExecuteNow = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                lastRun: new Date().toISOString(),
              }
            : t
        )
      );
      toast.success(`Executing task: ${task.name}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="h-8 w-8" />
            {pageTexts.title}
          </h1>
          <p className="text-muted-foreground">{pageTexts.pageDescription}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                {pageTexts.addTask}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? pageTexts.editTask : pageTexts.addTask}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{pageTexts.taskName}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder={pageTexts.taskNamePlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{pageTexts.taskDescription}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder={pageTexts.descriptionPlaceholder}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cron">{pageTexts.cronExpression}</Label>
                  <Input
                    id="cron"
                    value={formData.cronExpression}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cronExpression: e.target.value,
                      }))
                    }
                    placeholder={pageTexts.cronPlaceholder}
                  />
                  <p className="text-xs text-muted-foreground">{pageTexts.cronHelp}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action">{pageTexts.action}</Label>
                  <Input
                    id="action"
                    value={formData.action}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, action: e.target.value }))
                    }
                    placeholder={pageTexts.actionPlaceholder}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enabled">{pageTexts.enabled}</Label>
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, enabled: checked }))
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    {pageTexts.cancel}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!formData.name.trim() || !formData.action.trim()}
                  >
                    {pageTexts.save}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center py-8">
            <LoadingSpinner />
          </CardContent>
        </Card>
      ) : tasks.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tasks ({tasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paginatedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{task.name}</span>
                    <Badge className={statusColors[task.status]}>
                      {task.status === 'running'
                        ? pageTexts.running
                        : task.status === 'stopped'
                          ? pageTexts.stopped
                          : pageTexts.error}
                    </Badge>
                    {!task.enabled && (
                      <Badge variant="outline" className="text-yellow-500">
                        {pageTexts.stopped}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {task.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {parseCronExpression(task.cronExpression)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {task.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {pageTexts.lastRun}: {formatDate(task.lastRun)}
                    </span>
                    {task.nextRun && task.enabled && (
                      <span>
                        {pageTexts.nextRun}: {formatDate(task.nextRun)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleExecuteNow(task.id)}
                    title={pageTexts.executeNow}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStatus(task.id)}
                    title={task.enabled ? pageTexts.stop : pageTexts.start}
                  >
                    {task.enabled ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(task)}
                    title={pageTexts.edit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(task.id)}
                    className="text-destructive hover:text-destructive"
                    title={pageTexts.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{pageTexts.noTasks}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {pageTexts.noTasksDesc}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
