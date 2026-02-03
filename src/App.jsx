import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  IndianRupee, 
  Briefcase, 
  Zap, 
  Calendar,
  Wallet,
  PieChart, 
  ShieldAlert,
  Plus,
  Trash2,
  ChevronRight,
  Activity,
  Settings,
  X,
  ArrowDownRight,
  ArrowUpRight,
  LayoutDashboard,
  LineChart,
  Target,
  CreditCard,
  Bot,
  Loader2,
  MessageSquare,
  Sparkles,
  Search,
  History,
  Tag,
  ReceiptText,
  Filter,
  User
} from 'lucide-react';

// import './App.css' // (Optional) Remove or comment out if not needed
const STORAGE_KEY = 'moneyPulseLedgerState';

const CATEGORIES = [
  { name: 'Housing', icon: '🏠', color: 'text-blue-400' },
  { name: 'Food', icon: '🍔', color: 'text-orange-400' },
  { name: 'Transport', icon: '🚗', color: 'text-purple-400' },
  { name: 'Shopping', icon: '🛍️', color: 'text-pink-400' },
  { name: 'Income', icon: '💰', color: 'text-emerald-400' },
  { name: 'Entertainment', icon: '🍿', color: 'text-amber-400' },
  { name: 'Health', icon: '🏥', color: 'text-rose-400' },
  { name: 'Other', icon: '📦', color: 'text-slate-400' }
];

const createDefaultFormData = () => ({
  userType: 'individual',
  initialBalance: '',
  transactions: [],
  monthlyGoal: '50000',
});

const loadPersistedState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const App = () => {
  // --- Initialization ---
  const initialStateRef = useRef(null);
  if (!initialStateRef.current) {
    const saved = loadPersistedState();
    initialStateRef.current = {
      step: saved?.step ?? 0,
      activeTab: saved?.activeTab ?? 'ledger',
      formData: saved?.formData ?? createDefaultFormData(),
    };
  }
  const initialState = initialStateRef.current;

  const [step, setStep] = useState(initialState.step);
  const [activeTab, setActiveTab] = useState(initialState.activeTab);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Transaction Form State
  const [newTx, setNewTx] = useState({
    title: '',
    amount: '',
    type: 'debit',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });

  // AI States
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [formData, setFormData] = useState(initialState.formData);

  const totalSteps = 2;

  // --- Persistence ---
  useEffect(() => {
    const payload = { step, activeTab, formData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [step, activeTab, formData]);

  // --- Calculations ---
  const results = useMemo(() => {
    const sortedTxs = [...formData.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const initial = parseFloat(formData.initialBalance) || 0;
    let currentBalance = initial;
    let totalIncome = 0;
    let totalExpense = 0;

    formData.transactions.forEach(tx => {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'credit') {
        currentBalance += amt;
        totalIncome += amt;
      } else {
        currentBalance -= amt;
        totalExpense += amt;
      }
    });

    const categoryBreakdown = formData.transactions.reduce((acc, tx) => {
      if (tx.type === 'debit') {
        acc[tx.category] = (acc[tx.category] || 0) + (parseFloat(tx.amount) || 0);
      }
      return acc;
    }, {});

    const chartData = sortedTxs.slice(0, 10).reverse().map(tx => ({
      label: new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      value: tx.type === 'credit' ? parseFloat(tx.amount) : -parseFloat(tx.amount)
    }));

    const healthScore = totalIncome > 0 ? Math.min(100, Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))) : 0;

    return {
      currentBalance,
      totalIncome,
      totalExpense,
      sortedTxs,
      categoryBreakdown,
      chartData,
      healthScore,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
    };
  }, [formData]);

  // --- Handlers ---
  const handleAddTransaction = () => {
    if (!newTx.title || !newTx.amount) return;
    
    const transaction = {
      ...newTx,
      id: Date.now(),
      amount: parseFloat(newTx.amount),
    };

    setFormData(prev => ({
      ...prev,
      transactions: [transaction, ...prev.transactions]
    }));
    
    setNewTx({ title: '', amount: '', type: 'debit', category: 'Food', date: new Date().toISOString().split('T')[0] });
    setIsLogOpen(false);
  };

  const deleteTransaction = (id) => {
    setFormData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const resetData = () => {
    setFormData(createDefaultFormData());
    setStep(0);
    setIsEditOpen(false);
  };

  // --- AI Logic ---
  const callGemini = async (prompt, contextData) => {
    const apiKey = ""; 
    const systemPrompt = `You are MoneyPulse AI Ledger Auditor. 
    Current Ledger State: ${JSON.stringify(contextData)}
    Instructions: Be precise, highlight spending leaks, and use high-end financial terminology. Use Markdown.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Audit service currently unavailable.";
    } catch (e) {
      return "Connection to audit node failed.";
    }
  };

  const runAudit = async () => {
    setIsAnalyzing(true);
    const context = {
      balance: results.currentBalance,
      income: results.totalIncome,
      expense: results.totalExpense,
      categories: results.categoryBreakdown
    };
    const res = await callGemini("Perform a deep audit of my current ledger. Identify the biggest risk factor and suggest one strategic cut.", context);
    setAiAnalysis(res);
    setIsAnalyzing(false);
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    const newMessages = [...chatMessages, { role: 'user', text }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);

    const context = { txCount: formData.transactions.length, balance: results.currentBalance };
    const response = await callGemini(text, context);
    setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsChatLoading(false);
  };

  // --- Sub-components ---
  const Header = () => (
    <div className="px-6 pt-8 pb-3 bg-black/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-1.5 rounded-lg shadow-lg shadow-emerald-500/20"><ReceiptText className="w-3.5 h-3.5 text-white" /></div>
          <h1 className="font-bold text-[10px] tracking-[0.2em] text-white uppercase">MoneyPulse Ledger</h1>
        </div>
        <button onClick={() => setIsEditOpen(true)} className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 transition-colors"><Settings className="w-3.5 h-3.5" /></button>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Vault Secured</span>
      </div>
    </div>
  );

  const Nav = () => (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[320px] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 flex gap-1 z-40 shadow-2xl">
      {[
        { id: 'ledger', icon: History, label: 'Ledger' },
        { id: 'insights', icon: PieChart, label: 'Insights' },
        { id: 'coach', icon: Bot, label: 'Audit' },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === tab.id ? 'bg-emerald-500 text-black font-bold' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
        >
          <tab.icon className="w-4 h-4" />
          <span className="text-[8px] uppercase tracking-tighter font-black">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  // --- Render Steps ---
  if (step < totalSteps) {
    return (
      <div className="min-h-screen bg-[#040404] flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-sm space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]"><Zap className="w-6 h-6 text-black" /></div>
            <h1 className="text-4xl font-black tracking-tighter">Initialize Ledger.</h1>
            <p className="text-slate-500 text-sm font-medium">Professional grade bookkeeping starts here.</p>
          </div>

          <div className="space-y-6">
            {step === 0 ? (
              <div className="space-y-4">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Entry Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Individual', 'Business'].map(type => (
                    <button key={type} onClick={() => { updateField('userType', type.toLowerCase()); setStep(1); }} className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left group">
                      <div className="text-slate-400 group-hover:text-emerald-400 mb-2">{type === 'Individual' ? <User className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}</div>
                      <div className="font-bold">{type}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Opening Balance (INR)</label>
                  <div className="bg-white/5 rounded-3xl border border-white/5 p-6 flex items-center gap-4 focus-within:border-emerald-500 transition-all">
                    <IndianRupee className="text-emerald-500 w-6 h-6" />
                    <input type="number" placeholder="0.00" value={formData.initialBalance} onChange={(e) => updateField('initialBalance', e.target.value)} className="bg-transparent text-3xl font-black outline-none w-full placeholder:text-slate-800" />
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="w-full py-5 bg-white text-black rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-xl shadow-white/5">Establish Vault</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040404] flex flex-col items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-sm:w-full max-w-sm bg-[#0a0a0a] rounded-[2.5rem] shadow-2xl border border-white/5 h-[800px] flex flex-col relative overflow-hidden backdrop-blur-3xl ring-1 ring-white/5">
        
        <Header />

        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 pb-32">
          {activeTab === 'ledger' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Balance Card */}
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-900 shadow-xl shadow-emerald-950/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-8 -mt-8" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-200/60">Current Liquidity</span>
                <div className="text-4xl font-black mt-2 tracking-tighter">₹{results.currentBalance.toLocaleString('en-IN')}</div>
                <div className="flex gap-4 mt-6">
                  <div className="bg-black/20 backdrop-blur-md p-3 rounded-2xl flex-1 border border-white/5">
                    <div className="text-[8px] font-black uppercase text-emerald-200/50 mb-1">Inflow</div>
                    <div className="text-xs font-bold">+₹{results.totalIncome.toLocaleString()}</div>
                  </div>
                  <div className="bg-black/20 backdrop-blur-md p-3 rounded-2xl flex-1 border border-white/5">
                    <div className="text-[8px] font-black uppercase text-emerald-200/50 mb-1">Outflow</div>
                    <div className="text-xs font-bold">-₹{results.totalExpense.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Transaction List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">History Log</h3>
                  <button onClick={() => setIsLogOpen(true)} className="p-2 bg-white rounded-full text-black hover:bg-emerald-400 transition-all active:scale-90 shadow-lg"><Plus className="w-4 h-4" /></button>
                </div>

                <div className="space-y-3">
                  {results.sortedTxs.length === 0 ? (
                    <div className="py-12 flex flex-col items-center opacity-20 text-center space-y-3">
                      <History className="w-12 h-12" />
                      <p className="text-xs font-bold uppercase tracking-widest">No entries recorded</p>
                    </div>
                  ) : (
                    results.sortedTxs.map(tx => (
                      <div key={tx.id} className="group bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center transition-all hover:bg-white/[0.07] hover:border-white/10">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {CATEGORIES.find(c => c.name === tx.category)?.icon || '📦'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:translate-x-1 transition-transform">{tx.title}</div>
                            <div className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mt-0.5">{tx.category} • {new Date(tx.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`text-sm font-black ${tx.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                            {tx.type === 'credit' ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString()}
                          </div>
                          <button onClick={() => deleteTransaction(tx.id)} className="p-1.5 bg-black/50 text-slate-700 rounded-lg opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-xl font-black">Analytics.</h2>
                <p className="text-xs text-slate-500">Category-wise resource allocation.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/5 p-5 rounded-3xl">
                  <div className="text-[9px] font-black uppercase text-slate-500 mb-1">Savings Rate</div>
                  <div className="text-2xl font-black text-emerald-400">{results.savingsRate.toFixed(1)}%</div>
                </div>
                <div className="bg-white/5 border border-white/5 p-5 rounded-3xl">
                  <div className="text-[9px] font-black uppercase text-slate-500 mb-1">Health Score</div>
                  <div className="text-2xl font-black text-white">{results.healthScore}/100</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Top Burn Categories</h3>
                <div className="space-y-3">
                  {Object.entries(results.categoryBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, amt]) => {
                      const categoryInfo = CATEGORIES.find(c => c.name === cat);
                      const percentage = (amt / results.totalExpense) * 100;
                      return (
                        <div key={cat} className="bg-white/5 border border-white/5 p-4 rounded-3xl space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span>{categoryInfo?.icon}</span>
                              <span className="text-xs font-bold uppercase">{cat}</span>
                            </div>
                            <span className="text-xs font-black">₹{amt.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${categoryInfo?.color?.replace('text-', 'bg-') || 'bg-slate-500'} rounded-full`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coach' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full pb-8">
               <div className="space-y-2">
                <h2 className="text-xl font-black flex items-center gap-2"><Bot className="w-5 h-5 text-emerald-500" /> Audit Center.</h2>
                <p className="text-xs text-slate-500">AI-driven financial strategy and leak detection.</p>
              </div>

              <button onClick={runAudit} disabled={isAnalyzing} className="w-full py-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center gap-3 group hover:border-emerald-500/50 transition-all disabled:opacity-50">
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin text-emerald-500" /> : <Sparkles className="w-5 h-5 text-emerald-400 group-hover:scale-125 transition-transform" />}
                <span className="text-xs font-black uppercase tracking-widest">Execute Deep Audit</span>
              </button>

              {aiAnalysis && (
                <div className="bg-emerald-950/20 border border-emerald-900/50 p-6 rounded-3xl text-xs leading-relaxed text-emerald-100 prose prose-invert animate-in zoom-in-95 duration-500">
                  <div dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide py-4 border-t border-white/5">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-xs ${m.role === 'user' ? 'bg-emerald-500 text-black font-bold' : 'bg-white/5 border border-white/5 text-slate-200'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && <div className="text-xs text-slate-500 animate-pulse flex items-center gap-2"><Bot className="w-3 h-3" /> Analyzing ledger...</div>}
              </div>

              <div className="relative mt-auto">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(chatInput)} placeholder="Ask about your spending..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-xs outline-none focus:border-emerald-500 transition-all" />
                <button onClick={() => handleSendMessage(chatInput)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500"><ArrowUpRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}
        </div>

        <Nav />

        {/* Add Transaction Modal */}
        {isLogOpen && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end animate-in fade-in duration-300">
            <div className="w-full bg-[#0d0d0d] rounded-t-[3rem] p-8 space-y-8 animate-in slide-in-from-bottom-24 duration-500 border-t border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">New Entry.</h3>
                <button onClick={() => setIsLogOpen(false)} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex gap-2 p-1.5 bg-black rounded-2xl border border-white/5">
                <button onClick={() => setNewTx(p => ({ ...p, type: 'debit' }))} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTx.type === 'debit' ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/20' : 'text-slate-500'}`}>Debit</button>
                <button onClick={() => setNewTx(p => ({ ...p, type: 'credit' }))} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTx.type === 'credit' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-900/20' : 'text-slate-500'}`}>Credit</button>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest px-1">Label</label>
                  <input value={newTx.title} onChange={e => setNewTx(p => ({ ...p, title: e.target.value }))} placeholder="Transaction Name" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm outline-none focus:border-white/20 transition-all" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest px-1">Amount</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="number" value={newTx.amount} onChange={e => setNewTx(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xl font-black outline-none focus:border-white/20 transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest px-1">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map(c => (
                      <button key={c.name} onClick={() => setNewTx(p => ({ ...p, category: c.name }))} className={`p-2 rounded-xl text-center transition-all border ${newTx.category === c.name ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5'}`}>
                        <div className="text-lg">{c.icon}</div>
                        <div className="text-[8px] uppercase font-black mt-1 tracking-tighter truncate">{c.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleAddTransaction} className="w-full py-5 bg-white text-black rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-xl">Confirm Entry</button>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {isEditOpen && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="w-full bg-[#0d0d0d] rounded-[3rem] p-8 space-y-8 border border-white/10">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black">Vault Controls.</h3>
                  <button onClick={() => setIsEditOpen(false)} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                  <button onClick={resetData} className="w-full py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Format Entire Ledger</button>
                  <div className="p-4 bg-white/5 rounded-2xl space-y-1">
                    <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Storage Status</div>
                    <div className="text-xs font-bold text-white">LocalStorage (Offline Secure)</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl space-y-1">
                    <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Developer Mode</div>
                    <div className="text-xs font-bold text-white">V1.2.0 Stable Build</div>
                  </div>
                </div>

                <button onClick={() => setIsEditOpen(false)} className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest">Dismiss</button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;