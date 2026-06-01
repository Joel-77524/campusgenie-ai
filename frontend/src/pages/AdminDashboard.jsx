import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShieldAlert, Users, Clock, Activity, Loader2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setStats(res.data.data);
      } catch (err) {
        toast.error('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-gray-400">Loading Agent Analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center text-red-400">
        <ShieldAlert className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold">Access Denied or Error</h2>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 font-display">Agent Command Center</h1>
            <p className="text-gray-400">Monitor multi-agent orchestration, latency, and request volume.</p>
          </div>
        </motion.div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Activity className="text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Requests (7d)</p>
                <h3 className="text-3xl font-bold text-white">{stats.totalRequests}</h3>
              </div>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Agents Active</p>
                <h3 className="text-3xl font-bold text-white">{stats.agentUsageChart.length}</h3>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Clock className="text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Avg Orchestration Latency</p>
                <h3 className="text-3xl font-bold text-white">
                  {stats.dailyData[stats.dailyData.length-1]?.avgLatencyMs || 0}ms
                </h3>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <ShieldAlert className="text-red-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Agent Fallbacks</p>
                <h3 className="text-3xl font-bold text-white">{stats.fallbackCount}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Daily Request Volume</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="requests" name="Total Requests" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Agent Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.agentUsageChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.agentUsageChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Logs Table */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Live Agent Stream</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="pb-3 px-4 font-medium">Time</th>
                  <th className="pb-3 px-4 font-medium">User</th>
                  <th className="pb-3 px-4 font-medium">Agent</th>
                  <th className="pb-3 px-4 font-medium">Query</th>
                  <th className="pb-3 px-4 font-medium">Confidence</th>
                  <th className="pb-3 px-4 font-medium">Latency</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm">
                {stats.recentLogs.map((log) => (
                  <tr key={log._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">{new Date(log.createdAt).toLocaleTimeString()}</td>
                    <td className="py-3 px-4">{log.userId?.name || 'Unknown'}</td>
                    <td className="py-3 px-4">
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-xs border border-purple-500/30">
                        {log.agentName}
                      </span>
                    </td>
                    <td className="py-3 px-4 truncate max-w-xs">{log.query}</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${log.confidenceScore}%` }}></div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{log.latencyMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
