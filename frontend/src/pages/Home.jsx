import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Sparkles, GraduationCap, Brain, Phone, Shield, BookOpen,
  TrendingUp, Users, Award, ArrowRight, Star, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Answers',
    desc: 'Ask any question about AIT and get instant, accurate answers powered by GPT-4o-mini with RAG.',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    icon: Phone,
    title: 'AI Voice Counseling',
    desc: 'Request a real AI phone call from Aria, our virtual admission counselor who answers all your questions.',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'Your conversations are protected with JWT authentication and encrypted data storage.',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: BookOpen,
    title: 'Rich Knowledge Base',
    desc: 'Access comprehensive info about courses, fees, placements, hostels, and scholarships instantly.',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    icon: TrendingUp,
    title: 'Placement Insights',
    desc: 'Get detailed placement statistics, top recruiters, average packages, and success stories.',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    icon: Award,
    title: 'Scholarship Finder',
    desc: 'Discover merit-based, government, and corporate scholarships you may be eligible for.',
    gradient: 'from-yellow-500 to-amber-600',
  },
];

const STATS = [
  { value: '94.8%', label: 'Placement Rate', icon: TrendingUp },
  { value: '₹42 LPA', label: 'Highest Package', icon: Star },
  { value: '187+', label: 'Companies Visit', icon: Users },
  { value: 'NAAC A+', label: 'Accreditation', icon: Award },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' });

  return (
    <div className="pt-16">
      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Animated mesh gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(ellipse, #7c3aed 0%, #2563eb 50%, transparent 80%)' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">
              Powered by GPT-4o-mini + RAG Technology
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.1] mb-6"
          >
            Your AI-Powered{' '}
            <span className="gradient-text">College Counselor</span>
            <br />
            <span className="text-4xl sm:text-5xl lg:text-6xl text-gray-300">Available 24/7</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Ask anything about <strong className="text-white">Apex Institute of Technology</strong> —
            courses, fees, placements, hostels, and scholarships. Get instant, accurate answers
            from our agentic AI counselor.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-primary flex items-center justify-center gap-2 text-base" id="hero-dashboard-btn">
                  Go to Dashboard
                  <ArrowRight size={18} />
                </Link>
                <button
                  className="btn-secondary flex items-center justify-center gap-2 text-base"
                  onClick={() => document.getElementById('chat-fab-button')?.click()}
                  id="hero-chat-btn"
                >
                  <Sparkles size={18} />
                  Chat with Aria
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn-primary flex items-center justify-center gap-2 text-base" id="hero-signup-btn">
                  Start for Free
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary flex items-center justify-center gap-2 text-base" id="hero-login-btn">
                  Login to Chat
                  <ChevronRight size={18} />
                </Link>
              </>
            )}
          </motion.div>

          {/* Hero stats */}
          <motion.div
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="visible"
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {STATS.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="glass-card rounded-2xl p-4 text-center hover:border-purple-500/20 transition-colors"
              >
                <Icon size={18} className="text-purple-400 mx-auto mb-2" />
                <p className="font-display font-bold text-2xl text-white">{value}</p>
                <p className="text-gray-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES SECTION ──────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4" ref={featuresRef}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={featuresInView ? 'visible' : 'hidden'}
            className="text-center mb-16"
          >
            <span className="text-purple-400 font-medium text-sm tracking-widest uppercase">Features</span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-white mt-3 mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Make the Right Choice</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our AI counselor is equipped with deep college knowledge and can answer
              any admission-related question in seconds.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, gradient }, i) => (
              <motion.div
                key={title}
                variants={fadeUp}
                custom={i * 0.5}
                initial="hidden"
                animate={featuresInView ? 'visible' : 'hidden'}
                className="glass-card rounded-2xl p-6 group hover:border-purple-500/25 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / CTA SECTION ───────────────────────────────────────────── */}
      <section id="about" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="relative rounded-3xl p-12 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(37,99,235,0.15) 100%)',
              border: '1px solid rgba(139,92,246,0.25)',
            }}
          >
            {/* Background glow */}
            <div className="absolute inset-0 opacity-30 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.3) 0%, transparent 70%)' }} />

            <div className="relative">
              <GraduationCap size={48} className="text-purple-400 mx-auto mb-6 animate-float" />
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
                Ready to Begin Your Journey at AIT?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of students who've used our AI counselor to make informed decisions
                about their education. Get started for free today.
              </p>

              {isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-purple-300 font-medium">
                    Welcome back, {user?.name}! 👋
                  </p>
                  <p className="text-gray-400 text-sm">
                    Use the chat button in the bottom-right corner to start asking questions.
                  </p>
                  <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 mt-2" id="cta-dashboard-btn">
                    Go to Dashboard
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup" className="btn-primary inline-flex items-center gap-2 text-base" id="cta-signup-btn">
                    Create Free Account
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn-secondary inline-flex items-center gap-2 text-base" id="cta-login-btn">
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-purple-400" />
            <span className="font-display font-semibold text-white">AIT ChatBot</span>
          </div>
          <p className="text-gray-600 text-sm">
            © 2024 Apex Institute of Technology. Built with ❤️ and AI.
          </p>
          <div className="flex gap-4 text-sm text-gray-600">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
