'use client';

import { useState } from 'react';
import { useI18n, useHeartbeatTasks, useHeartbeatActions } from '@/hooks';
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
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/common';
import { toast } from 'sonner';
import type { HeartbeatTask, HeartbeatTaskStatus, CreateHeartbeatTaskRequest, UpdateHeartbeatTaskRequest } from '@/types/heartbeat';

const statusColors: Record<HeartbeatTaskStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  running: 'bg-green-500/10 text-green-500 border-green-500/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  disabled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
}

function parseSchedule(schedule: string): string {
  // Check if it's an interval format like "30m", "1h", "1d"
  const intervalMatch = schedule.match(/^(\d+)([mhd])$/);
  if (intervalMatch) {
    const [, value, unit] = intervalMatch;
    const unitNames: Record<string, string> = {
      m: 'minute(s)',
      h: 'hour(s)',
      d: 'day(s)',
    };
    return `Every ${value} ${unitNames[unit] || unit}`;
  }

  // Simple cron expression parser for display
  const parts = schedule.split(' ');
  if (parts.length !== 5) return schedule;

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

  return schedule;
}

export default function HeartbeatsPage() {
  const { t } = useI18n();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Use real API hooks
  const { data, isLoading, isError, error, refetch } = useHeartbeatTasks(currentPage, itemsPerPage);
  const actions = useHeartbeatActions();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HeartbeatTask | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    schedule: '0 * * * *',
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
    cronExpression: t('heartbeats.cronExpression') || 'Schedule',
    cronPlaceholder: t('heartbeats.cronPlaceholder') || 'e.g., 0 * * * * (every hour) or 30m',
    enabled: t('heartbeats.enabled') || 'Enabled',
    running: t('heartbeats.running') || 'Running',
    stopped: t('heartbeats.stopped') || 'Stopped',
    pending: t('heartbeats.pending') || 'Pending',
    completed: t('heartbeats.completed') || 'Completed',
    failed: t('heartbeats.failed') || 'Failed',
    disabled: t('heartbeats.disabled') || 'Disabled',
    error: t('heartbeats.error') || 'Error',
    lastRun: t('heartbeats.lastRun') || 'Last Run',
    nextRun: t('heartbeats.nextRun') || 'Next Run',
    schedule: t('heartbeats.schedule') || 'Schedule',
    noTasks: t('heartbeats.noTasks') || 'No tasks configured',
    noTasksDesc: t('heartbeats.noTasksDesc') || 'Create a task to get started',
    noTasksGuide: t('heartbeats.noTasksGuide') || 'Click "Add Task" to create your first scheduled task',
    cancel: t('common.cancel') || 'Cancel',
    save: t('common.save') || 'Save',
    delete: t('common.delete') || 'Delete',
    edit: t('common.edit') || 'Edit',
    start: t('heartbeats.start') || 'Start',
    stop: t('heartbeats.stop') || 'Stop',
    executeNow: t('heartbeats.executeNow') || 'Execute Now',
    cronHelp: t('heartbeats.cronHelp') || 'Format: minute hour day-of-month month day-of-week, or interval like 30m, 1h, 1d',
    loadError: t('heartbeats.loadError') || 'Failed to load tasks',
    retry: t('common.retry') || 'Retry',
  };

  // Get tasks from API response
  const tasks = data?.tasks ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Get status text
  const getStatusText = (status: HeartbeatTaskStatus) => {
    switch (status) {
      case 'pending': return pageTexts.pending;
      case 'running': return pageTexts.running;
      case 'completed': return pageTexts.completed;
      case 'failed': return pageTexts.failed;
      case 'disabled': return pageTexts.disabled;
      default: return status;
    }
  };

  const handleOpenDialog = (task?: HeartbeatTask) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        schedule: task.schedule,
        enabled: task.enabled,
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        schedule: '0 * * * *',
        enabled: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      schedule: '0 * * * *',
      enabled: true,
    });
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Task name is required');
      return;
    }

    if (editingTask) {
      // Update existing task
      const request: UpdateHeartbeatTaskRequest = {
        title: formData.title,
        description: formData.description,
        schedule: formData.schedule,
        enabled: formData.enabled,
      };
      actions.updateTask(
        { id: editingTask.id, request },
        {
          onSuccess: () => {
            toast.success('Task updated successfully');
            handleCloseDialog();
          },
          onError: (err) => {
            toast.error(`Failed to update task: ${err instanceof Error ? err.message : 'Unknown error'}`);
          },
        }
      );
    } else {
      // Create new task
      const request: CreateHeartbeatTaskRequest = {
        title: formData.title,
        description: formData.description,
        schedule: formData.schedule,
        enabled: formData.enabled,
      };
      actions.addTask(request, {
        onSuccess: () => {
          toast.success('Task created successfully');
          handleCloseDialog();
        },
        onError: (err) => {
          toast.error(`Failed to create task: ${err instanceof Error ? err.message : 'Unknown error'}`);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    actions.deleteTask(id, {
      onSuccess: () => {
        toast.success('Task deleted successfully');
      },
      onError: (err) => {
        toast.error(`Failed to delete task: ${err instanceof Error ? err.message : 'Unknown error'}`);
      },
    });
  };

  const handleToggleStatus = (task: HeartbeatTask) => {
    const newEnabled = !task.enabled;
    const request: UpdateHeartbeatTaskRequest = {
      enabled: newEnabled,
    };
    actions.updateTask(
      { id: task.id, request },
      {
        onSuccess: () => {
          toast.success(newEnabled ? 'Task started' : 'Task stopped');
        },
        onError: (err) => {
          toast.error(`Failed to update task: ${err instanceof Error ? err.message : 'Unknown error'}`);
        },
      }
    );
  };

  const handleExecuteNow = (task: HeartbeatTask) => {
    actions.executeTask(task.id, {
      onSuccess: () => {
        toast.success(`Executing task: ${task.title}`);
      },
      onError: (err) => {
        toast.error(`Failed to execute task: ${err instanceof Error ? err.message : 'Unknown error'}`);
      },
    });
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
          <Button variant="outline" size="icon" onClick={() => refetch()}>
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
                  <Label htmlFor="title">{pageTexts.taskName}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
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
                  <Label htmlFor="schedule">{pageTexts.cronExpression}</Label>
                  <Input
                    id="schedule"
                    value={formData.schedule}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        schedule: e.target.value,
                      }))
                    }
                    placeholder={pageTexts.cronPlaceholder}
                  />
                  <p className="text-xs text-muted-foreground">{pageTexts.cronHelp}</p>
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
                    disabled={!formData.title.trim() || actions.isAddingTask || actions.isUpdatingTask}
                  >
                    {(actions.isAddingTask || actions.isUpdatingTask) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
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
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-muted-foreground">{pageTexts.loadError}</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {pageTexts.retry}
            </Button>
          </CardContent>
        </Card>
      ) : tasks.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tasks ({data?.total ?? tasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{task.title}</span>
                    <Badge className={statusColors[task.status]}>
                      {getStatusText(task.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {task.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {parseSchedule(task.schedule)}
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
                    onClick={() => handleExecuteNow(task)}
                    title={pageTexts.executeNow}
                    disabled={actions.isExecutingTask}
                  >
                    {actions.isExecutingTask ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStatus(task)}
                    title={task.enabled ? pageTexts.stop : pageTexts.start}
                    disabled={actions.isUpdatingTask}
                  >
                    {actions.isUpdatingTask ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : task.enabled ? (
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
                    disabled={actions.isDeletingTask}
                  >
                    {actions.isDeletingTask ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
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
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {pageTexts.noTasksGuide}
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              {pageTexts.addTask}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
