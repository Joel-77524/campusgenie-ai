import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Loader2, Search, Zap, Check } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Compare = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  const [formData, setFormData] = useState({
    item1: '',
    item2: '',
    category: 'courses'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item1 || !formData.item2) {
      toast.error('Please enter two items to compare');
      return;
    }
    
    setLoading(true);
    setResults(null);
    try {
      const res = await api.post('/compare/generate', formData);
      setResults(res.data.data);
      toast.success('Comparison generated!');
    } catch (err) {
      toast.error('Failed to generate comparison. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <TrendingUp size={32} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">College Comparison Agent</h1>
          <p className="text-gray-400">Compare courses, hostels, or departments side-by-side using AI.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1 glass-card rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Search className="text-blue-400" size={20} /> What to Compare?
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                  <option value="courses">Courses / Programs</option>
                  <option value="hostels">Hostels / Accommodation</option>
                  <option value="departments">Departments</option>
                  <option value="clubs">Clubs / Extracurriculars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Item 1</label>
                <input type="text" name="item1" value={formData.item1} onChange={handleChange} className="input-field" placeholder="e.g. B.Tech CSE" required />
              </div>
              
              <div className="flex justify-center my-2">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 font-bold text-xs">
                  VS
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Item 2</label>
                <input type="text" name="item2" value={formData.item2} onChange={handleChange} className="input-field" placeholder="e.g. B.Tech AI & ML" required />
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-medium text-white transition-all flex justify-center items-center gap-2 mt-4" style={{ background: 'linear-gradient(135deg, #3b82f6, #0891b2)', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={20} /> Generate Comparison</>}
              </button>
            </form>
          </motion.div>

          {/* Results */}
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              {!results && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-2xl">
                  <TrendingUp size={48} className="text-blue-500/30 mb-4" />
                  <p className="text-gray-400 max-w-sm">Enter two items to generate an objective side-by-side comparison matrix.</p>
                </motion.div>
              )}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-white/10 rounded-2xl">
                  <Loader2 size={48} className="text-blue-500 animate-spin" />
                  <p className="text-blue-400 animate-pulse">Analyzing data and generating comparison...</p>
                </motion.div>
              )}

              {results && !loading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Summary */}
                  <div className="glass-card rounded-2xl p-6 border-blue-500/20 border">
                    <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Overview</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{results.summary}</p>
                  </div>

                  {/* Comparison Table */}
                  <div className="glass-card rounded-2xl overflow-hidden border-white/5 border">
                    <div className="grid grid-cols-3 bg-white/5 p-4 border-b border-white/5">
                      <div className="font-bold text-gray-400 text-xs uppercase tracking-wider">Metric</div>
                      <div className="font-bold text-white text-sm text-center">{formData.item1}</div>
                      <div className="font-bold text-white text-sm text-center">{formData.item2}</div>
                    </div>
                    
                    <div className="divide-y divide-white/5">
                      {results.comparison.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-3 p-4 hover:bg-white/5 transition-colors">
                          <div className="text-gray-400 text-sm font-medium flex items-center">{row.metric}</div>
                          <div className="text-gray-200 text-sm text-center flex items-center justify-center px-2">{row.item1Value}</div>
                          <div className="text-gray-200 text-sm text-center flex items-center justify-center px-2 border-l border-white/5">{row.item2Value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-2xl p-6 border border-blue-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <Check className="text-blue-400/20" size={64} />
                    </div>
                    <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider relative z-10">AI Verdict</h3>
                    <p className="text-gray-200 font-medium relative z-10">{results.recommendation}</p>
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

export default Compare;
