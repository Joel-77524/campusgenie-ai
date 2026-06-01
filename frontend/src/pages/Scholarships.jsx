import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Loader2, Award, Search, Calendar, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Scholarships = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  const [formData, setFormData] = useState({
    marks: '',
    income: '',
    category: 'General',
    achievements: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.marks || !formData.income) {
      toast.error('Please fill in required fields');
      return;
    }
    
    setLoading(true);
    setResults(null);
    try {
      const payload = {
        ...formData,
        marks: Number(formData.marks),
        income: Number(formData.income),
      };
      const res = await api.post('/scholarships/find', payload);
      setResults(res.data.data);
      toast.success('Scholarships found!');
    } catch (err) {
      toast.error('Failed to find scholarships. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <Star size={32} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">Scholarship Finder</h1>
          <p className="text-gray-400">Discover financial aid and merit scholarships tailored to your profile.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 glass-card rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Search className="text-orange-400" size={20} /> Search Criteria
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">12th Grade Marks (%)</label>
                <input type="number" name="marks" value={formData.marks} onChange={handleChange} className="input-field" placeholder="e.g. 92" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Family Income (₹/year)</label>
                <input type="number" name="income" value={formData.income} onChange={handleChange} className="input-field" placeholder="e.g. 300000" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Achievements / Extracurriculars</label>
                <textarea 
                  name="achievements" 
                  value={formData.achievements} 
                  onChange={handleChange} 
                  className="input-field min-h-[80px]" 
                  placeholder="e.g. State level chess player, NCC Cadet..." 
                />
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-medium text-white transition-all flex justify-center items-center gap-2 mt-4" style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)' }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Star size={20} /> Find Scholarships</>}
              </button>
            </form>
          </motion.div>

          {/* Results */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!results && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-2xl">
                  <Award size={48} className="text-orange-500/30 mb-4" />
                  <p className="text-gray-400 max-w-sm">Enter your academic and financial details to unlock personalized scholarship opportunities.</p>
                </motion.div>
              )}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-white/10 rounded-2xl">
                  <Loader2 size={48} className="text-orange-500 animate-spin" />
                  <p className="text-orange-400 animate-pulse">Searching databases...</p>
                </motion.div>
              )}

              {results && !loading && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid sm:grid-cols-2 gap-4">
                  {results.length === 0 ? (
                    <div className="sm:col-span-2 text-center py-10 glass-card rounded-2xl">
                      <p className="text-gray-400">No specific matches found. Try adjusting your criteria.</p>
                    </div>
                  ) : (
                    results.map((sch, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: i * 0.1 }}
                        className="glass-card rounded-2xl p-5 border hover:border-orange-500/30 transition-all flex flex-col relative overflow-hidden group"
                      >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />
                        
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2.5 py-1 rounded-md border border-orange-500/20">
                            {sch.matchPercentage}% Match
                          </span>
                          <span className="text-gray-400 text-xs flex items-center gap-1">
                            <Calendar size={12} /> {sch.deadline || 'Ongoing'}
                          </span>
                        </div>
                        
                        <h3 className="font-display font-bold text-lg text-white mb-1 relative z-10 leading-tight">{sch.name}</h3>
                        <p className="text-orange-300 text-sm font-medium mb-3 relative z-10">{sch.provider}</p>
                        
                        <div className="mb-4 relative z-10">
                          <p className="text-gray-300 text-xs line-clamp-3">{sch.eligibility}</p>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Amount</p>
                            <p className="text-white font-medium text-sm">{sch.amount}</p>
                          </div>
                          <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-500/20 hover:text-orange-400 transition-colors">
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scholarships;
