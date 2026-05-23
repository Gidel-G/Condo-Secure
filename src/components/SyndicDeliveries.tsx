import { useState, useEffect } from "react";
import { Package, CheckCircle, Clock, Truck, Plus, Trash2, Search, Filter, Hash, User, Calendar, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

export function SyndicDeliveries() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "picked_up">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  // New Delivery Form State
  const [courier, setCourier] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [unit, setUnit] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default demo data for deliveries if not present in local storage
  const defaultDeliveries = [
    { id: "del-1", courier: "Amazon", trackingCode: "AMZ778291", status: "received_at_gate", receivedAt: new Date(Date.now() - 3600000).toISOString(), unit: "402", recipientName: "Morador Demo" },
    { id: "del-2", courier: "Mercado Livre", trackingCode: "ML5529910", status: "picked_up", receivedAt: new Date(Date.now() - 72000000).toISOString(), unit: "101", recipientName: "Ana Paula" },
    { id: "del-3", courier: "Correios (Sedex)", trackingCode: "SX829102BR", status: "received_at_gate", receivedAt: new Date(Date.now() - 18000000).toISOString(), unit: "204", recipientName: "Carlos Pereira" },
    { id: "del-4", courier: "DHL Express", trackingCode: "DHL9928172", status: "received_at_gate", receivedAt: new Date(Date.now() - 86450000).toISOString(), unit: "303", recipientName: "Mariana Costa" }
  ];

  useEffect(() => {
    const stored = localStorage.getItem("condo_deliveries");
    if (stored) {
      setDeliveries(JSON.parse(stored));
    } else {
      localStorage.setItem("condo_deliveries", JSON.stringify(defaultDeliveries));
      setDeliveries(defaultDeliveries);
    }
  }, []);

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courier || !unit) return alert("Por favor, preencha a transportadora e a unidade.");

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const newDelivery = {
      id: "del-" + Math.random().toString(36).substr(2, 9),
      courier,
      trackingCode: "",
      unit,
      recipientName: recipientName || `Morador Apto ${unit}`,
      status: "received_at_gate",
      receivedAt: new Date().toISOString()
    };

    const updated = [newDelivery, ...deliveries];
    localStorage.setItem("condo_deliveries", JSON.stringify(updated));
    setDeliveries(updated);
    
    // Clear inputs & close
    setCourier("");
    setTrackingCode("");
    setUnit("");
    setRecipientName("");
    setIsSubmitting(false);
    setShowModal(false);
  };

  const handleToggleStatus = (id: string) => {
    const updated = deliveries.map((del) => {
      if (del.id === id) {
        const nextStatus = del.status === "received_at_gate" ? "picked_up" : "received_at_gate";
        return { ...del, status: nextStatus };
      }
      return del;
    });
    localStorage.setItem("condo_deliveries", JSON.stringify(updated));
    setDeliveries(updated);
  };

  const handleDeleteDelivery = (id: string) => {
    if (!confirm("Confirmar a remoção do registro desta entrega?")) return;
    const updated = deliveries.filter((del) => del.id !== id);
    localStorage.setItem("condo_deliveries", JSON.stringify(updated));
    setDeliveries(updated);
  };

  const filteredDeliveries = deliveries.filter((del) => {
    const matchesFilter = 
      filter === "all" || 
      (filter === "pending" && del.status === "received_at_gate") ||
      (filter === "picked_up" && del.status === "picked_up");

    const matchesSearch = 
      del.courier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      del.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (del.recipientName && del.recipientName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 p-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-start gap-4">
        <div>
          <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full font-black uppercase tracking-widest">
            Acesso Síndico
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2">Logística de Portaria</h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Gestão global de entregas recebidas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center hover:bg-slate-800"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </header>

      {/* Overview Analytics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Total</span>
          <p className="text-xl font-black text-slate-800 mt-1 tabular-nums">{deliveries.length}</p>
        </div>
        <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100">
          <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">Na Portaria</span>
          <p className="text-xl font-black text-amber-700 mt-1 tabular-nums">
            {deliveries.filter(d => d.status === "received_at_gate").length}
          </p>
        </div>
        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
          <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Retiradas</span>
          <p className="text-xl font-black text-emerald-700 mt-1 tabular-nums">
            {deliveries.filter(d => d.status === "picked_up").length}
          </p>
        </div>
      </div>

      {/* Custom Controls Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por unidade, transportadora, morador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Filters Segmented Tab */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/40">
          <button 
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all",
              filter === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Todas ({deliveries.length})
          </button>
          <button 
            type="button"
            onClick={() => setFilter("pending")}
            className={cn(
              "flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all",
              filter === "pending" ? "bg-white text-amber-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Pendentes ({deliveries.filter(d => d.status === "received_at_gate").length})
          </button>
          <button 
            type="button"
            onClick={() => setFilter("picked_up")}
            className={cn(
              "flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all",
              filter === "picked_up" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Entregues ({deliveries.filter(d => d.status === "picked_up").length})
          </button>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="space-y-3">
        {filteredDeliveries.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200">
            <Package className="mx-auto text-slate-300 mb-4" size={52} />
            <p className="text-slate-500 font-bold text-base">Nenhuma entrega encontrada</p>
            <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto mt-1">
              Refine a busca ou clique no botão "+" acima para registrar uma no sistema.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredDeliveries.map((delivery) => (
              <motion.div
                key={delivery.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "bg-white rounded-3xl p-5 shadow-sm border flex flex-col gap-3 group hover:border-indigo-200 transition-colors",
                  delivery.status === "picked_up" ? "border-slate-100 opacity-70" : "border-slate-200"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Status Indicator Circle */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105",
                    delivery.status === "received_at_gate" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  )}>
                    {delivery.status === "received_at_gate" ? <Clock size={22} strokeWidth={2.5} /> : <CheckCircle size={22} strokeWidth={2.5} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
                        Apto {delivery.unit}
                      </span>
                      <h3 className="font-bold text-slate-800 truncate text-sm">
                        {delivery.courier}
                      </h3>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                      <User size={12} className="text-slate-400" /> {delivery.recipientName}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end shrink-0 justify-between h-12">
                    <span className="text-[9px] text-slate-400 block uppercase font-black tracking-widest leading-none">
                      {new Date(delivery.receivedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 leading-none">
                      {new Date(delivery.receivedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* Operations Panel */}
                <div className="pt-3 border-t border-slate-100/60 flex items-center justify-between">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                    delivery.status === "received_at_gate" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  )}>
                    {delivery.status === "received_at_gate" ? "Na Portaria" : "Retirada"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleStatus(delivery.id)}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all active:scale-95",
                        delivery.status === "received_at_gate" 
                          ? "bg-slate-900 text-white hover:bg-slate-800" 
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )}
                    >
                      {delivery.status === "received_at_gate" ? "Marcar como Retirada" : "Garantir na Portaria"}
                    </button>
                    <button 
                      onClick={() => handleDeleteDelivery(delivery.id)}
                      className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg border border-rose-100 transition-colors active:scale-95"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Registration Modal Dialog */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-sm rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 block sm:hidden" />
              
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Nova Entrega</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Registrar recebimento de pacote</p>
              </div>

              <form onSubmit={handleCreateDelivery} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">Apartamento/Unidade *</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Ex: 402 ou 105"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">Transportadora *</label>
                  <div className="relative">
                    <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Ex: Amazon, Mercado Livre, Correios..."
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">Nome do Destinatário (Opcional)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Ex: João da Silva"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>



                <div className="pt-4 space-y-3">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Registrar Entrega"
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full py-2.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest text-center focus:outline-none"
                  >
                    Cancelar
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
