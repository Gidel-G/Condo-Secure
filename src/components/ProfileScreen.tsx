import { User, Mail, Lock, LogOut, ChevronLeft, ShieldCheck, X } from "lucide-react";
import { auth } from "@/src/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

interface ProfileProps {
  user: any;
  role: string;
  setActiveTab: (tab: string) => void;
}

export function ProfileScreen({ user, role, setActiveTab }: ProfileProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return alert("As novas senhas não coincidem!");
    }
    
    setIsUpdating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    alert("Senha alterada com sucesso!");
    setShowPasswordModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 pb-24">
      {/* Header with Back Button */}
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setActiveTab("home")}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm active:scale-95 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-widest">Minha Conta</h1>
      </header>

      {/* Profile Header Card */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm mb-8 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center text-white text-4xl font-black shadow-xl mb-6 border-4 border-indigo-50">
            {user?.displayName?.[0] || <User size={40} />}
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">{user?.displayName || "Morador"}</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {role === "syndic" ? "Síndico do Condomínio" : `Morador • Unidade ${user?.unit || "402"}`}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
      </section>

      {/* Info Rows */}
      <div className="space-y-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <Mail size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail de Acesso</p>
              <p className="font-bold text-slate-700">{user?.email || "demo@condo.com"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <Lock size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Palavra-passe</p>
              <p className="font-bold text-slate-700">••••••••</p>
            </div>
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
            >
              Alterar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} />
           </div>
           <div>
              <p className="text-sm font-bold text-slate-700">Conta Verificada</p>
              <p className="text-xs text-slate-400">Seu cadastro está em conformidade com o regulamento do condomínio.</p>
           </div>
        </div>
      </div>

      {/* Logout Action */}
      <div className="mt-8">
        <button 
          onClick={() => auth?.signOut()}
          className="w-full bg-rose-50 text-rose-600 font-black py-5 rounded-[2rem] border border-rose-100 shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
        >
          <LogOut size={18} />
          Encerrar Sessão
        </button>
      </div>

      <p className="mt-12 text-[10px] text-slate-400 text-center font-black uppercase tracking-[0.2em] opacity-40">CondoSecure v2.4.0</p>

      {/* Update Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                  <h2 className="text-xl font-black text-slate-800">Alterar Senha</h2>
                </div>
                <button onClick={() => setShowPasswordModal(false)} className="text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-3">Senha Atual</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="password" 
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-3">Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-3">Confirmar Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isUpdating}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : "ATUALIZAR SENHA"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
