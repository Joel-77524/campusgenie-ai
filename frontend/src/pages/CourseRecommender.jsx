import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CourseRecommender = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  const [formData, setFormData] = useState({
    marks: '',
    board: 'CBSE',
    preferredSubjects: '',
    careerInterests: '',
    budget: '',
    preferredDomain: 'Software Engineering'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.marks || !formData.budget) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setResults(null);
    try {
      const payload = {
        ...formData,
        marks: Number(formData.marks),
        budget: Number(formData.budget),
        preferredSubjects: formData.preferredSubjects.split(',').map(s => s.trim()),
        careerInterests: formData.careerInterests.split(',').map(s => s.trim()),
      };
      const res = await api.post('/recommendations', payload);
      setResults(res.data.data.recommendations);
      toast.success('Recommendations generated!');
    } catch (err) {
      toast.error('Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">AI Course Recommender</h1>
          <p className="text-gray-400">Find the perfect B.Tech program based on your academic profile and career goals.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="text-purple-400" /> Your Profile
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">12th Marks (%)</label>
                  <input type="number" name="marks" value={formData.marks} onChange={handleChange} className="input-field" placeholder="e.g. 85" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Board</label>
                  <select name="board" value={formData.board} onChange={handleChange} className="input-field">
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Preferred Subjects (comma separated)</label>
                <input type="text" name="preferredSubjects" value={formData.preferredSubjects} onChange={handleChange} className="input-field" placeholder="e.g. Physics, Math, Computer Science" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Career Interests (comma separated)</label>
                <input type="text" name="careerInterests" value={formData.careerInterests} onChange={handleChange} className="input-field" placeholder="e.g. App Development, Data Analysis" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Expected Budget (₹/year)</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="input-field" placeholder="e.g. 150000" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Preferred Domain</label>
                <select name="preferredDomain" value={formData.preferredDomain} onChange={handleChange} className="input-field">
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Hardware & Electronics">Hardware & Electronics</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Mechanical / Core">Mechanical / Core</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary !py-3 mt-4 flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={20} /> Generate AI Recommendations</>}
              </button>
            </form>
          </motion.div>

          {/* Results */}
          <div>
            <AnimatePresence mode="wait">
              {!results && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-2xl">
                  <Sparkles size={48} className="text-purple-500/50 mb-4" />
                  <p className="text-gray-400">Fill out your profile and let our AI find the best courses for your future.</p>
                </motion.div>
              )}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 size={48} className="text-purple-500 animate-spin" />
                  <p className="text-purple-400 animate-pulse">Analyzing profile and matching courses...</p>
                </motion.div>
              )}

              {results && !loading && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <h2 className="text-xl font-bold text-white mb-4">Top Matches For You</h2>
                  {results.map((rec, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card rounded-2xl p-5 border border-purple-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {rec.matchPercentage}% Match
                      </div>
                      <h3 className="font-display font-bold text-lg text-white mb-2">{rec.courseName}</h3>
                      <p className="text-gray-300 text-sm mb-3">{rec.reasoning}</p>
                      <div>
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Career Paths</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.careerOpportunities.map((role, idx) => (
                            <span key={idx} className="bg-white/10 text-purple-300 text-xs px-2 py-1 rounded-md">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseRecommender;
