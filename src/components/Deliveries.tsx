import { useState, useEffect } from "react";
import { Package, CheckCircle, Clock, Truck } from "lucide-react";
import { db, auth, collection, query, where, onSnapshot, orderBy } from "@/src/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface DeliveriesProps {
  user?: any;
}

export function Deliveries({ user }: DeliveriesProps) {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read from localStorage to sync with Syndic registration
    const syncDeliveries = () => {
      const stored = localStorage.getItem("condo_deliveries");
      const userUnit = user?.unit || "402";
      if (stored) {
        const parsed = JSON.parse(stored);
        // Let's filter to only show deliveries registered for their apartment unit or matching their residentId.
        const residentSelected = parsed.filter(
          (d: any) => d.unit === userUnit || d.residentId === user?.uid
        );
        setDeliveries(residentSelected);
      } else {
        // Build initial demo data
        const initial = [
          { id: "del-1", courier: "Amazon", trackingCode: "AMZ778291", status: "received_at_gate", receivedAt: new Date(Date.now() - 3600000).toISOString(), unit: userUnit, recipientName: user?.displayName || "Morador Demo" },
          { id: "del-2", courier: "Mercado Livre", trackingCode: "ML5529910", status: "picked_up", receivedAt: new Date(Date.now() - 72000000).toISOString(), unit: "101", recipientName: "Ana Paula" }
        ];
        localStorage.setItem("condo_deliveries", JSON.stringify(initial));
        setDeliveries(initial.filter((d: any) => d.unit === userUnit));
      }
      setLoading(false);
    };

    syncDeliveries();
    
    // Listen for storage changes in real-time
    window.addEventListener("storage", syncDeliveries);
    return () => window.removeEventListener("storage", syncDeliveries);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Entregas na Portaria</h1>
        <p className="text-slate-500 text-sm font-medium">Acompanhe suas encomendas em tempo real.</p>
      </header>

      {deliveries.length === 0 ? (
        <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
          <Package className="mx-auto text-slate-300 mb-4" size={56} />
          <p className="text-slate-600 font-bold text-lg">Sem entregas agora</p>
          <p className="text-slate-400 text-sm mt-1 max-w-[200px] mx-auto">Novas encomendas aparecerão automaticamente aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {deliveries.map((delivery, index) => (
              <motion.div
                key={delivery.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex items-center gap-5 group hover:border-indigo-200 transition-colors"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110",
                  delivery.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                  delivery.status === "received_at_gate" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                  "bg-slate-50 text-slate-400 border-slate-100 opacity-60"
                )}>
                  {delivery.status === "pending" ? <Clock size={28} /> :
                   delivery.status === "received_at_gate" ? <Truck size={28} /> :
                   <CheckCircle size={28} />}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                     <span className={cn(
                       "w-1.5 h-4 rounded-full",
                       delivery.status === "pending" ? "bg-amber-400" :
                       delivery.status === "received_at_gate" ? "bg-indigo-500" : "bg-slate-300"
                     )}></span>
                     <h3 className="font-bold text-slate-800 truncate text-base leading-tight">
                        {delivery.courier || "Encomenda"}
                     </h3>
                   </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    {delivery.status === "received_at_gate" ? "DISPONÍVEL NA PORTARIA" :
                     delivery.status === "picked_up" ? "RETIRADO" : "EM TRÂNSITO"}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 block uppercase font-black tracking-widest mb-1">
                    {new Date(delivery.receivedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                  <div className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <span className="text-xs font-black text-slate-700 block tabular-nums">
                       {new Date(delivery.receivedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
