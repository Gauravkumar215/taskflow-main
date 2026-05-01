import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Users, Search, Mail, Shield, UserCheck, Loader2, ArrowUpRight } from "lucide-react";
import { authService } from "../services/authService";
import { cn } from "../utils/cn";
import toast from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const TeamPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authService.getAllUsers();
      setUsers(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-5xl font-black tracking-tighter">TEAM MANAGEMENT</h2>
          <p className="text-text-secondary text-lg mt-1 italic">Manage system personnel and access levels</p>
        </div>

        <div className="flex gap-2">
           <div className="bg-brand/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-brand/20">
              <UserCheck className="w-4 h-4 text-brand" />
              <span className="text-xs font-black uppercase tracking-widest text-brand">{users.length} Active Users</span>
           </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input
          type="text"
          className="input pl-12 h-12 rounded-2xl"
          placeholder="Filter by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TEAM LIST */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, i) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="card group hover:border-brand/30 relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-surface-muted flex items-center justify-center font-black text-2xl text-brand group-hover:bg-brand group-hover:text-white transition-all">
                  {user.name.charAt(0)}
                </div>
                <div className={cn(
                  "badge text-[10px] uppercase font-black tracking-tighter",
                  user.role === 'admin' ? "bg-brand text-white" : "bg-surface text-text-secondary"
                )}>
                  {user.role}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold">{user.name}</h4>
                  <div className="flex items-center gap-2 text-text-secondary text-xs mt-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-text-secondary">
                    <Shield className="w-3 h-3" />
                    {user.role === 'admin' ? 'Full Access' : 'Limited Access'}
                  </div>
                  
                  <button className="text-brand opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 text-xs font-bold">
                    Profile <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center glass border-dashed">
             <Users className="w-12 h-12 mx-auto text-surface-muted mb-4" />
             <p className="font-bold text-text-secondary">No members match your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
