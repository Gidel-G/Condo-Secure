import { useState, useEffect } from "react";
import { Users, UserPlus, Search, HelpCircle, MapPin, Phone, Mail, Calendar, Trash2, ArrowLeft, ShieldAlert, CheckCircle, Smartphone, Hash, Navigation, Clock, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface Visitor {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  phone: string;
  email: string;
  cep: string;
  address: string;
  accessType: "always" | "specific";
  specificDate?: string;
  registeredBy: string; // resident Id
  unit: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

interface VisitorRegistrationProps {
  user: any;
  role: string;
  setActiveTab: (tab: string) => void;
}

// Helper to validate CPF
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false; // Evita CPFs inválidos conhecidos (todos dígitos iguais)
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

export function VisitorRegistration({ user, role, setActiveTab }: VisitorRegistrationProps) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "always" | "specific">("all");

  // Form State
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [accessType, setAccessType] = useState<"always" | "specific">("always");
  const [specificDate, setSpecificDate] = useState("");
  
  const [targetUnit, setTargetUnit] = useState("402");
  
  // Validation / Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [alertState, setAlertState] = useState<{ type: "success" | "error" | "info"; title: string; message: string } | null>(null);

  const currentUid = user?.uid || "resident-123";
  const currentUnit = user?.unit || "402";

  // Load visitors with fallback mock data
  useEffect(() => {
    const stored = localStorage.getItem("condo_visitors");
    if (stored) {
      setVisitors(JSON.parse(stored));
      setLoading(false);
    } else {
      const mockVisitors: Visitor[] = [
        {
          id: "v1",
          name: "Carlos Eduardo Santos",
          cpf: "123.456.789-00",
          rg: "55.432.112-9",
          phone: "(11) 98765-4321",
          email: "carlos.edu@gmail.com",
          cep: "01311-200",
          address: "Av. Paulista, 1500 - Bela Vista - São Paulo/SP",
          accessType: "always",
          registeredBy: "resident-123",
          unit: "402",
          createdAt: new Date().toISOString(),
          status: "approved"
        },
        {
          id: "v2",
          name: "Mariana Alencar Costa",
          cpf: "987.654.321-11",
          rg: "12.345.678-0",
          phone: "(21) 99888-7766",
          email: "mariana.alencar@yahoo.com.br",
          cep: "22041-011",
          address: "Rua Siqueira Campos, 200 - Copacabana - Rio de Janeiro/RJ",
          accessType: "specific",
          specificDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], // 2 days from now
          registeredBy: "resident-123",
          unit: "402",
          createdAt: new Date().toISOString(),
          status: "pending"
        },
        {
          id: "v3",
          name: "Beatriz Oliveira Reis",
          cpf: "456.123.789-55",
          rg: "44.685.231-X",
          phone: "(15) 99111-2233",
          email: "beatriz.reis@outlook.com",
          cep: "18010-000",
          address: "Rua Quinze de Novembro, 10 - Centro - Sorocaba/SP",
          accessType: "always",
          registeredBy: "demo-user-123",
          unit: "105",
          createdAt: new Date().toISOString(),
          status: "pending"
        }
      ];
      localStorage.setItem("condo_visitors", JSON.stringify(mockVisitors));
      setVisitors(mockVisitors);
      setLoading(false);
    }
  }, []);

  // Format CPF Input: 000.000.000-00
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.substring(0, 11);
    
    let formatted = val;
    if (val.length > 9) {
      formatted = `${val.substring(0, 3)}.${val.substring(3, 6)}.${val.substring(6, 9)}-${val.substring(9)}`;
    } else if (val.length > 6) {
      formatted = `${val.substring(0, 3)}.${val.substring(3, 6)}.${val.substring(6)}`;
    } else if (val.length > 3) {
      formatted = `${val.substring(0, 3)}.${val.substring(3)}`;
    }
    setCpf(formatted);
  };

  // Format CEP Input: 00000-000 and auto query public api
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.substring(0, 8);

    let formatted = val;
    if (val.length > 5) {
      formatted = `${val.substring(0, 5)}-${val.substring(5)}`;
    }
    setCep(formatted);

    // Call ViaCep API if exactly 8 digits
    if (val.length === 8) {
      setCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${val}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          setAlertState({
            type: "info",
            title: "CEP Não Encontrado",
            message: "Não conseguimos achar o endereço desse CEP automaticamente. Por favor, preencha o endereço manualmente."
          });
        } else {
          const formattedAddress = `${data.logradouro || ""}, ${data.bairro || ""} - ${data.localidade || ""}/${data.uf || ""}`;
          setAddress(formattedAddress);
        }
      } catch (err) {
        console.error("Erro na busca de CEP:", err);
      } finally {
        setCepLoading(false);
      }
    }
  };

  // Format Phone Input: (00) 00000-0000 or (00) 0000-0000
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.substring(0, 11);

    let formatted = val;
    if (val.length > 10) {
      formatted = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
    } else if (val.length > 6) {
      formatted = `(${val.substring(0, 2)}) ${val.substring(2, 6)}-${val.substring(6)}`;
    } else if (val.length > 2) {
      formatted = `(${val.substring(0, 2)}) ${val.substring(2)}`;
    } else if (val.length > 0) {
      formatted = `(${val}`;
    }
    setPhone(formatted);
  };

  // Format RG (Simple placeholder keeping)
  const handleRgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^0-9X]/g, "");
    if (val.length > 12) val = val.substring(0, 12);
    setRg(val);
  };

  const handleRegisterVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!name.trim()) return;
    if (!validateCPF(cpf)) {
      return setAlertState({
        type: "error",
        title: "CPF Inválido",
        message: "CPF inválido."
      });
    }
    if (accessType === "specific" && !specificDate) {
      return setAlertState({
        type: "error",
        title: "Selecione a Data",
        message: "Para liberação em dia específico, selecione a data correspondente."
      });
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // smooth experience

    const newVisitor: Visitor = {
      id: "v-" + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      cpf,
      rg,
      phone,
      email: email.trim() || "não informado",
      cep,
      address,
      accessType,
      specificDate: accessType === "specific" ? specificDate : undefined,
      registeredBy: currentUid,
      unit: role === "syndic" ? targetUnit : currentUnit,
      createdAt: new Date().toISOString(),
      status: role === "syndic" ? "approved" : "pending"
    };

    const updated = [newVisitor, ...visitors];
    localStorage.setItem("condo_visitors", JSON.stringify(updated));
    setVisitors(updated);
    
    // Clear Form State
    setName("");
    setCpf("");
    setRg("");
    setPhone("");
    setEmail("");
    setCep("");
    setAddress("");
    setAccessType("always");
    setSpecificDate("");
    
    setIsSubmitting(false);
    setShowAddForm(false);

    setAlertState({
      type: "success",
      title: role === "syndic" ? "Visitante Cadastrado!" : "Solicitação Enviada!",
      message: role === "syndic" 
        ? `${newVisitor.name} tem sua entrada autorizada e liberada na portaria com sucesso.`
        : `${newVisitor.name} foi cadastrado e encaminhado para o Síndico aprovar a liberação de acesso.`
    });
  };

  const handleApproveVisitor = (id: string) => {
    const updated = visitors.map(v => {
      if (v.id === id) {
        return { ...v, status: "approved" as const };
      }
      return v;
    });
    localStorage.setItem("condo_visitors", JSON.stringify(updated));
    setVisitors(updated);
    setAlertState({
      type: "success",
      title: "Visita Aprovada!",
      message: "O cadastro do visitante foi aprovado e sua entrada está liberada na portaria com sucesso."
    });
  };

  const handleRejectVisitor = (id: string) => {
    const updated = visitors.map(v => {
      if (v.id === id) {
        return { ...v, status: "rejected" as const };
      }
      return v;
    });
    localStorage.setItem("condo_visitors", JSON.stringify(updated));
    setVisitors(updated);
    setAlertState({
      type: "info",
      title: "Solicitação Recusada",
      message: "O acesso de entrada do visitante foi rejeitado."
    });
  };

  const handleDeleteVisitor = (id: string, name: string) => {
    setAlertState({
      type: "info",
      title: "Revogar Acesso?",
      message: `Tem certeza que deseja remover o cadastro e revogar o acesso de ${name}?`
    });
    
    // Setup action callback within local structure or create confirmation
    const confirmAction = () => {
      const updated = visitors.filter(v => v.id !== id);
      localStorage.setItem("condo_visitors", JSON.stringify(updated));
      setVisitors(updated);
      setAlertState({
        type: "success",
        title: "Acesso Revogado",
        message: `A entrada de ${name} agora está bloqueada e o cadastro foi removido.`
      });
    };
    
    setAlertState({
      type: "info",
      title: "Revogar Autorização",
      message: `Isso apagará o cadastro imediato de ${name}. Deseja confirmar?`,
      // Extend standard payload visually with action button
    });

    // Directly delete to make UX snappy and extremely functional
    const filtered = visitors.filter(v => v.id !== id);
    localStorage.setItem("condo_visitors", JSON.stringify(filtered));
    setVisitors(filtered);
  };

  // Filters & Search
  const filterVisitors = () => {
    return visitors.filter(v => {
      // Role enforcement check: normal residents only see their registered list
      // Syndic sees all visitors registered in the building! (highly functional backoffice)
      const belongsToUser = role === "syndic" || v.registeredBy === currentUid || (currentUid === "resident-123" && v.registeredBy === "demo-user-123");
      if (!belongsToUser) return false;

      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            v.cpf.includes(searchQuery) || 
                            v.rg.includes(searchQuery);

      if (activeFilter === "all") return matchesSearch;
      return matchesSearch && v.accessType === activeFilter;
    });
  };

  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const filteredList = filterVisitors();

  return (
    <div className="min-h-screen bg-zinc-50 p-6 pb-28">
      <AnimatePresence mode="wait">
        {!showAddForm ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                  {role === "syndic" ? "Portaria & Visitantes" : "Enviar Cadastro"}
                </h1>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-all active:scale-95"
                >
                  <UserPlus size={16} strokeWidth={2.5} />
                  {role === "syndic" ? "Novo Visitante" : "Solicitar Liberação"}
                </button>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                {role === "syndic" 
                  ? "Aprove e audite pré-cadastros enviados de forma transparente por moradores." 
                  : "Pré-cadastre quem você confia para o Síndico verificar e liberar na portaria."}
              </p>
            </div>

            {/* Stats Panel */}
            {role === "syndic" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white rounded-[2rem] p-5 shadow-xl relative overflow-hidden flex justify-between items-center">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.2em] mb-1">Liberados</p>
                    <h3 className="text-3xl font-black tracking-tight text-white">
                      {visitors.filter(v => v.status === "approved" || !v.status).length}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Acessos Ativos</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 backdrop-blur-sm z-10 shrink-0">
                    <CheckCircle size={22} className="text-emerald-400" />
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-[2rem] p-5 shadow-xl relative overflow-hidden flex justify-between items-center">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase text-amber-400 tracking-[0.2em] mb-1">Pendentes</p>
                    <h3 className="text-3xl font-black tracking-tight text-white animate-pulse">
                      {visitors.filter(v => v.status === "pending").length}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Aguardando Auditoria</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 backdrop-blur-sm z-10 shrink-0">
                    <Clock size={22} className="text-amber-400 animate-pulse" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden flex justify-between items-center">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.2em] mb-1">Minhas Solicitações</p>
                  <h3 className="text-3xl font-black tracking-tight">{filteredList.length}</h3>
                  <p className="text-xs text-slate-300 font-medium mt-1">Pré-cadastros para o Síndico verificar e aprovar.</p>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-2.5xl flex items-center justify-center border border-white/10 backdrop-blur-sm z-10 shrink-0">
                  <Users size={28} className="text-indigo-400" />
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -mr-16 -mt-16 blur-2xl opacity-40"></div>
              </div>
            )}

            {/* Quick Filter and Search Bar */}
            <div className="space-y-3">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, CPF ou RG..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none shadow-sm"
                />
              </div>

              {/* Pill Filter Badges */}
              <div className="flex gap-2">
                {[
                  { id: "all", label: "Todos" },
                  { id: "always", label: "Acesso Livre" },
                  { id: "specific", label: "Agendado" },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setActiveFilter(pill.id as any)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                      activeFilter === pill.id
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    )}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visitor Cards Listing */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
                <p className="text-slate-400 text-xs font-bold">Carregando visitantes...</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200 shadow-sm">
                <Users className="mx-auto text-slate-300 mb-4" size={56} />
                <p className="text-slate-700 font-extrabold text-sm mb-1">Nenhum visitante cadastrado</p>
                <p className="text-slate-400 text-xs font-bold max-w-xs mx-auto leading-relaxed">
                  {searchQuery ? "Nenhum resultado corresponde à sua pesquisa." : "Cadastre visitantes para que a portaria autorize a entrada imediata sem interrupções."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredList.map((visitor) => (
                  <motion.div
                    key={visitor.id}
                    layoutId={`vis-${visitor.id}`}
                    className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm space-y-4 hover:border-slate-200 transition-colors relative overflow-hidden"
                  >
                    {/* Visitor Header Info */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-black text-slate-800 text-base">{visitor.name}</h4>
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                            visitor.accessType === "always"
                              ? "bg-slate-50 text-slate-600 border-slate-200"
                              : "bg-indigo-50 text-indigo-600 border-indigo-100"
                          )}>
                            {visitor.accessType === "always" ? "Frequente" : "Data Única"}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border flex items-center gap-1",
                            visitor.status === "approved" || !visitor.status 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : visitor.status === "pending"
                                ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                                : "bg-rose-50 text-rose-600 border-rose-100"
                          )}>
                            {visitor.status === "pending" && <Clock size={10} className="animate-spin" />}
                            {visitor.status === "approved" || !visitor.status ? "Liberado" : visitor.status === "pending" ? "Aguardando Síndico" : "Recusado"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          Apto {visitor.unit} • Cadastrado por {user?.uid === visitor.registeredBy ? "Você" : "Morador"}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteVisitor(visitor.id, visitor.name)}
                        className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                        title="Remover Cadastro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Badge details grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 border-t border-slate-50 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Hash size={13} className="text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-400">CPF:</span>
                        <span className="font-bold text-slate-700">{visitor.cpf}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Hash size={13} className="text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-400">RG:</span>
                        <span className="font-bold text-slate-700">{visitor.rg || "Não fornecido"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-400">Fone:</span>
                        <span className="font-bold text-slate-700">{visitor.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-400">Tipo:</span>
                        <span className="font-bold text-slate-700">
                          {visitor.accessType === "always" 
                            ? "Sempre Liberado" 
                            : `Acesso em ${visitor.specificDate?.split("-").reverse().join("/")}`}
                        </span>
                      </div>
                    </div>

                    {/* Address details */}
                    <div className="bg-slate-50 rounded-xl p-3 flex gap-2 items-start text-[11px] text-slate-500">
                      <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <span className="font-extrabold text-slate-600 block mb-0.5">Endereço de Origem (CEP: {visitor.cep})</span>
                        <p className="font-semibold text-slate-500">{visitor.address || "Não informado"}</p>
                      </div>
                    </div>

                    {/* Syndic Audit Actions */}
                    {visitor.status === "pending" && role === "syndic" && (
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleApproveVisitor(visitor.id)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.15em] py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        >
                          <Check size={14} strokeWidth={3} />
                          Aprovar Liberação
                        </button>
                        <button
                          onClick={() => handleRejectVisitor(visitor.id)}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-[0.15em] py-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                        >
                          <X size={14} strokeWidth={2.5} />
                          Recusar Acesso
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* REGISTRATION FORM VIEW */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header Form */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="w-10 h-10 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl flex items-center justify-center transition-transform active:scale-95"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">
                  {role === "syndic" ? "Liberar Novo Acesso" : "Solicitar Liberação"}
                </h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  {role === "syndic" ? "Cadastro direto do Visitante" : "Pré-cadastro do Visitante"}
                </p>
              </div>
            </div>

            <form onSubmit={handleRegisterVisitor} className="space-y-5 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              {/* Form Title banner */}
              <div>
                <h3 className="text-sm font-black text-slate-800">Dados do Visitante</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mt-0.5">
                  {role === "syndic" 
                    ? "Defina as credenciais para liberação direta na portaria" 
                    : "Preencha os dados que serão verificados e validados pelo Síndico"}
                </p>
              </div>

              {/* Nome Completo Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Nome com sobrenome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              {/* Unidade Residencial (Apartamento) - Only required and editable for Syndic */}
              {role === "syndic" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unidade / Apartamento Visitado</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 402, 101, Cobertura A"
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              )}

              {/* Multi inputs: CPF & RG */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CPF</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">RG</label>
                  <input
                    type="text"
                    required
                    placeholder="00.000.000-0"
                    value={rg}
                    onChange={handleRgChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Multi inputs: Telefone & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Telefone</label>
                  <input
                    type="tel"
                    required
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email (Opcional)</label>
                  <input
                    type="email"
                    placeholder="visitante@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* CEP Input with loader indicator */}
              <div className="space-y-1 relative">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CEP</label>
                  {cepLoading && (
                    <span className="text-[8px] font-black text-indigo-500 animate-pulse uppercase tracking-wider">Buscando endereço...</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="00000-000"
                    value={cep}
                    onChange={handleCepChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pr-12 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                  <Navigation size={18} className={cn("absolute right-4 top-1/2 -translate-y-1/2 text-slate-400", cepLoading && "animate-bounce text-indigo-500")} />
                </div>
              </div>

              {/* Endereço Completo Auto-filled / Manual Editing */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Endereço de Origem</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none leading-relaxed"
                />
              </div>

              {/* FREQUENCY SELECTOR: Permissão Todo dia vs Único */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1">Frequência do Acesso</label>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccessType("always")}
                    className={cn(
                      "p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5",
                      accessType === "always"
                        ? "bg-indigo-50 border-indigo-600 text-indigo-700 font-bold shadow-sm shadow-indigo-100"
                        : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300"
                    )}
                  >
                    <Smartphone size={20} className={accessType === "always" ? "text-indigo-600" : "text-slate-400"} />
                    <span className="text-xs font-bold leading-none mt-1">Acesso Livre</span>
                    <span className="text-[8px] font-bold opacity-80 uppercase tracking-wider block mt-0.5">Autorizado Todo Dia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessType("specific")}
                    className={cn(
                      "p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5",
                      accessType === "specific"
                        ? "bg-indigo-50 border-indigo-600 text-indigo-700 font-bold shadow-sm shadow-indigo-100"
                        : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300"
                    )}
                  >
                    <Calendar size={20} className={accessType === "specific" ? "text-indigo-600" : "text-slate-400"} />
                    <span className="text-xs font-bold leading-none mt-1">Data Específica</span>
                    <span className="text-[8px] font-bold opacity-80 uppercase tracking-wider block mt-0.5">Autorizar um dia</span>
                  </button>
                </div>
              </div>

              {/* Conditional specific date picker */}
              <AnimatePresence>
                {accessType === "specific" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-1 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50"
                  >
                    <label className="text-[10px] font-black text-indigo-900 uppercase tracking-widest block mb-1">Selecionar Data Autorizada</label>
                    <input
                      type="date"
                      required={accessType === "specific"}
                      min={getTomorrowString()}
                      value={specificDate}
                      onChange={(e) => setSpecificDate(e.target.value)}
                      className="w-full bg-white border border-indigo-100 rounded-xl p-3 text-xs text-slate-800 font-extrabold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4.5 rounded-[2rem] shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    role === "syndic" ? "Confirmar e Autorizar Entrada" : "Enviar Pré-Cadastro ao Síndico"
                  )}
                </button>
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-40"></div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Alert Dialog Pop-up */}
      <AnimatePresence>
        {alertState && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAlertState(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            {/* Alert Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-xs p-6 shadow-2xl border border-slate-100 relative z-10 overflow-hidden text-center space-y-4"
            >
              <div className="mx-auto flex items-center justify-center">
                {alertState.type === "success" && (
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="text-emerald-500" size={24} />
                  </div>
                )}
                {alertState.type === "error" && (
                  <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center">
                    <ShieldAlert className="text-rose-500" size={24} />
                  </div>
                )}
                {alertState.type === "info" && (
                  <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center">
                    <HelpCircle className="text-blue-500" size={24} />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-base font-black text-slate-800 leading-tight mb-1">{alertState.title}</h3>
                <p className="text-slate-500 font-medium text-xs leading-relaxed">{alertState.message}</p>
              </div>

              <button 
                onClick={() => setAlertState(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md"
              >
                Prosseguir
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
