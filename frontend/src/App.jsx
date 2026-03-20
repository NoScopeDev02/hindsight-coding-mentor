import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MemoryBadge from './components/MemoryBadge';

function App() {
  const [messages, setMessages] = useState([
    { role: 'mentor', content: "Hello! I'm Avinya Coding Mentor. What are we working on today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recalledFacts, setRecalledFacts] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleClearMemory = async () => {
    if (!window.confirm("Are you sure you want to clear your memory bank? This cannot be undone.")) return;
    try {
      await fetch('http://localhost:8000/memory', { method: 'DELETE' });
      setRecalledFacts([]);
      alert("Memory cleared!");
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
        body: JSON.stringify({ user_msg: userMsg }),
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

  return (
    <div className="flex h-screen bg-dark-900 text-white font-sans">
      <Sidebar facts={recalledFacts} onClear={handleClearMemory} isRecalling={loading} />
      
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-dark-700 flex items-center justify-between px-8 bg-dark-900/50 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg">Avinya Code Session</h1>
            <MemoryBadge active={recalledFacts.length > 0} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
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
                    ? 'bg-blue-600 text-white' 
                    : 'bg-dark-800 border border-dark-700'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-hindsight-green/20 border border-hindsight-green flex items-center justify-center">
                <Loader2 size={18} className="text-hindsight-green animate-spin" />
              </div>
              <div className="bg-dark-800 border border-dark-700 p-4 rounded-2xl italic text-gray-400 text-sm">
                Recalling and thinking...
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
              placeholder="Type your coding question or challenge..."
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
            Powered by Groq & Hindsight Memory
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
