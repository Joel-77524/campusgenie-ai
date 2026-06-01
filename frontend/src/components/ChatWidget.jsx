import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, RotateCcw, Sparkles, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useChat from '../hooks/useChat';
import ChatMessage from './ChatMessage';
import VoiceCallModal from './VoiceCallModal';

const QUICK_QUESTIONS = [
  'Admission process',
  'Fee structure',
  'Placement details',
  'Hostel facilities',
  'Available courses',
  'Scholarship options',
];

const ChatWidget = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { messages, isLoading, sendMessage, clearChat } = useChat();

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question) => {
    sendMessage(question);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl shadow-purple-500/40 flex items-center justify-center text-white"
            aria-label="Open AI Chat Assistant"
            id="chat-fab-button"
          >
            <div className="relative">
              <MessageCircle size={26} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-600 animate-pulse" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
            style={{
              background: 'linear-gradient(135deg, rgba(15,10,30,0.97) 0%, rgba(20,15,40,0.97) 100%)',
              border: '1px solid rgba(139,92,246,0.3)',
              backdropFilter: 'blur(20px)',
            }}
            id="chat-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10"
              style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))' }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-950" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Aria — AIT Assistant</p>
                  <p className="text-green-400 text-xs">Online • Ready to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowVoiceModal(true)}
                  title="Request AI voice call"
                  className="p-2 rounded-lg text-purple-300 hover:text-white hover:bg-white/10 transition-colors"
                  id="voice-call-button"
                >
                  <Phone size={16} />
                </button>
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  id="clear-chat-button"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  id="close-chat-button"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-purple-900">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                    <Sparkles size={28} className="text-purple-400" />
                  </div>
                  <p className="text-white font-medium mb-1">Hi! I'm Aria 👋</p>
                  <p className="text-gray-400 text-sm">
                    Your AI admission counselor for Apex Institute of Technology.
                    Ask me anything!
                  </p>

                  {/* Quick Questions */}
                  <div className="mt-5 flex flex-wrap gap-2 justify-center">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleQuickQuestion(q)}
                        className="px-3 py-1.5 text-xs rounded-full border border-purple-500/40 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 hover:text-purple-200 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                    <Sparkles size={12} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-none"
                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <div className="flex gap-1.5 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 border-t border-white/10">
              {messages.length > 0 && messages.length < 6 && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
                  {QUICK_QUESTIONS.slice(0, 3).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuickQuestion(q)}
                      className="text-xs whitespace-nowrap px-2.5 py-1 rounded-full border border-purple-500/30 text-purple-400 hover:bg-purple-500/15 hover:text-purple-300 transition-all shrink-0"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about admissions, courses, fees..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none min-h-[42px] max-h-[100px]"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    scrollbarWidth: 'none',
                  }}
                  id="chat-input"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:from-purple-500 hover:to-blue-500 transition-all active:scale-95"
                  id="send-message-button"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
              <p className="text-center text-gray-600 text-xs mt-2">
                Powered by GPT-4o-mini + RAG
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Call Modal */}
      <VoiceCallModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />
    </>
  );
};

export default ChatWidget;
