import { useState, useEffect } from "react";
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "./lib/firebase";
import { BottomNav } from "./components/BottomNav";
import { HomeScreen } from "./components/HomeScreen";
import { Deliveries } from "./components/Deliveries";
import { FinanceSummary } from "./components/FinanceSummary";
import { BulletinBoard } from "./components/BulletinBoard";
import { SyndicDeliveries } from "./components/SyndicDeliveries";
import { SyndicFinance } from "./components/SyndicFinance";
import { AreaBooking } from "./components/AreaBooking";
import { ProfileScreen } from "./components/ProfileScreen";
import { CancelBooking } from "./components/CancelBooking";
import { VisitorRegistration } from "./components/VisitorRegistration";
import { Logo } from "./components/Logo";
import { CitylineFooter } from "./components/CitylineFooter";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, ShieldAlert, Mail, Lock, UserPlus, ArrowRight } from "lucide-react";
import { cn } from "./lib/utils";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<"resident" | "syndic">("resident");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  // Auth Form State
  const [authMode, setAuthMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        setActiveTab("home");
        
        // Fetch role from Firestore
        if (db) {
          const userRef = doc(db, "users", authUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setRole(userData.role as "resident" | "syndic");
            setUser({ ...authUser, ...userData });
          } else {
            // Default Role and Save to Firestore
            const initialRole = authUser.email?.includes("sindico") ? "syndic" : "resident";
            const initialData = {
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName || "Usuário Demo",
              role: initialRole,
              unit: "402"
            };
            await setDoc(userRef, initialData);
            setRole(initialRole);
            setUser({ ...authUser, ...initialData });
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    // Email validation regex (updated to match user provided pattern)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return alert("Por favor, insira um e-mail válido.");
    }

    setIsAuthenticating(true);
    try {
      if (authMode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await sendPasswordResetEmail(auth, email);
        alert("E-mail de recuperação enviado com sucesso!");
        setAuthMode("login");
      }
    } catch (error: any) {
      alert(error.message || "Erro na operação");
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mb-4" />
        <p className="text-slate-500 font-medium">Carregando...</p>
      </div>
    );
  }

  if (!auth || !db) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-rose-50 p-8 text-center text-rose-900">
        <ShieldAlert size={48} className="mb-4" />
        <h1 className="text-xl font-bold mb-2 text-slate-800">Configuração Necessária</h1>
        <p className="max-w-xs text-sm text-slate-600">
          Acesse as extensões do AI Studio e finalize a configuração do Firebase para habilitar a base de dados.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-between min-h-screen bg-zinc-50 relative overflow-hidden">
        {/* Main Central Container */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full z-10 bg-[#181130]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            {/* Form Bento Card */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200/60 p-8 overflow-hidden relative">
              
              {/* Logo and Condo Secure centered at the beginning of the Form Card */}
              <div className="flex flex-col items-center mb-8 border-b border-slate-50 pb-6">
                <Logo variant="vertical" iconSize={80} />
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-3">Gestão de Portaria & Condomínio</p>
              </div>

              {authMode !== "forgot" ? (
                <div className="mb-6">
                  <h2 className="text-xl font-black text-slate-800 leading-tight">Acessar Conta</h2>
                  <p className="text-xs text-[#13062E]/70 font-bold mt-1 uppercase tracking-widest">Portal do Condomínio</p>
                </div>
              ) : (
                <div className="mb-6">
                  <button 
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="text-[10px] font-black text-[#13062E] uppercase tracking-widest flex items-center gap-1 hover:text-[#220c52] transition-colors"
                  >
                    <ArrowRight size={14} className="rotate-180" />
                    Voltar para o Login
                  </button>
                  <h2 className="text-xl font-black text-slate-800 mt-4 leading-tight">Recuperar Acesso</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Enviaremos um link de reset para seu e-mail.</p>
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authMode === "login" && (
                  <div className="bg-[#13062E]/5 border border-[#13062E]/10 p-4 rounded-2xl mb-4">
                    <p className="text-[9px] font-black text-[#13062E]/60 uppercase tracking-widest mb-1">Acesso Demonstração</p>
                    <p className="text-[11px] text-[#13062E] font-bold leading-tight">
                      Morador 1: <span className="text-[#13062E] font-black">demo@condo.com</span><br/>
                      Morador 2: <span className="text-[#13062E] font-black">morador@condo.com</span><br/>
                      Síndico: <span className="text-[#13062E] font-black">sindico@condo.com</span><br/>
                      Senha padrão: <span className="text-[#13062E] font-black">123456</span>
                    </p>
                  </div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#13062E] transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder={authMode === "forgot" ? "E-mail para recuperação" : "Seu e-mail"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#13062E] focus:border-[#13062E] transition-all outline-none"
                  />
                </div>
                
                {authMode !== "forgot" && (
                  <>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#13062E] transition-colors" size={18} />
                      <input 
                        type="password" 
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#13062E] focus:border-[#13062E] transition-all outline-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button 
                        type="button" 
                        onClick={() => setAuthMode("forgot")}
                        className="text-[10px] font-black text-[#13062E] uppercase tracking-widest hover:text-[#220c52] transition-colors"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                  </>
                )}

                <button 
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-[#13062E] hover:bg-[#1d0a45] text-white font-black py-4 rounded-2xl shadow-none active:scale-95 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 mt-4"
                >
                  {isAuthenticating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {authMode === "login" ? "Entrar" : "Enviar Recuperação"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#13062E]/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50"></div>
            </div>

            <p className="mt-8 text-[10px] text-slate-400 text-center font-black uppercase tracking-[0.2em]">© 2026 Grupo Univesp</p>
          </motion.div>
        </div>

        {/* Decorative Cityline Skyline Footer */}
        <CitylineFooter />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <HomeScreen user={user} role={role} setActiveTab={setActiveTab} />;
      case "deliveries": return role === "syndic" ? <SyndicDeliveries /> : <Deliveries user={user} />;
      case "board": return <BulletinBoard role={role} />;
      case "booking": return <AreaBooking setActiveTab={setActiveTab} role={role} user={user} />;
      case "cancel-booking": return <CancelBooking setActiveTab={setActiveTab} user={user} />;
      case "visitors": return <VisitorRegistration user={user} role={role} setActiveTab={setActiveTab} />;
      case "finance": return role === "syndic" ? <SyndicFinance /> : <HomeScreen user={user} role={role} setActiveTab={setActiveTab} />;
      case "profile": return <ProfileScreen user={user} role={role} setActiveTab={setActiveTab} />;
      default: return <HomeScreen user={user} role={role} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-slate-900 selection:bg-indigo-100 font-sans">
      <div className="max-w-lg mx-auto bg-white min-h-screen shadow-sm border-x border-slate-100 relative pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
        
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} role={role} />
      </div>
    </div>
  );
}
