/**
 * Analytics Dashboard UI
 * Displays earnings analytics and charts
 */

let dashboardData = null;

/**
 * Initialize analytics page
 */
async function init() {
    console.log('[Analytics] Initializing');
    
    setupEventListeners();
    await loadDashboardData();
    renderDashboard();
    
    // Auto-refresh every 30 seconds
    setInterval(async () => {
        await loadDashboardData();
        renderDashboard();
    }, 30000);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    document.getElementById('refreshBtn').addEventListener('click', async () => {
        const btn = document.getElementById('refreshBtn');
        btn.style.animation = 'spin 1s linear';
        await loadDashboardData();
        renderDashboard();
        setTimeout(() => {
            btn.style.animation = '';
        }, 1000);
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
        exportData();
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
        if (confirm('⚠️ Are you sure you want to clear all session history? This cannot be undone.')) {
            clearAllData();
        }
    });

    document.getElementById('backBtn').addEventListener('click', () => {
        window.close();
    });
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
    try {
        await storageService.init();
        dashboardData = await analyticsService.getDashboardData();
        console.log('[Analytics] Dashboard data loaded', dashboardData);
    } catch (error) {
        console.error('[Analytics] Error loading data:', error);
        dashboardData = analyticsService.getEmptyDashboard();
    }
}

/**
 * Render entire dashboard
 */
async function renderDashboard() {
    if (!dashboardData) return;

    renderSummaryCards();
    renderCharts();
    renderStats();
    await renderMetrics();
    updateLastUpdated();
}

/**
 * Render summary cards
 */
function renderSummaryCards() {
    const s = dashboardData.summary;
    const t = dashboardData.today;

    document.getElementById('totalLifetime').textContent = 
        `${s.totalLifetimeCredits} cr`;
    document.getElementById('totalSessions').textContent = 
        `${s.totalSessions} sessions`;

    document.getElementById('todayEarnings').textContent = 
        `${t.credits} cr`;
    
    // Get comparison for today vs yesterday
    analyticsService.getComparison().then((comp) => {
        const changeText = comp.change === 0 ? 'No data yet' : 
            `${comp.isPositive ? '📈' : '📉'} ${Math.abs(comp.change)}%`;
        document.getElementById('todayChange').textContent = changeText;
    });

    document.getElementById('creditsPerHour').textContent = 
        `${t.creditsPerHour} cr`;

    analyticsService.getProjection().then((proj) => {
        document.getElementById('projectedDaily').textContent = 
            `${proj} cr`;
    });
}

/**
 * Render all charts
 */
function renderCharts() {
    renderDailyEarningsChart();
    renderWeeklyChart();
    renderHourlyChart();
}

/**
 * Render daily earnings chart (30 days)
 */
function renderDailyEarningsChart() {
    const data = dashboardData.charts.dailyEarnings;
    const svgContainer = document.getElementById('dailyChartSvg');
    const loadingEl = document.getElementById('dailyChartLoading');

    if (!data || data.length === 0) {
        loadingEl.textContent = 'No data yet';
        return;
    }

    loadingEl.classList.add('hidden');
    svgContainer.innerHTML = '';

    const width = svgContainer.clientWidth;
    const height = svgContainer.clientHeight;
    const padding = 40;
    const maxCredit = Math.max(...data.map(d => d.credits), 1);

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Draw grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padding + (i * (height - padding * 2) / gridLines);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', 'rgba(255,255,255,0.1)');
        svg.appendChild(line);
    }

    // Draw bars
    const barWidth = (width - padding * 2) / data.length * 0.8;
    const barSpacing = (width - padding * 2) / data.length;

    data.forEach((d, i) => {
        const x = padding + (i * barSpacing) + barSpacing * 0.1;
        const barHeight = ((d.credits / maxCredit) * (height - padding * 2));
        const y = height - padding + (barHeight - (height - padding));

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', barHeight);
        rect.setAttribute('fill', '#667eea');
        rect.setAttribute('opacity', '0.8');
        rect.setAttribute('rx', '3');
        
        // Add hover effect
        rect.style.cursor = 'pointer';
        rect.addEventListener('mouseenter', () => {
            rect.setAttribute('opacity', '1');
        });
        rect.addEventListener('mouseleave', () => {
            rect.setAttribute('opacity', '0.8');
        });

        svg.appendChild(rect);

        // Add label every 5 days
        if (i % 5 === 0) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            const dateObj = new Date(d.date);
            text.setAttribute('x', x + barWidth / 2);
            text.setAttribute('y', height - 10);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'rgba(255,255,255,0.6)');
            text.setAttribute('font-size', '11');
            text.textContent = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
            svg.appendChild(text);
        }
    });

    // Add title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', width / 2);
    title.setAttribute('y', 20);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('fill', 'rgba(255,255,255,0.8)');
    title.setAttribute('font-size', '14');
    title.setAttribute('font-weight', 'bold');
    title.textContent = `Max: ${maxCredit.toFixed(1)} cr`;
    svg.appendChild(title);

    svgContainer.appendChild(svg);
}

/**
 * Render weekly distribution chart
 */
function renderWeeklyChart() {
    const data = dashboardData.charts.weeklyTrend;
    const svgContainer = document.getElementById('weeklyChartSvg');

    if (!data || data.length === 0) return;

    svgContainer.innerHTML = '';

    const width = svgContainer.clientWidth;
    const height = svgContainer.clientHeight;
    const padding = 40;
    const maxCredit = Math.max(...data.map(d => d.credits), 1);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Draw bars
    const barWidth = (width - padding * 2) / 7 * 0.7;
    const barSpacing = (width - padding * 2) / 7;

    data.forEach((d, i) => {
        const x = padding + (i * barSpacing) + barSpacing * 0.15;
        const barHeight = ((d.credits / maxCredit) * (height - padding * 2));
        const y = height - padding + (barHeight - (height - padding));

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', barHeight);
        rect.setAttribute('fill', '#764ba2');
        rect.setAttribute('opacity', '0.8');
        rect.setAttribute('rx', '3');

        svg.appendChild(rect);

        // Add day label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + barWidth / 2);
        text.setAttribute('y', height - 10);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'rgba(255,255,255,0.6)');
        text.setAttribute('font-size', '12');
        text.textContent = d.day;
        svg.appendChild(text);
    });

    svgContainer.appendChild(svg);
}

/**
 * Render hourly chart for today
 */
function renderHourlyChart() {
    const data = dashboardData.charts.hourlyDistribution;
    const svgContainer = document.getElementById('hourlyChartSvg');
    const loadingEl = document.getElementById('hourlyChartLoading');

    if (!data || data.every(d => d.credits === 0)) {
        loadingEl.textContent = 'No data for today';
        return;
    }

    loadingEl.classList.add('hidden');
    svgContainer.innerHTML = '';

    const width = svgContainer.clientWidth;
    const height = svgContainer.clientHeight;
    const padding = 40;
    const maxCredit = Math.max(...data.map(d => d.credits), 1);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Draw bars
    const barWidth = (width - padding * 2) / 24 * 0.8;
    const barSpacing = (width - padding * 2) / 24;

    data.forEach((d, i) => {
        if (d.credits === 0) return;

        const x = padding + (i * barSpacing) + barSpacing * 0.1;
        const barHeight = ((d.credits / maxCredit) * (height - padding * 2));
        const y = height - padding + (barHeight - (height - padding));

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', barHeight);
        rect.setAttribute('fill', '#10b981');
        rect.setAttribute('opacity', '0.8');
        rect.setAttribute('rx', '2');

        svg.appendChild(rect);

        // Add label every 4 hours
        if (i % 4 === 0) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', height - 10);
            text.setAttribute('fill', 'rgba(255,255,255,0.6)');
            text.setAttribute('font-size', '10');
            text.textContent = `${i}h`;
            svg.appendChild(text);
        }
    });

    svgContainer.appendChild(svg);
}

/**
 * Render stats section
 */
function renderStats() {
    const l7 = dashboardData.last7Days;

    document.getElementById('last7Total').textContent = `${l7.credits} cr`;
    document.getElementById('last7Average').textContent = `${l7.dailyAverage.toFixed(2)} cr`;
    document.getElementById('last7Sessions').textContent = l7.sessions;
    document.getElementById('last7Uptime').textContent = `${l7.torUptime}%`;
}

/**
 * Render performance metrics
 */
async function renderMetrics() {
    try {
        const perf = await analyticsService.getPerformanceMetrics();
        
        document.getElementById('bestHour').textContent = perf.bestHour || '—';
        document.getElementById('peakEarnings').textContent = `${perf.peakEarnings} cr`;
        document.getElementById('avgPerSession').textContent = 
            `${dashboardData.summary.averagePerSession} cr`;
    } catch (error) {
        console.error('[Analytics] Error rendering metrics:', error);
    }
}

/**
 * Update last updated timestamp
 */
function updateLastUpdated() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('lastUpdated').textContent = time;
}

/**
 * Export data as JSON
 */
async function exportData() {
    try {
        const jsonData = await storageService.exportSessions();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pepetor-sessions-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('✅ Data exported successfully');
    } catch (error) {
        console.error('[Analytics] Export error:', error);
        alert('❌ Failed to export data');
    }
}

/**
 * Clear all session data
 */
async function clearAllData() {
    try {
        await storageService.clearAll();
        dashboardData = analyticsService.getEmptyDashboard();
        renderDashboard();
        alert('✅ All session history cleared');
    } catch (error) {
        console.error('[Analytics] Clear error:', error);
        alert('❌ Failed to clear data');
    }
}

// Add CSS animation for refresh button
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);