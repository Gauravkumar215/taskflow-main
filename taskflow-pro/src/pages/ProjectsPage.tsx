import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  Eye,
  X,
  Loader2,
  Users,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { projectService } from "../services/projectService.ts";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";
import toast from "react-hot-toast";

/* =========================
   TYPES
========================= */
interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  members?: any[];
  owner: { name: string };
  createdAt: string;
}

/* =========================
   MODAL
========================= */
const CreateProjectModal = ({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await projectService.createProject({ name, description });
      toast.success("Project created successfully");
      onCreated();
      onClose();
      setName("");
      setDescription("");
    } catch (error) {
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg glass p-8 rounded-3xl shadow-2xl relative border-border/50 border overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-3xl -z-10" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-text-secondary hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-3xl font-black mb-2 tracking-tighter">
          INITIATE PROJECT
        </h3>
        <p className="text-text-secondary text-sm mb-8 font-medium">
          Define a new operational scope
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-brand tracking-widest pl-1">
              Project Identifier
            </label>
            <input
              type="text"
              className="input h-14 text-lg"
              placeholder="e.g. Operation Chimera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-brand tracking-widest pl-1">
              Operational Brief
            </label>
            <textarea
              className="input min-h-[140px] py-4"
              placeholder="Mission parameters and objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 h-12"
            >
              ABORT
            </button>
            <button
              type="submit"
              disabled={loading || !name || !description}
              className="btn-primary flex-1 h-12"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5 mx-auto" />
              ) : (
                "DEPLOY"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* =========================
   MAIN PAGE
========================= */
const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjects();
      setProjects(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-border">
        <div>
          <h2 className="text-5xl font-black tracking-tighter">PROJECTS</h2>
          <p className="text-text-secondary text-lg mt-1 italic">
            Active operations across the system
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 px-8 h-12"
        >
          <Plus className="w-5 h-5" />
          START NEW PROJECT
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            className="input pl-12 h-12 rounded-2xl"
            placeholder="Search by ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button className="btn-secondary flex items-center gap-2 h-12 flex-1 justify-center px-6">
            <Filter className="w-4 h-4" />
            FILTER
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-surface-muted/50 animate-pulse rounded-3xl"
            />
          ))
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project, i) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/admin/projects/${project._id}`}
                className="card group hover:border-brand/60 overflow-hidden flex flex-col h-full transition-all active:scale-[0.98] border-2 border-transparent"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-brand/10 rounded-2xl group-hover:bg-brand group-hover:text-white transition-all">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <span
                    className={cn(
                      "badge uppercase text-[10px] font-black tracking-widest px-4 py-1.5",
                      project.status === "active"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-neutral-800 text-text-secondary border-white/5",
                    )}
                  >
                    {project.status?.toUpperCase() || "ACTIVE"}
                  </span>
                </div>

                <div className="space-y-3 flex-grow">
                  <h3 className="text-3xl font-black tracking-tight leading-none group-hover:text-brand transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 font-medium leading-relaxed opacity-80">
                    {project.description}
                  </p>
                </div>

                <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand" />
                      {project.members?.length || 0}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-brand group-hover:text-white flex items-center justify-center transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-24 glass border-dashed">
            <Briefcase className="w-16 h-16 text-surface-muted mx-auto mb-6" />
            <p className="text-xl font-black tracking-tight">
              NO PROJECTS DETECTED
            </p>
            <p className="text-text-secondary text-sm mt-2">
              Try adjusting your search or start a new operation
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateProjectModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreated={fetchProjects}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;
