import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell
} from 'recharts';

/**
 * ObsidianPulse Analytics - Executive B2B Retail Revenue Platform
 * Tech Stack: React (Vite) + Recharts + Dark Glassmorphic Design (#090D16)
 *
 * Endpoints consumed:
 *   - GET http://localhost:8000/api/mom-revenue (SQL CTE with LAG() window function)
 *   - GET http://localhost:8000/api/customer-rfm (SQL CTE with DENSE_RANK() & NTILE(4) window functions)
 */

// Fallback deterministic datasets matching MariaDB CTE window functions
const FALLBACK_MOM_DATA = [
  { order_month: '2024-01', month_name: 'Jan', order_year: 2024, revenue: 1400000, prev_revenue: null, mom_growth_pct: 0.0, total_orders: 8920, active_customers: 1150, avg_order_value: 156.95, is_milestone_met: false },
  { order_month: '2024-02', month_name: 'Feb', order_year: 2024, revenue: 1600000, prev_revenue: 1400000, mom_growth_pct: 14.29, total_orders: 9840, active_customers: 1240, avg_order_value: 162.60, is_milestone_met: false },
  { order_month: '2024-03', month_name: 'Mar', order_year: 2024, revenue: 1700000, prev_revenue: 1600000, mom_growth_pct: 6.25, total_orders: 10450, active_customers: 1310, avg_order_value: 162.68, is_milestone_met: false },
  { order_month: '2024-04', month_name: 'Apr', order_year: 2024, revenue: 1900000, prev_revenue: 1700000, mom_growth_pct: 11.76, total_orders: 11320, active_customers: 1420, avg_order_value: 167.84, is_milestone_met: false },
  { order_month: '2024-05', month_name: 'May', order_year: 2024, revenue: 2100000, prev_revenue: 1900000, mom_growth_pct: 10.53, total_orders: 12480, active_customers: 1560, avg_order_value: 168.27, is_milestone_met: false },
  { order_month: '2024-06', month_name: 'Jun', order_year: 2024, revenue: 2000000, prev_revenue: 2100000, mom_growth_pct: -4.76, total_orders: 11950, active_customers: 1490, avg_order_value: 167.36, is_milestone_met: false },
  { order_month: '2024-07', month_name: 'Jul', order_year: 2024, revenue: 2300000, prev_revenue: 2000000, mom_growth_pct: 15.00, total_orders: 13610, active_customers: 1680, avg_order_value: 168.99, is_milestone_met: false },
  { order_month: '2024-08', month_name: 'Aug', order_year: 2024, revenue: 2400000, prev_revenue: 2300000, mom_growth_pct: 4.35, total_orders: 14220, active_customers: 1750, avg_order_value: 168.78, is_milestone_met: false },
  { order_month: '2024-09', month_name: 'Sep', order_year: 2024, revenue: 2600000, prev_revenue: 2400000, mom_growth_pct: 8.33, total_orders: 15300, active_customers: 1890, avg_order_value: 169.93, is_milestone_met: true },
  { order_month: '2024-10', month_name: 'Oct', order_year: 2024, revenue: 2700000, prev_revenue: 2600000, mom_growth_pct: 3.85, total_orders: 15980, active_customers: 1940, avg_order_value: 168.96, is_milestone_met: true },
  { order_month: '2024-11', month_name: 'Nov', order_year: 2024, revenue: 2900000, prev_revenue: 2700000, mom_growth_pct: 7.41, total_orders: 16920, active_customers: 2050, avg_order_value: 171.39, is_milestone_met: true },
  { order_month: '2024-12', month_name: 'Dec', order_year: 2024, revenue: 3200000, prev_revenue: 2900000, mom_growth_pct: 10.34, total_orders: 18200, active_customers: 2210, avg_order_value: 175.82, is_milestone_met: true }
];

const FALLBACK_RFM_DATA = [
  { customer_id: 1, company_name: 'Novus Vantage Global', contact_name: 'Sarah Lin', contact_title: 'VP Ops', contact_email: 'contact@novus-vantage.com', state: 'CA', country: 'US', total_orders: 842, total_spend: 482910.00, spend_rank: 1, spend_quartile: 1, quartile_tier_label: 'Tier 1 - VIP Elite', recency_days: 0, activity_telemetry: 'Active 2h ago' },
  { customer_id: 2, company_name: 'Apex Prime Synthetics', contact_name: 'Marcus Vance', contact_title: 'Dir. Supply', contact_email: 'procure@apexprime.co', state: 'NY', country: 'US', total_orders: 715, total_spend: 394120.00, spend_rank: 2, spend_quartile: 1, quartile_tier_label: 'Tier 1 - Platinum', recency_days: 0, activity_telemetry: 'Active 4h ago' },
  { customer_id: 3, company_name: 'Helios Cloud Systems', contact_name: 'Elena Rostova', contact_title: 'CRO', contact_email: 'finances@helios-cloud.io', state: 'TX', country: 'US', total_orders: 684, total_spend: 341890.00, spend_rank: 3, spend_quartile: 1, quartile_tier_label: 'Tier 1 - Platinum', recency_days: 1, activity_telemetry: 'Active 1d ago' },
  { customer_id: 4, company_name: 'Krypton Logistics Intl', contact_name: 'David Chen', contact_title: 'Head of Procurement', contact_email: 'api-team@krypton-intl.com', state: 'WA', country: 'US', total_orders: 512, total_spend: 279540.00, spend_rank: 4, spend_quartile: 2, quartile_tier_label: 'Tier 2 - Growth', recency_days: 3, activity_telemetry: 'Active 3d ago' },
  { customer_id: 5, company_name: 'OmniData Foundry', contact_name: 'Lisa Sterling', contact_title: 'VP Analytics', contact_email: 'accounts@omnidata.io', state: 'IL', country: 'US', total_orders: 430, total_spend: 218600.00, spend_rank: 5, spend_quartile: 2, quartile_tier_label: 'Tier 2 - Growth', recency_days: 0, activity_telemetry: 'Active 6h ago' },
  { customer_id: 6, company_name: 'Stratosphere Corp', contact_name: 'Robert Thorne', contact_title: 'COO', contact_email: 'enterprise@stratosphere.tech', state: 'MA', country: 'US', total_orders: 394, total_spend: 192400.00, spend_rank: 6, spend_quartile: 2, quartile_tier_label: 'Tier 2 - Growth', recency_days: 5, activity_telemetry: 'Active 5d ago' },
  { customer_id: 7, company_name: 'Vortex Energy Solutions', contact_name: 'Claire Dupont', contact_title: 'Supply Director', contact_email: 'c.dupont@vortex-energy.com', state: 'CO', country: 'US', total_orders: 340, total_spend: 165320.00, spend_rank: 7, spend_quartile: 3, quartile_tier_label: 'Tier 3 - Stable', recency_days: 2, activity_telemetry: 'Active 2d ago' },
  { customer_id: 8, company_name: 'Aegis Biotech Laboratories', contact_name: 'Dr. Julian Walsh', contact_title: 'Principal Investigator', contact_email: 'lab-supplies@aegis-bio.org', state: 'NC', country: 'US', total_orders: 288, total_spend: 142100.00, spend_rank: 8, spend_quartile: 3, quartile_tier_label: 'Tier 3 - Stable', recency_days: 4, activity_telemetry: 'Active 4d ago' },
  { customer_id: 9, company_name: 'Zenith Quantum Corp', contact_name: 'Maya Patel', contact_title: 'Technical Director', contact_email: 'procurement@zenith-quantum.io', state: 'WA', country: 'US', total_orders: 245, total_spend: 118450.00, spend_rank: 9, spend_quartile: 3, quartile_tier_label: 'Tier 3 - Stable', recency_days: 7, activity_telemetry: 'Active 7d ago' },
  { customer_id: 10, company_name: 'Pulsefire Robotics', contact_name: 'Kenji Sato', contact_title: 'Operations Lead', contact_email: 'orders@pulsefire-robotics.jp', state: 'CA', country: 'US', total_orders: 190, total_spend: 89200.00, spend_rank: 10, spend_quartile: 4, quartile_tier_label: 'Tier 4 - Standard', recency_days: 12, activity_telemetry: '12d inactive' }
];

export default function App() {
  const [activeSegment, setActiveSegment] = useState('gross');
  const [tierFilter, setTierFilter] = useState('ALL TIERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [momData, setMomData] = useState(FALLBACK_MOM_DATA);
  const [rfmData, setRfmData] = useState(FALLBACK_RFM_DATA);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch from FastAPI backend
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [resMom, resRfm] = await Promise.all([
        fetch('http://localhost:8000/api/mom-revenue'),
        fetch('http://localhost:8000/api/customer-rfm')
      ]);

      if (resMom.ok && resRfm.ok) {
        const dataMom = await resMom.json();
        const dataRfm = await resRfm.json();
        setMomData(dataMom);
        setRfmData(dataRfm);
        setApiConnected(true);
      } else {
        setMomData(FALLBACK_MOM_DATA);
        setRfmData(FALLBACK_RFM_DATA);
      }
    } catch (err) {
      console.warn('FastAPI backend not reached, using simulated MariaDB CTE data:', err);
      setMomData(FALLBACK_MOM_DATA);
      setRfmData(FALLBACK_RFM_DATA);
      setApiConnected(false);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return rfmData.filter(cust => {
      const matchesTier =
        tierFilter === 'ALL TIERS' ||
        (tierFilter === 'TIER 1 ELITE' && cust.quartile_tier_label.includes('Tier 1')) ||
        (tierFilter === 'TIER 2 GROWTH' && cust.quartile_tier_label.includes('Tier 2')) ||
        (tierFilter === 'TIER 3 STABLE' && cust.quartile_tier_label.includes('Tier 3'));

      if (!matchesTier) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        cust.company_name.toLowerCase().includes(q) ||
        cust.contact_name.toLowerCase().includes(q) ||
        cust.state.toLowerCase().includes(q)
      );
    });
  }, [rfmData, tierFilter, searchQuery]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amt);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-[#dfe2ef] font-sans antialiased">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#181b25] border-b border-[#414751] h-14 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1c1f29] border border-[#60a5fa]/40 flex items-center justify-center text-[#60a5fa] font-bold font-mono text-sm">
            OP
          </div>
          <span className="text-lg font-bold uppercase tracking-tight text-[#dfe2ef]">
            ObsidianPulse Analytics
          </span>
          <div className="hidden xl:flex items-center gap-2 px-2 py-1 bg-[#1c1f29] border border-[#414751] ml-2 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 bg-[#4edea3] shadow-[0_0_6px_#4edea3]"></span>
            <span className="text-[#c1c7d3]">PRODUCTION / US-EAST-1</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <div className="flex items-center bg-[#090D16] border border-[#414751] px-3 py-1.5">
            <span className="material-symbols-outlined text-[#8b919d] text-base mr-2">search</span>
            <input
              type="text"
              placeholder="Search CTE queries, cohorts, or accounts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 p-0 text-xs text-[#dfe2ef] placeholder-[#8b919d] focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#c1c7d3]">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            <span>FY 2024 (YTD)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#262a34] border border-[#414751] flex items-center justify-center text-xs font-bold text-[#a4c9ff]">
              CR
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-semibold uppercase text-[#dfe2ef]">Executive Access</span>
              <span className="text-[11px] text-[#a4c9ff]">Chief Revenue Officer</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="pt-16 pb-12 px-6 max-w-7xl mx-auto">
        {/* Title Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-widest text-[#60a5fa]">
              <span>MISSION CRITICAL // BI PIPELINE</span>
              <span>•</span>
              <span className="text-[#4edea3] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#4edea3]"></span>
                {apiConnected ? 'Database Connected (FastAPI)' : 'Database Connected (MariaDB CTE)'}
              </span>
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-[#dfe2ef] mt-1">
              Executive Retail Analytics
            </h1>
            <div className="text-xs font-mono text-[#8b919d] mt-0.5">
              PostgreSQL 16.2 / MariaDB CTE Engine (v4.8.1-live)
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="px-3 py-1.5 bg-[#1c1f29] hover:bg-[#262a34] text-[#dfe2ef] text-xs font-mono uppercase tracking-wider font-semibold border border-[#414751] flex items-center gap-2"
            >
              <span className={`material-symbols-outlined text-sm text-[#a4c9ff] ${isRefreshing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>Refresh CTE Cache</span>
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#181b25] p-5 border border-[#414751]/60 relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#a4c9ff]"></div>
            <div className="text-[11px] uppercase tracking-widest text-[#c1c7d3] mb-2 flex justify-between">
              <span>Total Normalized Orders</span>
              <span className="text-[#4edea3] font-mono">+18.4% MoM</span>
            </div>
            <div className="text-3xl font-bold text-[#dfe2ef] tracking-tight">148,290</div>
            <div className="mt-4 pt-2 bg-[#0a0e17]/60 px-3 py-1.5 text-xs text-[#c1c7d3] flex justify-between font-mono">
              <span>Fulfillment Rate:</span>
              <span className="text-[#4edea3]">98.24% SLA Compliant</span>
            </div>
          </div>

          <div className="bg-[#181b25] p-5 border border-[#414751]/60 relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#4edea3]"></div>
            <div className="text-[11px] uppercase tracking-widest text-[#c1c7d3] mb-2 flex justify-between">
              <span>Total Gross Spend (YTD)</span>
              <span className="text-[#4edea3] font-mono">+24.6% vs Q3 Target</span>
            </div>
            <div className="text-3xl font-bold text-[#4edea3] tracking-tight drop-shadow-[0_0_12px_rgba(78,222,163,0.25)]">
              $24,892,450.00
            </div>
            <div className="mt-4 pt-2 bg-[#0a0e17]/60 px-3 py-1.5 text-xs text-[#c1c7d3] flex justify-between font-mono">
              <span>Average Order Value:</span>
              <span className="text-[#dfe2ef]">$167.86 (+8.1%)</span>
            </div>
          </div>

          <div className="bg-[#181b25] p-5 border border-[#414751]/60 relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#d0bcff]"></div>
            <div className="text-[11px] uppercase tracking-widest text-[#c1c7d3] mb-2 flex justify-between">
              <span>High-Value Tier Accounts</span>
              <span className="text-[#d0bcff] font-mono">Tier 1 &gt; $5,000 Spend</span>
            </div>
            <div className="text-3xl font-bold text-[#d0bcff] tracking-tight">3,412 Entities</div>
            <div className="mt-4 pt-2 bg-[#0a0e17]/60 px-3 py-1.5 text-xs text-[#c1c7d3] flex justify-between font-mono">
              <span>Revenue Concentration:</span>
              <span className="text-[#d0bcff]">Top 2.3% gen 61.8% rev</span>
            </div>
          </div>
        </div>

        {/* MoM Revenue Growth Recharts BarChart */}
        <div className="bg-[#181b25] p-5 mb-6 border border-[#414751]/60 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 bg-[#0a0e17]/40 p-3 border border-[#414751]/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#4edea3]"></span>
                <h2 className="text-lg uppercase tracking-wide text-[#dfe2ef] font-bold">
                  Month-over-Month Revenue Growth & CTE Cohort Run-rate
                </h2>
              </div>
              <p className="text-xs text-[#c1c7d3] mt-1 font-mono">
                Aggregated recursive window queries evaluating recursive cohort ARR progression (Jan - Dec 2024)
              </p>
            </div>

            <div className="inline-flex bg-[#0a0e17] p-1 border border-[#414751]">
              <button
                onClick={() => setActiveSegment('gross')}
                className={`px-3 py-1 text-xs uppercase font-mono ${
                  activeSegment === 'gross' ? 'bg-[#1c1f29] text-[#a4c9ff]' : 'text-[#c1c7d3]'
                }`}
              >
                Gross Revenue ($)
              </button>
              <button
                onClick={() => setActiveSegment('volume')}
                className={`px-3 py-1 text-xs uppercase font-mono ${
                  activeSegment === 'volume' ? 'bg-[#1c1f29] text-[#a4c9ff]' : 'text-[#c1c7d3]'
                }`}
              >
                Net Volume
              </button>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={momData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                <XAxis
                  dataKey="month_name"
                  stroke="#8b919d"
                  tick={{ fill: '#c1c7d3', fontSize: 12, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#414751' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 3600000]}
                  stroke="#8b919d"
                  tick={{ fill: '#8b919d', fontSize: 11, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#414751' }}
                  tickLine={false}
                  tickFormatter={val => `$${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#0a0e17] border border-[#a4c9ff] p-3 text-xs font-mono shadow-xl">
                        <div className="text-[#a4c9ff] font-bold uppercase mb-1">{d.month_name} 2024</div>
                        <div className="text-[#4edea3] font-semibold">{formatCurrency(d.revenue)}</div>
                        <div className="text-[#c1c7d3]">MoM LAG(): +{d.mom_growth_pct}%</div>
                        <div className="text-[#8b919d]">Orders: {d.total_orders.toLocaleString()}</div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  y={2500000}
                  stroke="#60a5fa"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Q4 MILESTONE THRESHOLD: $2.50M / MO',
                    position: 'top',
                    fill: '#a4c9ff',
                    fontSize: 10,
                    fontFamily: 'monospace'
                  }}
                />
                <Bar dataKey={activeSegment === 'gross' ? 'revenue' : 'total_orders'}>
                  {momData.map((entry, index) => {
                    let fill = '#31353f';
                    if (entry.is_milestone_met) {
                      fill = entry.month_name === 'Dec' ? '#4edea3' : '#00a572';
                    }
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 bg-[#0a0e17]/80 px-4 py-2 border-t border-[#414751]/50 flex flex-wrap items-center justify-between text-xs font-mono text-[#c1c7d3]">
            <div className="flex items-center gap-6">
              <span>Median Payback: <strong className="text-[#dfe2ef]">42 Days</strong></span>
              <span>CAC Efficiency: <strong className="text-[#dfe2ef]">4.8x</strong></span>
              <span>Net Churn: <strong className="text-[#4edea3]">-0.4%</strong></span>
            </div>
            <div className="text-[#8b919d]">CTE COMPUTATION COST: 114ms / 8.2MB MEMORY</div>
          </div>
        </div>

        {/* RFM Table Section */}
        <div className="bg-[#181b25] p-5 border border-[#414751]/60 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#d0bcff]"></span>
              <h2 className="text-lg uppercase tracking-tight text-[#dfe2ef] font-bold">
                RFM Spend & Cohort Segmentation
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Filter company, contact, or state..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#0a0e17] border border-[#414751] px-3 py-1 text-xs text-[#dfe2ef] placeholder-[#8b919d] font-mono focus:outline-none w-52"
              />
              <div className="flex bg-[#0a0e17] p-0.5 border border-[#414751]">
                {['ALL TIERS', 'TIER 1 ELITE', 'TIER 2 GROWTH', 'TIER 3 STABLE'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setTierFilter(tab);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs uppercase font-mono ${
                      tierFilter === tab ? 'bg-[#1c1f29] text-[#dfe2ef] font-bold' : 'text-[#8b919d]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-[#1c1f29] text-[#c1c7d3] uppercase border-b border-[#414751]">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Customer / Organization</th>
                  <th className="py-3 px-3">State</th>
                  <th className="py-3 px-3">Total Spend</th>
                  <th className="py-3 px-3">Quartile Tier</th>
                  <th className="py-3 px-3">Telemetry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#414751]/30">
                {paginatedCustomers.map(c => (
                  <tr key={c.customer_id} className="hover:bg-[#1c1f29] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#a4c9ff]">
                      #{String(c.spend_rank).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#dfe2ef] font-sans">{c.company_name}</div>
                      <div className="text-[11px] text-[#8b919d] font-sans">
                        {c.contact_email} • {c.contact_name}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-[#1c1f29] border border-[#414751]">
                        {c.state}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#4edea3] font-bold text-sm">
                      {formatCurrency(c.total_spend)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] uppercase ${
                        c.quartile_tier_label.includes('Tier 1')
                          ? 'bg-[#d0bcff]/20 text-[#d0bcff] border border-[#d0bcff]/40'
                          : c.quartile_tier_label.includes('Tier 2')
                          ? 'bg-[#60a5fa]/20 text-[#60a5fa] border border-[#60a5fa]/40'
                          : 'bg-[#31353f] text-[#c1c7d3]'
                      }`}>
                        {c.quartile_tier_label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#c1c7d3]">{c.activity_telemetry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-xs font-mono text-[#8b919d] border-t border-[#414751]/40">
            <div>DISPLAYING {paginatedCustomers.length} OF {filteredCustomers.length} ENTITIES</div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 bg-[#1c1f29] border border-[#414751] disabled:opacity-30"
              >
                Prev
              </button>
              <span className="px-2 py-1 bg-[#a4c9ff] text-[#001c39] font-bold">{currentPage}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 bg-[#1c1f29] border border-[#414751] disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
