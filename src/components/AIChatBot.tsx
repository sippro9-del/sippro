import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Header, BottomNav } from './Common';
import { Send, User, Bot, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AIChatBot: React.FC = () => {
  const { 
    chatHistory, 
    sendMessageToAI, 
    isAiLoading, 
    clearChat, 
    setScreen,
    t
  } = useApp();
  
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isAiLoading]);

  const handleSend = async () => {
    if (!input.trim() || isAiLoading) return;
    const msg = input;
    setInput('');
    await sendMessageToAI(msg);
  };

  return (
    <div className="pb-32 bg-main-gradient min-h-screen flex flex-col">
      <Header 
        showBack 
        onBack={() => setScreen('home')} 
        title="Spice Assistant" 
        rightElement={
          <button 
            onClick={clearChat}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 size={20} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 w-full">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="text-primary w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">How can I help you?</h2>
              <p className="text-gray-500 text-sm">Ask me about spices, recipes, or product recommendations!</p>
            </div>
            <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
              {[
                "Suggest a spice for Biryani",
                "Health benefits of Turmeric",
                "Spices for Italian pasta"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="bg-white p-3 rounded-xl border border-gray-100 text-sm text-gray-700 hover:border-primary/50 transition-colors text-left"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border text-primary'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
              }`}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}

        {isAiLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-white border text-primary flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex gap-1">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
        </div>
      </div>

      <div className="fixed bottom-24 left-0 right-0 px-4 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:max-w-xl">
        <div className="bg-white rounded-2xl shadow-xl p-2 flex items-center border border-gray-100 gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-800 placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isAiLoading}
            className={`p-3 rounded-xl transition-all ${
              input.trim() && !isAiLoading 
                ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <BottomNav active="chat" onNavigate={setScreen} />
    </div>
  );
};
