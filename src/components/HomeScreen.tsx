import { LogOut, Bell, Package, Calendar, Megaphone, DollarSign, ChevronRight, User, Users } from "lucide-react";
import { auth } from "@/src/lib/firebase";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { Logo } from "./Logo";

interface HomeProps {
  user: any;
  role: "resident" | "syndic";
  setActiveTab: (tab: string) => void;
}

export function HomeScreen({ user, role, setActiveTab }: HomeProps) {
  const quickActions = [
    { id: "deliveries", label: "Entregas", icon: Package, color: "bg-amber-100 text-amber-700", border: "border-amber-200" },
    { id: "booking", label: "Reservas", icon: Calendar, color: "bg-indigo-100 text-indigo-700", border: "border-indigo-200" },
    { id: "board", label: "Mural", icon: Megaphone, color: "bg-orange-100 text-orange-700", border: "border-orange-200" },
  ];

  if (role === "syndic") {
    quickActions.push({ id: "finance", label: "Financeiro", icon: DollarSign, color: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" });
  }
  quickActions.push({ id: "visitors", label: "Visitantes", icon: Users, color: "bg-teal-100 text-teal-700", border: "border-teal-200" });

  return (
    <div className="space-y-8 p-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div className="flex flex-col items-start">
          <Logo variant="horizontal" iconSize={32} />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Gestão Integrada</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{user?.displayName?.split(" ")[0] || "Usuário"}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{role === "syndic" ? "Síndico" : "Morador"}</p>
          </div>
          <button 
            onClick={() => setActiveTab("profile")}
            className="w-12 h-12 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm active:scale-95 transition-transform"
          >
            {user?.displayName?.[0] || <User size={20} />}
          </button>
        </div>
      </header>

      {/* Hero Card - Styled like a Bento Tile */}
      <section className="relative overflow-hidden bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-6 bg-white/30 rounded-full"></span>
            <h2 className="text-lg font-bold">Resumo do Dia</h2>
          </div>
          <p className="text-indigo-100 text-sm mb-6 max-w-[200px] leading-relaxed">
            Você tem 3 encomendas pendentes na portaria e 1 reserva futura.
          </p>
          <button 
            onClick={() => setActiveTab("deliveries")}
            className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
          >
            Ver Detalhes
          </button>
        </div>
        {/* Abstract patterns from design style */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-400 rounded-full blur-3xl opacity-20" />
      </section>

      {/* Quick Actions Grid - Bento Style */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Painel de Controle</h3>
          <Bell size={18} className="text-slate-300" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(action.id)}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left group hover:border-indigo-300 transition-colors"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border shadow-sm transition-transform group-hover:scale-110", action.color, action.border)}>
                <action.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-800 text-lg">{action.label}</span>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Announcements Preview - Dark Bento Tile */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Megaphone className="text-orange-400" size={20} />
          Último Comunicado
        </h2>
        <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Próxima Terça-feira</p>
          <h3 className="text-sm font-bold mb-2">Manutenção Preventiva de Elevadores</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            O elevador de serviço estará indisponível das 09h às 11h para testes de segurança.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab("board")}
          className="mt-6 text-indigo-400 text-xs font-bold flex items-center gap-1 hover:text-indigo-300"
        >
          VER TODOS OS AVISOS <ChevronRight size={14} />
        </button>
      </section>
    </div>
  );
}
