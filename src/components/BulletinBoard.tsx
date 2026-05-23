import { useState, useEffect } from "react";
import { Megaphone, Info, AlertTriangle, PartyPopper, Calendar, Plus, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface BulletinBoardProps {
  role?: string;
}

export function BulletinBoard({ role }: BulletinBoardProps) {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");

  useEffect(() => {
    // Check if notices are stored in localStorage
    const stored = localStorage.getItem("condo_notices");
    if (stored) {
      setNotices(JSON.parse(stored));
      setLoading(false);
    } else {
      const defaultNotices = [
        { id: "n1", title: "Limpeza de Caixa d'Água", content: "Ocorrerá na próxima terça-feira às 18:00 para desinfecção periódica do reservatório.", type: "maintenance", createdAt: new Date().toISOString() },
        { id: "n2", title: "Festa Junina do Condomínio", content: "Prepare seu traje caipira! Teremos fogueira, comidas típicas e brinquedos infláveis no dia 20 de Junho.", type: "event", createdAt: new Date().toISOString() }
      ];
      localStorage.setItem("condo_notices", JSON.stringify(defaultNotices));
      setNotices(defaultNotices);
      setLoading(false);
    }
  }, []);

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return alert("Por favor, preencha todos os campos do aviso.");
    }

    const newNotice = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      type,
      createdAt: new Date().toISOString()
    };

    const updated = [newNotice, ...notices];
    localStorage.setItem("condo_notices", JSON.stringify(updated));
    setNotices(updated);
    
    // Clear form & close modal
    setTitle("");
    setContent("");
    setType("general");
    setShowModal(false);
  };

  const handleDeleteNotice = (id: string) => {
    if (confirm("Deseja realmente excluir este aviso?")) {
      const updated = notices.filter(n => n.id !== id);
      localStorage.setItem("condo_notices", JSON.stringify(updated));
      setNotices(updated);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "important": return <AlertTriangle className="text-red-500" size={20} />;
      case "maintenance": return <Info className="text-blue-500" size={20} />;
      case "event": return <PartyPopper className="text-purple-500" size={20} />;
      default: return <Megaphone className="text-slate-500" size={20} />;
    }
  };

  const getTagColor = (type: string) => {
    switch (type) {
      case "important": return "bg-red-50 text-red-700 border-red-100";
      case "maintenance": return "bg-blue-50 text-blue-700 border-blue-100";
      case "event": return "bg-purple-50 text-purple-700 border-purple-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 pb-24">
      <header className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mural de Avisos</h1>
          <p className="text-slate-500 text-sm font-medium">Fique por dentro das novidades.</p>
        </div>
        {role === "syndic" && (
          <button 
            id="btn-create-notice"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black px-4 py-2.5 rounded-2xl text-[10px] uppercase tracking-[0.1em] transition-all duration-200 shadow-md active:scale-95 shrink-0"
          >
            <Plus size={14} strokeWidth={3} />
            Criar Aviso
          </button>
        )}
      </header>

      {notices.length === 0 ? (
        <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
          <Megaphone className="mx-auto text-slate-300 mb-4" size={56} />
          <p className="text-slate-400 font-bold">Nenhum aviso no momento.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {notices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, x: -25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, ease: "easeOut" }}
                className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:border-indigo-300 transition-colors"
                id={`notice-card-${notice.id}`}
              >
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                    getTagColor(notice.type)
                  )}>
                    {notice.type === "important" ? "Urgente" :
                     notice.type === "maintenance" ? "Manutenção" :
                     notice.type === "event" ? "Evento" : "Geral"}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <Calendar size={12} strokeWidth={3} />
                      {new Date(notice.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                    {role === "syndic" && (
                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="text-slate-300 hover:text-rose-600 transition-colors duration-150 p-1 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100"
                        title="Excluir aviso"
                        id={`btn-delete-notice-${notice.id}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 relative z-10">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform shadow-inner">
                    {getIcon(notice.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-800 text-lg leading-tight mb-2">{notice.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                       {notice.content}
                    </p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Notice Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="create-notice-modal">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-sm p-8 shadow-2xl relative z-10 border border-slate-100 overflow-hidden"
            >
              {/* Decorative light effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-60"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[9px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                    Postar no Mural
                  </span>
                  <h2 className="text-xl font-black text-slate-800 mt-2.5 tracking-tight">Criar Novo Aviso</h2>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateNotice} className="space-y-4">
                {/* Notice Title */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Título do Aviso</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Interrupção de Água, Assembleia Geral..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={60}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    id="input-notice-title"
                  />
                </div>

                {/* Notice Type Select */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Categoria</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    id="select-notice-type"
                  >
                    <option value="general">📢 Geral / Comunicado</option>
                    <option value="important">🚨 Urgente / Importante</option>
                    <option value="maintenance">🔧 Manutenção</option>
                    <option value="event">🎉 Evento</option>
                  </select>
                </div>

                {/* Notice Content Description */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Conteúdo</label>
                  <textarea 
                    placeholder="Digite a mensagem completa do aviso aqui..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={4}
                    maxLength={300}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-700 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                    id="textarea-notice-content"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold py-3.5 rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-md text-center"
                    id="btn-submit-notice"
                  >
                    Publicar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
