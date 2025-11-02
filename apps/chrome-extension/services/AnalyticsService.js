/**
 * AnalyticsService - Calculate earnings analytics and statistics
 * Processes session history for insights and performance metrics
 */

class AnalyticsService {
  constructor() {
    this.storageService = storageService;
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData() {
    const sessions = await this.storageService.getAllSessions();
    if (sessions.length === 0) {
      return this.getEmptyDashboard();
    }

    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter((s) => s.date === today);
    const last7Days = this.getLast7DaysSessions(sessions);

    return {
      summary: {
        totalLifetimeCredits: this.sum(sessions, 'credits'),
        totalSessions: sessions.length,
        averagePerSession: this.average(sessions, 'credits'),
        bestSession: this.max(sessions, 'credits'),
      },
      today: {
        credits: this.sum(todaySessions, 'credits'),
        sessions: todaySessions.length,
        averagePerSession: this.average(todaySessions, 'credits'),
        creditsPerHour: this.calculateCreditsPerHour(todaySessions),
        torUptime: this.calculateTorUptime(todaySessions),
      },
      last7Days: {
        credits: this.sum(last7Days, 'credits'),
        sessions: last7Days.length,
        dailyAverage: this.sum(last7Days, 'credits') / 7,
        creditsPerHour: this.calculateCreditsPerHour(last7Days),
        torUptime: this.calculateTorUptime(last7Days),
      },
      charts: {
        dailyEarnings: this.generateDailyEarningsChart(sessions),
        hourlyDistribution: this.generateHourlyDistribution(todaySessions),
        weeklyTrend: this.generateWeeklyTrend(sessions),
      },
    };
  }

  /**
   * Get empty dashboard for when no data exists
   */
  getEmptyDashboard() {
    return {
      summary: {
        totalLifetimeCredits: 0,
        totalSessions: 0,
        averagePerSession: 0,
        bestSession: 0,
      },
      today: {
        credits: 0,
        sessions: 0,
        averagePerSession: 0,
        creditsPerHour: 0,
        torUptime: 0,
      },
      last7Days: {
        credits: 0,
        sessions: 0,
        dailyAverage: 0,
        creditsPerHour: 0,
        torUptime: 0,
      },
      charts: {
        dailyEarnings: [],
        hourlyDistribution: [],
        weeklyTrend: [],
      },
    };
  }

  /**
   * Generate daily earnings chart data
   */
  generateDailyEarningsChart(sessions, days = 30) {
    const data = {};
    const today = new Date();

    // Initialize last 30 days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      data[dateStr] = 0;
    }

    // Sum credits by day
    sessions.forEach((session) => {
      if (data.hasOwnProperty(session.date)) {
        data[session.date] += session.credits || 0;
      }
    });

    return Object.entries(data).map(([date, credits]) => ({
      date,
      credits: Math.round(credits * 100) / 100,
    }));
  }

  /**
   * Generate hourly distribution for today
   */
  generateHourlyDistribution(todaySessions) {
    const hourData = Array(24).fill(0);

    todaySessions.forEach((session) => {
      const hour = new Date(session.timestamp).getHours();
      hourData[hour] += session.credits || 0;
    });

    return hourData.map((credits, hour) => ({
      hour: `${hour}:00`,
      credits: Math.round(credits * 100) / 100,
    }));
  }

  /**
   * Generate weekly trend
   */
  generateWeeklyTrend(sessions) {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    sessions.forEach((session) => {
      const day = new Date(session.timestamp).getDay();
      weekData[day] += session.credits || 0;
    });

    return Object.entries(weekData).map(([dayNum, credits]) => ({
      day: weekDays[dayNum],
      credits: Math.round(credits * 100) / 100,
    }));
  }

  /**
   * Calculate credits per hour
   */
  calculateCreditsPerHour(sessions) {
    if (sessions.length === 0) return 0;

    const totalCredits = this.sum(sessions, 'credits');
    const timeSpanMs = sessions[sessions.length - 1].timestamp - sessions[0].timestamp;
    const hours = timeSpanMs / (1000 * 60 * 60);

    if (hours === 0) return totalCredits;

    return Math.round((totalCredits / hours) * 100) / 100;
  }

  /**
   * Calculate Tor uptime percentage
   */
  calculateTorUptime(sessions) {
    if (sessions.length === 0) return 0;

    const runningCount = sessions.filter((s) => s.torStatus === 'running').length;
    return Math.round((runningCount / sessions.length) * 100);
  }

  /**
   * Get last 7 days of sessions
   */
  getLast7DaysSessions(sessions) {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return sessions.filter(
      (s) => new Date(s.timestamp) >= sevenDaysAgo && new Date(s.timestamp) <= today
    );
  }

  /**
   * Sum property across sessions
   */
  sum(sessions, property) {
    return Math.round(sessions.reduce((sum, s) => sum + (s[property] || 0), 0) * 100) / 100;
  }

  /**
   * Calculate average of property
   */
  average(sessions, property) {
    if (sessions.length === 0) return 0;
    return Math.round((this.sum(sessions, property) / sessions.length) * 100) / 100;
  }

  /**
   * Get max value of property
   */
  max(sessions, property) {
    if (sessions.length === 0) return 0;
    return Math.max(...sessions.map((s) => s[property] || 0));
  }

  /**
   * Get performance metrics for today
   */
  async getPerformanceMetrics() {
    const today = new Date().toISOString().split('T')[0];
    const sessions = await this.storageService.getSessionsByDate(today);

    if (sessions.length === 0) {
      return {
        totalEarnings: 0,
        averageEarnings: 0,
        totalSessions: 0,
        bestHour: null,
        peakEarnings: 0,
      };
    }

    const hourlyData = this.generateHourlyDistribution(sessions);
    const bestHour = hourlyData.reduce((max, hour) =>
      hour.credits > max.credits ? hour : max
    );

    return {
      totalEarnings: this.sum(sessions, 'credits'),
      averageEarnings: this.average(sessions, 'credits'),
      totalSessions: sessions.length,
      bestHour: bestHour.hour,
      peakEarnings: bestHour.credits,
    };
  }

  /**
   * Get projection - estimated daily earnings based on current rate
   */
  async getProjection() {
    const today = new Date().toISOString().split('T')[0];
    const sessions = await this.storageService.getSessionsByDate(today);

    if (sessions.length === 0) return 0;

    const currentHour = new Date().getHours();
    const currentCredits = this.sum(sessions, 'credits');
    const hoursActive = currentHour + 1; // +1 to include current hour

    if (hoursActive === 0) return 0;

    const creditsPerHour = currentCredits / hoursActive;
    const projectedDaily = creditsPerHour * 24;

    return Math.round(projectedDaily * 100) / 100;
  }

  /**
   * Get comparison - compare today vs yesterday
   */
  async getComparison() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todaySessions = await this.storageService.getSessionsByDate(todayStr);
    const yesterdaySessions = await this.storageService.getSessionsByDate(yesterdayStr);

    const todayCredits = this.sum(todaySessions, 'credits');
    const yesterdayCredits = this.sum(yesterdaySessions, 'credits');

    const change = yesterdayCredits === 0 ? 0 : ((todayCredits - yesterdayCredits) / yesterdayCredits) * 100;

    return {
      todayCredits,
      yesterdayCredits,
      change: Math.round(change * 100) / 100,
      isPositive: change >= 0,
    };
  }
}

// Export as singleton
const analyticsService = new AnalyticsService();