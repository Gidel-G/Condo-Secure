import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, PieChart, FileText } from "lucide-react";
import { db, collection, query, onSnapshot, orderBy, limit } from "@/src/lib/firebase";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

export function FinanceSummary() {
  const [finances, setFinances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, "finances"),
      orderBy("year", "desc"),
      orderBy("month", "desc"),
      limit(6)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFinances(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching finances:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const latest = finances[0] || { totalIncome: 0, totalExpenses: 0, month: "N/A", year: 2026, categories: [] };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Painel Financeiro</h1>
        <p className="text-slate-500 text-sm font-medium">Relatório detalhado do condomínio.</p>
      </header>

      {/* Bento Tiles for Finance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 mb-4 shadow-sm">
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">Receita</span>
          <p className="text-xl font-black text-slate-800 tabular-nums">
            R$ {latest.totalIncome.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 mb-4 shadow-sm">
            <TrendingDown size={24} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">Despesa</span>
          <p className="text-xl font-black text-rose-600 tabular-nums">
             R$ {latest.totalExpenses.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Highlights Bento Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{latest.month} {latest.year}</span>
              <h3 className="text-3xl font-black mt-2 tabular-nums">
                R$ {(latest.totalIncome - latest.totalExpenses).toLocaleString("pt-BR")}
              </h3>
              <p className="text-slate-400 text-xs font-medium mt-1 italic">Saldo Acumulado no Período</p>
            </div>
            <div className="bg-indigo-500/20 p-3 rounded-2xl border border-indigo-500/30">
              <DollarSign size={24} className="text-indigo-400" />
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-widest">Utilização da Receita</span>
              <span className="font-black text-emerald-400">
                {Math.round((latest.totalExpenses / (latest.totalIncome || 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(latest.totalExpenses / (latest.totalIncome || 1)) * 100}%` }}
                className="bg-indigo-500 h-full rounded-full"
              />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      </div>

      {/* Categories Detail */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
            Maiores Custos
          </h2>
        </div>
        <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 space-y-6">
            {latest.categories?.map((cat: any, i: number) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{cat.category}</span>
                  <span className="text-slate-800 font-black tabular-nums">R$ {cat.amount.toLocaleString("pt-BR")}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500/60 rounded-full" style={{ width: `${Math.random() * 50 + 20}%` }} />
                </div>
              </div>
            ))}
            {(!latest.categories || latest.categories.length === 0) && (
              <p className="text-slate-400 text-xs italic text-center py-4">Carregando dados comparativos...</p>
            )}
          </div>
        </div>
      </section>

      {/* History Table */}
      <section>
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
          <FileText size={18} />
          Histórico Recente
        </h2>
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-200">
                <th className="p-5 text-left">Competência</th>
                <th className="p-5 text-right">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finances.slice(1).map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 text-sm font-bold text-slate-700">{f.month}/{f.year}</td>
                  <td className="p-5 text-right">
                    <span className={cn(
                      "text-xs font-black px-3 py-1 rounded-full border tabular-nums",
                      f.totalIncome > f.totalExpenses ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                      R$ {(f.totalIncome - f.totalExpenses).toLocaleString("pt-BR")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
