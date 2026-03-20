import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MemoryBadge from './components/MemoryBadge';
import LandingPage from './components/LandingPage';

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'mentor', content: "Hello! I'm your Avinya Code Mentor. What are we working on today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recalledFacts, setRecalledFacts] = useState([]);
  const [dimension, setDimension] = useState('core');
  
  // Dynamic Dimensions State
  const [dimensions, setDimensions] = useState([
    { id: 'scandine', label: 'Scandine', color: 'bg-blue-500', border: 'border-blue-500/30', text: 'text-blue-400' },
    { id: 'core', label: 'Core Engineering', color: 'bg-purple-500', border: 'border-purple-500/30', text: 'text-purple-400' },
    { id: 'arch', label: 'System Arch', color: 'bg-orange-500', border: 'border-orange-500/30', text: 'text-orange-400' },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Fetch memory facts when dimension changes
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
    if (dimensions.find(d => d.id === newDim.toLowerCase())) return;
    const colors = ['bg-pink-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-indigo-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const dimObj = {
      id: newDim.toLowerCase().replace(/\s+/g, '-'),
      label: newDim,
      color: randomColor,
      border: `border-${randomColor.split('-')[1]}-500/30`,
      text: `text-${randomColor.split('-')[1]}-400`
    };
    setDimensions([...dimensions, dimObj]);
    setDimension(dimObj.id);
  };

  const handleDeleteDimension = (dimId) => {
    if (dimensions.length <= 1) return;
    const filtered = dimensions.filter(d => d.id !== dimId);
    setDimensions(filtered);
    if (dimension === dimId) setDimension(filtered[0].id);
  };

  const handleClearMemory = async () => {
    if (!window.confirm("Are you sure you want to clear your ENTIRE memory bank? All dimensions will be wiped. This cannot be undone.")) return;
    try {
      await fetch('http://localhost:8000/memory', { method: 'DELETE' });
      setRecalledFacts([]);
      alert("Memory bank fully reset!");
    } catch (error) {
      console.error("Error clearing memory:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_msg: userMsg, dimension: dimension }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'mentor', content: data.mentor_message }]);
      setRecalledFacts(data.recalled_facts || []);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: 'mentor', content: "Sorry, I'm having trouble connecting to my brain right now." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LandingPage onLogin={(uid) => setUser(uid)} />;
  }

  return (
    <div className="flex h-screen bg-dark-900 text-white font-sans">
      <Sidebar 
        facts={recalledFacts} 
        onClear={handleClearMemory} 
        isRecalling={loading} 
        dimension={dimension}
        setDimension={setDimension}
        dimensions={dimensions}
        onAddDimension={handleAddDimension}
        onDeleteDimension={handleDeleteDimension}
      />
      
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-dark-700 flex items-center justify-between px-8 bg-dark-900/50 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg italic uppercase tracking-tighter">Avinya Session</h1>
            <div className="px-3 py-1 rounded-full bg-hindsight-green/10 border border-hindsight-green/20 text-hindsight-green text-[10px] font-bold tracking-widest uppercase">
              USER: {user}
            </div>
            <MemoryBadge active={recalledFacts.length > 0} />
          </div>
          <button 
            onClick={() => setUser(null)}
            className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
          >
            Logout
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-hindsight-green/20 border border-hindsight-green'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} className="text-hindsight-green" />}
                </div>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10' 
                    : 'bg-dark-800 border border-dark-700'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 justify-start animate-in fade-in duration-500">
              <div className="w-8 h-8 rounded-full bg-hindsight-green/20 border border-hindsight-green flex items-center justify-center">
                <Loader2 size={18} className="text-hindsight-green animate-spin" />
              </div>
              <div className="bg-dark-800 border border-dark-700 p-4 rounded-2xl italic text-gray-400 text-sm">
                Accessing Vault...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-8 pt-0 bg-dark-900">
          <form onSubmit={handleSend} className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${dimensions.find(d => d.id === dimension)?.label}...`}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-6 py-4 pr-16 focus:outline-none focus:border-hindsight-green transition-colors text-white placeholder-gray-500"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-hindsight-green text-dark-900 disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-4 uppercase tracking-tighter">
            Powered by Groq & Hindsight Memory | Production Ready
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
