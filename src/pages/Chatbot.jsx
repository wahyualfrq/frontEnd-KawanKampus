import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import useChatbotStore from '../store/chatbotStore';
import api from '../services/api';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatbotPage() {
  const [input, setInput] = useState('');
  const { messages, addMessage, isTyping, setIsTyping } = useChatbotStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    addMessage({ id: Date.now(), text: userMsg, sender: 'user' });
    setIsTyping(true);

    try {
      const response = await api.post('/chatbot', { message: userMsg });
      addMessage({ id: Date.now(), text: response.data.reply || response.data.message, sender: 'bot' });
    } catch (err) {
      console.warn("API failed, using mock response", err);
      setTimeout(() => {
        addMessage({ 
          id: Date.now(), 
          text: "I'm a mock AI response. Your backend seems to be disconnected.", 
          sender: 'bot' 
        });
        setIsTyping(false);
      }, 1000);
      return;
    }
    
    setIsTyping(false);
  };

  return (
    <div className="p-8 h-full">
      <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-[24px] shadow-medium border border-gray-100 overflow-hidden">
        <div className="flex items-center px-7 py-5 border-b border-gray-100 bg-white/50 backdrop-blur-sm shrink-0">
          <div className="w-12 h-12 rounded-2xl ai-gradient flex items-center justify-center mr-4 shadow-lg shadow-[#7C3AED]/20">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">KawanKampus Assistant</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">AI Support Online</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-7 space-y-7 bg-gray-50/20 scrollbar-hide">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-gray-400 space-y-5"
              >
                <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
                   <Bot className="w-10 h-10 text-gray-300" />
                </div>
                <p className="font-bold text-sm tracking-tight text-gray-400">Tanyakan apapun pada asisten kampusmu!</p>
              </motion.div>
            )}

            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={cn(
                  "flex w-full",
                  msg.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "flex max-w-[85%] items-end gap-3",
                  msg.sender === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    msg.sender === 'user' 
                      ? "bg-[#FD6825] text-white" 
                      : "bg-white border border-gray-100 text-[#7C3AED]"
                  )}>
                    {msg.sender === 'user' ? (
                      <User className="w-4.5 h-4.5" />
                    ) : (
                      <Bot className="w-4.5 h-4.5" />
                    )}
                  </div>
                  
                  <div className={cn(
                    "px-5 py-4 rounded-[20px] text-sm font-bold leading-relaxed shadow-soft border",
                    msg.sender === 'user'
                      ? "bg-[#FD6825] text-white border-[#FD6825] rounded-br-sm"
                      : "bg-white border-gray-100 text-gray-800 rounded-bl-sm"
                  )}>
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-end max-w-[80%] gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4.5 h-4.5 text-[#7C3AED]" />
                  </div>
                  <div className="px-6 py-4.5 rounded-[20px] rounded-bl-sm bg-white border border-gray-100 flex space-x-2 shadow-soft">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-200 animate-bounce"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-200 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-200 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-5 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pesan kamu di sini..."
              className="w-full pl-6 pr-16 py-4.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#FD6825]/5 focus:border-[#FD6825] outline-none transition-all text-sm font-bold placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2.5 p-3.5 bg-[#FD6825] text-white rounded-xl transition-all shadow-lg shadow-[#FD6825]/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
