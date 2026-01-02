import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import "./retail.css";
const Analytics = ({ analyticsData, loading, selectedGate }) => {
    if (loading) {
        return (
            <div className="loading-state">
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (!analyticsData?.data?.stats) {
        return (
            <div className="loading-state">
                <p>No analytics data available</p>
            </div>
        );
    }

    const stats = analyticsData.data.stats;

    const chartData = analyticsData.data.hourly || [];

    // Custom tooltip: show people, previousPeople and combined avg dwell time
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;
        const point = payload[0].payload || {};
        // backend may provide avgDwellMinutes and avgDwellSeconds (or avgDwellSeconds only)
        const minutes = Number(point.avgDwellMinutes ?? 0);
        const seconds = Number(point.avgDwellSeconds ?? 0);
        const totalSeconds = minutes * 60 + seconds;
        const dispMin = Math.floor(totalSeconds / 60);
        const dispSec = totalSeconds % 60;
        const dwellDisplay = `${dispMin} mins ${dispSec} secs`;

        return (
            <div className="custom-tooltip">
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
                <div>People: {point.people ?? 0}</div>
                <div>Previous: {point.previousPeople ?? 0}</div>
                <div>Avg dwell: {dwellDisplay}</div>
            </div>
        );
    };

    console.log("Chart Data:", chartData);



    return (
        <div className="stats-container">
            {/* Total Visitors Card */}
            <div className="stat-card">
                <div className="stat-header">
                    <span className="stat-icon">👥</span>
                    <h3 className="stat-title">Total Visitors</h3>
                </div>
                <div className="stat-value">
                    {stats.totalVisitors || 'N/A'}
                </div>
                <div className="stat-footer">
                    <span className={`stat-growth ${stats.trend || ''}`}>
                        {stats.growthPercent > 0 ? '+' : ''}
                        {stats.growthPercent || 0}%
                    </span>
                    <span className="stat-comparison">
                        vs {stats.previousTotalVisitors || 0} prev. period
                    </span>
                </div>
                <div className="stat-gate">
                    Gate: {selectedGate === 'all' ? 'All Gates' : selectedGate}
                </div>
            </div>

            {/* Average Dwell Time Card */}
            <div className="stat-card">
                <div className="stat-header">
                    <span className="stat-icon">⏱️</span>
                    <h3 className="stat-title">Average Dwell Time</h3>
                </div>
                <div className="stat-value-time">
                    {stats.averageDwellTime || '0 hrs 0 mins 0 secs'}
                </div>
                <div className="stat-footer">
                    <span className={`stat-growth ${stats.dwellTimeTrend || ''}`}>
                        {stats.dwellTimeGrowthPercent > 0 ? '+' : ''}
                        {stats.dwellTimeGrowthPercent || 0}%
                    </span>
                    <span className="stat-comparison">
                        vs {stats.previousAverageDwellTime || '0 hrs 0 mins 0 secs'} prev.
                    </span>
                </div>
                <div className="stat-gate">
                    Gate: {selectedGate === 'all' ? 'All Gates' : selectedGate}
                </div>
            </div>

            {/* Chart / visualization */}
            <div className="chart-card">
                <div className="stat-header" style={{ marginBottom: '16px' }}>
                    <span className="stat-icon">📈</span>
                    <h3 className="stat-title">Occupancy Trend</h3>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="hour"
                                tick={{ fontSize: 12, fill: '#666' }}
                                axisLine={false}
                                tickLine={false}
                                interval={3} // Show every 4th label to avoid clutter
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#666' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Line
                                type="monotone"
                                dataKey="people"
                                name="Current"
                                stroke="#1890ff"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="previousPeople"
                                name="Previous"
                                stroke="#d9d9d9"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default Analytics;