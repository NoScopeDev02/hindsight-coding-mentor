import React, { useMemo, useEffect, useState } from 'react';
import { BrainCircuit, Trash2, Loader2, Activity, Zap, BarChart3, AlertTriangle, Cpu, Target, Gauge } from 'lucide-react';

const Sidebar = ({ facts, onClear, isRecalling }) => {
  const [pulse, setPulse] = useState(1);

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

  return (
    <aside className="w-80 h-screen bg-dark-800 border-r border-dark-700 p-6 flex flex-col gap-6 select-none overflow-hidden">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-2 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <BrainCircuit className={`text-hindsight-green w-5 h-5 ${isRecalling ? 'animate-pulse' : ''}`} />
          <h2 className="text-lg font-black tracking-tighter text-white uppercase italic">Avinya Code</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-0.5 rounded text-[8px] font-bold border ${analytics.lastProject !== 'Initialization' ? 'bg-hindsight-green/10 text-hindsight-green border-hindsight-green/20' : 'bg-gray-800 text-gray-600 border-gray-700'}`}>
            {analytics.lastProject}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-1">
        {/* Skill Radar Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-hindsight-green/60">
            <Cpu size={12} />
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em]">Skill Radar</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 bg-dark-900/40 p-4 rounded-xl border border-white/5">
            <StatBar label="Architecture" value={85} color="bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" icon={Target} />
            <StatBar label="Async Logic" value={70} color="bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" icon={Zap} />
            <StatBar label="Project Context" value={95} color="bg-hindsight-green shadow-[0_0_8px_rgba(16,185,129,0.4)]" icon={Activity} />
          </div>
        </section>

        {/* Cognitive Load Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-orange-400/60">
            <Gauge size={12} />
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em]">Cognitive Load</h3>
          </div>
          <div className="relative h-2 bg-dark-900/50 rounded-full border border-white/5 overflow-hidden">
            <div 
              className="absolute inset-0 bg-hindsight-green/40 blur-[2px] transition-all duration-1000"
              style={{ width: `${Math.min(100, 30 + (facts.length * 10))}%`, transform: `scaleX(${pulse})` }}
            />
            <div 
              className="absolute inset-0 bg-hindsight-green transition-all duration-1000"
              style={{ width: `${Math.min(100, 30 + (facts.length * 10))}%` }}
            />
          </div>
        </section>

        {/* Recurring Friction Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-red-400/60">
            <AlertTriangle size={12} />
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em]">Recurring Friction</h3>
          </div>
          <div className="space-y-2">
            {analytics.friction.length === 0 ? (
              <p className="text-[9px] text-gray-600 font-medium pl-4 border-l border-dark-700">Nominal operations.</p>
            ) : (
              analytics.friction.map((item, i) => (
                <div key={i} className="flex items-center gap-3 pl-2 py-1 border-l-2 border-red-500/30 group">
                  <Zap size={8} className="text-red-500/40 group-hover:text-red-400" />
                  <span className="text-[9px] font-bold text-gray-500 group-hover:text-gray-300">{item}</span>
                </div>
              ))
            )}
          </div>
        </section>
        
        {/* Cognitive Trace Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-2">
            <div className="flex items-center gap-2 text-gray-500">
              <BarChart3 size={12} />
              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em]">Cognitive Trace</h3>
            </div>
            {facts && Array.isArray(facts) && facts.length > 0 && (
              <span className="text-[8px] text-gray-600 font-mono italic">
                {facts.length.toString().padStart(2, '0')}_NODES
              </span>
            )}
          </div>

          <div className="relative group">
            {(!facts || !Array.isArray(facts) || facts.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-6 text-center opacity-10">
                <p className="text-[8px] uppercase tracking-[0.3em] font-black">Zero Memory</p>
              </div>
            ) : (
              <ul className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-700">
                {facts.map((fact, i) => {
                  const text = formatFact(fact);
                  if (!text) return null;
                  return (
                    <li key={i} className="group/item border-l border-dark-700 pl-4 relative hover:border-hindsight-green/30 transition-colors">
                      <div className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-dark-700 group-hover/item:bg-hindsight-green transition-colors" />
                      <p className="text-[10px] text-gray-500 leading-relaxed font-medium group-hover/item:text-gray-300 transition-colors">
                        {text}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-dark-700 mt-auto">
        <button 
          onClick={onClear}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-500/5 text-red-500/40 border border-red-500/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all text-[8px] font-black uppercase tracking-[0.3em]"
        >
          <Trash2 size={10} />
          Flush Core
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
