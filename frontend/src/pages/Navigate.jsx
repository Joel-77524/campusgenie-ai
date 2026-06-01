import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, Navigation2, Clock, Ruler, Info } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Navigate = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    mobility: 'None'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.from || !formData.to) {
      toast.error('Please enter starting point and destination');
      return;
    }
    
    setLoading(true);
    setResults(null);
    try {
      const res = await api.post('/navigation/directions', formData);
      setResults(res.data.data);
      toast.success('Directions generated!');
    } catch (err) {
      toast.error('Failed to generate directions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/30">
            <MapPin size={32} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">Campus Navigation</h1>
          <p className="text-gray-400">Get step-by-step directions around the AIT campus.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Navigation2 className="text-pink-400" size={20} /> Where to?
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Starting Point</label>
                <input type="text" name="from" value={formData.from} onChange={handleChange} className="input-field" placeholder="e.g. Main Gate" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Destination</label>
                <input type="text" name="to" value={formData.to} onChange={handleChange} className="input-field" placeholder="e.g. CSE Department" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mobility Requirements</label>
                <select name="mobility" value={formData.mobility} onChange={handleChange} className="input-field">
                  <option value="None">None (Standard walking route)</option>
                  <option value="Wheelchair access">Wheelchair Accessible</option>
                  <option value="Avoid stairs">Avoid Stairs</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-medium text-white transition-all flex justify-center items-center gap-2 mt-4" style={{ background: 'linear-gradient(135deg, #ec4899, #e11d48)', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)' }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><MapPin size={20} /> Get Directions</>}
              </button>
            </form>
          </motion.div>

          {/* Results */}
          <div>
            <AnimatePresence mode="wait">
              {!results && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-2xl">
                  <MapPin size={48} className="text-pink-500/30 mb-4" />
                  <p className="text-gray-400">Enter your starting point and destination to see the route.</p>
                </motion.div>
              )}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-white/10 rounded-2xl">
                  <Loader2 size={48} className="text-pink-500 animate-spin" />
                  <p className="text-pink-400 animate-pulse">Calculating optimal route...</p>
                </motion.div>
              )}

              {results && !loading && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-6 relative overflow-hidden h-full flex flex-col">
                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock size={18} className="text-pink-400" />
                      <span className="font-bold text-white">{results.estimatedTimeMinutes} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Ruler size={18} className="text-pink-400" />
                      <span className="font-bold text-white">{results.distanceMeters} m</span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="flex-1 relative mb-6">
                    <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-pink-500/20" />
                    <ul className="space-y-6 relative z-10">
                      {results.steps.map((step, i) => (
                        <li key={i} className="flex gap-4">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${i === 0 ? 'bg-green-500 text-white' : i === results.steps.length - 1 ? 'bg-red-500 text-white' : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'}`}>
                            {i === 0 ? 'A' : i === results.steps.length - 1 ? 'B' : i}
                          </div>
                          <p className="text-gray-300 text-sm pt-1">{step}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Accessibility & Landmarks */}
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    {results.accessibilityNotes && (
                      <div className="flex gap-2 items-start text-sm bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-blue-200">{results.accessibilityNotes}</p>
                      </div>
                    )}
                    
                    {results.nearbyLandmarks && results.nearbyLandmarks.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-bold uppercase tracking-wider text-[10px]">Nearby:</span>
                        <div className="flex gap-2">
                          {results.nearbyLandmarks.map((lm, i) => (
                            <span key={i} className="bg-white/5 px-2 py-0.5 rounded text-xs">{lm}</span>
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

export default Navigate;
