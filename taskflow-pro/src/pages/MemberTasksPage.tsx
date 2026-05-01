import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckSquare,
  Clock,
  Search,
  Loader2,
  Calendar,
  Briefcase,
  Filter,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { taskService } from "../services/taskService";
import { projectService } from "../services/projectService.ts";
import { useAuth } from "../context/AuthContext";
import { cn, formatDate } from "../utils/cn";
import toast from "react-hot-toast";

/* =========================
   TYPES
========================= */
interface Task {
  _id: string;
  title: string;
  status: string;
  projectName?: string;
  dueDate?: string;
  priority?: string;
}

/* =========================
   COMPONENT
========================= */
const MemberTasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const fetchAllTasks = async () => {
    if (!user) return;
    try {
      const pRes = await projectService.getProjects();
      const projectList = pRes.data.data || [];

      if (!projectList.length) {
        setTasks([]);
        return;
      }

      const taskPromises = projectList.map((p: any) =>
        taskService.getProjectTasks(p._id),
      );

      const taskResponses = await Promise.all(taskPromises);

      const allTasks = taskResponses.flatMap((res: any) => {
        const project = projectList.find(
          (p: any) => p._id === res.config.url.split("/")[2],
        );
        const tasks = res.data.data.tasks || [];
        return tasks
          .filter(
            (t: any) =>
              t.assignedTo?._id === user.id || t.assignedTo === user.id,
          )
          .map((t: any) => ({
            ...t,
            projectName: project?.name || "Unknown Project",
          }));
      });

      setTasks(allTasks);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      await taskService.updateTask(taskId, { status });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status } : t)),
      );
      toast.success("Operational status updated");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "All" || task.status === filter;
    const matchesSearch =
      task.title?.toLowerCase().includes(search.toLowerCase()) ||
      task.projectName?.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-border">
        <div>
          <h2 className="text-5xl font-black tracking-tighter uppercase">
            ASSIGNMENTS
          </h2>
          <p className="text-text-secondary text-lg mt-1 italic">
            Personal task registry and status control
          </p>
        </div>

        <div className="flex gap-2">
          <div className="bg-brand/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-brand/20">
            <TrendingUp className="w-4 h-4 text-brand" />
            <span className="text-xs font-black uppercase tracking-widest text-brand">
              {tasks.length} Total Assignments
            </span>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            className="input pl-12 h-12 rounded-2xl"
            placeholder="Search tasks or project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: "All", value: "All" },
            { label: "To Do", value: "todo" },
            { label: "In Progress", value: "in_progress" },
            { label: "Review", value: "in_review" },
            { label: "Done", value: "done" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all h-12 flex items-center",
                filter === f.value
                  ? "bg-brand text-white shadow-lg shadow-brand/20"
                  : "bg-surface-muted text-text-secondary hover:bg-surface border border-border",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* TASK LIST */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, i) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.03 }}
                className="card flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-brand/40"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-brand bg-brand/5 px-2 py-0.5 rounded tracking-tighter uppercase">
                      {task.projectName}
                    </span>
                    <h4 className="text-xl font-bold group-hover:text-brand transition-colors">
                      {task.title}
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {task.dueDate ? formatDate(task.dueDate) : "No deadline"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Priority: {task.priority || "medium"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end mr-4">
                    <span className="text-[10px] font-black text-text-secondary tracking-widest mb-1">
                      SET STATUS
                    </span>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleUpdateStatus(task._id, e.target.value)
                      }
                      className={cn(
                        "input text-[10px] h-10 w-40 font-black uppercase tracking-widest",
                        task.status === "done"
                          ? "text-green-400 border-green-500/20"
                          : "",
                      )}
                    >
                      <option value="todo">TO DO</option>
                      <option value="in_progress">IN PROGRESS</option>
                      <option value="in_review">IN REVIEW</option>
                      <option value="done">COMPLETED</option>
                    </select>
                  </div>

                  <button className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center hover:bg-brand hover:text-white transition-all">
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center glass border-dashed"
            >
              <CheckSquare className="w-16 h-16 text-surface-muted mx-auto mb-6" />
              <p className="text-xl font-black tracking-tight">
                REGISTRY CLEAR
              </p>
              <p className="text-text-secondary text-sm mt-1">
                No tasks matching current filter parameters
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MemberTasksPage;
