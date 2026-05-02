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
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="flex items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mr-4">
          <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">KawanKampus Assistant</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Always here to help</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50 dark:bg-black/10">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 space-y-4"
            >
              <Bot className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
              <p>Send a message to start chatting</p>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={cn(
                "flex w-full",
                msg.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "flex max-w-[80%] items-end",
                msg.sender === 'user' ? "flex-row-reverse" : "flex-row"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  msg.sender === 'user' 
                    ? "bg-purple-100 dark:bg-purple-500/20 ml-2" 
                    : "bg-indigo-100 dark:bg-indigo-500/20 mr-2"
                )}>
                  {msg.sender === 'user' ? (
                    <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.sender === 'user'
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-bl-sm"
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
              <div className="flex items-end max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mr-2 shrink-0">
                  <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="px-4 py-4 rounded-2xl rounded-bl-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full pl-4 pr-12 py-3 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
