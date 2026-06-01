import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Menu, X, LogOut, User, ChevronDown, GraduationCap, Activity, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { language, setLanguage, currentLanguageName, LANGUAGES } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setLangMenuOpen(false);
  }, [location]);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = isAuthenticated
    ? [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Home', href: '/' },
      ]
    : [
        { label: 'Home', href: '/' },
        { label: 'Features', href: '/#features' },
        { label: 'About', href: '/#about' },
      ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? 'py-3'
          : 'py-4'
      }`}
      style={{
        background: scrolled || mobileOpen
          ? 'rgba(6,4,16,0.92)'
          : 'transparent',
        backdropFilter: scrolled || mobileOpen ? 'blur(20px)' : 'none',
        borderBottom: scrolled || mobileOpen
          ? '1px solid rgba(139,92,246,0.15)'
          : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" id="navbar-logo">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-white">AIT</span>
              <span className="font-display font-medium text-lg text-purple-400 ml-1">ChatBot</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'text-white bg-purple-500/15'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => { setLangMenuOpen(!langMenuOpen); setUserMenuOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/8 transition-colors"
              >
                <span>{currentLanguageName}</span>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    className="absolute right-0 mt-2 w-36 rounded-xl overflow-hidden shadow-2xl z-50"
                    style={{
                      background: 'rgba(13,10,30,0.96)',
                      border: '1px solid rgba(139,92,246,0.25)',
                    }}
                  >
                    <div className="p-1.5 flex flex-col">
                      {Object.values(LANGUAGES).map((l) => (
                        <button
                          key={l.code}
                          onClick={() => { setLanguage(l.code); setLangMenuOpen(false); }}
                          className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            language === l.code ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-gray-300 hover:bg-white/8 hover:text-white'
                          }`}
                        >
                          {l.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isAuthenticated ? (
              /* User Menu */
              <div className="relative">
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setLangMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/8 transition-colors"
                  id="user-menu-button"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-300 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-2xl"
                      style={{
                        background: 'rgba(13,10,30,0.96)',
                        border: '1px solid rgba(139,92,246,0.25)',
                      }}
                    >
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-colors"
                          id="dashboard-link"
                        >
                          <User size={15} />
                          Dashboard
                        </Link>
                        {user?.role === 'admin' && (
                          <>
                            <Link
                              to="/admin/dashboard"
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-colors"
                            >
                              <Activity size={15} />
                              Admin Dashboard
                            </Link>
                            <Link
                              to="/admin/documents"
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-colors"
                            >
                              <FileText size={15} />
                              Document Agent
                            </Link>
                          </>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          id="logout-button"
                        >
                          <LogOut size={15} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors px-3 py-2"
                  id="navbar-login"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary !py-2 !px-5 text-sm"
                  id="navbar-signup"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition-colors"
              id="mobile-menu-button"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-white/8 mt-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <>
                    <Link to="/login" className="flex items-center px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-colors">
                      Login
                    </Link>
                    <Link to="/signup" className="block mt-2">
                      <span className="btn-primary block text-center text-sm">Get Started</span>
                    </Link>
                  </>
                )}
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
