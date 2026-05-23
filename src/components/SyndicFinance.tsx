import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  AlertCircle, 
  PiggyBank,
  Sliders,
  Hammer
} from "lucide-react";
import { motion } from "motion/react";

export function SyndicFinance() {
  // Custom interactive simulation state
  const [numBuildings, setNumBuildings] = useState(7);
  const [numFloors, setNumFloors] = useState(15);
  const [aptsPerFloor, setAptsPerFloor] = useState(4);
  const [condoFee, setCondoFee] = useState(800);
  
  // Calculations
  const totalApartments = numBuildings * numFloors * aptsPerFloor;
  const totalInflow = totalApartments * condoFee;

  // Real mock maintenance & operational expenses
  const [maintenanceCost, setMaintenanceCost] = useState(132000);
  const [securityCost, setSecurityCost] = useState(74000);
  const [cleaningCost, setCleaningCost] = useState(28000);
  const [adminCost, setAdminCost] = useState(16000);
  
  const totalOutflow = maintenanceCost + securityCost + cleaningCost + adminCost;
  const netBalance = totalInflow - totalOutflow;

  return (
    <div className="space-y-6 p-6 pb-24">
      {/* Header Dashboard Section */}
      <header className="flex justify-between items-start gap-4">
        <div>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-black uppercase tracking-widest">
            Painel Síndico
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2">Finanças Mirante do Parque</h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Controle fiscal e auditoria de caixa</p>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {/* Entry vs Exit Hero Summary Card */}
        <div className="bg-slate-900 rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Fluxo Operacional Mensal</span>
                <h3 className="text-3xl font-black mt-1.5 tracking-tight text-white tabular-nums">
                  R$ {netBalance.toLocaleString("pt-BR")}
                </h3>
                <p className="text-slate-400 text-xs font-medium mt-1">Saldo Líquido / Previsão Realizada</p>
              </div>
              <div className="p-3 rounded-2xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                <PiggyBank size={24} />
              </div>
            </div>

            {/* Grid for Flow */}
            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-white/10">
              <div>
                <span className="text-slate-400 text-[8px] font-black uppercase tracking-wider block">Valor de Entrada</span>
                <div className="flex items-center gap-1.5 mt-1 text-emerald-400">
                  <TrendingUp size={14} />
                  <span className="font-extrabold text-sm tabular-nums">
                    R$ {totalInflow.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[8px] font-black uppercase tracking-wider block">Valor de Saída</span>
                <div className="flex items-center gap-1.5 mt-1 text-rose-400">
                  <TrendingDown size={14} />
                  <span className="font-extrabold text-sm tabular-nums">
                    R$ {totalOutflow.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-slate-400 uppercase tracking-widest">Utilização de Receitas</span>
                <span className="font-black text-rose-400">
                  {Math.min(100, Math.round((totalOutflow / (totalInflow || 1)) * 100))}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalOutflow / (totalInflow || 1)) * 100)}%` }}
                  className="bg-emerald-500 h-full rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Decorative backgrounds */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -ml-32 -mb-32" />
        </div>

        {/* Calculations Breakdown Board (Prédios, andares, moradores) */}
        <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 size={16} />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-sm tracking-tight uppercase tracking-wider">Base de Receita (Entrada)</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cálculo proporcional de cotas</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200/40 p-4 space-y-3.5">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
              <span>Prédios/Condomínios</span>
              <span className="text-slate-800 font-black tracking-tight">{numBuildings} blocos</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
              <span>Andares por prédio</span>
              <span className="text-slate-800 font-black tracking-tight">{numFloors} pavimentos</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
              <span>Apartamentos por andar</span>
              <span className="text-slate-800 font-black tracking-tight">{aptsPerFloor} unidades</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
              <span>Cota de Condomínio individual</span>
              <span className="text-emerald-600 font-black tracking-tight">R$ {condoFee.toLocaleString("pt-BR")}</span>
            </div>
            
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-700 uppercase tracking-widest text-[10px]">Total de Unidades Pagantes</span>
              <span className="text-slate-800 font-black text-sm font-mono">{totalApartments} APARTAMENTOS</span>
            </div>
          </div>

          {/* Slider simulation area */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                <Sliders size={12} />
                Simular Cota de Condomínio:
              </span>
              <span className="text-sm font-black text-indigo-600">
                R$ {condoFee}
              </span>
            </div>
            <input 
              type="range" 
              min="400" 
              max="1500" 
              step="50"
              value={condoFee}
              onChange={(e) => setCondoFee(Number(e.target.value))}
              className="w-full xl:w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-black uppercase block">Prédios</span>
                <input 
                  type="number" 
                  value={numBuildings}
                  min="1"
                  max="15"
                  onChange={(e) => setNumBuildings(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg text-center font-bold text-xs p-1.5 text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-black uppercase block">Andares</span>
                <input 
                  type="number" 
                  value={numFloors}
                  min="1"
                  max="30"
                  onChange={(e) => setNumFloors(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg text-center font-bold text-xs p-1.5 text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-black uppercase block">Aptos/Andar</span>
                <input 
                  type="number" 
                  value={aptsPerFloor}
                  min="1"
                  max="10"
                  onChange={(e) => setAptsPerFloor(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg text-center font-bold text-xs p-1.5 text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Outcomes detailed categories card */}
        <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <Hammer size={16} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-sm tracking-tight uppercase tracking-wider">Custos de Manutenção e Serviços (Saída)</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Despesas operacionais regulamentadas</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Maintenance */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">Manutenção Geral (Elevadores, bombas, pintura)</span>
                <span className="font-black text-slate-800 tabular-nums">R$ {maintenanceCost.toLocaleString("pt-BR")}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500/80 rounded-full" style={{ width: `${(maintenanceCost / totalOutflow) * 100}%` }} />
              </div>
            </div>

            {/* Portaria & Security */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">Segurança Armada & Portaria 24h</span>
                <span className="font-black text-slate-800 tabular-nums">R$ {securityCost.toLocaleString("pt-BR")}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500/80 rounded-full" style={{ width: `${(securityCost / totalOutflow) * 100}%` }} />
              </div>
            </div>

            {/* Cleaning */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">Limpeza, Pintura & Jardinagem das Áreas</span>
                <span className="font-black text-slate-800 tabular-nums">R$ {cleaningCost.toLocaleString("pt-BR")}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500/80 rounded-full" style={{ width: `${(cleaningCost / totalOutflow) * 100}%` }} />
              </div>
            </div>

            {/* Admin */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">Administradora do Condomínio & Jurídico</span>
                <span className="font-black text-slate-800 tabular-nums">R$ {adminCost.toLocaleString("pt-BR")}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-500/80 rounded-full" style={{ width: `${(adminCost / totalOutflow) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Info advice footprint */}
          <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-slate-400 shrink-0 mt-0.5" size={16} />
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Os valores acima representam as despesas obrigatórias consolidadas com fornecedores, auditadas bimestralmente pelo conselho de administração.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
