import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, User } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
        isUser
          ? 'bg-gradient-to-br from-purple-500 to-pink-500'
          : 'bg-gradient-to-br from-purple-600 to-blue-600'
      }`}>
        {isUser ? (
          <User size={13} className="text-white" />
        ) : (
          <Sparkles size={13} className="text-white" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'rounded-br-none text-white'
              : `rounded-bl-none text-gray-100 ${message.isError ? 'border border-red-500/30' : ''}`
          }`}
          style={
            isUser
              ? {
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                }
              : {
                  background: message.isError
                    ? 'rgba(239,68,68,0.1)'
                    : 'rgba(139,92,246,0.12)',
                  border: message.isError
                    ? '1px solid rgba(239,68,68,0.3)'
                    : '1px solid rgba(139,92,246,0.2)',
                }
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <span className={`text-[10px] text-gray-600 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
