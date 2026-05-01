import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CheckSquare,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";
import { motion, AnimatePresence } from "motion/react";

/* =========================
   SIDEBAR
========================= */
const Sidebar = ({
  isOpen,
  toggle,
}: {
  isOpen: boolean;
  toggle: () => void;
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setTimeout(() => navigate("/login"), 0);
  };

  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Projects", path: "/admin/projects", icon: Briefcase },
    { name: "Team", path: "/admin/team", icon: Users },
  ];

  const memberLinks = [
    { name: "Dashboard", path: "/member/dashboard", icon: LayoutDashboard },
    { name: "My Tasks", path: "/member/tasks", icon: CheckSquare },
  ];

  const links = user.role === "admin" ? adminLinks : memberLinks;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggle}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-surface-muted border-r border-border z-50 transition-all duration-300 ease-in-out",
          !isOpen && "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-8 flex items-center justify-between">
            <Link
              to={user.role === "admin" ? "/admin/dashboard" : "/member/dashboard"}
              className="flex items-center gap-3 text-2xl font-black text-brand tracking-tighter"
            >
              <div className="bg-brand text-white p-1 rounded-lg">
                <CheckSquare className="w-6 h-6" />
              </div>
              TASKFLOW
            </Link>

            <button onClick={toggle} className="lg:hidden text-text-secondary hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 mt-4 space-y-4">
             <div className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 pl-4">Navigation</div>
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => { if(window.innerWidth < 1024) toggle(); }}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest",
                    isActive
                      ? "bg-brand text-white shadow-lg shadow-brand/20 ring-1 ring-brand/30"
                      : "text-text-secondary hover:bg-surface hover:text-text-primary",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer User Info */}
          <div className="p-6 m-6 rounded-3xl bg-surface border border-border group hover:border-brand/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black">
                {user.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest truncate">{user.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 h-10 mt-6 rounded-xl bg-surface-muted text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              TERMINATE SESSION
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

/* =========================
   NAVBAR
========================= */
const Navbar = ({ toggle }: { toggle: () => void }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'OVERVIEW';
    if (path.includes('projects')) return 'PROJECTS';
    if (path.includes('team')) return 'TEAM';
    if (path.includes('tasks')) return 'ASSIGNMENTS';
    return 'SYSTEM';
  };

  return (
    <header className="sticky top-0 z-30 h-20 flex items-center justify-between px-6 lg:px-10 bg-surface/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center gap-6">
        <button onClick={toggle} className="lg:hidden p-2 bg-surface-muted rounded-xl">
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">
            SYSTEM / {user?.role} / {getPageTitle()}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-surface-muted h-10 px-4 rounded-xl border border-border">
          <Search className="w-4 h-4 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Search Registry..." 
            className="bg-transparent text-[10px] font-bold outline-none uppercase tracking-widest w-32 focus:w-48 transition-all"
          />
        </div>
        
        <button className="p-2 relative hover:bg-surface-muted rounded-xl transition-all">
          <Bell className="w-5 h-5 text-text-secondary" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full ring-2 ring-surface" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border h-8 ml-2">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black leading-none">{user?.name}</p>
              <p className="text-[8px] font-bold text-green-400 uppercase tracking-tighter">Connected</p>
           </div>
           <div className="w-8 h-8 rounded-lg bg-surface-muted border border-border flex items-center justify-center font-black text-xs">
              {user?.name?.charAt(0)}
           </div>
        </div>
      </div>
    </header>
  );
};

/* =========================
   MAIN LAYOUT
========================= */
const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface selection:bg-brand selection:text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="lg:ml-72 flex flex-col min-h-screen">
        <Navbar toggle={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
             <motion.div
               key={window.location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3 }}
             >
               <Outlet />
             </motion.div>
          </div>
        </main>
      </div>

      {/* MOBILE HUD BAR (Optional extra polish) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-md border-t border-border z-40 flex items-center justify-around px-4">
         <Link to={window.location.pathname.includes('/admin') ? '/admin/dashboard' : '/member/dashboard'} className="p-3 text-text-secondary hover:text-brand transition-colors">
            <LayoutDashboard className="w-6 h-6" />
         </Link>
         <Link to={window.location.pathname.includes('/admin') ? '/admin/projects' : '/member/tasks'} className="p-3 text-text-secondary hover:text-brand transition-colors">
            {window.location.pathname.includes('/admin') ? <Briefcase className="w-6 h-6" /> : <CheckSquare className="w-6 h-6" />}
         </Link>
         <button onClick={() => setIsSidebarOpen(true)} className="p-3 text-text-secondary hover:text-brand transition-colors">
            <Menu className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
};

export default DashboardLayout;
