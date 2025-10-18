"use client";

import { useEffect, useState } from "react";
import { getTasks, createTask, deleteTask, toggleTaskCompletion } from "@/app/actions/task";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function TasksPage() {
  interface Task {
    id: string;
    title: string;
    description?: string | null;
    completed: boolean;
    creator?: { name?: string | null; email: string };
  }

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const result = await getTasks();
      if (result.error) {
        setError(result.error);
      } else {
        setTasks(result.tasks || []);
      }
    } catch (err: unknown) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      const result = await createTask({
        title,
        description: description || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setTitle("");
        setDescription("");
        setSuccess("Task created successfully");
        setTimeout(() => setSuccess(""), 3000);
        loadTasks();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create task";
      setError(msg);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const result = await deleteTask(taskId);
      if (result.error) {
        setError(result.error);
      } else {
        loadTasks();
      }
    } catch (err: unknown) {
      setError("Failed to delete task");
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const result = await toggleTaskCompletion(taskId);
      if (result.error) {
        setError(result.error);
      } else {
        loadTasks();
      }
    } catch (err: unknown) {
      setError("Failed to update task");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Tasks</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Create Task Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <Button type="submit">Create Task</Button>
          </form>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle>Your Tasks ({tasks.length})</CardTitle>
        </CardHeader>
        <div>
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">No tasks yet. Create your first task above!</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        className="mt-1 mr-3 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${
                            task.completed ? "line-through text-gray-400" : "text-gray-900"
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        {task.creator && (
                          <p className="text-xs text-gray-500 mt-2">
                            Created by {task.creator.name || task.creator.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
