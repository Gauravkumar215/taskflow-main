import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Briefcase,
  CheckSquare,
  ChevronRight,
  TrendingUp,
  Layout,
  Clock,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { projectService } from "../services/projectService";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";

/* =========================
   TYPES
========================= */
interface Project {
  _id: string;
  name: string;
  description?: string;
  status?: string;
  createdAt: string;
  tasks?: {
    total: number;
    done: number;
  };
}

/* =========================
   COMPONENT
========================= */
const MemberDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getProjects();
        setProjects(response.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-brand" />
      </div>
    );
  }

  const totalTasks = projects.reduce((acc, p) => acc + (p.tasks?.total || 0), 0);
  const completedTasks = projects.reduce((acc, p) => acc + (p.tasks?.done || 0), 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-10 pb-20">
      {/* WELCOME SECTION */}
      <div className="flex flex-col lg:flex-row gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-grow p-10 rounded-3xl bg-brand/10 border border-brand/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl -z-10 group-hover:bg-brand/10 transition-all" />
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tighter">MISSION CONTROL</h2>
            <p className="text-xl text-text-secondary mt-2 font-medium">
              Welcome back, <span className="text-brand">{user?.name}</span>. 
              Status: <span className="text-green-400 font-bold uppercase tracking-widest text-xs">Operational</span>
            </p>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/member/tasks" className="btn-primary flex items-center gap-2 px-8 h-12">
                <CheckSquare className="w-5 h-5" />
                ACTIVE TASKS
              </Link>
              <div className="flex items-center gap-3 px-6 h-12 rounded-2xl bg-surface border border-border">
                <Layout className="w-5 h-5 text-brand" />
                <span className="text-xs font-black uppercase tracking-widest">{projects.length} PROJECTS</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 gap-4 lg:w-[400px]">
          {[
            { label: "Completion", value: `${completionRate}%`, icon: TrendingUp, color: "text-green-400" },
            { label: "Hours", value: "32h", icon: Clock, color: "text-blue-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card flex flex-col justify-between p-6"
            >
              <stat.icon className={cn("w-6 h-6", stat.color)} />
              <div>
                <h3 className="text-3xl font-black">{stat.value}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PROJECTS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
            ASSIGNED PROJECTS
            <span className="text-[10px] font-black bg-surface px-2 py-0.5 rounded text-text-secondary tracking-widest">
              {projects.length}
            </span>
          </h3>
          <Link to="/member/tasks" className="text-brand text-xs font-black flex items-center gap-1 hover:underline tracking-widest">
            VIEW ALL TASKS <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.length > 0 ? (
            projects.map((project, i) => {
              const progress = Math.round(((project.tasks?.done || 0) / (project.tasks?.total || 1)) * 100);
              
              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card group hover:border-brand/40 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-brand/10 rounded-2xl group-hover:bg-brand group-hover:text-white transition-all">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-text-secondary tracking-tighter">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 flex-grow">
                    <h4 className="text-2xl font-black tracking-tight">{project.name}</h4>
                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="space-y-2 text-[10px] font-black uppercase tracking-widest">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Mission Progress</span>
                        <span className="text-brand">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-brand"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-text-secondary">
                        {project.tasks?.done || 0} / {project.tasks?.total || 0} TASKS REACHED
                      </span>
                      <Link
                        to="/member/tasks"
                        className="flex items-center gap-1 text-brand hover:underline"
                      >
                        DETAILS <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center glass border-dashed">
              <Briefcase className="w-12 h-12 mx-auto text-surface-muted mb-4" />
              <p className="font-bold text-text-secondary uppercase tracking-widest text-sm">No Projects Assigned Yet</p>
              <p className="text-xs text-text-secondary mt-1">Contact your administrator for deployment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
