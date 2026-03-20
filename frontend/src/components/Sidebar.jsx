import React, { useMemo, useEffect, useState } from 'react';
import { BrainCircuit, Trash2, Loader2, Activity, Zap, BarChart3, AlertTriangle, Cpu, Target, Gauge, Layers, Plus, X, Sparkles, Trophy, Lightbulb, TrendingUp } from 'lucide-react';

const Sidebar = ({ facts, onClear, isRecalling, dimension, setDimension, dimensions, onAddDimension, onDeleteDimension, isOpen, setIsOpen, mentorAnalysis }) => {
  const [pulse, setPulse] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [newDimName, setNewDimName] = useState('');

  const activeDim = dimensions.find(d => d.id === dimension) || dimensions[1];

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p === 1 ? 1.05 : 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatFact = (fact) => {
    if (typeof fact === 'object' && fact !== null && fact.text) {
      let text = fact.text;
      if (text.includes('|')) text = text.split('|')[0].trim();
      return text;
    }
    if (typeof fact === 'string') {
      const textMatch = fact.match(/text=['"](.*?)['"]/);
      if (textMatch && textMatch[1]) {
        let text = textMatch[1];
        if (text.includes('|')) text = text.split('|')[0].trim();
        return text;
      }
      if (fact.startsWith('id=')) return "";
      let text = fact;
      if (text.includes('|')) text = text.split('|')[0].trim();
      return text;
    }
    return "";
  };

  const analytics = useMemo(() => {
    if (!facts || facts.length === 0) return { logic: 20, depth: 15, velocity: 10, friction: [], lastProject: "Initialization" };
    const rawTexts = facts.map(f => (typeof f === 'string' ? f : (f.text || "")).toLowerCase());
    const logicScore = Math.min(100, (rawTexts.filter(t => t.includes('solve') || t.includes('success') || t.includes('fix') || t.includes('complete')).length * 20) + 20);
    const depthScore = Math.min(100, (rawTexts.filter(t => t.includes('async') || t.includes('await') || t.includes('concurrent') || t.includes('backend') || t.includes('performance')).length * 15) + 15);
    const velocityScore = Math.min(100, (rawTexts.filter(t => t.includes('scandine') || t.includes('ice factory') || t.includes('progress')).length * 25) + 10);
    const friction = [];
    if (rawTexts.some(t => t.includes('async') && (t.includes('error') || t.includes('struggle')))) friction.push("Syntax Errors in Async");
    if (rawTexts.some(t => t.includes('db') || t.includes('database') || t.includes('connection'))) friction.push("Database Connection Logic");
    let lastProject = "General Practice";
    if (rawTexts.some(t => t.includes('scandine'))) lastProject = "Scandine";
    else if (rawTexts.some(t => t.includes('ice factory'))) lastProject = "Ice Factory";
    return { logic: logicScore, depth: depthScore, velocity: velocityScore, friction, lastProject };
  }, [facts]);

  const StatBar = ({ label, value, color, icon: Icon }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[8px] uppercase tracking-[0.15em] font-black text-gray-500">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={10} className="text-gray-600" />}
          <span>{label}</span>
        </div>
        <span className="font-mono text-gray-400">{value}%</span>
      </div>
      <div className="h-1 w-full bg-dark-900/50 rounded-full overflow-hidden border border-white/5 p-[1px]">
        <div 
          className={`h-full transition-all duration-1000 ease-out rounded-full ${color}`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newDimName.trim()) {
      onAddDimension(newDimName.trim());
      setNewDimName('');
      setShowAdd(false);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsOpen(false)}
      />

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-dark-800 border-r border-dark-700 p-6 flex flex-col gap-6 select-none overflow-hidden transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-2 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <BrainCircuit className={`text-hindsight-green w-5 h-5 ${isRecalling ? 'animate-pulse' : ''}`} />
            <h2 className="text-lg font-black tracking-tighter text-white uppercase italic">Avinya Code</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded text-[8px] font-bold border ${activeDim.color} ${activeDim.text} ${activeDim.border} bg-opacity-10`}>
              {activeDim.label}
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-gray-500 hover:text-white">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-1">
          {/* Mentor Insights - Glassmorphism Card */}
          <section className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-hindsight-green/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-dark-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-hindsight-green font-black text-[10px] uppercase tracking-widest">
                  <Sparkles size={14} className="animate-pulse" />
                  Mentor Insights
                </div>
                <div className="group/tip relative">
                  <Lightbulb size={14} className="text-yellow-500 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-dark-800 border border-white/10 rounded-lg text-[9px] text-gray-300 hidden group-hover/tip:block animate-in fade-in zoom-in duration-200 shadow-2xl z-50">
                    <span className="text-hindsight-green font-bold block mb-1 uppercase">Pro-Tip:</span>
                    {mentorAnalysis?.debugging_suggestions || "Keep coding to generate new insights."}
                  </div>
                </div>
              </div>

              {/* Challenge Box */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 text-[9px] font-bold uppercase tracking-tighter">
                  <Trophy size={12} />
                  Daily Challenge
                </div>
                <p className="text-[10px] text-gray-400 leading-tight italic">
                  {mentorAnalysis?.personalized_challenge || "Loading fresh challenge from your history..."}
                </p>
                <button className="w-full py-1.5 rounded-lg bg-hindsight-green text-dark-900 text-[9px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all">
                  Accept Task
                </button>
              </div>

              {/* Growth Path */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-purple-400 text-[9px] font-bold uppercase tracking-widest">
                  <TrendingUp size={12} />
                  Growth Path
                </div>
                <span className="text-[9px] text-gray-500 font-mono italic truncate max-w-[120px]">
                  {mentorAnalysis?.learning_path?.split(':')[1]?.trim() || "Initializing..."}
                </span>
              </div>
            </div>
          </section>

          {/* Memory Dimensions */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
                <Layers size={12} />
                <h3 className="text-[9px] font-bold uppercase tracking-[0.2em]">Vaults</h3>
              </div>
              <button onClick={() => setShowAdd(!showAdd)} className="p-1 rounded-md bg-dark-700 text-gray-400 hover:text-hindsight-green transition-colors">
                {showAdd ? <X size={10} /> : <Plus size={10} />}
              </button>
            </div>
            
            {showAdd && (
              <form onSubmit={handleAddSubmit} className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                <input autoFocus type="text" value={newDimName} onChange={(e) => setNewDimName(e.target.value)} placeholder="New Dimension..." className="flex-1 bg-dark-900 border border-dark-700 rounded-md px-2 py-1 text-[9px] focus:outline-none focus:border-hindsight-green" />
                <button type="submit" className="px-2 py-1 bg-hindsight-green text-dark-900 rounded-md text-[9px] font-bold uppercase tracking-widest">Add</button>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {dimensions.map(dim => (
                <div key={dim.id} className="relative group/dim">
                  <button onClick={() => { setDimension(dim.id); if(window.innerWidth < 1024) setIsOpen(false); }} className={`px-3 py-1.5 rounded-full text-[9px] font-bold border transition-all ${dimension === dim.id ? `${dim.color} text-white ${dim.border}` : 'bg-dark-900/30 text-gray-500 border-dark-700 hover:border-gray-600'}`}>{dim.label}</button>
                  {dimensions.length > 1 && <button onClick={(e) => { e.stopPropagation(); onDeleteDimension(dim.id); }} className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/dim:opacity-100 transition-opacity border border-dark-800"><X size={6} className="text-white" /></button>}
                </div>
              ))}
            </div>
          </section>

          {/* Skill Radar */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-hindsight-green/60 text-[9px] font-bold uppercase tracking-[0.2em]"><Cpu size={12} /> Skill Radar</div>
            <div className="grid grid-cols-1 gap-4 bg-dark-900/40 p-4 rounded-xl border border-white/5">
              <StatBar label="Architecture" value={85} color="bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" icon={Target} />
              <StatBar label="Async Logic" value={70} color="bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" icon={Zap} />
              <StatBar label="Project Context" value={95} color="bg-hindsight-green shadow-[0_0_8px_rgba(16,185,129,0.4)]" icon={Activity} />
            </div>
          </section>

          {/* Cognitive Trace */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-dark-700 pb-2">
              <div className="flex items-center gap-2 text-gray-500 text-[9px] font-bold uppercase tracking-[0.2em]"><BarChart3 size={12} /> Cognitive Trace</div>
              {facts && Array.isArray(facts) && facts.length > 0 && <span className="text-[8px] text-gray-600 font-mono italic">{facts.length.toString().padStart(2, '0')}_NODES</span>}
            </div>
            <div className="relative group">
              {(!facts || !Array.isArray(facts) || facts.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-6 text-center opacity-10"><p className="text-[8px] uppercase tracking-[0.3em] font-black">Dimension Null</p></div>
              ) : (
                <ul className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  {facts.map((fact, i) => {
                    const text = formatFact(fact);
                    if (!text) return null;
                    return (
                      <li key={i} className="group/item border-l border-dark-700 pl-4 relative hover:border-hindsight-green/30 transition-colors">
                        <div className={`absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-dark-700 group-hover/item:${activeDim.color} transition-colors`} />
                        <p className="text-[10px] text-gray-400 leading-relaxed font-medium group-hover/item:text-gray-100 transition-colors">{text}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-dark-700 mt-auto">
          <button onClick={onClear} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-500/5 text-red-500/40 border border-red-500/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all text-[8px] font-black uppercase tracking-[0.3em]"><Trash2 size={10} /> Flush Core</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
