import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { UserPlus, CheckSquare, Loader2, Target, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { cn } from "../utils/cn";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await register({ name, email, password, role });
      navigate(
        user.role === "admin" ? "/admin/dashboard" : "/member/dashboard",
        { replace: true },
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden px-6 py-12">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-brand/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[10%] w-[40rem] h-[40rem] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        {/* HEADER */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center p-4 bg-brand/10 border border-brand/20 rounded-3xl text-brand mb-6"
          >
            <CheckSquare className="w-10 h-10" />
          </motion.div>

          <h1 className="text-5xl font-black tracking-tighter text-text-primary uppercase">
            ENROLLMENT
          </h1>
          <p className="text-text-secondary mt-2 font-medium tracking-tight">
            Register new operator profile for <span className="text-brand font-bold">TASKFLOW</span>
          </p>
        </div>

        {/* BRUTALIST REGISTRATION FORM */}
        <div className="glass p-10 rounded-3xl shadow-2xl border border-border/50 relative">
          <div className="absolute top-0 right-10 -translate-y-1/2 bg-brand text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            New Directive
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-brand tracking-[0.2em] ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="input h-14 bg-surface"
                  placeholder="Operator Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-brand tracking-[0.2em] ml-1">
                  Role Assignment
                </label>
                <select
                  className="input h-14 bg-surface font-bold uppercase text-xs"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                >
                  <option value="member">MEMBER / FIELD AGENT</option>
                  <option value="admin">ADMIN / COMMANDER</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-brand tracking-[0.2em] ml-1">
                Authorized Email
              </label>
              <input
                type="email"
                className="input h-14 bg-surface"
                placeholder="protocol_alpha@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-brand tracking-[0.2em] ml-1">
                Security Key
              </label>
              <input
                type="password"
                className="input h-14 bg-surface"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name || !email || !password}
              className="btn-primary w-full h-16 text-lg font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 relative overflow-hidden group shadow-2xl shadow-brand/40 mt-4"
            >
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  <Target className="w-6 h-6 group-hover:rotate-45 transition-transform" />
                  CONFIRM ENROLLMENT
                  <ArrowRight className="w-5 h-5 absolute right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-10 pt-8 border-t border-border flex flex-col items-center gap-4">
            <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest text-center">
              Existing Operator?{" "}
              <Link
                to="/login"
                className="text-brand hover:underline underline-offset-4"
              >
                Access Terminal
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
