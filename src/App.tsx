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
import {
  calculateMoMGrowth,
  computeRfmWindowFunctions,
  filterCustomers,
  formatCurrency,
  computeKpis,
  MoMRevenueRecord,
  CustomerRFMRecord
} from './utils/analyticsEngine';

// Seed raw monthly series for 2024
const INITIAL_MONTHLY_RAW = [
  { month: '2024-01', month_name: 'Jan', year: 2024, revenue: 1400000, orders: 8920, active_customers: 1150 },
  { month: '2024-02', month_name: 'Feb', year: 2024, revenue: 1600000, orders: 9840, active_customers: 1240 },
  { month: '2024-03', month_name: 'Mar', year: 2024, revenue: 1700000, orders: 10450, active_customers: 1310 },
  { month: '2024-04', month_name: 'Apr', year: 2024, revenue: 1900000, orders: 11320, active_customers: 1420 },
  { month: '2024-05', month_name: 'May', year: 2024, revenue: 2100000, orders: 12480, active_customers: 1560 },
  { month: '2024-06', month_name: 'Jun', year: 2024, revenue: 2000000, orders: 11950, active_customers: 1490 },
  { month: '2024-07', month_name: 'Jul', year: 2024, revenue: 2300000, orders: 13610, active_customers: 1680 },
  { month: '2024-08', month_name: 'Aug', year: 2024, revenue: 2400000, orders: 14220, active_customers: 1750 },
  { month: '2024-09', month_name: 'Sep', year: 2024, revenue: 2600000, orders: 15300, active_customers: 1890 },
  { month: '2024-10', month_name: 'Oct', year: 2024, revenue: 2700000, orders: 15980, active_customers: 1940 },
  { month: '2024-11', month_name: 'Nov', year: 2024, revenue: 2900000, orders: 16920, active_customers: 2050 },
  { month: '2024-12', month_name: 'Dec', year: 2024, revenue: 3200000, orders: 18200, active_customers: 2210 }
];

// Seed customer accounts matching mockup
const INITIAL_CUSTOMERS_RAW = [
  { customer_id: 1, company_name: 'Novus Vantage Global', contact_name: 'Sarah Lin', contact_title: 'VP Ops', contact_email: 'contact@novus-vantage.com', state: 'CA', country: 'US', total_orders: 842, total_spend: 482910.00, recency_days: 0, activity_telemetry: 'Active 2h ago' },
  { customer_id: 2, company_name: 'Apex Prime Synthetics', contact_name: 'Marcus Vance', contact_title: 'Dir. Supply', contact_email: 'procure@apexprime.co', state: 'NY', country: 'US', total_orders: 715, total_spend: 394120.00, recency_days: 0, activity_telemetry: 'Active 4h ago' },
  { customer_id: 3, company_name: 'Helios Cloud Systems', contact_name: 'Elena Rostova', contact_title: 'CRO', contact_email: 'finances@helios-cloud.io', state: 'TX', country: 'US', total_orders: 684, total_spend: 341890.00, recency_days: 1, activity_telemetry: 'Active 1d ago' },
  { customer_id: 4, company_name: 'Krypton Logistics Intl', contact_name: 'David Chen', contact_title: 'Head of Procurement', contact_email: 'api-team@krypton-intl.com', state: 'WA', country: 'US', total_orders: 512, total_spend: 279540.00, recency_days: 3, activity_telemetry: 'Active 3d ago' },
  { customer_id: 5, company_name: 'OmniData Foundry', contact_name: 'Lisa Sterling', contact_title: 'VP Analytics', contact_email: 'accounts@omnidata.io', state: 'IL', country: 'US', total_orders: 430, total_spend: 218600.00, recency_days: 0, activity_telemetry: 'Active 6h ago' },
  { customer_id: 6, company_name: 'Stratosphere Corp', contact_name: 'Robert Thorne', contact_title: 'COO', contact_email: 'enterprise@stratosphere.tech', state: 'MA', country: 'US', total_orders: 394, total_spend: 192400.00, recency_days: 5, activity_telemetry: 'Active 5d ago' },
  { customer_id: 7, company_name: 'Vortex Energy Solutions', contact_name: 'Claire Dupont', contact_title: 'Supply Director', contact_email: 'c.dupont@vortex-energy.com', state: 'CO', country: 'US', total_orders: 340, total_spend: 165320.00, recency_days: 2, activity_telemetry: 'Active 2d ago' },
  { customer_id: 8, company_name: 'Aegis Biotech Laboratories', contact_name: 'Dr. Julian Walsh', contact_title: 'Principal Investigator', contact_email: 'lab-supplies@aegis-bio.org', state: 'NC', country: 'US', total_orders: 288, total_spend: 142100.00, recency_days: 4, activity_telemetry: 'Active 4d ago' },
  { customer_id: 9, company_name: 'Zenith Quantum Corp', contact_name: 'Maya Patel', contact_title: 'Technical Director', contact_email: 'procurement@zenith-quantum.io', state: 'WA', country: 'US', total_orders: 245, total_spend: 118450.00, recency_days: 7, activity_telemetry: 'Active 7d ago' },
  { customer_id: 10, company_name: 'Pulsefire Robotics', contact_name: 'Kenji Sato', contact_title: 'Operations Lead', contact_email: 'orders@pulsefire-robotics.jp', state: 'CA', country: 'US', total_orders: 190, total_spend: 89200.00, recency_days: 12, activity_telemetry: '12d inactive' }
];

export default function App() {
  const [activeNav, setActiveNav] = useState('revenue-cohorts');
  const [activeSegment, setActiveSegment] = useState<'gross' | 'volume' | 'runrate'>('gross');
  const [tierFilter, setTierFilter] = useState('ALL TIERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRFMRecord | null>(null);
  const [showSqlLab, setShowSqlLab] = useState(false);
  const [selectedSqlTab, setSelectedSqlTab] = useState<'mom' | 'rfm'>('mom');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemsPerPage = 6;

  // Local data holders populated from FastAPI backend or high-precision deterministic CTE simulation
  const [momData, setMomData] = useState<MoMRevenueRecord[]>(() =>
    calculateMoMGrowth(INITIAL_MONTHLY_RAW, 2500000)
  );
  const [rfmData, setRfmData] = useState<CustomerRFMRecord[]>(() =>
    computeRfmWindowFunctions(INITIAL_CUSTOMERS_RAW)
  );

  // Attempt to fetch from FastAPI backend on mount or refresh
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // Check FastAPI backend health and endpoints
      const [resMom, resRfm, resHealth] = await Promise.all([
        fetch('http://localhost:8000/api/mom-revenue').catch(() => null),
        fetch('http://localhost:8000/api/customer-rfm').catch(() => null),
        fetch('http://localhost:8000/api/health').catch(() => null)
      ]);

      if (resMom && resMom.ok) {
        const jsonMom = await resMom.json();
        setMomData(jsonMom);
        setApiConnected(true);
      } else {
        // Fallback to deterministic CTE calculation
        setMomData(calculateMoMGrowth(INITIAL_MONTHLY_RAW, 2500000));
      }

      if (resRfm && resRfm.ok) {
        const jsonRfm = await resRfm.json();
        setRfmData(jsonRfm);
      } else {
        setRfmData(computeRfmWindowFunctions(INITIAL_CUSTOMERS_RAW));
      }

      if (resHealth && resHealth.ok) {
        const health = await resHealth.json();
        setApiConnected(health.database_connected || true);
      }
    } catch {
      // Retain simulated deterministic calculation
      setMomData(calculateMoMGrowth(INITIAL_MONTHLY_RAW, 2500000));
      setRfmData(computeRfmWindowFunctions(INITIAL_CUSTOMERS_RAW));
      setApiConnected(false);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute KPIs
  const kpis = useMemo(() => computeKpis(momData, rfmData), [momData, rfmData]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return filterCustomers(rfmData, tierFilter, searchQuery);
  }, [rfmData, tierFilter, searchQuery]);

  // Paginated customers
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));

  // CSV Export utility
  const handleExportCsv = () => {
    const headers = [
      'Rank',
      'Company Name',
      'Contact Name',
      'Email',
      'State',
      'Total Orders',
      'Total Spend ($)',
      'Quartile Tier',
      'Telemetry Status'
    ];
    const rows = filteredCustomers.map(c => [
      `#${String(c.spend_rank).padStart(2, '0')}`,
      `"${c.company_name}"`,
      `"${c.contact_name}"`,
      c.contact_email,
      c.state,
      c.total_orders,
      c.total_spend.toFixed(2),
      `"${c.quartile_tier_label}"`,
      `"${c.activity_telemetry}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `obsidian_rfm_cohorts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart data formatting based on segment switcher
  const chartData = useMemo(() => {
    return momData.map(m => {
      let metricValue = m.revenue;
      if (activeSegment === 'volume') metricValue = m.total_orders;
      if (activeSegment === 'runrate') metricValue = m.revenue * 12;

      return {
        ...m,
        metricValue,
        displayRevenue: `$${(m.revenue / 1000000).toFixed(1)}M`
      };
    });
  }, [momData, activeSegment]);

  return (
    <div className="min-h-screen bg-[#090D16] text-[#dfe2ef] flex flex-col font-sans selection:bg-[#60a5fa] selection:text-[#001c39]">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER BAR */}
      {/* ------------------------------------------------------------- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#181b25] border-b border-[#414751] h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#c1c7d3] hover:text-[#dfe2ef] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
          <div className="w-8 h-8 bg-[#1c1f29] border border-[#60a5fa]/40 flex items-center justify-center text-[#60a5fa] font-bold font-mono text-sm tracking-wider shadow-[0_0_8px_rgba(96,165,250,0.2)]">
            OP
          </div>
          <span className="font-['Space_Grotesk'] text-base sm:text-lg font-semibold tracking-tight uppercase text-[#dfe2ef]">
            ObsidianPulse Analytics
          </span>
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-[#1c1f29] border border-[#414751]">
            <span className="w-1.5 h-1.5 bg-[#4edea3] shadow-[0_0_6px_#4edea3]"></span>
            <span className="text-[11px] font-semibold text-[#c1c7d3] uppercase tracking-wider font-mono">
              PRODUCTION / US-EAST-1
            </span>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative flex items-center bg-[#090D16] border border-[#414751] px-3 py-1.5 focus-within:border-[#a4c9ff]">
            <span className="material-symbols-outlined text-[#8b919d] text-lg mr-2">search</span>
            <input
              type="text"
              placeholder="Search CTE queries, cohorts, or accounts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 p-0 text-xs text-[#dfe2ef] placeholder-[#8b919d] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#8b919d] hover:text-[#dfe2ef]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden lg:flex items-center gap-2 bg-[#090D16] border border-[#414751] px-3 py-1.5 text-xs text-[#dfe2ef] uppercase font-semibold">
            <span className="material-symbols-outlined text-[#8b919d] text-sm">calendar_today</span>
            <span>FY 2024 (YTD)</span>
            <span className="material-symbols-outlined text-[#8b919d] text-sm">arrow_drop_down</span>
          </div>

          <div
            className="relative cursor-pointer p-1 text-[#c1c7d3] hover:text-[#dfe2ef]"
            title="Telemetry alerts"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#ffb4ab]"></span>
          </div>

          <div className="h-6 w-px bg-[#414751] hidden sm:block"></div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#262a34] border border-[#414751] flex items-center justify-center text-xs font-bold text-[#a4c9ff]">
              CR
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-semibold uppercase text-[#dfe2ef] tracking-wider leading-none">
                Executive Access
              </span>
              <span className="text-[11px] text-[#a4c9ff] tracking-tight mt-0.5 font-medium">
                Chief Revenue Officer
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* SIDEBAR NAVIGATION */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed left-0 top-14 bottom-8 w-64 bg-[#181b25] border-r border-[#414751] z-40 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="pt-4 pb-6">
          <div className="px-4 pb-2 text-[#8b919d] text-[11px] font-semibold uppercase tracking-widest">
            Telemetry Suites
          </div>
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => {
                setActiveNav('revenue-cohorts');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center px-4 py-2.5 text-sm transition-colors text-left ${
                activeNav === 'revenue-cohorts'
                  ? 'bg-[#1c1f29] text-[#dfe2ef] border-l-2 border-[#a4c9ff] font-semibold'
                  : 'text-[#c1c7d3] hover:bg-[#1c1f29] hover:text-[#dfe2ef]'
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-lg text-[#60a5fa]">trending_up</span>
              Revenue & Cohorts
            </button>

            <button
              onClick={() => {
                setActiveNav('rfm-segmentation');
                setMobileMenuOpen(false);
                const el = document.getElementById('rfm-table-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex items-center px-4 py-2.5 text-sm transition-colors text-left ${
                activeNav === 'rfm-segmentation'
                  ? 'bg-[#1c1f29] text-[#dfe2ef] border-l-2 border-[#a4c9ff] font-semibold'
                  : 'text-[#c1c7d3] hover:bg-[#1c1f29] hover:text-[#dfe2ef]'
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-lg text-[#d0bcff]">grid_view</span>
              RFM Segmentation
            </button>

            <button
              onClick={() => {
                setActiveNav('sql-cte-query-lab');
                setShowSqlLab(true);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center px-4 py-2.5 text-sm transition-colors text-left ${
                activeNav === 'sql-cte-query-lab' || showSqlLab
                  ? 'bg-[#1c1f29] text-[#dfe2ef] border-l-2 border-[#a4c9ff] font-semibold'
                  : 'text-[#c1c7d3] hover:bg-[#1c1f29] hover:text-[#dfe2ef]'
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-lg text-[#4edea3]">terminal</span>
              SQL CTE Query Lab
              <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5 bg-[#4edea3]/20 text-[#4edea3] font-mono">
                LIVE
              </span>
            </button>

            <button
              onClick={() => {
                setActiveNav('retention-matrix');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center px-4 py-2.5 text-sm transition-colors text-left ${
                activeNav === 'retention-matrix'
                  ? 'bg-[#1c1f29] text-[#dfe2ef] border-l-2 border-[#a4c9ff] font-semibold'
                  : 'text-[#c1c7d3] hover:bg-[#1c1f29] hover:text-[#dfe2ef]'
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-lg text-[#8b919d]">table_chart</span>
              Retention Matrix
            </button>

            <button
              onClick={() => {
                setActiveNav('settings-db-config');
                setShowSqlLab(true);
                setSelectedSqlTab('rfm');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center px-4 py-2.5 text-sm transition-colors text-left ${
                activeNav === 'settings-db-config'
                  ? 'bg-[#1c1f29] text-[#dfe2ef] border-l-2 border-[#a4c9ff] font-semibold'
                  : 'text-[#c1c7d3] hover:bg-[#1c1f29] hover:text-[#dfe2ef]'
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-lg text-[#8b919d]">settings_suggest</span>
              Settings & DB Config
            </button>
          </nav>
        </div>

        {/* Node Status panel */}
        <div className="p-4 bg-[#090D16] border-t border-[#414751]">
          <div className="flex items-center justify-between text-[#8b919d] text-[11px] font-semibold uppercase tracking-wider mb-1 font-mono">
            <span>Node Status</span>
            <span className="text-[#4edea3] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#4edea3] shadow-[0_0_6px_#4edea3]"></span>
              {apiConnected ? 'FASTAPI LIVE' : 'SYNCED (MOCK CTE)'}
            </span>
          </div>
          <div className="w-full bg-[#31353f] h-1 overflow-hidden">
            <div className="bg-[#4edea3] h-1 w-full shadow-[0_0_8px_#4edea3]"></div>
          </div>
          <div className="mt-2 text-[10px] text-[#8b919d] font-mono flex justify-between">
            <span>DB: enterprise_retail_db</span>
            <span>PORT: 3306</span>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:pl-64 pl-0 flex flex-col min-h-screen">
        <main className="w-full pt-16 pb-12 px-6 bg-[#090D16] flex-1">
          {/* SECTION HEADER: EXECUTIVE TELEMETRY COMMAND */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#60a5fa] font-mono">
                  MISSION CRITICAL // BI PIPELINE
                </span>
                <span className="w-1.5 h-1.5 bg-[#414751]"></span>
                <div className="flex items-center gap-2 bg-[#181b25] px-2.5 py-1 border border-[#414751]/50 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 bg-[#4edea3] shadow-[0_0_8px_#4edea3]"></span>
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4edea3] font-mono">
                    Database Connected
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-4 flex-wrap">
                <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#dfe2ef] tracking-tight uppercase">
                  Executive Retail Analytics
                </h1>
                <div className="flex items-center gap-1.5 text-[#c1c7d3] text-xs font-mono">
                  <span className="material-symbols-outlined text-base text-[#a4c9ff]">dns</span>
                  <span>PostgreSQL 16.2 / MariaDB CTE Engine (v4.8.1-live)</span>
                </div>
              </div>
            </div>

            {/* Telemetry Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={fetchData}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1f29] hover:bg-[#262a34] transition-colors text-[#dfe2ef] text-xs uppercase tracking-wider font-semibold border border-[#414751] shadow-sm disabled:opacity-50"
              >
                <span
                  className={`material-symbols-outlined text-sm text-[#a4c9ff] transition-transform duration-500 ${
                    isRefreshing ? 'rotate-180 animate-spin' : ''
                  }`}
                >
                  sync
                </span>
                <span>{isRefreshing ? 'Re-calculating...' : 'Refresh CTE Cache'}</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1f29] hover:bg-[#262a34] transition-colors text-[#dfe2ef] text-xs uppercase tracking-wider font-semibold border border-[#414751] shadow-sm"
              >
                <span className="material-symbols-outlined text-sm text-[#c1c7d3]">file_download</span>
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setShowSqlLab(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1f29] hover:bg-[#262a34] transition-colors text-[#60a5fa] text-xs uppercase tracking-wider font-semibold border border-[#60a5fa]/40 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm text-[#60a5fa]">code</span>
                <span>View SQL Queries</span>
              </button>
            </div>
          </div>

          {/* KPI TELEMETRY STRIP (BRUTALIST CARDS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Tile 1: Total Normalized Orders */}
            <div className="bg-[#181b25] p-5 relative overflow-hidden border border-[#414751]/60 shadow-lg flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#a4c9ff]"></div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#c1c7d3]">
                    Total Normalized Orders
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#4edea3]/10 text-[#4edea3] text-[11px] font-semibold tracking-widest uppercase font-mono">
                    <span className="material-symbols-outlined text-xs">arrow_upward</span>
                    +{kpis.ordersMoMChange}% MoM
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="font-['Space_Grotesk'] text-3xl text-[#dfe2ef] tracking-tight font-bold">
                    {kpis.totalOrders.toLocaleString()}
                  </div>
                  {/* Sparkline representation */}
                  <div className="w-24 h-8 flex items-end gap-[3px]">
                    <div className="flex-1 bg-[#31353f] h-2"></div>
                    <div className="flex-1 bg-[#31353f] h-3"></div>
                    <div className="flex-1 bg-[#31353f] h-4"></div>
                    <div className="flex-1 bg-[#60a5fa]/40 h-4"></div>
                    <div className="flex-1 bg-[#60a5fa]/60 h-5"></div>
                    <div className="flex-1 bg-[#60a5fa]/70 h-6"></div>
                    <div className="flex-1 bg-[#a4c9ff] h-7 shadow-[0_0_6px_#a4c9ff]"></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-2.5 bg-[#0a0e17]/60 px-3 py-1.5 flex items-center justify-between border-t border-[#414751]/30">
                <span className="text-xs text-[#c1c7d3]">Fulfillment Rate:</span>
                <span className="text-xs text-[#4edea3] font-mono font-semibold">
                  {kpis.fulfillmentRate}% SLA Compliant
                </span>
              </div>
            </div>

            {/* Tile 2: Gross Spend ($) */}
            <div className="bg-[#181b25] p-5 relative overflow-hidden border border-[#414751]/60 shadow-lg flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#4edea3]"></div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#c1c7d3]">
                    Total Gross Spend (YTD)
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#4edea3]/15 text-[#4edea3] text-[11px] font-semibold tracking-widest uppercase font-mono">
                    <span className="w-1.5 h-1.5 bg-[#4edea3] shadow-[0_0_6px_#4edea3]"></span>
                    +{kpis.vsTargetPct}% vs Q3 Target
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="font-['Space_Grotesk'] text-3xl text-[#4edea3] tracking-tight font-bold drop-shadow-[0_0_12px_rgba(78,222,163,0.25)]">
                    {formatCurrency(kpis.totalGrossSpend)}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-2.5 bg-[#0a0e17]/60 px-3 py-1.5 flex items-center justify-between border-t border-[#414751]/30">
                <span className="text-xs text-[#c1c7d3]">Average Order Value (AOV):</span>
                <span className="text-xs text-[#dfe2ef] font-mono font-semibold">
                  ${kpis.aov.toFixed(2)} (+{kpis.aovChangePct}%)
                </span>
              </div>
            </div>

            {/* Tile 3: High-Value Tier Count */}
            <div className="bg-[#181b25] p-5 relative overflow-hidden border border-[#414751]/60 shadow-lg flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#d0bcff]"></div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#c1c7d3]">
                    High-Value Tier Accounts
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#d0bcff]/15 text-[#d0bcff] text-[11px] font-semibold tracking-widest uppercase font-mono">
                    <span className="w-1.5 h-1.5 bg-[#d0bcff] shadow-[0_0_6px_#d0bcff]"></span>
                    Tier 1 &gt; $5,000 Spend
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="font-['Space_Grotesk'] text-3xl text-[#d0bcff] tracking-tight font-bold">
                    {kpis.highValueTierCount.toLocaleString()}{' '}
                    <span className="text-[#c1c7d3] text-xs uppercase tracking-wider font-normal">
                      Entities
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-2.5 bg-[#0a0e17]/60 px-3 py-1.5 flex items-center justify-between border-t border-[#414751]/30">
                <span className="text-xs text-[#c1c7d3]">Revenue Concentration:</span>
                <span className="text-xs text-[#d0bcff] font-mono font-semibold">
                  Top {kpis.topPctRevenue}% gen {kpis.topRevShare}% rev
                </span>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* MONTH-OVER-MONTH REVENUE GROWTH & CTE COHORT RUN-RATE VISUALIZATION */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#181b25] p-5 mb-6 border border-[#414751]/60 shadow-lg flex flex-col">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 mb-4 bg-[#0a0e17]/40 p-3 border border-[#414751]/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#4edea3] shadow-[0_0_6px_#4edea3]"></span>
                  <h2 className="font-['Space_Grotesk'] text-lg uppercase tracking-wide text-[#dfe2ef] font-bold">
                    Month-over-Month Revenue Growth & CTE Cohort Run-rate
                  </h2>
                </div>
                <p className="text-xs text-[#c1c7d3] mt-1 font-mono">
                  Aggregated recursive window queries evaluating recursive cohort ARR progression (Jan - Dec 2024)
                </p>
              </div>

              {/* Segment Switcher */}
              <div className="inline-flex bg-[#0a0e17] p-1 border border-[#414751]/50 self-start lg:self-center">
                <button
                  onClick={() => setActiveSegment('gross')}
                  className={`px-3 py-1 text-xs uppercase tracking-wider font-semibold transition-colors ${
                    activeSegment === 'gross'
                      ? 'bg-[#1c1f29] text-[#a4c9ff] shadow-sm border border-[#a4c9ff]/40'
                      : 'text-[#c1c7d3] hover:text-[#dfe2ef]'
                  }`}
                >
                  Gross Revenue ($)
                </button>
                <button
                  onClick={() => setActiveSegment('volume')}
                  className={`px-3 py-1 text-xs uppercase tracking-wider font-semibold transition-colors ${
                    activeSegment === 'volume'
                      ? 'bg-[#1c1f29] text-[#a4c9ff] shadow-sm border border-[#a4c9ff]/40'
                      : 'text-[#c1c7d3] hover:text-[#dfe2ef]'
                  }`}
                >
                  Net Volume
                </button>
                <button
                  onClick={() => setActiveSegment('runrate')}
                  className={`px-3 py-1 text-xs uppercase tracking-wider font-semibold transition-colors ${
                    activeSegment === 'runrate'
                      ? 'bg-[#1c1f29] text-[#a4c9ff] shadow-sm border border-[#a4c9ff]/40'
                      : 'text-[#c1c7d3] hover:text-[#dfe2ef]'
                  }`}
                >
                  Cohort Run-Rate
                </button>
              </div>
            </div>

            {/* Recharts BarChart */}
            <div className="relative w-full h-80 pt-2 px-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 35, right: 20, left: 10, bottom: 5 }}>
                  <XAxis
                    dataKey="month_name"
                    stroke="#8b919d"
                    tick={{ fill: '#c1c7d3', fontSize: 12, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#414751' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    domain={[0, 3600000]}
                    ticks={[0, 1000000, 2000000, 3000000]}
                    stroke="#8b919d"
                    tick={{ fill: '#8b919d', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#414751' }}
                    tickLine={false}
                    tickFormatter={val => (activeSegment === 'volume' ? `${val}` : `$${(val / 1000000).toFixed(1)}M`)}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload as MoMRevenueRecord;
                      return (
                        <div className="bg-[#0a0e17] border border-[#a4c9ff]/60 p-3 shadow-xl font-mono text-xs">
                          <div className="text-[#a4c9ff] font-bold uppercase mb-1.5 border-b border-[#414751] pb-1">
                            {d.month_name} 2024 Telemetry
                          </div>
                          <div className="space-y-1 text-[#dfe2ef]">
                            <div className="flex justify-between gap-4">
                              <span className="text-[#8b919d]">Monthly Revenue:</span>
                              <span className="font-semibold text-[#4edea3]">
                                {formatCurrency(d.revenue)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-[#8b919d]">MoM Growth (LAG):</span>
                              <span
                                className={`font-semibold ${
                                  d.mom_growth_pct >= 0 ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
                                }`}
                              >
                                {d.mom_growth_pct > 0 ? `+${d.mom_growth_pct}%` : `${d.mom_growth_pct}%`}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-[#8b919d]">Total Orders:</span>
                              <span>{d.total_orders.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-[#8b919d]">Average Order Value:</span>
                              <span>${d.avg_order_value.toFixed(2)}</span>
                            </div>
                            {d.is_milestone_met && (
                              <div className="mt-1 pt-1 text-[10px] text-[#4edea3] uppercase border-t border-[#414751] flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">verified</span>
                                Surpassed $2.50M Milestone
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }}
                  />
                  {activeSegment === 'gross' && (
                    <ReferenceLine
                      y={2500000}
                      stroke="#60a5fa"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Q4 MILESTONE THRESHOLD: $2.50M / MO',
                        position: 'top',
                        fill: '#a4c9ff',
                        fontSize: 10,
                        fontWeight: 'bold',
                        fontFamily: 'monospace'
                      }}
                    />
                  )}
                  <Bar dataKey="metricValue" radius={[0, 0, 0, 0]}>
                    {chartData.map((entry, index) => {
                      let fillColor = '#31353f';
                      if (entry.is_milestone_met) {
                        if (entry.month_name === 'Dec') {
                          fillColor = '#4edea3';
                        } else if (entry.month_name === 'Nov') {
                          fillColor = '#00a572';
                        } else {
                          fillColor = 'rgba(0, 165, 114, 0.7)';
                        }
                      }
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={fillColor}
                          className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cohort Telemetry Meta Footer */}
            <div className="mt-4 pt-3 bg-[#0a0e17]/80 px-4 py-2 border-t border-[#414751]/50 flex flex-wrap items-center justify-between gap-4 text-[#c1c7d3] text-xs uppercase tracking-wider font-mono">
              <div className="flex items-center gap-6 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-[#4edea3]">check_circle</span>
                  <span>
                    Median Payback Window: <strong className="text-[#dfe2ef]">42 Days</strong>
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-[#a4c9ff]">analytics</span>
                  <span>
                    Blended CAC Efficiency: <strong className="text-[#dfe2ef]">4.8x</strong>
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-[#4edea3]">trending_down</span>
                  <span>
                    Aggregate Net Churn: <strong className="text-[#4edea3]">-0.4%</strong> (Expansion Outweighs)
                  </span>
                </span>
              </div>
              <div className="text-[#8b919d]">CTE COMPUTATION COST: 114ms / 8.2MB MEMORY</div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* RFM SPEND & CUSTOMER VALUE SEGMENTATION TABLE */}
          {/* ------------------------------------------------------------- */}
          <div id="rfm-table-section" className="bg-[#181b25] p-5 border border-[#414751]/60 shadow-lg">
            {/* Table Controls Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#d0bcff] shadow-[0_0_6px_#d0bcff]"></span>
                  <h2 className="font-['Space_Grotesk'] text-lg uppercase tracking-tight text-[#dfe2ef] font-bold">
                    RFM Spend & Cohort Segmentation
                  </h2>
                </div>
                <span className="px-2.5 py-1 bg-[#1c1f29] border border-[#414751]/40 text-[11px] uppercase tracking-wider text-[#c1c7d3] font-mono">
                  Top Tier Accounts (Ranked via DENSE_RANK & NTILE)
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Search filter input */}
                <div className="relative flex items-center bg-[#0a0e17] px-3 py-1 border border-[#414751] focus-within:border-[#a4c9ff]">
                  <span className="material-symbols-outlined text-[#8b919d] text-sm mr-2">filter_list</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Filter company, contact, or state..."
                    className="bg-transparent border-0 p-0 text-xs text-[#dfe2ef] placeholder-[#8b919d] focus:outline-none w-48 lg:w-60 font-mono"
                  />
                </div>

                {/* Tier Segment Buttons */}
                <div className="flex items-center bg-[#0a0e17] p-1 border border-[#414751]/60">
                  {['ALL TIERS', 'TIER 1 ELITE', 'TIER 2 GROWTH', 'TIER 3 STABLE'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        setTierFilter(tab);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 text-xs uppercase tracking-wider transition-colors ${
                        tierFilter === tab
                          ? 'bg-[#1c1f29] text-[#dfe2ef] font-semibold border border-[#414751]'
                          : 'text-[#c1c7d3] hover:text-[#dfe2ef]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-[#1c1f29] text-[#c1c7d3] text-[11px] uppercase tracking-wider border-b border-[#414751]">
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Customer / Organization</th>
                    <th className="py-3 px-3">Region</th>
                    <th className="py-3 px-3">Order Frequency</th>
                    <th className="py-3 px-3">Total Gross Spend</th>
                    <th className="py-3 px-3">Quartile Tier</th>
                    <th className="py-3 px-3">Activity / Telemetry</th>
                    <th className="py-3 px-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#414751]/30">
                  {paginatedCustomers.map((c, i) => {
                    const initials = c.company_name
                      .split(' ')
                      .map(w => w[0])
                      .slice(0, 2)
                      .join('');
                    const maxOrders = 842;
                    const orderPct = Math.min(100, Math.round((c.total_orders / maxOrders) * 100));

                    // Quartile badge color coding
                    let badgeColor = 'bg-[#31353f] text-[#c1c7d3]';
                    let dotColor = 'bg-[#8b919d]';
                    if (c.quartile_tier_label.includes('VIP Elite')) {
                      badgeColor = 'bg-[#d0bcff]/20 text-[#d0bcff] border border-[#d0bcff]/40 shadow-[0_0_8px_rgba(208,188,255,0.3)] font-bold';
                      dotColor = 'bg-[#d0bcff]';
                    } else if (c.quartile_tier_label.includes('Platinum')) {
                      badgeColor = 'bg-[#d0bcff]/15 text-[#d0bcff] border border-[#d0bcff]/30 font-semibold';
                      dotColor = 'bg-[#d0bcff]';
                    } else if (c.quartile_tier_label.includes('Growth')) {
                      badgeColor = 'bg-[#60a5fa]/15 text-[#60a5fa] border border-[#60a5fa]/30 font-semibold';
                      dotColor = 'bg-[#60a5fa]';
                    } else if (c.quartile_tier_label.includes('Stable')) {
                      badgeColor = 'bg-[#414751]/40 text-[#c1c7d3] border border-[#414751]';
                      dotColor = 'bg-[#8b919d]';
                    }

                    return (
                      <tr
                        key={c.customer_id}
                        className={`hover:bg-[#1c1f29] transition-colors group ${
                          i % 2 === 1 ? 'bg-[#0a0e17]/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#a4c9ff]/10 text-[#a4c9ff] font-bold border border-[#a4c9ff]/30">
                            #{String(c.spend_rank).padStart(2, '0')}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#31353f] border border-[#414751] flex items-center justify-center font-bold text-[#d0bcff] text-xs">
                              {initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-['Space_Grotesk'] text-sm uppercase tracking-tight text-[#dfe2ef] font-semibold group-hover:text-[#a4c9ff] transition-colors font-sans">
                                {c.company_name}
                              </span>
                              <span className="text-[#8b919d] text-[11px] font-sans">
                                {c.contact_email} • {c.contact_name} ({c.contact_title})
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-[#1c1f29] border border-[#414751] text-[11px] font-semibold text-[#dfe2ef]">
                            {c.state}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-[#dfe2ef] w-20">
                              {c.total_orders} orders
                            </span>
                            <div className="w-16 h-1.5 bg-[#31353f]">
                              <div
                                className="h-1.5 bg-[#60a5fa]"
                                style={{ width: `${orderPct}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[#4edea3] font-bold text-sm">
                            {formatCurrency(c.total_spend)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase tracking-wider ${badgeColor}`}>
                            <span className={`w-1.5 h-1.5 ${dotColor}`}></span>
                            {c.quartile_tier_label}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 text-[#c1c7d3]">
                            <span
                              className={`w-1.5 h-1.5 ${
                                c.recency_days <= 1 ? 'bg-[#4edea3]' : 'bg-[#8b919d]'
                              }`}
                            ></span>
                            <span>{c.activity_telemetry}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            title="Inspect Window Record CTE"
                            className="p-1 bg-[#1c1f29] hover:bg-[#a4c9ff] hover:text-[#001c39] transition-colors text-[#c1c7d3] border border-[#414751]"
                          >
                            <span className="material-symbols-outlined text-sm">terminal</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedCustomers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#8b919d]">
                        No cohort records match query &quot;{searchQuery}&quot; in tier &quot;{tierFilter}&quot;.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination & Query Latency Strip */}
            <div className="mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0a0e17]/60 px-4 py-2 border-t border-[#414751]/50 text-xs font-mono">
              <div className="text-[#8b919d] uppercase tracking-wider">
                DISPLAYING {paginatedCustomers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} OF {filteredCustomers.length} MATCHING COHORT ENTITIES
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 bg-[#1c1f29] hover:bg-[#262a34] transition-colors text-[#c1c7d3] disabled:opacity-30 border border-[#414751]"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                        currentPage === pNum
                          ? 'bg-[#a4c9ff] text-[#001c39] border border-[#a4c9ff]'
                          : 'bg-[#1c1f29] hover:bg-[#262a34] text-[#dfe2ef] border border-[#414751]'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                {totalPages > 3 && <span className="px-1 text-[#8b919d]">...</span>}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 bg-[#1c1f29] hover:bg-[#262a34] transition-colors text-[#dfe2ef] disabled:opacity-30 border border-[#414751]"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* ------------------------------------------------------------- */}
        {/* FOOTER STRIP */}
        {/* ------------------------------------------------------------- */}
        <footer className="fixed bottom-0 lg:left-64 left-0 right-0 h-8 z-40 bg-[#181b25] border-t border-[#414751] px-4 sm:px-6 flex items-center justify-between text-[11px] font-mono text-[#8b919d]">
          <div className="flex items-center gap-3">
            <span className="inline-block w-1.5 h-1.5 bg-[#4edea3]"></span>
            <span className="truncate">
              PostgreSQL 16.2 Read Replica (Sync delay: 14ms) • MariaDB Analytics Engine active
            </span>
          </div>
          <div className="flex items-center gap-6 hidden md:flex">
            <span>TLS 1.3 CIPHER: AES-GCM-256</span>
            <span>SYSTEM LOAD: 0.18</span>
          </div>
        </footer>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SQL CTE QUERY LAB */}
      {/* ------------------------------------------------------------- */}
      {showSqlLab && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#181b25] border border-[#a4c9ff] max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#414751]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3]">terminal</span>
                <h3 className="font-['Space_Grotesk'] text-lg uppercase font-bold text-[#dfe2ef]">
                  SQL CTE & Window Function Query Lab
                </h3>
              </div>
              <button
                onClick={() => setShowSqlLab(false)}
                className="text-[#8b919d] hover:text-[#dfe2ef] p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Query Tabs */}
            <div className="flex gap-2 mb-4 border-b border-[#414751] pb-2">
              <button
                onClick={() => setSelectedSqlTab('mom')}
                className={`px-4 py-1.5 text-xs font-mono uppercase font-semibold transition-colors ${
                  selectedSqlTab === 'mom'
                    ? 'bg-[#1c1f29] text-[#a4c9ff] border-b-2 border-[#a4c9ff]'
                    : 'text-[#8b919d] hover:text-[#dfe2ef]'
                }`}
              >
                1. MoM Revenue CTE with LAG()
              </button>
              <button
                onClick={() => setSelectedSqlTab('rfm')}
                className={`px-4 py-1.5 text-xs font-mono uppercase font-semibold transition-colors ${
                  selectedSqlTab === 'rfm'
                    ? 'bg-[#1c1f29] text-[#d0bcff] border-b-2 border-[#d0bcff]'
                    : 'text-[#8b919d] hover:text-[#dfe2ef]'
                }`}
              >
                2. RFM Segmentation with DENSE_RANK() & NTILE(4)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#0a0e17] p-4 border border-[#414751] font-mono text-xs text-[#a4c9ff] leading-relaxed">
              {selectedSqlTab === 'mom' ? (
                <pre className="whitespace-pre-wrap">
{`-- ====================================================================
-- CTE 1: Month-over-Month Revenue Growth with LAG() Window Function
-- Executed against MariaDB 'enterprise_retail_db'
-- ====================================================================
WITH monthly_revenue AS (
    SELECT 
        DATE_FORMAT(order_date, '%Y-%m') AS order_month,
        DATE_FORMAT(order_date, '%b') AS month_name,
        MONTH(order_date) AS month_num,
        YEAR(order_date) AS order_year,
        SUM(total_amount) AS current_month_revenue,
        COUNT(DISTINCT order_id) AS total_orders,
        COUNT(DISTINCT customer_id) AS active_customers,
        AVG(total_amount) AS avg_order_value
    FROM orders
    WHERE order_status = 'COMPLETED'
      AND order_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(order_date, '%Y-%m'), DATE_FORMAT(order_date, '%b'), MONTH(order_date), YEAR(order_date)
),
mom_calculation AS (
    SELECT 
        order_month,
        month_name,
        month_num,
        order_year,
        current_month_revenue,
        total_orders,
        active_customers,
        avg_order_value,
        LAG(current_month_revenue, 1) OVER (ORDER BY order_month ASC) AS prev_month_revenue
    FROM monthly_revenue
)
SELECT 
    order_month,
    month_name,
    order_year,
    ROUND(current_month_revenue, 2) AS revenue,
    ROUND(prev_month_revenue, 2) AS prev_revenue,
    ROUND(
        CASE 
            WHEN prev_month_revenue IS NULL OR prev_month_revenue = 0 THEN 0.0
            ELSE ((current_month_revenue - prev_month_revenue) / prev_month_revenue) * 100.0 
        END, 
        2
    ) AS mom_growth_pct,
    total_orders,
    active_customers,
    ROUND(avg_order_value, 2) AS avg_order_value,
    CASE 
        WHEN current_month_revenue >= 2500000 THEN TRUE 
        ELSE FALSE 
    END AS is_milestone_met
FROM mom_calculation
ORDER BY order_month ASC;`}
                </pre>
              ) : (
                <pre className="whitespace-pre-wrap">
{`-- ====================================================================
-- CTE 2: Customer RFM Segmentation with DENSE_RANK() & NTILE(4)
-- Executed against MariaDB 'enterprise_retail_db'
-- ====================================================================
WITH customer_aggregates AS (
    SELECT 
        c.customer_id,
        c.company_name,
        c.contact_name,
        c.contact_title,
        c.contact_email,
        c.state,
        c.country,
        COUNT(o.order_id) AS total_orders,
        SUM(o.total_amount) AS total_spend,
        MAX(o.order_date) AS last_order_date,
        DATEDIFF(CURDATE(), MAX(o.order_date)) AS recency_days
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.order_status = 'COMPLETED'
    GROUP BY c.customer_id, c.company_name, c.contact_name, c.contact_title, c.contact_email, c.state, c.country
),
rfm_ranking AS (
    SELECT 
        customer_id,
        company_name,
        contact_name,
        contact_title,
        contact_email,
        state,
        country,
        total_orders,
        total_spend,
        last_order_date,
        recency_days,
        DENSE_RANK() OVER (ORDER BY total_spend DESC) AS spend_rank,
        NTILE(4) OVER (ORDER BY total_spend DESC) AS spend_quartile,
        NTILE(4) OVER (ORDER BY total_orders DESC) AS frequency_quartile,
        NTILE(4) OVER (ORDER BY recency_days ASC) AS recency_quartile
    FROM customer_aggregates
)
SELECT 
    customer_id,
    company_name,
    contact_name,
    contact_title,
    contact_email,
    state,
    country,
    total_orders,
    ROUND(total_spend, 2) AS total_spend,
    spend_rank,
    spend_quartile,
    CASE 
        WHEN spend_quartile = 1 AND spend_rank <= 3 THEN 'Tier 1 - VIP Elite'
        WHEN spend_quartile = 1 THEN 'Tier 1 - Platinum'
        WHEN spend_quartile = 2 THEN 'Tier 2 - Growth'
        WHEN spend_quartile = 3 THEN 'Tier 3 - Stable'
        ELSE 'Tier 4 - Standard'
    END AS quartile_tier_label,
    recency_days,
    CASE
        WHEN recency_days = 0 THEN 'Active today'
        WHEN recency_days = 1 THEN 'Active 1d ago'
        WHEN recency_days <= 7 THEN CONCAT('Active ', recency_days, 'd ago')
        ELSE CONCAT(recency_days, 'd inactive')
    END AS activity_telemetry
FROM rfm_ranking
ORDER BY spend_rank ASC;`}
                </pre>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-[#8b919d] font-mono">
              <span>Target: dev_user@localhost:3306/enterprise_retail_db</span>
              <button
                onClick={() => setShowSqlLab(false)}
                className="px-4 py-1.5 bg-[#a4c9ff] text-[#001c39] font-bold uppercase tracking-wider"
              >
                Close Query Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DRAWER: CUSTOMER RFM RECORD INSPECTION */}
      {/* ------------------------------------------------------------- */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-end backdrop-blur-xs">
          <div className="bg-[#181b25] border-l border-[#a4c9ff] w-full max-w-md p-6 h-full flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#414751]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#d0bcff]">badge</span>
                  <h3 className="font-['Space_Grotesk'] text-lg uppercase font-bold text-[#dfe2ef]">
                    Cohort Telemetry Record
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-[#8b919d] hover:text-[#dfe2ef]"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <div className="text-[#8b919d] uppercase text-[10px]">Entity Rank & Classification</div>
                  <div className="text-xl font-bold text-[#dfe2ef] font-['Space_Grotesk'] mt-1">
                    #{String(selectedCustomer.spend_rank).padStart(2, '0')} • {selectedCustomer.company_name}
                  </div>
                  <div className="text-[#c1c7d3] font-sans mt-0.5">
                    {selectedCustomer.contact_name} ({selectedCustomer.contact_title})
                  </div>
                  <div className="text-[#8b919d]">{selectedCustomer.contact_email}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#414751]">
                  <div className="bg-[#0a0e17] p-2.5 border border-[#414751]">
                    <div className="text-[#8b919d] text-[10px]">TOTAL SPEND (LTV)</div>
                    <div className="text-base font-bold text-[#4edea3] mt-0.5">
                      {formatCurrency(selectedCustomer.total_spend)}
                    </div>
                  </div>
                  <div className="bg-[#0a0e17] p-2.5 border border-[#414751]">
                    <div className="text-[#8b919d] text-[10px]">DENSE_RANK()</div>
                    <div className="text-base font-bold text-[#a4c9ff] mt-0.5">
                      Rank #{selectedCustomer.spend_rank}
                    </div>
                  </div>
                  <div className="bg-[#0a0e17] p-2.5 border border-[#414751]">
                    <div className="text-[#8b919d] text-[10px]">NTILE(4) QUARTILE</div>
                    <div className="text-base font-bold text-[#d0bcff] mt-0.5">
                      Bucket {selectedCustomer.spend_quartile} of 4
                    </div>
                  </div>
                  <div className="bg-[#0a0e17] p-2.5 border border-[#414751]">
                    <div className="text-[#8b919d] text-[10px]">TOTAL ORDERS</div>
                    <div className="text-base font-bold text-[#dfe2ef] mt-0.5">
                      {selectedCustomer.total_orders} orders
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0e17] p-3 border border-[#414751] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#8b919d]">State / Region:</span>
                    <span className="font-semibold text-[#dfe2ef]">{selectedCustomer.state}, US</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b919d]">Quartile Label:</span>
                    <span className="font-semibold text-[#d0bcff]">{selectedCustomer.quartile_tier_label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b919d]">Recency Window:</span>
                    <span className="font-semibold text-[#4edea3]">{selectedCustomer.activity_telemetry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b919d]">Recency Days:</span>
                    <span>{selectedCustomer.recency_days} days</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#414751] flex gap-3">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="flex-1 py-2 bg-[#a4c9ff] text-[#001c39] font-bold text-xs uppercase tracking-wider font-mono"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
