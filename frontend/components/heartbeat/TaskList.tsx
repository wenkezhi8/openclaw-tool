'use client';

import { useState } from 'react';
import { useHeartbeatTasks, useHeartbeatActions } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { ListTodo, Plus, Play, Trash2, Edit, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/common';
import type { HeartbeatTaskStatus, CreateHeartbeatTaskRequest } from '@/types/heartbeat';

function formatDate(dateString?: string): string {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString();
}

const statusColors: Record<HeartbeatTaskStatus, string> = {
  pending: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  running: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  disabled: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
};

export function TaskList() {
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<CreateHeartbeatTaskRequest>({
    title: '',
    description: '',
    schedule: '30m',
    enabled: true,
  });

  const { data, isLoading, refetch } = useHeartbeatTasks(page, 10);
  const {
    addTask,
    deleteTask,
    executeTask,
    isAddingTask,
    isDeletingTask,
    isExecutingTask,
  } = useHeartbeatActions();

  const handleAddTask = () => {
    addTask(newTask, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        setNewTask({
          title: '',
          description: '',
          schedule: '30m',
          enabled: true,
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ListTodo className="h-4 w-4" />
          Tasks ({data?.total || 0})
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Task title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input
                    id="schedule"
                    value={newTask.schedule}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, schedule: e.target.value }))}
                    placeholder="e.g., 30m, 1h, 1d"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use format: 30m (minutes), 1h (hours), 1d (days)
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTask} disabled={isAddingTask || !newTask.title}>
                    {isAddingTask ? 'Adding...' : 'Add Task'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : data && data.tasks.length > 0 ? (
          <>
            <div className="space-y-3">
              {data.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{task.title}</span>
                      <Badge className={statusColors[task.status]}>{task.status}</Badge>
                      {!task.enabled && (
                        <Badge variant="outline" className="text-yellow-500">
                          Disabled
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Schedule: {task.schedule}</span>
                      <span>Last: {formatDate(task.lastRun)}</span>
                      <span>Next: {formatDate(task.nextRun)}</span>
                    </div>
                    {task.lastResult && (
                      <div className="mt-2 text-xs">
                        {task.lastResult.success ? (
                          <span className="text-green-500">{task.lastResult.output}</span>
                        ) : (
                          <span className="text-red-500">{task.lastResult.error}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => executeTask(task.id)}
                      disabled={isExecutingTask || !task.enabled}
                      title="Execute now"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      disabled={isDeletingTask}
                      className="text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {data.page} of {data.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tasks configured</p>
            <p className="text-sm mt-1">Add a task to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
