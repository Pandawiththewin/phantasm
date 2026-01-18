import React, { useState, useEffect } from 'react';
import { Siren, Clock, AlertTriangle, ChevronRight, Activity, Save, CheckCircle, Database, Youtube, ExternalLink } from 'lucide-react';
import { generateCramPlan } from '../services/geminiService';
import { fetchSurvivalPlans, saveSurvivalPlan } from '../services/openNoteService';
import { CramPlan } from '../types';

interface CramTramViewProps {
  courseCode: string;
  syllabusContext: string | null;
  onBack: () => void;
}

const CramTramView: React.FC<CramTramViewProps> = ({ courseCode, syllabusContext, onBack }) => {
  const [examType, setExamType] = useState('Midterm');
  const [hours, setHours] = useState('6 Hours');
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<CramPlan | null>(null);
  const [oldPlans, setOldPlans] = useState<CramPlan[]>([]);
  const [hasLedger, setHasLedger] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('phantasm_ledger_token');
    if (token) {
        setHasLedger(true);
        loadOldPlans();
    }
  }, [courseCode]);

  const loadOldPlans = async () => {
      const data = await fetchSurvivalPlans(courseCode);
      setOldPlans(data);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
        // Generate new plan
        const newPlan = await generateCramPlan(courseCode, syllabusContext, examType, hours);
        setPlan(newPlan);
        
        // Auto-save to OpenNote if connected
        if (hasLedger) {
            await saveSurvivalPlan(courseCode, newPlan);
            loadOldPlans(); // refresh list
        }
    } catch (e) {
        alert("The Triage Surgeon is busy. Try again.");
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const loadExistingPlan = (oldPlan: CramPlan) => {
      setPlan(oldPlan);
  };

  return (
    <div className="min-h-screen bg-[#2a0a0a] text-[#ffcccb] font-typewriter p-4 md:p-8 animate-in fade-in duration-500">
       <div className="max-w-5xl mx-auto border-[4px] border-red-900 shadow-[0_0_50px_rgba(255,0,0,0.2)] rounded-2xl overflow-hidden bg-[#1a0505]">
           
           {/* Emergency Header */}
           <div className="bg-red-900/20 border-b-4 border-red-900 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-red-600 p-3 rounded-full animate-pulse">
                        <Siren className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display uppercase tracking-widest text-red-500">Cram Tram</h1>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400/60">Doomsday Protocol Active • {courseCode}</p>
                    </div>
                </div>
                <button onClick={onBack} className="text-xs uppercase border border-red-800 px-4 py-2 hover:bg-red-900/40 transition-colors rounded">
                    Return to Safety
                </button>
           </div>

           <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
               
               {/* Controls Column */}
               <div className="lg:col-span-1 space-y-6">
                    <div className="bg-red-950/50 p-6 border-2 border-red-900 rounded-xl">
                        <label className="block text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Threat Level</label>
                        <select 
                            value={examType}
                            onChange={(e) => setExamType(e.target.value)}
                            className="w-full bg-[#2a0a0a] border border-red-800 p-3 text-red-200 focus:outline-none focus:border-red-500 rounded mb-4"
                        >
                            <option value="Unit Test">Unit Test</option>
                            <option value="Midterm">Midterm Exam</option>
                            <option value="Final Exam">Final Exam</option>
                        </select>

                        <label className="block text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Time Until Impact</label>
                        <select 
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full bg-[#2a0a0a] border border-red-800 p-3 text-red-200 focus:outline-none focus:border-red-500 rounded mb-6"
                        >
                            <option value="2 Hours">2 Hours (Panic)</option>
                            <option value="6 Hours">6 Hours (Rush)</option>
                            <option value="12 Hours">12 Hours (All Nighter)</option>
                            <option value="24 Hours">24 Hours (Strategic)</option>
                        </select>

                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-display text-xl uppercase tracking-widest rounded shadow-[0_0_20px_rgba(255,0,0,0.4)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Activity className="w-6 h-6 animate-spin" /> : <AlertTriangle className="w-6 h-6" />}
                            {isLoading ? "Triaging..." : "Initiate Protocol"}
                        </button>
                    </div>

                    {/* The Survivor's Journal (History) */}
                    {hasLedger && oldPlans.length > 0 && (
                        <div className="bg-[#2a0a0a] border border-red-900/50 rounded-xl p-4">
                            <h3 className="flex items-center gap-2 text-sm font-bold uppercase text-red-400 mb-4 pb-2 border-b border-red-900/30">
                                <Database className="w-4 h-4" /> Survivor's Journal
                            </h3>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {oldPlans.map((p, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => loadExistingPlan(p)}
                                        className="w-full text-left p-3 bg-red-950/30 hover:bg-red-900/40 border border-transparent hover:border-red-800 rounded transition-colors group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-red-200 text-sm">{p.examType}</span>
                                            <span className="text-[10px] bg-red-900 text-red-200 px-1 rounded">{p.totalHours}</span>
                                        </div>
                                        <p className="text-[10px] text-red-400 mt-1 truncate">{p.strategy}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
               </div>

               {/* Results Column */}
               <div className="lg:col-span-2">
                   {!plan ? (
                       <div className="h-full flex flex-col items-center justify-center text-red-900 opacity-50 min-h-[400px]">
                           <Clock className="w-24 h-24 mb-4 stroke-1" />
                           <p className="text-2xl font-display uppercase tracking-widest">Waiting for Input</p>
                       </div>
                   ) : (
                       <div className="animate-in slide-in-from-right-4 duration-500">
                           {/* Strategy Box */}
                           <div className="bg-red-950/30 border-l-4 border-red-500 p-6 mb-8 rounded-r-xl">
                               <h3 className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">Surgeon's Strategy</h3>
                               <p className="text-xl font-bold leading-relaxed text-red-100 italic">"{plan.strategy || 'No strategy data returned.'}"</p>
                           </div>

                           {/* Timeline */}
                           <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-red-800 before:to-transparent">
                               {plan.schedule?.length === 0 && (
                                   <div className="bg-[#2a0a0a] border-2 border-red-900/50 p-6 rounded-xl text-center text-red-400 italic">
                                       No detailed timeline could be generated.
                                   </div>
                               )}
                               {plan.schedule?.map((item, idx) => (
                                   <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                       
                                       {/* Icon */}
                                       <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#1a0505] bg-red-900 group-hover:bg-red-600 transition-colors shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            <span className="text-xs font-bold text-white">{idx + 1}</span>
                                       </div>

                                       {/* Content Card */}
                                       <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-[#2a0a0a] border-2 border-red-900/50 p-4 rounded-xl shadow-lg hover:border-red-500 transition-colors relative">
                                           {item.priority === 'CRITICAL' && (
                                               <span className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-lg animate-pulse">
                                                   Critical
                                               </span>
                                           )}
                                           <div className="flex items-center justify-between mb-1">
                                               <time className="font-display font-bold text-red-400 uppercase">{item.timeblock}</time>
                                           </div>
                                           <div className="text-lg font-bold text-red-100 mb-2">{item.action}</div>
                                           <p className="text-xs text-red-400/70 italic mb-4">{item.notes}</p>

                                           {/* Video Link */}
                                           {item.videoSuggestion && (
                                               <a 
                                                 href={item.videoSuggestion.url} 
                                                 target="_blank" 
                                                 rel="noopener noreferrer"
                                                 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-300 hover:text-white bg-red-900/30 hover:bg-red-600 border border-red-800 hover:border-red-500 p-2 rounded transition-all group/link"
                                               >
                                                   <Youtube className="w-4 h-4" />
                                                   <span className="truncate">{item.videoSuggestion.title}</span>
                                                   <ExternalLink className="w-3 h-3 opacity-50 group-hover/link:opacity-100" />
                                               </a>
                                           )}
                                       </div>
                                   </div>
                               ))}
                           </div>

                           <div className="mt-12 text-center">
                                <p className="text-red-500/50 text-xs uppercase tracking-widest animate-pulse">Good Luck. You will need it.</p>
                           </div>
                       </div>
                   )}
               </div>

           </div>
       </div>
    </div>
  );
};

export default CramTramView;