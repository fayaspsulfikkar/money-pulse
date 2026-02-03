import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  IndianRupee, 
  Briefcase, 
  Zap, 
  Calendar,
  Wallet,
  PieChart, 
  ShieldAlert,
  Lightbulb,
  Plus,
  Trash2,
  Clock,
  ChevronRight,
  Info,
  BarChart3,
  Percent,
  Activity,
  Settings,
  X,
  Edit2,
  ArrowDownRight,
  ArrowUpRight,
  LayoutDashboard,
  LineChart,
  ListTodo,
  ShoppingBag,
  TrendingDown,
  Target,
  Infinity as InfinityIcon,
  Timer,
  CreditCard,
  HeartPulse,
  Coins,
  Ban,
  Send,
  Bot,
  User,
  Loader2,
  MessageSquare,
  Sparkles,
  BrainCircuit,
  FileText,
  Search
} from 'lucide-react';

const App = () => {
  const [step, setStep] = useState(0);
  const [activeTab, setActiveTab] = useState('main'); 
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseItem, setPurchaseItem] = useState(''); 
  const [purchaseDelay, setPurchaseDelay] = useState(0); 
  const [aiPurchaseAdvice, setAiPurchaseAdvice] = useState('');
  const [isAnalyzingPurchase, setIsAnalyzingPurchase] = useState(false);
  
  // New AI States
  const [cfoReport, setCfoReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [liabilityAudit, setLiabilityAudit] = useState('');
  const [isAuditingLiabilities, setIsAuditingLiabilities] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [formData, setFormData] = useState({
    userType: '',
    income: '',
    fixedLiabilities: [
      { id: Date.now(), title: '', amount: '', dueDay: 1 }
    ],
    dailyVariable: '',
    balance: '',
    incomeDate: 1,
  });

  const totalSteps = 6;
  const isFreelancer = formData.userType === 'freelancer';

  const addLiability = () => {
    setFormData(prev => ({
      ...prev,
      fixedLiabilities: [...prev.fixedLiabilities, { id: Date.now(), title: '', amount: '', dueDay: 1 }]
    }));
  };

  const removeLiability = (id) => {
    if (formData.fixedLiabilities.length === 1) return;
    setFormData(prev => ({
      ...prev,
      fixedLiabilities: prev.fixedLiabilities.filter(l => l.id !== id)
    }));
  };

  const updateLiability = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      fixedLiabilities: prev.fixedLiabilities.map(l => l.id === id ? { ...l, [field]: value } : l)
    }));
  };

  const handleNext = () => {
    if (step === 4 && isFreelancer) {
        setStep(6); 
    } else {
        setStep(s => Math.min(s + 1, totalSteps));
    }
  };

  const handleBack = () => {
    if (step === 6 && isFreelancer) {
        setStep(4);
    } else {
        setStep(s => Math.max(s - 1, 0));
    }
  };

  const results = useMemo(() => {
    if (step !== 6) return null;

    const rawIncome = parseFloat(formData.income) || 0;
    const balanceAmount = parseFloat(formData.balance) || 0;
    const dailySpend = parseFloat(formData.dailyVariable) || 0;
    const payday = parseInt(formData.incomeDate);
    const fixedMonthly = formData.fixedLiabilities.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const variableMonthly = dailySpend * 30;
    
    let monthlyIncome = 0;
    let dailyIncomeInflow = 0;

    if (isFreelancer) {
        dailyIncomeInflow = rawIncome / 7; 
        monthlyIncome = dailyIncomeInflow * 30;
    } else {
        monthlyIncome = rawIncome;
    }

    const totalOutflow = fixedMonthly + variableMonthly;
    const monthlySurplus = monthlyIncome - totalOutflow;
    
    const today = new Date();
    const maxSimulationDays = 3650; 
    const chartWindow = 180;

    const masterProjection = [];
    let bal = balanceAmount;
    let simDate = new Date(today);
    let dZero = -1;

    for (let i = 0; i <= maxSimulationDays; i++) {
        const dayOfMonth = simDate.getDate();

        if (i > 0) {
            if (isFreelancer) {
                bal += dailyIncomeInflow;
            } else {
                if (dayOfMonth === payday) bal += monthlyIncome;
            }

            bal -= dailySpend;
            formData.fixedLiabilities.forEach(bill => {
                if (parseInt(bill.dueDay) === dayOfMonth) bal -= (parseFloat(bill.amount) || 0);
            });
        }

        masterProjection.push({
            day: i,
            balance: bal,
            dateObj: new Date(simDate),
            dateStr: simDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
        });

        if (bal <= 0 && dZero === -1) {
            dZero = i;
        }
        simDate.setDate(simDate.getDate() + 1);
    }

    const daysUntilZero = dZero === -1 ? 9999 : dZero;
    const depletionDate = dZero !== -1 ? masterProjection[dZero].dateStr : 'Growing';
    const chartPoints = masterProjection.slice(0, chartWindow);

    const testPrice = parseFloat(purchasePrice) || 0;
    let testDaysUntilZero = daysUntilZero;
    let testDepletionDate = depletionDate;
    
    if (testPrice > 0) {
        let failIndex = -1;
        if (daysUntilZero < purchaseDelay && daysUntilZero !== 9999) {
            testDaysUntilZero = daysUntilZero; 
        } else {
            for (let i = purchaseDelay; i < masterProjection.length; i++) {
                if (masterProjection[i].balance - testPrice <= 0) {
                    failIndex = i;
                    break;
                }
            }
            testDaysUntilZero = failIndex === -1 ? 9999 : failIndex;
        }
        testDepletionDate = testDaysUntilZero !== 9999 
            ? new Date(today.getTime() + testDaysUntilZero * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) 
            : 'Growing';
    }

    let optimalDate = null;
    let optimalDaysAway = -1;
    let optimalType = 'safe'; 
    let lowestFutureBalance = 0;

    if (testPrice > 0) {
        lowestFutureBalance = Math.max(...masterProjection.slice(0, 90).map(p => p.balance));

        if (testDaysUntilZero < 45 + purchaseDelay) {
            const searchHorizon = monthlySurplus > 0 ? 365 : 60; 

            for (let d = 1; d <= searchHorizon; d++) {
                if (masterProjection[d].balance >= testPrice) {
                    let safeWindow = true;
                    const limit = Math.min(d + 45, masterProjection.length - 1);
                    
                    for (let k = d; k <= limit; k++) {
                        if (masterProjection[k].balance - testPrice <= 0) {
                            safeWindow = false;
                            break;
                        }
                    }

                    if (safeWindow) {
                        optimalDaysAway = d;
                        optimalDate = masterProjection[d].dateStr;
                        optimalType = 'safe';
                        break;
                    }
                }
            }

            if (!optimalDate) {
                for (let d = 1; d <= searchHorizon; d++) {
                    if (masterProjection[d].balance >= testPrice) {
                        let survWindow = true;
                        const limit = Math.min(d + 30, masterProjection.length - 1);
                        for (let k = d; k <= limit; k++) {
                            if (masterProjection[k].balance - testPrice <= 0) {
                                survWindow = false;
                                break;
                            }
                        }
                        if (survWindow) {
                            optimalDaysAway = d;
                            optimalDate = masterProjection[d].dateStr;
                            optimalType = 'survival';
                            break;
                        }
                    }
                }
            }
        }
    }

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - totalOutflow) / monthlyIncome) * 100 : 0;
    const survivalFundMonths = fixedMonthly > 0 ? (balanceAmount / fixedMonthly).toFixed(1) : '∞';
    const safetyMargin = monthlyIncome > 0 ? ((monthlyIncome - fixedMonthly) / monthlyIncome) * 100 : 0;

    let rawScore = 0;
    if (daysUntilZero > 180) rawScore += 50; else rawScore += Math.min(50, daysUntilZero * 0.28); 
    if (savingsRate >= 20) rawScore += 30; else if (savingsRate > 0) rawScore += savingsRate * 1.5;
    if (parseFloat(survivalFundMonths) >= 6) rawScore += 20; else if (parseFloat(survivalFundMonths) > 0) rawScore += parseFloat(survivalFundMonths) * 3;
    const healthScore = Math.min(100, Math.max(0, Math.round(rawScore)));
    const dailyNet = monthlySurplus / 30;

    const currentDay = today.getDate();
    const sortedLiabilities = formData.fixedLiabilities.map(l => {
        const d = parseInt(l.dueDay);
        let daysAway = d - currentDay;
        if (daysAway < 0) daysAway += 30;
        const amount = parseFloat(l.amount) || 0;
        const impact = monthlyIncome > 0 ? (amount / monthlyIncome) * 100 : 0;
        return { ...l, daysAway, impact, status: daysAway < 7 ? 'Urgent' : 'Upcoming' };
    }).sort((a, b) => a.daysAway - b.daysAway);
    
    const nextBill = sortedLiabilities.length > 0 ? sortedLiabilities[0] : null;
    const fixedLoadRatio = monthlyIncome > 0 ? (fixedMonthly / monthlyIncome) * 100 : 0;
    const paidLiabilities = formData.fixedLiabilities.filter(l => parseInt(l.dueDay) < currentDay);
    const paidAmount = paidLiabilities.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const paidPercentage = fixedMonthly > 0 ? (paidAmount / fixedMonthly) * 100 : 0;
    const daysToPayday = payday >= currentDay ? payday - currentDay : (30 - currentDay) + payday;

    const insights = [];
    if (isFreelancer) {
        insights.push({
            icon: <Briefcase className="w-3.5 h-3.5 text-emerald-400" />,
            text: `Income: Weekly ₹${rawIncome.toLocaleString()} ≈ ₹${Math.floor(monthlyIncome).toLocaleString()}/mo.`
        });
    }
    if (!isFreelancer && daysUntilZero <= daysToPayday && daysUntilZero < 365) {
      insights.push({ icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />, text: `Critical: Cash runs out in ${daysUntilZero} days.` });
    }

    return { 
      daysUntilZero, 
      status: daysUntilZero < 15 ? 'DANGER' : daysUntilZero <= 45 ? 'WARNING' : 'SAFE', 
      color: daysUntilZero < 15 ? 'text-rose-500' : daysUntilZero <= 45 ? 'text-amber-500' : 'text-emerald-500', 
      gradient: daysUntilZero < 15 ? 'from-rose-900/50 to-rose-950/80' : daysUntilZero <= 45 ? 'from-amber-900/50 to-amber-950/80' : 'from-emerald-900/50 to-emerald-950/80',
      fixedMonthly,
      variableMonthly,
      totalOutflow,
      savingsRate,
      monthlySurplus,
      survivalFundMonths,
      safetyMargin,
      chartPoints,
      testDaysUntilZero,
      testDepletionDate,
      optimalDate,
      optimalDaysAway,
      optimalType,
      lowestFutureBalance,
      depletionDate,
      liabilities: sortedLiabilities,
      fixedLoadRatio,
      paidAmount,
      paidPercentage,
      healthScore,
      dailyNet,
      nextBill,
      daysToPayday,
      insights,
      dailyIncomeInflow,
      monthlyIncome
    };
  }, [formData, step, purchasePrice, purchaseDelay, isFreelancer]);

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  useEffect(() => {
    if (activeTab === 'coach' && chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  useEffect(() => {
    if (step === 6 && results && chatMessages.length === 0) {
        setChatMessages([{ role: 'model', text: `Wealth Report Ready.\n\nScore: **${results.healthScore}/100**\nRunway: **${results.daysUntilZero > 180 ? 'Infinite' : results.daysUntilZero + ' days'}**\n\nI'm ready to analyze your financial strategy.` }]);
    }
  }, [step, results]);

  // --- GEMINI API CALLS ---
  const callGemini = async (prompt, contextData) => {
    const apiKey = ""; // API Key provided by environment
    const systemPrompt = `You are MoneyPulse, a high-end financial strategist. 
    Context:
    ${JSON.stringify(contextData)}
    
    Instructions:
    - Be concise, direct, and professional (like a CFO).
    - Use Markdown for formatting.
    - Focus on cashflow efficiency and runway extension.`;

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
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis unavailable.";
    } catch (e) {
        console.error(e);
        return "System offline. Unable to generate analysis.";
    }
  };

  // 1. Chat Coach
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    const newMessages = [...chatMessages, { role: 'user', text }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);

    const context = {
        type: formData.userType,
        monthlyIncome: results.monthlyIncome,
        balance: formData.balance,
        healthScore: results.healthScore,
        runway: results.daysUntilZero,
        surplus: results.monthlySurplus
    };

    try {
        const response = await callGemini(text, context);
        setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  // 2. Purchase Analyzer
  const analyzePurchase = async () => {
    if (!purchasePrice || !purchaseItem.trim()) return;
    setIsAnalyzingPurchase(true);
    
    const context = {
        item: purchaseItem,
        price: purchasePrice,
        currentRunway: results.daysUntilZero,
        postPurchaseRunway: results.testDaysUntilZero,
        healthScore: results.healthScore
    };

    try {
        const response = await callGemini(`Analyze buying ${purchaseItem} for ${purchasePrice}. Should I buy it? Give a "Green/Yellow/Red Light" verdict and 1 sentence reason.`, context);
        setAiPurchaseAdvice(response);
    } finally {
        setIsAnalyzingPurchase(false);
    }
  };

  // 3. CFO Report
  const generateCFOReport = async () => {
      setIsGeneratingReport(true);
      const context = {
          health: results.healthScore,
          runway: results.daysUntilZero,
          surplus: results.monthlySurplus,
          savingsRate: results.savingsRate
      };
      try {
          const response = await callGemini("Write a 3-sentence Executive CFO Summary of my finances. Bold the key insight.", context);
          setCfoReport(response);
      } finally {
          setIsGeneratingReport(false);
      }
  };

  // 4. Liability Audit
  const auditLiabilities = async () => {
      setIsAuditingLiabilities(true);
      const context = {
          income: results.monthlyIncome,
          liabilities: results.liabilities.map(l => ({ title: l.title, amount: l.amount }))
      };
      try {
          const response = await callGemini("Review my list of bills. Identify high ratios vs income or potential cuts. Bullet points.", context);
          setLiabilityAudit(response);
      } finally {
          setIsAuditingLiabilities(false);
      }
  };


  const ForecastChart = ({ data }) => {
    const [hoverIndex, setHoverIndex] = useState(null);
    const svgRef = useRef(null);
    if (!data || data.length === 0) return null;
    const balances = data.map(d => d.balance);
    const maxVal = Math.max(...balances, 1000);
    const minVal = Math.min(...balances, 0);
    const range = maxVal - minVal || 1;
    const width = 400;
    const height = 150;
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.balance - minVal) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    const handleInteraction = (e) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const index = Math.round(percent * (data.length - 1));
      setHoverIndex(index);
    };
    const activePoint = hoverIndex !== null ? data[hoverIndex] : null;
    const activeX = hoverIndex !== null ? (hoverIndex / (data.length - 1)) * width : 0;
    const activeY = activePoint ? height - ((activePoint.balance - minVal) / range) * height : 0;
    return (
      <div className="w-full mt-4">
        <div className="flex justify-between items-center mb-6 h-8 border-b border-white/5 pb-2">
            {activePoint ? (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{activePoint.dateStr}</div>
                    <div className="text-sm font-black text-white tracking-widest">₹{Math.floor(activePoint.balance).toLocaleString()}</div>
                </div>
            ) : (
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Activity className="w-3 h-3" /> Projection</div>
            )}
        </div>
        <div className="relative h-40 group">
            <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible cursor-crosshair touch-none" onMouseMove={handleInteraction} onTouchMove={handleInteraction} onMouseLeave={() => setHoverIndex(null)} onTouchEnd={() => setHoverIndex(null)}>
                <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.2" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs>
                <line x1="0" y1={height - (Math.abs(minVal)/range * height)} x2={width} y2={height - (Math.abs(minVal)/range * height)} stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                <path d={`M0,${height} ${points} L${width},${height} Z`} fill="url(#fade)" />
                <polyline fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={points} className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                {hoverIndex !== null && (<g className="animate-in fade-in duration-200"><line x1={activeX} y1="0" x2={activeX} y2={height} stroke="#10b981" strokeWidth="1" strokeDasharray="4" /><circle cx={activeX} cy={activeY} r="4" fill="#0f172a" stroke="#10b981" strokeWidth="2" /></g>)}
            </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 md:p-8 font-sans text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="w-full max-w-sm bg-[#0a0a0a] rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(16,185,129,0.1)] overflow-hidden border border-white/5 ring-1 ring-white/5 flex flex-col h-[750px] relative backdrop-blur-3xl">
        
        {/* Header */}
        <div className="px-6 pt-8 pb-3 bg-[#0a0a0a]/80 backdrop-blur-xl z-20 border-b border-white/5 sticky top-0">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-1.5 rounded-lg shadow-lg shadow-emerald-900/50"><Zap className="w-3.5 h-3.5 text-white" /></div>
              <h1 className="font-bold text-xs tracking-[0.2em] text-white uppercase">MoneyPulse</h1>
            </div>
            {step === 6 && (<button onClick={() => setIsEditOpen(true)} className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 transition-colors hover:text-white"><Settings className="w-3.5 h-3.5" /></button>)}
          </div>
          {step < 6 && (
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: `${(step / totalSteps) * 100}%` }} />
            </div>
          )}
          {step === 6 && (
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <div className={`w-1.5 h-1.5 rounded-full ${results?.daysUntilZero > 30 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'} animate-pulse`} />
                    <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">System Live</span>
                </div>
                <div className="text-[9px] font-bold text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-900/50 uppercase tracking-widest">{formData.userType === 'freelancer' ? 'Self-Employed' : formData.userType}</div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6 overflow-y-auto scrollbar-hide pb-36">
          {step < 6 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
                {step === 0 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Income Source</h2>
                            <p className="text-slate-500 text-xs font-medium">Select your primary cashflow engine.</p>
                        </div>
                        <div className="space-y-3">
                            {['salaried', 'business', 'freelancer'].map((type) => (
                            <button key={type} onClick={() => { updateField('userType', type); handleNext(); }} className={`relative w-full p-4 rounded-2xl border transition-all duration-300 group hover:scale-[1.02] ${formData.userType === type ? 'border-emerald-500/50 bg-emerald-950/10 shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)]' : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-all duration-300 ${formData.userType === type ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-black/40 text-slate-500 group-hover:text-emerald-400'}`}>
                                        {type === 'salaried' ? <Briefcase className="w-4 h-4" /> : type === 'business' ? <TrendingUp className="w-4 h-4" /> : <PieChart className="w-4 h-4" />}
                                    </div>
                                    <div className="text-left">
                                        <span className={`block font-bold text-xs uppercase mb-0.5 tracking-widest ${formData.userType === type ? 'text-white' : 'text-slate-300'}`}>{type === 'freelancer' ? 'Self-Employed' : type}</span>
                                        <span className="text-[10px] font-medium text-slate-500 tracking-wide">
                                            {type === 'salaried' ? 'Fixed monthly paycheck' : type === 'business' ? 'Profit-based earnings' : 'Variable project income'}
                                        </span>
                                    </div>
                                </div>
                            </button>
                            ))}
                        </div>
                    </div>
                )}
                {step === 1 && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">{isFreelancer ? "Weekly Average" : "Monthly Net"}</h2>
                            <p className="text-slate-500 text-xs font-medium">Post-tax liquidity injection.</p>
                        </div>
                        <div className="group relative bg-white/5 rounded-3xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-emerald-500/30 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_30px_-5px_rgba(16,185,129,0.1)]">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-lg text-slate-500 transition-colors group-focus-within:text-emerald-400"><IndianRupee className="w-4 h-4" /></div>
                            <input autoFocus type="number" value={formData.income} onChange={(e) => updateField('income', e.target.value)} placeholder="0" className="w-full h-full py-8 pl-16 pr-6 text-3xl font-bold text-white placeholder:text-white/10 bg-transparent outline-none tracking-tight" />
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end"><h2 className="text-xl font-bold text-white tracking-tight">Fixed Burn</h2><button onClick={addLiability} className="flex items-center gap-2 bg-white/10 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-white/20 transition-all active:scale-95 border border-white/5 uppercase tracking-widest"><Plus className="w-3 h-3" /> Add Item</button></div>
                        <div className="space-y-3">
                            {formData.fixedLiabilities.map((item) => (
                            <div key={item.id} className="group relative bg-white/5 rounded-2xl border border-white/5 p-2 pr-4 flex items-center gap-3 hover:border-white/10 transition-all duration-300">
                                <button onClick={() => removeLiability(item.id)} className="absolute -top-2 -right-2 bg-black text-slate-500 p-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:border-rose-500/30 transition-all z-10"><Trash2 className="w-3 h-3" /></button>
                                <div className="p-2.5 bg-black/40 rounded-xl text-slate-600 group-hover:text-emerald-500 transition-colors"><IndianRupee className="w-3.5 h-3.5" /></div>
                                <div className="flex-1 space-y-0.5">
                                    <input type="text" placeholder="Label" value={item.title} onChange={(e) => updateLiability(item.id, 'title', e.target.value)} className="w-full bg-transparent font-bold text-white text-xs outline-none placeholder:text-slate-600 tracking-wide" />
                                    <input type="number" placeholder="0" value={item.amount} onChange={(e) => updateLiability(item.id, 'amount', e.target.value)} className="w-full bg-transparent text-[10px] font-medium text-slate-400 outline-none placeholder:text-slate-700" />
                                </div>
                                <div className="bg-black/40 rounded-lg px-2 py-1 border border-white/5">
                                    <span className="text-[7px] font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">Day</span>
                                    <select value={item.dueDay} onChange={(e) => updateLiability(item.id, 'dueDay', e.target.value)} className="bg-transparent font-bold text-white text-xs outline-none cursor-pointer">
                                        {[...Array(31)].map((_, i) => (<option key={i+1} value={i+1} className="bg-black">{i+1}</option>))}
                                    </select>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                )}
                {[3,4,5].includes(step) && (
                    <div className="space-y-8 animate-in fade-in">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
                                {step===3 ? "Daily Lifestyle" : step===4 ? "Current Liquidity" : "Inflow Date"}
                            </h2>
                            <p className="text-slate-500 text-xs font-medium">
                                {step===3 ? "Avg. spend on food, transport, etc." : step===4 ? "Total cash available right now." : "When does the money hit?"}
                            </p>
                        </div>
                        {step === 5 ? (
                            <div className="grid grid-cols-7 gap-2 p-3 bg-white/5 rounded-3xl border border-white/5">
                                {[...Array(31)].map((_, i) => (
                                    <button key={i} onClick={() => { updateField('incomeDate', i + 1); handleNext(); }} className={`aspect-square rounded-lg font-bold text-xs transition-all flex items-center justify-center ${formData.incomeDate === i + 1 ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10 scale-110' : 'text-slate-500 hover:bg-white/10 hover:text-white'}`}>{i + 1}</button>
                                ))}
                            </div>
                        ) : (
                            <div className="group relative bg-white/5 rounded-3xl border border-white/5 overflow-hidden transition-all hover:border-emerald-500/30 focus-within:border-emerald-500/50">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-lg text-slate-500 group-focus-within:text-emerald-400">
                                    {step===3?<Wallet className="w-4 h-4"/>:<CheckCircle2 className="w-4 h-4"/>}
                                </div>
                                <input autoFocus type="number" value={step===3?formData.dailyVariable:formData.balance} onChange={(e) => updateField(step===3?'dailyVariable':'balance', e.target.value)} placeholder="0" className="w-full h-full py-8 pl-16 pr-6 text-3xl font-bold text-white bg-transparent outline-none tracking-tighter" />
                            </div>
                        )}
                    </div>
                )}
              </div>
          )}

          {step === 6 && results && (
            <div className="animate-in fade-in duration-700 space-y-8">
              
              {activeTab === 'main' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className={`p-6 rounded-[2rem] bg-gradient-to-br ${results.gradient} relative overflow-hidden group border border-white/5`}>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Financial Pulse</span>
                                <div className="text-5xl font-black mt-2 leading-none tracking-tighter text-white">{results.healthScore}<span className="text-xl text-white/20 align-top ml-1">/100</span></div>
                            </div>
                            <div className="p-2.5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10">
                                <HeartPulse className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="w-full bg-black/30 rounded-full h-1.5 mb-4 overflow-hidden backdrop-blur-sm">
                            <div className="h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-1000" style={{ width: `${results.healthScore}%` }} />
                        </div>
                        <div className="flex gap-2 items-center">
                            {results.healthScore > 80 ? <Sparkles className="w-3.5 h-3.5 text-emerald-200" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />}
                            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wide">
                                {results.healthScore > 80 ? "Portfolio optimized." : "Optimization required."}
                            </span>
                        </div>
                    </div>
                  </div>

                  {/* CFO Report Generator */}
                  <button 
                      onClick={generateCFOReport}
                      disabled={isGeneratingReport}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-[2rem] p-5 transition-all text-left group"
                  >
                      <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg"><FileText className="w-4 h-4" /></div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Executive Report</span>
                          </div>
                          {isGeneratingReport ? <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" /> : <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />}
                      </div>
                      <div className="text-sm font-bold text-slate-400 group-hover:text-slate-200 leading-relaxed pl-1">
                          {cfoReport ? cfoReport : "Tap to generate a CFO-level summary of your financial status..."}
                      </div>
                  </button>

                  <div className="bg-white/5 rounded-[2rem] p-5 border border-white/5 relative overflow-hidden hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-1.5 rounded-lg ${results.dailyNet > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {results.dailyNet > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Wealth Velocity</span>
                    </div>
                    <div className="text-xl font-bold text-white tracking-tight">
                        {results.dailyNet > 0 ? 'Accumulating' : 'Burning'} <span className={results.dailyNet > 0 ? 'text-emerald-400' : 'text-rose-400'}>₹{Math.abs(Math.round(results.dailyNet))}</span> <span className="text-xs text-slate-500">/day</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/5 rounded-[1.5rem] p-4 hover:border-white/10 transition-colors">
                        <div className="bg-indigo-500/10 w-8 h-8 rounded-lg flex items-center justify-center text-indigo-400 mb-3"><CreditCard className="w-3.5 h-3.5" /></div>
                        <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Next Hit</span>
                            {results.nextBill ? (
                                <div className="mt-1">
                                    <div className="text-xs font-black text-white truncate">{results.nextBill.title}</div>
                                    <div className="text-[9px] font-bold text-rose-400">₹{results.nextBill.amount} in {results.nextBill.daysAway}d</div>
                                </div>
                            ) : (<div className="text-xs font-bold text-slate-500 mt-1">Clean</div>)}
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-[1.5rem] p-4 hover:border-white/10 transition-colors">
                        <div className="bg-emerald-500/10 w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 mb-3"><Coins className="w-3.5 h-3.5" /></div>
                        <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{isFreelancer ? "Mo. Est" : "Payday"}</span>
                            <div className="text-xs font-black text-white tracking-wide mt-1">
                                {isFreelancer ? `₹${Math.round(results.monthlyIncome / 1000)}k` : `${results.daysToPayday} Days`}
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-2">Zero Balance Trajectory</p>
                    <p className="text-sm font-black text-white flex items-center justify-center gap-2 bg-white/5 inline-block px-4 py-1.5 rounded-full border border-white/5">
                        {results.depletionDate === 'Growing' ? <span className="flex items-center gap-1.5 text-emerald-400"><InfinityIcon className="w-4 h-4" /> Infinite</span> : results.depletionDate}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'wealth' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Projection</h3>
                        <div className="bg-black/40 text-emerald-400 text-[9px] font-bold px-3 py-1 rounded-full uppercase border border-emerald-500/20">180 Days</div>
                    </div>
                    <ForecastChart data={results.chartPoints} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/5 rounded-[2rem] p-5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-slate-400 mb-2"><Percent className="w-3.5 h-3.5" /><span className="text-[9px] font-bold uppercase tracking-wider">Margin</span></div>
                        <div className={`text-2xl font-black ${results.safetyMargin > 20 ? 'text-emerald-400' : 'text-amber-400'}`}>{results.safetyMargin.toFixed(0)}%</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-[2rem] p-5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-slate-400 mb-2"><ShieldAlert className="w-3.5 h-3.5" /><span className="text-[9px] font-bold uppercase tracking-wider">Runway</span></div>
                        <div className="text-2xl font-black text-indigo-400">{results.survivalFundMonths} <span className="text-xs text-slate-500">Mo</span></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'liabilities' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden backdrop-blur-md">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fixed Load</span>
                            <span className="text-xl font-black text-white">₹{results.fixedMonthly.toLocaleString()}</span>
                        </div>
                        <div className="relative pt-2">
                            <div className="flex justify-between text-[9px] font-bold text-white/60 mb-2 uppercase tracking-wider">
                                <span>Ratio: {results.fixedLoadRatio.toFixed(0)}%</span>
                                <span>{results.fixedLoadRatio > 50 ? 'Heavy' : 'Optimal'}</span>
                            </div>
                            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${results.fixedLoadRatio > 50 ? 'bg-rose-500' : results.fixedLoadRatio > 30 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(100, results.fixedLoadRatio)}%` }} />
                            </div>
                        </div>
                    </div>
                  </div>

                  <button 
                      onClick={auditLiabilities}
                      disabled={isAuditingLiabilities}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.5rem] p-4 flex items-center justify-between group transition-all"
                  >
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl"><Search className="w-4 h-4" /></div>
                          <div className="text-left">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white">AI Audit</span>
                              <p className="text-[10px] text-slate-500 font-medium">Scan for optimization opportunities</p>
                          </div>
                      </div>
                      {isAuditingLiabilities ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white" />}
                  </button>
                  
                  {liabilityAudit && (
                      <div className="bg-emerald-900/20 border border-emerald-500/20 p-5 rounded-[1.5rem] animate-in fade-in slide-in-from-top-2">
                          <div className="text-xs font-bold text-emerald-200 leading-relaxed whitespace-pre-line">{liabilityAudit}</div>
                      </div>
                  )}

                  <div className="space-y-3">
                    {results.liabilities.map((item, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-4 bg-white/5 rounded-[1.5rem] border ${item.status === 'Urgent' ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5'} hover:bg-white/10 transition-all duration-300`}>
                            <div className="flex items-center gap-4 pl-1">
                                <div className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center border ${item.status === 'Urgent' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-black/40 border-white/5 text-slate-500'}`}>
                                    <span className="text-[7px] font-bold uppercase -mb-0.5 opacity-60">Day</span>
                                    <span className="text-xs font-black">{item.dueDay}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white">{item.title || 'Bill'}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] text-slate-400 font-mono">₹{parseFloat(item.amount || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right pr-2">
                                <span className={`text-[8px] font-black uppercase block tracking-wider ${item.status === 'Urgent' ? 'text-amber-400' : 'text-slate-600'}`}>
                                    {item.daysAway === 0 ? 'Today' : `${item.daysAway} days`}
                                </span>
                            </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'affordability' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-900/50"><ShoppingBag className="w-4 h-4" /></div>
                        <div><h3 className="text-sm font-black text-white leading-tight">Affordability</h3><p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Impact Simulation</p></div>
                    </div>
                    <div className="space-y-6">
                        <div className="group">
                            <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block tracking-widest pl-1">Item Name</label>
                            <input type="text" placeholder="e.g. New Laptop" value={purchaseItem} onChange={(e) => setPurchaseItem(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] py-3 pl-5 text-sm font-bold text-white focus:border-emerald-500/50 focus:bg-black/60 outline-none transition-all tracking-tight mb-4" />
                            
                            <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block tracking-widest pl-1">Item Cost</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-emerald-400 transition-colors" />
                                <input type="number" placeholder="0" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] py-4 pl-14 text-2xl font-black text-white focus:border-emerald-500/50 focus:bg-black/60 outline-none transition-all tracking-tight" />
                            </div>
                        </div>
                        {parseFloat(purchasePrice) > 0 && (
                            <div className="space-y-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Strategy</span>
                                    <button onClick={() => setPurchaseDelay(purchaseDelay === 0 ? 7 : 0)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${purchaseDelay === 7 ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-transparent border-white/10 text-slate-400 hover:border-white/30'}`}>Wait 7 Days</button>
                                </div>
                                
                                {results.optimalDate && (
                                    <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 p-5 rounded-[2rem] flex gap-4 items-center relative overflow-hidden">
                                        <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30"><Calendar className="w-4 h-4 text-emerald-400" /></div>
                                        <div className="z-10">
                                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Optimal Buy Date</p>
                                            <p className="text-xl font-black text-white">{results.optimalDate}</p>
                                            <p className="text-[9px] font-bold text-emerald-300/70 mt-1 leading-tight max-w-[200px]">{results.optimalType === 'safe' ? `Waiting ${results.optimalDaysAway} days restores your 45-day safety buffer.` : `Waiting ${results.optimalDaysAway} days prevents immediate bankruptcy.`}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {!results.optimalDate && results.testDaysUntilZero > 45 && (
                                    <div className="bg-emerald-900/20 border border-emerald-500/30 p-5 rounded-[2rem] flex gap-4 items-center">
                                        <div className="bg-emerald-500/20 p-2.5 rounded-xl text-emerald-400"><CheckCircle2 className="w-4 h-4" /></div>
                                        <div>
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Clear to Buy</p>
                                            <p className="text-lg font-black text-white">Today</p>
                                            <p className="text-[9px] font-bold text-emerald-400/60 mt-1">Impact minimal. Runway remains healthy.</p>
                                        </div>
                                    </div>
                                )}

                                {!results.optimalDate && results.testDaysUntilZero <= 45 && (
                                    <div className="bg-rose-900/20 border border-rose-500/30 p-5 rounded-[2rem] flex flex-col gap-4">
                                        <div className="flex gap-4 items-center">
                                            <div className="bg-rose-500/20 p-2.5 rounded-xl text-rose-500 border border-rose-500/30"><Ban className="w-4 h-4" /></div>
                                            <div>
                                                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Unattainable</p>
                                                <p className="text-lg font-black text-white">Requires Savings Plan</p>
                                            </div>
                                        </div>
                                        {results.lowestFutureBalance > 0 && results.lowestFutureBalance < parseFloat(purchasePrice) && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[9px] font-bold text-rose-400 uppercase tracking-wider">
                                                    <span>Capacity</span>
                                                    <span>{Math.round((results.lowestFutureBalance / parseFloat(purchasePrice)) * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-rose-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(results.lowestFutureBalance / parseFloat(purchasePrice)) * 100}%` }} />
                                                </div>
                                            </div>
                                        )}
                                        <p className="text-[9px] font-bold text-rose-300/60 leading-relaxed bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">Buying this anytime in the next year would trigger a financial crisis.</p>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={analyzePurchase} 
                                    disabled={isAnalyzingPurchase || !purchaseItem}
                                    className="w-full py-4 bg-emerald-600 text-black font-black rounded-[1.25rem] shadow-lg hover:bg-emerald-500 active:scale-[0.98] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAnalyzingPurchase ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
                                    Consult AI Advisor
                                </button>
                                
                                {aiPurchaseAdvice && (
                                    <div className="bg-white/5 border border-white/5 p-5 rounded-[2rem] animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                            <Bot className="w-4 h-4" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">Analysis</span>
                                        </div>
                                        <div className="text-xs font-bold text-slate-300 leading-relaxed whitespace-pre-line">{aiPurchaseAdvice}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'coach' && (
                <div className="space-y-4 h-[550px] flex flex-col animate-in slide-in-from-bottom-4 duration-500">
                   <div className="bg-white/5 border border-white/5 rounded-[2rem] p-5 flex items-center gap-4">
                        <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-900/50"><Bot className="w-5 h-5" /></div>
                        <div><h3 className="text-sm font-black text-white">Wealth AI</h3><p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Powered by Gemini</p></div>
                   </div>
                   <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 p-2">
                        {chatMessages.length === 0 && (
                            <div className="text-center text-slate-500 text-[10px] font-bold mt-10 uppercase tracking-widest">Awaiting Command...</div>
                        )}
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-[11px] font-bold leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-emerald-600 text-black rounded-tr-sm' : 'bg-white/10 border border-white/5 text-slate-200 rounded-tl-sm backdrop-blur-md'}`}>
                                    <div className="whitespace-pre-line">{msg.text}</div>
                                </div>
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex justify-start animate-in fade-in">
                                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2"><Loader2 className="w-3 h-3 text-emerald-400 animate-spin" /><span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Processing</span></div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                   </div>
                   {chatMessages.length < 2 && (
                       <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-1">
                           {['Optimization plan?', 'Audit my spending', 'Projected net worth?'].map((prompt) => (
                               <button key={prompt} onClick={() => handleSendMessage(prompt)} className="whitespace-nowrap px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wide">{prompt}</button>
                           ))}
                       </div>
                   )}
                   <div className="relative group">
                        <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)} placeholder="Execute query..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-5 pr-12 text-xs font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600" />
                        <button onClick={() => handleSendMessage(chatInput)} disabled={!chatInput.trim() || isChatLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-white/10 transition-colors"><Send className="w-3.5 h-3.5" /></button>
                   </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        {step === 6 && (
          <div className="absolute bottom-6 left-6 right-6 bg-[#0f0f0f]/90 backdrop-blur-2xl border border-white/10 p-1.5 rounded-[2rem] flex justify-between items-center z-30 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]">
            {[{ id: 'main', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Pulse' }, { id: 'wealth', icon: <LineChart className="w-4 h-4" />, label: 'Wealth' }, { id: 'liabilities', icon: <ListTodo className="w-4 h-4" />, label: 'Dues' }, { id: 'affordability', icon: <ShoppingBag className="w-4 h-4" />, label: 'Buy' }, { id: 'coach', icon: <Zap className="w-4 h-4" />, label: 'AI' }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 flex-1 py-2.5 rounded-[1.5rem] transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105' : 'text-slate-500 hover:text-white'}`}>
                    {tab.icon}<span className="text-[7px] font-black uppercase tracking-wider">{tab.label}</span>
                </button>
            ))}
          </div>
        )}

        {/* ONBOARDING NAV */}
        {step > 0 && step < 6 && (<div className="p-6 border-t border-white/5 flex gap-4 bg-[#0a0a0a]/90 backdrop-blur-xl absolute bottom-0 w-full z-20"><button onClick={handleBack} className="p-4 rounded-[1.25rem] bg-white/5 text-slate-400 hover:bg-white/10 transition-colors hover:text-white active:scale-95"><ArrowLeft className="w-5 h-5" /></button><button onClick={handleNext} className="flex-1 p-4 rounded-[1.25rem] font-black text-black bg-white shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3 text-xs tracking-widest uppercase">CONFIRM <ArrowRight className="w-4 h-4" /></button></div>)}

        {/* EDIT MODAL */}
        {isEditOpen && (
          <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-2xl z-[60] flex flex-col animate-in slide-in-from-bottom duration-500">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div><h2 className="text-xl font-black text-white tracking-tight">Manual Override</h2><p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Adjust Parameters</p></div>
              <button onClick={() => setIsEditOpen(false)} className="p-2.5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-36 scrollbar-hide">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-500 tracking-widest pl-1">Income</label><input type="number" value={formData.income} onChange={(e) => updateField('income', e.target.value)} className="w-full p-4 bg-black/40 border border-white/10 rounded-[1.5rem] font-black text-white focus:border-emerald-500/50 outline-none transition-all text-sm" /></div>
                  <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-500 tracking-widest pl-1">Balance</label><input type="number" value={formData.balance} onChange={(e) => updateField('balance', e.target.value)} className="w-full p-4 bg-black/40 border border-white/10 rounded-[1.5rem] font-black text-white focus:border-emerald-500/50 outline-none transition-all text-sm" /></div>
                  <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-500 tracking-widest pl-1">Daily Burn</label><input type="number" value={formData.dailyVariable} onChange={(e) => updateField('dailyVariable', e.target.value)} className="w-full p-4 bg-black/40 border border-white/10 rounded-[1.5rem] font-black text-white focus:border-emerald-500/50 outline-none transition-all text-sm" /></div>
                  {!isFreelancer && (
                      <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-500 tracking-widest pl-1">Payday</label><select value={formData.incomeDate} onChange={(e) => updateField('incomeDate', e.target.value)} className="w-full p-4 bg-black/40 border border-white/10 rounded-[1.5rem] font-black text-white appearance-none focus:border-emerald-500/50 transition-all text-sm">{[...Array(31)].map((_, i) => (<option key={i+1} value={i+1} className="bg-black">Day {i+1}</option>))}</select></div>
                  )}
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end pb-2 border-b border-white/5"><h3 className="text-base font-black text-white">Fixed Obligations</h3><button onClick={addLiability} className="p-1.5 bg-white text-black rounded-lg hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]"><Plus className="w-3.5 h-3.5" /></button></div>
                {formData.fixedLiabilities.map((item) => (
                  <div key={item.id} className="p-2 bg-white/5 rounded-[1.5rem] border border-white/5 flex gap-3 relative group hover:bg-white/10 transition-colors">
                    <button onClick={() => removeLiability(item.id)} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:scale-110 transition-all z-10"><Trash2 className="w-3 h-3" /></button>
                    <div className="p-3 bg-black/30 rounded-[1rem] flex items-center justify-center text-slate-500"><IndianRupee className="w-4 h-4" /></div>
                    <div className="flex-1 grid grid-cols-2 gap-2 py-1 pr-2">
                        <input type="text" value={item.title} onChange={(e) => updateLiability(item.id, 'title', e.target.value)} className="col-span-2 w-full bg-transparent font-black text-white text-xs outline-none placeholder:text-slate-600 px-1" placeholder="Label" />
                        <input type="number" value={item.amount} onChange={(e) => updateLiability(item.id, 'amount', e.target.value)} className="w-full bg-black/30 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-300 outline-none border border-white/5" placeholder="0" />
                        <select value={item.dueDay} onChange={(e) => updateLiability(item.id, 'dueDay', e.target.value)} className="w-full bg-black/30 rounded-lg px-2 py-1.5 text-[9px] font-bold text-slate-300 outline-none border border-white/5 cursor-pointer">{[...Array(31)].map((_, i) => (<option key={i+1} value={i+1} className="bg-black">Day {i+1}</option>))}</select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-white/5 bg-[#0a0a0a] absolute bottom-0 w-full z-10"><button onClick={() => setIsEditOpen(false)} className="w-full py-4 bg-white text-black font-black rounded-[1.25rem] shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] hover:bg-slate-200 active:scale-[0.98] transition-all uppercase tracking-widest text-xs">Update System</button></div>
          </div>
        )}
      </div>
      <Analytics />
    </div>
  );
};

export default App;