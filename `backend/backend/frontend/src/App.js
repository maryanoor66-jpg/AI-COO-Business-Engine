import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [simulation, setSimulation] = useState(null);

  // 🔄 Load AI Analysis
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze');
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error('Load error:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Auto refresh
    return () => clearInterval(interval);
  }, []);

  const runSimulation = async (type) => {
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: type })
    });
    const result = await res.json();
    setSimulation(result);
  };

  if (loading) {
    return (
      <div className="loading">
        <div>🚀 AI COO Loading...</div>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <span className="ai-icon">🤖</span>
          <div>
            <h1>AI COO</h1>
            <div className="subtitle">
              Business Decision Engine • {data.portfolio.total_projects} Projects
            </div>
          </div>
        </div>
        <button onClick={loadData} className="refresh-btn">
          🔄 Refresh
        </button>
      </header>

      {/* TABS */}
      <nav className="tabs">
        <button className={activeTab === 'dashboard' ? 'active' : ''} 
                onClick={() => setActiveTab('dashboard')}>
          📊 Dashboard
        </button>
        <button className={activeTab === 'projects' ? 'active' : ''} 
                onClick={() => setActiveTab('projects')}>
          📋 Projects
        </button>
        <button className={activeTab === 'insights' ? 'active' : ''} 
                onClick={() => setActiveTab('insights')}>
          💡 Insights
        </button>
      </nav>

      <main>
        {activeTab === 'dashboard' && (
          <>
            {/* KPI CARDS */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-number">${(data.portfolio.total_budget/1000).toFixed(0)}K</div>
                <div>Total Budget</div>
              </div>
              <div className="kpi-card warning">
                <div className="kpi-number">${(data.portfolio.total_projected/1000).toFixed(0)}K</div>
                <div>Projected Spend</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-number">{data.portfolio.avg_health}</div>
                <div>Health Score</div>
              </div>
              <div className="kpi-card danger">
                <div className="kpi-number">{data.portfolio.critical_projects}</div>
                <div>Critical</div>
              </div>
            </div>

            {/* CHARTS */}
            <div className="chart-container">
              <h3>Budget vs Projection</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.projects.slice(0, 6)}>
                  <CartesianGrid />
                  <XAxis dataKey="name" angle={-45} height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="budget" fill="#10b981" name="Budget ($)" />
                  <Bar dataKey="projected" fill="#ef4444" name="Projected ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === 'projects' && (
          <div className="projects-grid">
            {data.projects.map((project, i) => (
              <div key={i} className={`project-card ${project.risk.toLowerCase()}`}>
                <h4>{project.name}</h4>
                <div>Health: <span className="health">{project.health}</span></div>
                <div>Budget: ${project.budget.toLocaleString()}</div>
                <div>Projected: ${project.projected.toLocaleString()}</div>
                <div className="risk-badge">{project.risk}</div>
                <div className="progress" style={{width: `${project.days_used/project.days_total*100}%`}}></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'insights' && (
          <>
            <div className="insights">
              {data.insights.map((insight, i) => (
                <div key={i} className="insight-card">
                  <div className="insight-icon">{insight[0]}</div>
                  <div>{insight.slice(2)}</div>
                </div>
              ))}
            </div>
            <div className="recommendations">
              <h3>🎯 AI Recommendations</h3>
              <ul>
                {data.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </main>

      {/* SIMULATOR */}
      <div className="simulator">
        <h3>⚡ Scenario Simulator</h3>
        <div className="sim-buttons">
          <button onClick={() => runSimulation('hire_2')}>+2 Engineers</button>
          <button onClick={() => runSimulation('delay_30')}>+30 Days</button>
        </div>
        {simulation && (
          <div className="sim-result">
            <div>Cost Impact: ${Math.round(simulation.impact.cost_increase/1000)}K</div>
            <div>Health Change: {simulation.impact.health_change}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
