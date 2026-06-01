const AgentAnalytics = require('../models/AgentAnalytics.model');
const AgentLog = require('../models/AgentLog.model');

const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total Requests this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const analytics = await AgentAnalytics.find({ date: { $gte: oneWeekAgo } }).sort({ date: 1 });
    
    // Aggregate data for the charts
    let totalRequests = 0;
    let fallbackCount = 0;
    const agentUsageMap = {};
    
    const dailyData = analytics.map(a => {
      totalRequests += a.totalRequests;
      fallbackCount += a.fallbackCount;
      
      const usage = Object.fromEntries(a.agentUsage);
      for (const [agent, count] of Object.entries(usage)) {
        agentUsageMap[agent] = (agentUsageMap[agent] || 0) + count;
      }

      return {
        date: a.date.toISOString().split('T')[0],
        requests: a.totalRequests,
        avgLatencyMs: a.avgLatencyMs
      };
    });

    // 2. Format Agent Usage for Pie Chart
    const agentUsageChart = Object.entries(agentUsageMap).map(([name, value]) => ({ name, value }));

    // 3. Get recent logs
    const recentLogs = await AgentLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        fallbackCount,
        dailyData,
        agentUsageChart,
        recentLogs
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
