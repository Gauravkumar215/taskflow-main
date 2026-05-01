import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Loader2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { projectService } from "../services/projectService";
import { cn } from "../utils/cn";

/* =========================
   TYPES
========================= */
interface DashboardData {
  summary: {
    totalProjects: number;
    totalTasks: number;
    tasksByStatus: {
      todo: number;
      in_progress: number;
      in_review: number;
      done: number;
    };
    overdueCount: number;
    myOpenTasksCount: number;
  };
  projects: any[];
  overdueTasks: any[];
}

/* =========================
   COMPONENT
========================= */
const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await projectService.getDashboardStats();
        setData(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-brand" />
      </div>
    );
  }

  if (!data) return null;

  const totalTasks = data.summary.totalTasks || 1;
  const completionRate = Math.round(
    ((data.summary.tasksByStatus.done || 0) / totalTasks) * 100,
  );

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black tracking-tighter">OVERVIEW</h2>
          <p className="text-text-secondary text-lg">System analytics & project health</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs font-black text-brand uppercase underline decoration-2 underline-offset-4">Live Updates Active</p>
        </div>
      </div>

      {/* STATS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Projects",
            value: data.summary.totalProjects,
            icon: Briefcase,
            color: "text-brand",
            bg: "bg-brand/10",
          },
          {
            label: "Completion",
            value: `${completionRate}%`,
            icon: TrendingUp,
            color: "text-green-400",
            bg: "bg-green-400/10",
          },
          {
            label: "Total Tasks",
            value: data.summary.totalTasks,
            icon: CheckCircle,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
          },
          {
            label: "Overdue",
            value: data.summary.overdueCount,
            icon: AlertTriangle,
            color: "text-red-400",
            bg: "bg-red-400/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card group hover:border-brand/50 transition-colors"
          >
            <div className={cn("inline-flex p-3 rounded-2xl mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <h3 className="text-4xl font-black">{stat.value}</h3>
            <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px] mt-1">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* RECENT PROJECTS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black tracking-tight">PROJECT POOL</h3>
            <Link to="/admin/projects" className="text-brand text-sm font-bold flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {data.projects.map((project, i) => {
              const pTasks = project.tasks || {};
              const progress = Math.round((pTasks.done / (pTasks.total || 1)) * 100);

              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <Link
                    to={`/admin/projects/${project._id}`}
                    className="card flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-muted/80 p-8 block transition-all active:scale-[0.99]"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-2xl font-black tracking-tight group-hover:text-brand transition-colors">{project.name}</h4>
                        <span className={cn(
                          "badge text-[10px] font-black",
                          project.status === 'active' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-surface text-text-secondary border-border"
                        )}>
                          {project.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-text-secondary text-sm line-clamp-1 font-medium italic opacity-70">{project.description}</p>
                    </div>

                    <div className="flex items-center gap-10 min-w-[300px]">
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-secondary">
                          <span>Completion</span>
                          <span className="text-brand">{progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border/50">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-brand shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                          />
                        </div>
                      </div>
                      
                      <div className="text-right hidden sm:block border-l border-border pl-8">
                        <p className="text-3xl font-black leading-none">{pTasks.total}</p>
                        <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mt-1">Registry</p>
                      </div>
                      
                      <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all scale-90 group-hover:scale-100">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* OVERDUE / URGENT LIST */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black tracking-tight">URGENT ACTIONS</h3>
          <div className="space-y-4">
            {data.overdueTasks.length > 0 ? (
              data.overdueTasks.map((task, i) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card border-l-4 border-l-red-500 bg-red-500/5"
                >
                  <p className="text-[10px] font-black text-red-400 uppercase mb-2 tracking-widest">Overdue</p>
                  <h5 className="font-bold">{task.title}</h5>
                  <div className="flex justify-between items-center mt-3 text-xs text-text-secondary">
                    <span className="font-medium underline">{task.project.name}</span>
                    <span className="flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="card bg-green-500/5 border-green-500/20 text-center py-10">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <p className="text-xs font-bold text-green-400 uppercase tracking-widest">No Overdue Tasks</p>
                <p className="text-text-secondary text-[10px] mt-1">Everything is on schedule</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
