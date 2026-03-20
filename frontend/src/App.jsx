import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Menu, History } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MemoryBadge from './components/MemoryBadge';
import LandingPage from './components/LandingPage';

function App() {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [chatHistories, setChatHistories] = useState({
    core: [{ role: 'mentor', content: "Hello! I'm your Avinya Code Mentor for Core Engineering. What are we working on today?" }],
    scandine: [{ role: 'mentor', content: "Hello! I'm your Avinya Code Mentor for Scandine. Ready to scale your SaaS?" }],
    arch: [{ role: 'mentor', content: "Hello! I'm your Avinya Code Mentor for System Arch. Let's design something robust." }]
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recalledFacts, setRecalledFacts] = useState([]);
  const [dimension, setDimension] = useState('core');
  
  const [dimensions, setDimensions] = useState([
    { id: 'scandine', label: 'Scandine', color: 'bg-blue-500', border: 'border-blue-500/30', text: 'text-blue-400' },
    { id: 'core', label: 'Core Engineering', color: 'bg-purple-500', border: 'border-purple-500/30', text: 'text-purple-400' },
    { id: 'arch', label: 'System Arch', color: 'bg-orange-500', border: 'border-orange-500/30', text: 'text-orange-400' },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistories, dimension]);

  useEffect(() => {
    if (!user) return;
    const fetchDimensionMemory = async () => {
      try {
        const response = await fetch(`http://localhost:8000/memory?dimension=${dimension}`);
        const data = await response.json();
        setRecalledFacts(data.recalled_facts || []);
      } catch (error) {
        console.error("Error fetching dimension memory:", error);
      }
    };
    fetchDimensionMemory();
  }, [dimension, user]);

  const handleAddDimension = (newDim) => {
    const id = newDim.toLowerCase().replace(/\s+/g, '-');
    if (dimensions.find(d => d.id === id)) return;
    
    const colors = ['bg-pink-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-indigo-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const dimObj = {
      id: id,
      label: newDim,
      color: randomColor,
      border: `border-${randomColor.split('-')[1]}-500/30`,
      text: `text-${randomColor.split('-')[1]}-400`
    };

    setChatHistories(prev => ({
      ...prev,
      [id]: [{ role: 'mentor', content: `Welcome to the ${newDim} dimension. Let's start building your knowledge base.` }]
    }));
    
    setDimensions([...dimensions, dimObj]);
    setDimension(dimObj.id);
  };

  const handleDeleteDimension = (dimId) => {
    if (dimensions.length <= 1) return;
    const filtered = dimensions.filter(d => d.id !== dimId);
    setDimensions(filtered);
    const newHistories = { ...chatHistories };
    delete newHistories[dimId];
    setChatHistories(newHistories);
    if (dimension === dimId) setDimension(filtered[0].id);
  };

  const handleClearMemory = async () => {
    if (!window.confirm("Are you sure? This wipes all dimensions.")) return;
    try {
      await fetch('http://localhost:8000/memory', { method: 'DELETE' });
      setRecalledFacts([]);
      const resetHistories = {};
      dimensions.forEach(d => {
        resetHistories[d.id] = [{ role: 'mentor', content: `Memory cleared. Ready for a fresh start in ${d.label}.` }];
      });
      setChatHistories(resetHistories);
      alert("Reset complete.");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setChatHistories(prev => ({
      ...prev,
      [dimension]: [...(prev[dimension] || []), { role: 'user', content: userMsg }]
    }));
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_msg: userMsg, dimension: dimension }),
      });
      const data = await response.json();
      setChatHistories(prev => ({
        ...prev,
        [dimension]: [...(prev[dimension] || []), { role: 'mentor', content: data.mentor_message }]
      }));
      setRecalledFacts(data.recalled_facts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LandingPage onLogin={(uid) => setUser(uid)} />;
  }

  const activeMessages = chatHistories[dimension] || [];
  const currentDimObj = dimensions.find(d => d.id === dimension);

  return (
    <div className="flex h-screen bg-dark-900 text-white font-sans overflow-hidden">
      <Sidebar 
        facts={recalledFacts} 
        onClear={handleClearMemory} 
        isRecalling={loading} 
        dimension={dimension}
        setDimension={setDimension}
        dimensions={dimensions}
        onAddDimension={handleAddDimension}
        onDeleteDimension={handleDeleteDimension}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col relative w-full overflow-hidden">
        {/* Header */}
        <header className="h-16 lg:h-20 border-b border-dark-700 flex items-center justify-between px-4 lg:px-8 bg-dark-900/50 backdrop-blur-md z-30 sticky top-0">
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-dark-800 border border-dark-700 text-gray-400 hover:text-white transition-all"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-black text-sm lg:text-lg italic uppercase tracking-tighter text-white/90 truncate max-w-[120px] lg:max-w-none">
              Avinya Session
            </h1>
            <div className={`hidden sm:flex px-2 lg:px-3 py-1 rounded-md bg-opacity-10 border text-[8px] lg:text-[10px] font-black tracking-widest uppercase transition-colors ${currentDimObj?.color} ${currentDimObj?.text} ${currentDimObj?.border}`}>
              {currentDimObj?.label}
            </div>
            <MemoryBadge active={recalledFacts.length > 0} />
          </div>
          <button 
            onClick={() => setUser(null)}
            className="text-[9px] lg:text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em] border border-transparent hover:border-white/10 px-2 lg:px-3 py-1.5 rounded-lg"
          >
            Log Out
          </button>
        </header>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 lg:space-y-8 custom-scrollbar scroll-smooth">
          {activeMessages.map((msg, i) => (
            <div key={i} className={`flex gap-3 lg:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 lg:gap-4 max-w-[95%] lg:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 shadow-lg shadow-blue-500/20' 
                    : 'bg-hindsight-green/10 border border-hindsight-green/30'
                }`}>
                  {msg.role === 'user' ? <User size={14} className="lg:size-4" /> : <Bot size={14} className="lg:size-4 text-hindsight-green" />}
                </div>
                <div className={`p-4 lg:p-5 rounded-2xl transition-all ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white shadow-xl' 
                    : 'bg-dark-800/50 border border-white/5 backdrop-blur-sm'
                }`}>
                  <p className="text-[12px] lg:text-[14px] leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 lg:gap-4 justify-start animate-in fade-in duration-500">
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-hindsight-green/10 border border-hindsight-green/30 flex items-center justify-center">
                <Loader2 size={14} className="lg:size-4 text-hindsight-green animate-spin" />
              </div>
              <div className="bg-dark-800/50 border border-white/5 p-4 lg:p-5 rounded-2xl italic text-gray-500 text-[10px] lg:text-[12px] font-bold uppercase tracking-widest">
                Syncing Vault...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <footer className="p-4 lg:p-8 pt-0 bg-dark-900/80 backdrop-blur-md">
          <form onSubmit={handleSend} className="relative group max-w-4xl mx-auto w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-hindsight-green/20 to-blue-500/20 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Msg ${currentDimObj?.label}...`}
              className="relative w-full bg-dark-800 border border-white/10 rounded-xl px-5 py-4 lg:py-5 pr-14 lg:pr-16 focus:outline-none focus:border-hindsight-green/50 transition-all text-[13px] lg:text-sm text-white placeholder-gray-600"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 lg:p-2.5 rounded-lg bg-hindsight-green text-dark-900 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              <Send size={16} lg:size={18} />
            </button>
          </form>
          
          {/* Mobile History Peek */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden mt-4 mx-auto flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800 border border-dark-700 text-[10px] font-bold text-gray-400 uppercase tracking-widest active:scale-95 transition-transform"
          >
            <History size={12} />
            Peek Trace
          </button>

          <p className="hidden lg:block text-center text-[9px] text-gray-600 mt-6 font-bold uppercase tracking-[0.4em] opacity-50">
            Hindsight Engine // Llama 3.1 8B
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
