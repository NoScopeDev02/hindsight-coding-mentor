import React from 'react';
import { BrainCircuit, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';

const LandingPage = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans selection:bg-hindsight-green/30">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-10 h-10 bg-hindsight-green/10 border border-hindsight-green/20 rounded-xl flex items-center justify-center group-hover:border-hindsight-green/50 transition-all">
            <BrainCircuit className="text-hindsight-green w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">Avinya Code</span>
        </div>
        <button 
          onClick={() => onLogin('Harshal')}
          className="px-6 py-2.5 rounded-xl bg-white text-dark-900 font-bold text-sm hover:bg-hindsight-green transition-all shadow-lg shadow-white/5"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hindsight-green/10 border border-hindsight-green/20 text-hindsight-green text-[10px] font-bold uppercase tracking-widest mb-8">
            <Sparkles size={12} />
            Hindsight 2026 Powered
          </div>
          <h1 className="text-7xl font-black tracking-tighter leading-[0.9] mb-8 uppercase italic">
            The Only Mentor That <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-hindsight-green to-blue-400">
              Remembers Your Growth.
            </span>
          </h1>
          <p className="text-xl text-gray-400 font-medium mb-12 max-w-xl leading-relaxed">
            Avinya Code eliminates the "Goldfish Memory" of AI. It maintains a persistent Cognitive Trace of your technical struggles, preferences, and project contexts.
          </p>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onLogin('Harshal_COE')}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-hindsight-green text-dark-900 font-black text-lg uppercase tracking-tighter hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Start Your Session
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-tight">Built for Devnovate</span>
              <span className="text-xs text-gray-500 font-medium tracking-tight italic">by Harshal Ghadge</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-3 gap-8 mt-32">
          {[
            { icon: BrainCircuit, title: "Cognitive Trace", desc: "Persistent semantic memory of your technical hurdles." },
            { icon: Zap, title: "Low Latency", desc: "Powered by Groq Llama 3.1 for lightning-fast responses." },
            { icon: Shield, title: "Dimension Isolation", desc: "Isolate project contexts like Scandine vs. Core Engineering." }
          ].map((feat, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-hindsight-green/30 transition-all group">
              <feat.icon className="text-hindsight-green w-8 h-8 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2 tracking-tight">{feat.title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center opacity-40">
          <span className="text-[10px] font-bold uppercase tracking-widest italic">Avinya Code // Production-Ready Alpha</span>
          <span className="text-[10px] font-bold uppercase tracking-widest italic"></span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
