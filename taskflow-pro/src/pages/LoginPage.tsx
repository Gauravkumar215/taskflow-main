import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { LogIn, CheckSquare, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login({ email, password });
      const from = (location.state as any)?.from?.pathname;

      if (from && !from.includes("/login")) {
        navigate(from, { replace: true });
      } else {
        navigate(
          user.role === "admin" ? "/admin/dashboard" : "/member/dashboard",
          { replace: true },
        );
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden px-6">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-brand/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[10%] w-[40rem] h-[40rem] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
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
            SYSTEM ENTRY
          </h1>
          <p className="text-text-secondary mt-2 font-medium tracking-tight">
            Establish connection to <span className="text-brand font-bold">TASKFLOW CORE</span>
          </p>
        </div>

        {/* BRUTALIST LOGIN FORM */}
        <div className="glass p-10 rounded-3xl shadow-2xl border border-border/50 relative">
          <div className="absolute top-0 right-10 -translate-y-1/2 bg-brand text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Identity Required
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-brand tracking-[0.2em] ml-1">
                Authorized Email
              </label>
              <input
                type="email"
                className="input h-14 text-lg border-2 border-transparent focus:border-brand/30 transition-all bg-surface"
                placeholder="protocol_alpha@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase text-brand tracking-[0.2em]">
                  Security Key
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-bold text-text-secondary hover:text-brand transition-colors uppercase tracking-widest"
                >
                  Key Recovery?
                </Link>
              </div>

              <input
                type="password"
                className="input h-14 text-lg border-2 border-transparent focus:border-brand/30 transition-all bg-surface"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full h-16 text-lg font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 relative overflow-hidden group shadow-2xl shadow-brand/40"
            >
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  INITIATE COMMAND
                  <ArrowRight className="w-5 h-5 absolute right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-10 pt-8 border-t border-border flex flex-col items-center gap-4">
            <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">
              New Operator Status?{" "}
              <Link
                to="/register"
                className="text-brand hover:underline underline-offset-4"
              >
                Request Deployment
              </Link>
            </p>
            
            <div className="flex items-center gap-6 opacity-30">
               <div className="h-px w-12 bg-border" />
               <p className="text-[8px] font-black">ENCRYPTED END-TO-END</p>
               <div className="h-px w-12 bg-border" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
