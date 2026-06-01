import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Loader2, Search, XCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EligibilityChecker = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    course: 'B.Tech CSE',
    marks: '',
    category: 'General',
    board: 'CBSE'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.marks || !formData.course) {
      toast.error('Please enter your marks and course');
      return;
    }
    
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        ...formData,
        marks: Number(formData.marks),
      };
      const res = await api.post('/eligibility/check', payload);
      setResult(res.data.data);
      toast.success('Eligibility checked!');
    } catch (err) {
      toast.error('Failed to check eligibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">Admission Eligibility Checker</h1>
          <p className="text-gray-400">Instantly check your chances of admission into your desired program.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Search className="text-green-400" /> Enter Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Target Course</label>
                <select name="course" value={formData.course} onChange={handleChange} className="input-field">
                  <option value="B.Tech CSE">B.Tech Computer Science & Engg</option>
                  <option value="B.Tech AI & ML">B.Tech AI & Machine Learning</option>
                  <option value="B.Tech ECE">B.Tech Electronics & Comm</option>
                  <option value="B.Tech Mechanical">B.Tech Mechanical Engg</option>
                  <option value="B.Tech Civil">B.Tech Civil Engg</option>
                  <option value="BCA">Bachelor of Computer Applications</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">12th Grade Marks (%)</label>
                <input type="number" name="marks" value={formData.marks} onChange={handleChange} className="input-field" placeholder="e.g. 82" min="0" max="100" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Board</label>
                  <select name="board" value={formData.board} onChange={handleChange} className="input-field">
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-medium text-white transition-all flex justify-center items-center gap-2 mt-4" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={20} /> Check Eligibility</>}
              </button>
            </form>
          </motion.div>

          {/* Results */}
          <div>
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-2xl">
                  <CheckCircle size={48} className="text-green-500/30 mb-4" />
                  <p className="text-gray-400">Fill in your details to see if you meet the cutoff for your target program.</p>
                </motion.div>
              )}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 size={48} className="text-green-500 animate-spin" />
                  <p className="text-green-400 animate-pulse">Analyzing admission criteria...</p>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 relative overflow-hidden h-full flex flex-col">
                  {/* Background glow */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${result.isEligible ? 'bg-green-500' : 'bg-red-500'}`} />
                  
                  <div className="flex items-start gap-4 mb-6 relative z-10">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${result.isEligible ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30' : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30'}`}>
                      {result.isEligible ? <CheckCircle size={28} className="text-white" /> : <XCircle size={28} className="text-white" />}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-2xl text-white">
                        {result.isEligible ? 'You are Eligible!' : 'Not Eligible'}
                      </h3>
                      <p className={`text-sm font-medium ${result.isEligible ? 'text-green-400' : 'text-red-400'}`}>
                        Score Match: {result.eligibilityPercentage}%
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 relative z-10 space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h4 className="text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Analysis</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{result.explanation}</p>
                    </div>
                    
                    {!result.isEligible && result.suggestedAlternatives && result.suggestedAlternatives.length > 0 && (
                      <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                        <h4 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                          <AlertTriangle size={14} /> Suggested Alternatives
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.suggestedAlternatives.map((alt, i) => (
                            <span key={i} className="bg-orange-500/20 text-orange-300 text-xs px-2.5 py-1 rounded-md border border-orange-500/30">
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EligibilityChecker;
