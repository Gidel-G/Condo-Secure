import { useState, useEffect } from "react";
import { Plus, Users, Utensils, Waves, Dumbbell, Calendar, Clock, MapPin, Trash2, AlertCircle } from "lucide-react";
import { db, auth, collection, query, onSnapshot, orderBy, where } from "@/src/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface AreaBookingProps {
  setActiveTab: (tab: string) => void;
  role?: string;
  user?: any;
}

export function AreaBooking({ setActiveTab, role, user }: AreaBookingProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [selectedArea, setSelectedArea] = useState("pool");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customAlert, setCustomAlert] = useState<{ title: string; message: string } | null>(null);

  const currentUid = user?.uid || auth?.currentUser?.uid || "resident-123";
  const currentUnit = user?.unit || "402";

  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  const getAreaBookingsForDate = (areaId: string, dateStr: string) => {
    return bookings.filter(b => b.status === "confirmed" && b.area === areaId && b.date === dateStr);
  };

  const checkConflict = (areaId: string, dateStr: string, startStr: string, endStr: string) => {
    if (!dateStr || !startStr || !endStr) return false;
    const newStart = toMinutes(startStr);
    const newEnd = toMinutes(endStr);
    if (newStart >= newEnd) return false;

    return bookings.some(b => {
      if (b.status !== "confirmed") return false;
      if (b.area !== areaId) return false;
      if (b.date !== dateStr) return false;

      const existingStart = toMinutes(b.startTime);
      const existingEnd = toMinutes(b.endTime);

      return newStart < existingEnd && existingStart < newEnd;
    });
  };

  const getUpcomingDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      dates.push({
        dateString,
        dayName: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      });
    }
    return dates;
  };

  const filteredBookings = bookings.filter(booking => {
    if (role === "syndic") {
      return booking.status === "confirmed";
    } else {
      return (booking.residentId === currentUid || 
              (currentUid === "resident-123" && booking.residentId === "demo-user-123") ||
              booking.unit === currentUnit) && booking.status === "confirmed";
    }
  });

  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const areas = [
    { id: "pool", name: "Piscina", icon: Waves, color: "bg-blue-50 text-blue-600" },
    { id: "gym", name: "Academia", icon: Dumbbell, color: "bg-orange-50 text-orange-600" },
    { id: "grill", name: "Churrasqueira", icon: Utensils, color: "bg-red-50 text-red-600" },
    { id: "party", name: "Salão de Festas", icon: Users, color: "bg-purple-50 text-purple-600" },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("condo_bookings");
    if (stored) {
      setBookings(JSON.parse(stored));
      setLoading(false);
    } else {
      const defaultMock = [
        { id: "b1", area: "grill", date: "2026-05-25", startTime: "12:00", endTime: "18:00", status: "confirmed", residentId: "demo-user-123", residentName: "Morador Demo", unit: "402" },
        { id: "b2", area: "pool", date: "2026-05-26", startTime: "14:00", endTime: "16:00", status: "confirmed", residentId: "user-abc-99", residentName: "Ana Paula de Souza", unit: "104" },
        { id: "b3", area: "party", date: "2026-05-27", startTime: "18:00", endTime: "23:00", status: "confirmed", residentId: "user-xyz-88", residentName: "Ronaldo Marques", unit: "201" }
      ];
      localStorage.setItem("condo_bookings", JSON.stringify(defaultMock));
      setBookings(defaultMock);
      setLoading(false);
    }
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      return setCustomAlert({
        title: "Selecione uma Data",
        message: "Por favor, selecione uma data para realizar a sua reserva."
      });
    }
    
    // 1. Prevent Same-Day or Past Bookings (Allow Tomorrow onwards)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const [year, month, day] = date.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    
    if (selectedDate < tomorrow) {
      return setCustomAlert({
        title: "Antecedência Necessária",
        message: "As reservas devem ser feitas com pelo menos 1 dia de antecedência (a partir de amanhã)."
      });
    }

    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime);

    if (newStart >= newEnd) {
      return setCustomAlert({
        title: "Horário Inválido",
        message: "O horário de início deve ser anterior ao horário de término."
      });
    }

    // Restrict booking hours between 10 AM (10:00) and 10 PM (22:00)
    const limitStart = toMinutes("10:00");
    const limitEnd = toMinutes("22:00");

    if (newStart < limitStart || newEnd > limitEnd) {
      return setCustomAlert({
        title: "Fora do Horário",
        message: "As reservas de áreas comuns são limitadas ao horário de regulamento das 10:00 às 22:00."
      });
    }

    // 2. Prevent Overlapping/Duplicate Bookings Validation
    const hasConflict = bookings.some(b => {
      if (b.status !== "confirmed") return false;
      if (b.area !== selectedArea) return false;
      if (b.date !== date) return false;

      const existingStart = toMinutes(b.startTime);
      const existingEnd = toMinutes(b.endTime);

      // Overlap condition: start_A < end_B AND start_B < end_A
      return newStart < existingEnd && existingStart < newEnd;
    });

    if (hasConflict) {
      return setCustomAlert({
        title: "Horário Reservado",
        message: "Não é possível agendar: Esta área já está reservada por outro morador neste período."
      });
    }

    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newBooking = {
      id: "b-" + Math.random().toString(36).substr(2, 9),
      area: selectedArea,
      date: date,
      startTime: startTime,
      endTime: endTime,
      status: "confirmed",
      residentId: auth?.currentUser?.uid || "demo-user-123",
      residentName: auth?.currentUser?.displayName || "Morador Demo",
      unit: user?.unit || "402",
      createdAt: new Date().toISOString()
    };

    const updated = [newBooking, ...bookings];
    localStorage.setItem("condo_bookings", JSON.stringify(updated));
    setBookings(updated);
    setIsSubmitting(false);
    setShowModal(false);
    
    // Reset form
    setDate("");
    setSelectedArea("pool");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 pb-24">
      <header className="flex justify-between items-center mb-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Agendamentos</h1>
          <p className="text-slate-500 text-sm font-medium">
            {role === "syndic" ? "Visualize e controle as reservas de áreas comuns." : "Clique na área que deseja agendar."}
          </p>
          {role !== "syndic" && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100/80 text-amber-700 px-3 py-1 rounded-2xl text-[9px] font-black uppercase tracking-widest leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              * Reserva com no mínimo 1 dia de antecedência
            </div>
          )}
        </div>
      </header>

      {/* Areas Bento Row */}
      <section>
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Áreas Disponíveis</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          {areas.map((area) => (
            <div 
              key={area.id} 
              className={cn(
                "flex-shrink-0 flex flex-col items-center group",
                role !== "syndic" ? "cursor-pointer" : "cursor-default"
              )}
              onClick={() => {
                if (role === "syndic") return;
                setSelectedArea(area.id);
                setShowModal(true);
              }}
            >
              <div className={cn(
                "w-20 h-20 rounded-[2rem] flex items-center justify-center mb-3 shadow-sm border transition-all",
                role !== "syndic" && "group-hover:scale-105 group-hover:-translate-y-1",
                area.color,
                area.id === "pool" ? "border-blue-200" : 
                area.id === "gym" ? "border-orange-200" : 
                area.id === "grill" ? "border-red-200" : "border-purple-200"
              )}>
                <area.icon size={32} strokeWidth={2} />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{area.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* My Bookings - Bento List */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
             {role === "syndic" ? "Reservas dos Condôminos" : "Minhas Reservas"}
           </h2>
           {role !== "syndic" && (
             <button 
               onClick={() => setActiveTab("cancel-booking")}
               className="text-[10px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest flex items-center gap-1.5"
             >
               Gerenciar Cancelamentos
             </button>
           )}
        </div>
        {filteredBookings.length === 0 ? (
          <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
            <Calendar className="mx-auto text-slate-300 mb-4" size={56} />
            <p className="text-slate-400 text-sm font-medium">
              {role === "syndic" ? "Nenhuma reserva confirmada encontrada." : "Nenhuma reserva ativa."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings
              .map((booking) => {
              const area = areas.find(a => a.id === booking.area) || areas[0];
              return (
                <div key={booking.id} className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-slate-200 flex gap-5 group hover:border-indigo-300 transition-colors">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner transition-transform group-hover:scale-110",
                    area.color,
                    area.id === "pool" ? "border-blue-100" : 
                    area.id === "gym" ? "border-orange-100" : 
                    area.id === "grill" ? "border-red-100" : "border-purple-100"
                  )}>
                    <area.icon size={26} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                      <div>
                        <h3 className="font-black text-slate-800 text-lg leading-tight">{area.name}</h3>
                        <p className="text-xs font-semibold mt-1 text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                          <span className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-black text-[9px]">
                            Apto {booking.unit || "402"}
                          </span>
                          <span className="text-slate-500 font-bold">
                            {booking.residentName || "Morador Demo"}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          booking.status === "confirmed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                          {booking.status === "confirmed" ? "Confirmado" : "Cancelado"}
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                          R$ 100,00
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/60">
                      <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-indigo-500" strokeWidth={3} />
                          {new Date(booking.date).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-indigo-500" strokeWidth={3} />
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </div>
                      {role !== "syndic" && booking.status === "confirmed" && (
                        <button 
                          onClick={() => setActiveTab("cancel-booking")}
                          className="text-[9px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Real Form Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-8 block sm:hidden" />
              
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                <h2 className="text-2xl font-black text-slate-800">Nova Reserva</h2>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-6">
                {/* Area Selection Chips */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-3">Selecione a Área</label>
                  <div className="grid grid-cols-2 gap-2">
                    {areas.map(area => (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => setSelectedArea(area.id)}
                        className={cn(
                          "px-4 py-3 rounded-2xl border text-sm font-bold transition-all text-left flex items-center gap-2",
                          selectedArea === area.id 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                            : "bg-slate-50 text-slate-600 border-slate-100 hover:border-indigo-200"
                        )}
                      >
                        <area.icon size={16} />
                        {area.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Calendar Dates with Availability Indicators */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Datas Recomendadas (Próximos 14 dias)</label>
                      <span className="text-[9px] font-black uppercase tracking-wider flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                          <span className="text-emerald-600">Livre</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500 block"></span>
                          <span className="text-rose-600 font-bold">Ocupado</span>
                        </span>
                      </span>
                    </div>
                    
                    <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
                      {getUpcomingDates().map((item) => {
                        const dayBookings = getAreaBookingsForDate(selectedArea, item.dateString);
                        const isBooked = dayBookings.length > 0;
                        const isSelected = date === item.dateString;
                        
                        return (
                          <button
                            key={item.dateString}
                            type="button"
                            onClick={() => setDate(item.dateString)}
                            className={cn(
                              "flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-between p-2 pb-2.5 transition-all outline-none border",
                              isSelected 
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-105" 
                                : "bg-slate-50 text-slate-700 border-slate-100 hover:border-slate-300",
                            )}
                          >
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-wider mt-1",
                              isSelected ? "text-indigo-200" : "text-slate-400"
                            )}>
                              {item.dayName}
                            </span>
                            <span className="text-base font-black tracking-tight leading-none my-0.5">
                              {item.dayNum}
                            </span>
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border text-center leading-none scale-90",
                              isSelected 
                                ? (isBooked ? "bg-indigo-700 text-indigo-100 border-indigo-800" : "bg-indigo-700 text-indigo-100 border-indigo-800")
                                : (isBooked ? "bg-rose-50 text-rose-600 border-rose-100 font-bold" : "bg-emerald-50 text-emerald-600 border-emerald-100")
                            )}>
                              {isBooked ? "Ocupado" : "Livre"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">Ou digite uma data específica</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      min={getTomorrowString()}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>

                  {/* List reservations on this day */}
                  {date && getAreaBookingsForDate(selectedArea, date).length > 0 && (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <AlertCircle size={12} strokeWidth={2.5} />
                        Reservas existentes nesta data:
                      </p>
                      <div className="space-y-1">
                        {getAreaBookingsForDate(selectedArea, date).map((b, i) => (
                          <p key={i} className="text-xs font-semibold text-rose-950">
                            • <span className="font-extrabold">{b.startTime} às {b.endTime}</span> (Apto {b.unit})
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-3">Início</label>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    >
                      {["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"].map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-3">Fim</label>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    >
                      {["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"].map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Real-time Conflict Warning Banner */}
                {date && checkConflict(selectedArea, date, startTime, endTime) && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-500 text-white p-4 rounded-3xl flex items-start gap-3 shadow-lg shadow-rose-100"
                  >
                    <AlertCircle className="shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">Horário Requisitado Ocupado</p>
                      <p className="text-[11px] font-semibold opacity-90 leading-normal mt-0.5 font-sans">
                        Esta área já possui agendamento confirmado no período de {startTime} às {endTime}. Escolha outro horário ou altere o dia.
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="pt-4 space-y-4">
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Taxa de Reserva</p>
                      <p className="text-sm font-bold text-indigo-900">Valor único por período</p>
                    </div>
                    <p className="text-xl font-black text-indigo-600 tracking-tight">R$ 100,00</p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting || (date !== "" && checkConflict(selectedArea, date, startTime, endTime))}
                    className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : "CONFIRMAR RESERVA"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full mt-2 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Popup Alert Modal */}
      <AnimatePresence>
        {customAlert && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomAlert(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            {/* Alert Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-xs p-6 shadow-2xl border border-slate-100 relative z-10 overflow-hidden text-center"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <AlertCircle className="text-rose-500" size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight">{customAlert.title}</h3>
              <p className="text-slate-500 font-semibold text-xs leading-relaxed mb-5">{customAlert.message}</p>
              <button 
                onClick={() => setCustomAlert(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md"
              >
                Entendi
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
