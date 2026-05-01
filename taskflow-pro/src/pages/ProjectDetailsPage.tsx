import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  CheckSquare,
  Settings,
  Plus,
  Trash2,
  UserPlus,
  Loader2,
  Calendar,
  Clock,
  ChevronRight,
  Filter,
  Search,
  X,
} from "lucide-react";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import { authService } from "../services/authService";
import { cn, formatDate } from "../utils/cn";
import toast from "react-hot-toast";

/* =========================
   TYPES
========================= */
interface Task {
  _id: string;
  title: string;
  status: string;
  assignedTo?: { _id: string; name: string };
  dueDate?: string;
  priority?: string;
}

interface Member {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  role: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  members?: Member[];
  owner: { _id: string; name: string };
}

interface User {
  _id: string;
  name: string;
  email: string;
}

/* =========================
   COMPONENT
========================= */
const ProjectDetailsPage = () => {
  const { projectId } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tasks" | "members" | "settings">(
    "tasks",
  );

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Form States
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
  });

  const [newMember, setNewMember] = useState({
    userId: "",
    role: "member",
  });

  /* =========================
     FETCH DATA
  ========================= */
  const fetchProjectData = async () => {
    if (!projectId) return;

    try {
      const [pRes, tRes, uRes] = await Promise.all([
        projectService.getProject(projectId),
        taskService.getProjectTasks(projectId),
        authService.getAllUsers(),
      ]);

      setProject(pRes.data.data);
      setTasks(tRes.data.data.tasks || []);
      setAvailableUsers(uRes.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  /* =========================
     TASK ACTIONS
  ========================= */
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    const toastId = toast.loading("Creating task...");
    try {
      await taskService.createTask(projectId, {
        ...newTask,
        assignedTo: newTask.assignedTo || null,
      });
      toast.success("Task created!", { id: toastId });
      setIsTaskModalOpen(false);
      setNewTask({
        title: "",
        description: "",
        assignedTo: "",
        priority: "medium",
        dueDate: "",
      });
      fetchProjectData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create task", {
        id: toastId,
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await taskService.updateTask(taskId, { status });
      toast.success("Status updated");
      fetchProjectData();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await taskService.deleteTask(taskId);
      toast.success("Task deleted");
      fetchProjectData();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  /* =========================
     MEMBER ACTIONS
  ========================= */
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    const toastId = toast.loading("Adding member...");
    try {
      await projectService.addMember(projectId, newMember);
      toast.success("Member added!", { id: toastId });
      setIsMemberModalOpen(false);
      setNewMember({ userId: "", role: "member" });
      fetchProjectData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add member", {
        id: toastId,
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!projectId || !window.confirm("Remove this member from project?"))
      return;

    try {
      await projectService.removeMember(projectId, memberId);
      toast.success("Member removed");
      fetchProjectData();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-brand" />
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-sm uppercase text-text-secondary tracking-widest font-bold">
            <span
              className="cursor-pointer hover:text-brand transition-colors"
              onClick={() => window.history.back()}
            >
              Projects
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-text-primary">{project?.name}</span>
          </div>

          <h2 className="text-5xl font-black mt-2 tracking-tighter">
            {project?.name}
          </h2>
          <p className="text-text-secondary text-lg mt-1 italic">
            {project?.description}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Member
          </button>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-8 border-b border-border">
        {[
          { id: "tasks", label: "Tasks", icon: CheckSquare },
          { id: "members", label: "Members", icon: Users },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "pb-4 flex items-center gap-2 border-b-2 text-sm uppercase font-bold tracking-wider transition-all",
              activeTab === tab.id
                ? "text-brand border-brand"
                : "text-text-secondary border-transparent hover:text-text-primary",
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABS CONTENT */}
      <AnimatePresence mode="wait">
        {/* ===================== TASKS ===================== */}
        {activeTab === "tasks" && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {tasks.length > 0 ? (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <div key={task._id} className="card relative group">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold">{task.title}</h4>
                        <div className="flex flex-wrap gap-4 text-xs text-text-secondary font-medium">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {task.assignedTo?.name || "Unassigned"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                          </div>
                          <div className="flex items-center gap-1 uppercase">
                            <Clock className="w-3 h-3" />
                            {task.priority}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleUpdateTaskStatus(task._id, e.target.value)
                          }
                          className="input text-xs w-auto min-w-[140px] font-bold"
                        >
                          <option value="todo">TO DO</option>
                          <option value="in_progress">IN PROGRESS</option>
                          <option value="in_review">IN REVIEW</option>
                          <option value="done">DONE</option>
                        </select>

                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-20 bg-surface-muted/30 border-dashed border-2">
                <p className="text-text-secondary font-bold uppercase tracking-widest text-sm">
                  No tasks found in this project
                </p>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="mt-4 text-brand font-black hover:underline"
                >
                  CREATE THE FIRST TASK
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ===================== MEMBERS ===================== */}
        {activeTab === "members" && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* OWNER CARD */}
            <div className="card border-brand/50 border-2 bg-brand/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <span className="text-[10px] font-black bg-brand px-2 py-0.5 rounded text-white uppercase tracking-tighter">
                  OWNER
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center font-black text-xl">
                  {project?.owner.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-lg">{project?.owner.name}</p>
                  <p className="text-xs text-text-secondary">Project Creator</p>
                </div>
              </div>
            </div>

            {/* MEMBERS LIST */}
            {project?.members?.map((m) => (
              <div key={m.user._id} className="card flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center font-bold">
                    {m.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{m.user.name}</p>
                    <p className="text-xs text-text-secondary">{m.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="badge bg-brand/10 text-brand py-1 px-3">
                    {m.role}
                  </span>
                  <button
                    onClick={() => handleRemoveMember(m.user._id)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ===================== SETTINGS ===================== */}
        {activeTab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="card space-y-6">
              <h3 className="text-xl font-bold">Project Configuration</h3>
              <div>
                <label className="text-xs font-black uppercase text-text-secondary mb-2 block">
                  Project Name
                </label>
                <input defaultValue={project?.name} className="input" />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-text-secondary mb-2 block">
                  Project Description
                </label>
                <textarea
                  defaultValue={project?.description}
                  className="input min-h-[100px]"
                />
              </div>
              <div className="pt-4 border-t border-border flex justify-between">
                <button className="btn-primary px-8">Save Changes</button>
                <button
                  onClick={() => {
                    if (window.confirm("Archive this project?")) {
                      toast.success("Project archived");
                    }
                  }}
                  className="btn-secondary border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Archive Project
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== MODALS ===================== */}

      {/* 🚀 TASK MODAL */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg glass p-8 rounded-2xl relative"
            >
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-3xl font-black mb-6 tracking-tighter">
                NEW TASK
              </h3>

              <form onSubmit={handleCreateTask} className="space-y-5">
                <div>
                  <label className="text-xs font-black uppercase mb-1 block">
                    Title
                  </label>
                  <input
                    className="input"
                    placeholder="What needs to be done?"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase mb-1 block">
                    Assignee
                  </label>
                  <select
                    className="input"
                    value={newTask.assignedTo}
                    onChange={(e) =>
                      setNewTask({ ...newTask, assignedTo: e.target.value })
                    }
                  >
                    <option value="">Unassigned</option>
                    {/* Owner */}
                    <option value={project?.owner._id}>
                      {project?.owner.name} (Owner)
                    </option>
                    {/* Members */}
                    {project?.members?.map((m) => (
                      <option key={m.user._id} value={m.user._id}>
                        {m.user.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase mb-1 block">
                      Priority
                    </label>
                    <select
                      className="input"
                      value={newTask.priority}
                      onChange={(e) =>
                        setNewTask({ ...newTask, priority: e.target.value })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase mb-1 block">
                      Due Date
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={newTask.dueDate}
                      onChange={(e) =>
                        setNewTask({ ...newTask, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase mb-1 block">
                    Description
                  </label>
                  <textarea
                    className="input min-h-[100px]"
                    placeholder="Details..."
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>

                <button type="submit" className="btn-primary w-full h-12 text-lg">
                  CREATE TASK
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 👥 MEMBER MODAL */}
      <AnimatePresence>
        {isMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md glass p-8 rounded-2xl relative"
            >
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-3xl font-black mb-6 tracking-tighter">
                ADD MEMBER
              </h3>

              <form onSubmit={handleAddMember} className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase mb-1 block">
                    Select User
                  </label>
                  <select
                    className="input"
                    value={newMember.userId}
                    onChange={(e) =>
                      setNewMember({ ...newMember, userId: e.target.value })
                    }
                    required
                  >
                    <option value="">Choose a user...</option>
                    {availableUsers
                      .filter(
                        (u) =>
                          u._id !== project?.owner._id &&
                          !project?.members?.some((m) => m.user._id === u._id),
                      )
                      .map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase mb-1 block">
                    Project Role
                  </label>
                  <select
                    className="input"
                    value={newMember.role}
                    onChange={(e) =>
                      setNewMember({ ...newMember, role: e.target.value })
                    }
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary w-full h-12">
                  ADD TO PROJECT
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetailsPage;
