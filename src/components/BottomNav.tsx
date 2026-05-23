import { Home, Package, DollarSign, Megaphone, Calendar, Users } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: "resident" | "syndic";
}

export function BottomNav({ activeTab, setActiveTab, role }: BottomNavProps) {
  const tabs = [
    { id: "home", label: "Início", icon: Home },
    { id: "deliveries", label: "Entregas", icon: Package },
    { id: "board", label: "Avisos", icon: Megaphone },
    { id: "booking", label: "Reserva", icon: Calendar },
  ];

  if (role === "syndic") {
    tabs.push({ id: "finance", label: "Financeiro", icon: DollarSign });
  }
  tabs.push({ id: "visitors", label: "Visitantes", icon: Users });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 pb-safe z-50">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-all relative",
                isActive ? "text-indigo-600 scale-110" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-colors",
                isActive && "bg-indigo-50"
              )}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.1em] mt-1",
                isActive ? "opacity-100" : "opacity-0"
              )}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-[1px] w-8 h-1 bg-indigo-600 rounded-b-full" 
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
