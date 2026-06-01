import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles, MessageCircle, Phone, BookOpen, TrendingUp,
  GraduationCap, Calendar, Star, ChevronRight, CheckCircle, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ADVANCED_TOOLS = [
  { icon: BookOpen, label: 'Course Recommender', description: 'AI-based personalized course matching', color: 'from-purple-500 to-indigo-600', href: '/recommend' },
  { icon: CheckCircle, label: 'Eligibility Checker', description: 'Check your admission chances instantly', color: 'from-green-500 to-emerald-600', href: '/eligibility' },
  { icon: Star, label: 'Scholarship Finder', description: 'Discover financial aid opportunities', color: 'from-orange-500 to-red-600', href: '/scholarships' },
  { icon: TrendingUp, label: 'College Comparison', description: 'Compare departments and placements', color: 'from-blue-500 to-cyan-600', href: '/compare' },
  { icon: MapPin, label: 'Campus Navigation', description: 'Find locations and get directions', color: 'from-pink-500 to-rose-600', href: '/navigate' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/chat/sessions');
        setSessions(res.data.data || []);
      } catch {
        // Non-critical
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, []);

  const openChat = (question) => {
    // Open the chat widget and prefill
    const fab = document.getElementById('chat-fab-button');
    if (fab) {
      fab.click();
      setTimeout(() => {
        const input = document.getElementById('chat-input');
        if (input) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, 'value'
          ).set;
          nativeInputValueSetter.call(input, question);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
        }
      }, 400);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4 },
    }),
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-gray-400 text-sm mb-1">{getGreeting()},</p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
            {user?.name} 👋
          </h1>
          <p className="text-gray-400 mt-2">
            What would you like to know about AIT today?
          </p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Conversations', value: sessions.length, icon: MessageCircle },
            { label: 'AI Model', value: 'GPT-4o', icon: Sparkles },
            { label: 'Knowledge Base', value: '16 Topics', icon: BookOpen },
            { label: 'Role', value: user?.role === 'admin' ? 'Admin' : 'Student', icon: GraduationCap },
          ].map(({ label, value, icon: Icon }, i) => (
            <motion.div
              key={label}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-2xl p-4"
            >
              <Icon size={16} className="text-purple-400 mb-2" />
              <p className="font-display font-bold text-xl text-white">{value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Advanced Tools */}
          <div className="lg:col-span-2">
            <h2 className="font-display font-semibold text-lg text-white mb-4">Advanced AI Tools</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {ADVANCED_TOOLS.map(({ icon: Icon, label, description, color, href }, i) => (
                <Link
                  key={label}
                  to={href}
                  className="glass-card rounded-2xl p-4 text-left group hover:border-purple-500/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4"
                  id={`tool-action-${i}`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-gray-500 text-xs truncate mt-0.5">{description}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-purple-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>

            {/* Chat CTA */}
            <motion.div
              variants={fadeUp}
              custom={4}
              initial="hidden"
              animate="visible"
              className="mt-4 rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(37,99,235,0.2) 100%)',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold text-white">Ask Aria Anything</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Our AI counselor is ready to answer your questions
                  </p>
                </div>
                <button
                  onClick={() => document.getElementById('chat-fab-button')?.click()}
                  className="btn-primary !py-2 !px-4 text-sm shrink-0 flex items-center gap-2"
                  id="dashboard-chat-cta"
                >
                  <Sparkles size={15} />
                  Chat Now
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Voice Call */}
            <motion.div
              variants={fadeUp}
              custom={5}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                  <Phone size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">AI Voice Call</p>
                  <p className="text-gray-500 text-xs">Talk to our AI counselor</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs mb-4">
                Get a personalized 5-minute counseling call from Aria, our AI admission advisor.
              </p>
              <button
                onClick={() => document.getElementById('voice-call-button')?.click() ||
                  document.getElementById('chat-fab-button')?.click()}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #ec4899, #e11d48)',
                  boxShadow: '0 4px 15px rgba(236,72,153,0.3)',
                }}
                id="dashboard-voice-btn"
              >
                Request Call
              </button>
            </motion.div>

            {/* Recent Chats */}
            <motion.div
              variants={fadeUp}
              custom={6}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-2xl p-5"
            >
              <h3 className="font-display font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <Calendar size={14} className="text-purple-400" />
                Recent Chats
              </h3>

              {loadingSessions ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-10 rounded-lg" />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-4">
                  <MessageCircle size={24} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-xs">No conversations yet</p>
                  <p className="text-gray-700 text-xs">Start chatting with Aria!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                        <MessageCircle size={13} className="text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 text-xs font-medium truncate">{s.title}</p>
                        <p className="text-gray-600 text-[10px]">{s.messageCount} messages</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
