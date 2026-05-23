import { useState, useEffect } from "react";
import { ChevronLeft, Calendar, Clock, AlertCircle, Trash2, XCircle, Waves, Dumbbell, Utensils, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { auth } from "@/src/lib/firebase";

interface CancelBookingProps {
  setActiveTab: (tab: string) => void;
  user?: any;
}

export function CancelBooking({ setActiveTab, user }: CancelBookingProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const areas = [
    { id: "pool", name: "Piscina", icon: Waves, color: "bg-blue-50 text-blue-600 border-blue-200" },
    { id: "gym", name: "Academia", icon: Dumbbell, color: "bg-orange-50 text-orange-600 border-orange-200" },
    { id: "grill", name: "Churrasqueira", icon: Utensils, color: "bg-red-50 text-red-600 border-red-200" },
    { id: "party", name: "Salão de Festas", icon: Users, color: "bg-purple-50 text-purple-600 border-purple-200" },
  ];

  // Load from local storage or fallback to mock
  useEffect(() => {
    const stored = localStorage.getItem("condo_bookings");
    if (stored) {
      setBookings(JSON.parse(stored));
    } else {
      const defaultMock = [
        { id: "b1", area: "grill", date: "2026-05-25", startTime: "12:00", endTime: "18:00", status: "confirmed", residentId: "demo-user-123" }
      ];
      localStorage.setItem("condo_bookings", JSON.stringify(defaultMock));
      setBookings(defaultMock);
    }
  }, []);

  const handleCancel = async () => {
    if (!selectedBooking) return;
    setIsDeleting(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const updated = bookings.map(b => {
      if (b.id === selectedBooking.id) {
        return { ...b, status: "cancelled" };
      }
      return b;
    });

    localStorage.setItem("condo_bookings", JSON.stringify(updated));
    setBookings(updated);
    setIsDeleting(false);
    setSelectedBooking(null);
  };

  const currentUid = user?.uid || auth?.currentUser?.uid || "resident-123";
  const currentUnit = user?.unit || "402";
  const activeBookings = bookings.filter(b => 
    b.status === "confirmed" && 
    (b.residentId === currentUid || 
     (currentUid === "resident-123" && b.residentId === "demo-user-123") ||
     b.unit === currentUnit)
  );

  return (
    <div className="min-h-screen bg-zinc-50 p-6 pb-28">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setActiveTab("booking")}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm active:scale-95 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-widest">Cancelar Reserva</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Selecione o agendamento</p>
        </div>
      </header>

      {/* Main Container */}
      <div className="space-y-6">
        {activeBookings.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200 shadow-sm">
            <XCircle className="mx-auto text-slate-300 mb-4" size={56} />
            <p className="text-slate-500 font-bold text-lg mb-1">Nenhuma reserva ativa</p>
            <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto">
              Você não possui nenhum agendamento confirmado no momento para realizar cancelamentos.
            </p>
            <button
              onClick={() => setActiveTab("booking")}
              className="mt-6 bg-indigo-600 text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-indigo-100"
            >
              Nova Reserva
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeBookings.map((booking) => {
              const area = areas.find(a => a.id === booking.area) || areas[0];
              return (
                <div 
                  key={booking.id} 
                  className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200 flex flex-col gap-4 group hover:border-red-200 transition-colors relative overflow-hidden"
                >
                  <div className="flex gap-4 items-start">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner transition-transform group-hover:scale-110",
                      area.color
                    )}>
                      <area.icon size={22} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-slate-800 text-lg leading-tight">{area.name}</h3>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-wider">
                          R$ 100,00
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-indigo-500" strokeWidth={3} />
                          {new Date(booking.date).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-indigo-500" strokeWidth={3} />
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cancel Button */}
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-4 py-2 bg-rose-50 text-rose-600 font-black text-[10px] rounded-xl border border-rose-100 shadow-sm active:scale-95 transition-transform flex items-center gap-2 uppercase tracking-widest hover:bg-rose-100"
                    >
                      <Trash2 size={12} />
                      Cancelar Agendamento
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info legend */}
        <div className="bg-slate-100 border border-slate-200/60 p-5 rounded-3xl flex items-start gap-3.5 mt-8">
          <AlertCircle className="text-slate-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-xs text-slate-600 font-bold leading-relaxed">
              Consulte o regulamento do condomínio sobre cancelamento
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 leading-normal">
              Cancelamentos realizados com menos de 24h de antecedência podem sofrer retenção da taxa administrativa de agendamento de áreas comuns.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedBooking(null)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-6 block sm:hidden" />
              
              <div className="flex items-center gap-3 mb-4 text-rose-600">
                <AlertCircle size={24} strokeWidth={2.5} />
                <h2 className="text-2xl font-black tracking-tight">Confirmar Cancelamento</h2>
              </div>

              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                Tem certeza que deseja cancelar sua reserva para a área{" "}
                <span className="font-extrabold text-slate-800">
                  {areas.find(a => a.id === selectedBooking.area)?.name}
                </span>{" "}
                no dia <span className="font-extrabold text-slate-800">{new Date(selectedBooking.date).toLocaleDateString("pt-BR")}</span>?
              </p>

              <div className="space-y-3">
                <button 
                  onClick={handleCancel}
                  disabled={isDeleting}
                  className="w-full bg-rose-600 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "CANCELAR RESERVA"}
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="w-full py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest text-center"
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
