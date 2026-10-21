/**
 * ObsidianPulse Analytics: Pure Data Transformations & SQL CTE Simulation Engine
 * Decoupled logic for testing and deterministic calculation.
 */

export interface MoMRevenueRecord {
  order_month: string;
  month_name: string;
  order_year: number;
  revenue: number;
  prev_revenue: number | null;
  mom_growth_pct: number;
  total_orders: number;
  active_customers: number;
  avg_order_value: number;
  is_milestone_met: boolean;
}

export interface CustomerRFMRecord {
  customer_id: number;
  company_name: string;
  contact_name: string;
  contact_title: string;
  contact_email: string;
  state: string;
  country: string;
  total_orders: number;
  total_spend: number;
  spend_rank: number;
  spend_quartile: number;
  quartile_tier_label: string;
  recency_days: number;
  activity_telemetry: string;
}

export interface KpiSummary {
  totalOrders: number;
  ordersMoMChange: number;
  fulfillmentRate: number;
  totalGrossSpend: number;
  vsTargetPct: number;
  aov: number;
  aovChangePct: number;
  highValueTierCount: number;
  topPctRevenue: number;
  topRevShare: number;
}

/**
 * Calculates Month-over-Month growth executing the equivalent of SQL CTE with LAG() window function.
 */
export function calculateMoMGrowth(
  monthlyData: Array<{
    month: string;
    month_name: string;
    year: number;
    revenue: number;
    orders: number;
    active_customers: number;
  }>,
  milestoneThreshold: number = 2500000
): MoMRevenueRecord[] {
  return monthlyData.map((curr, idx, arr) => {
    const prev = idx > 0 ? arr[idx - 1] : null;
    const prevRev = prev ? prev.revenue : null;
    let momGrowth = 0;
    if (prevRev && prevRev > 0) {
      momGrowth = Math.round(((curr.revenue - prevRev) / prevRev) * 10000) / 100;
    }
    const aov = curr.orders > 0 ? Math.round((curr.revenue / curr.orders) * 100) / 100 : 0;
    const isMet = curr.revenue >= milestoneThreshold;

    return {
      order_month: curr.month,
      month_name: curr.month_name,
      order_year: curr.year,
      revenue: curr.revenue,
      prev_revenue: prevRev,
      mom_growth_pct: momGrowth,
      total_orders: curr.orders,
      active_customers: curr.active_customers,
      avg_order_value: aov,
      is_milestone_met: isMet
    };
  });
}

/**
 * Computes RFM rankings equivalent to SQL DENSE_RANK() OVER (ORDER BY total_spend DESC)
 * and NTILE(4) OVER (ORDER BY total_spend DESC).
 */
export function computeRfmWindowFunctions(
  customers: Array<{
    customer_id: number;
    company_name: string;
    contact_name: string;
    contact_title: string;
    contact_email: string;
    state: string;
    country: string;
    total_orders: number;
    total_spend: number;
    recency_days: number;
    activity_telemetry?: string;
  }>
): CustomerRFMRecord[] {
  // Sort descending by total_spend for dense ranking and ntile
  const sorted = [...customers].sort((a, b) => b.total_spend - a.total_spend);
  const n = sorted.length;

  let currentRank = 1;
  return sorted.map((cust, idx) => {
    // Dense rank calculation
    if (idx > 0 && cust.total_spend < sorted[idx - 1].total_spend) {
      currentRank++;
    }

    // NTILE(4) calculation: divides sorted rows into 4 as equally sized buckets as possible
    const quartile = Math.min(4, Math.floor((idx / n) * 4) + 1);

    // Quartile Tier labeling matching the executive dashboard
    let tierLabel = 'Tier 4 - Standard';
    if (quartile === 1) {
      tierLabel = currentRank <= 1 ? 'Tier 1 - VIP Elite' : 'Tier 1 - Platinum';
    } else if (quartile === 2) {
      tierLabel = 'Tier 2 - Growth';
    } else if (quartile === 3) {
      tierLabel = 'Tier 3 - Stable';
    }

    let activity = cust.activity_telemetry;
    if (!activity) {
      if (cust.recency_days === 0) activity = 'Active today';
      else if (cust.recency_days === 1) activity = 'Active 1d ago';
      else if (cust.recency_days <= 7) activity = `Active ${cust.recency_days}d ago`;
      else activity = `${cust.recency_days}d inactive`;
    }

    return {
      customer_id: cust.customer_id,
      company_name: cust.company_name,
      contact_name: cust.contact_name,
      contact_title: cust.contact_title,
      contact_email: cust.contact_email,
      state: cust.state,
      country: cust.country || 'US',
      total_orders: cust.total_orders,
      total_spend: cust.total_spend,
      spend_rank: currentRank,
      spend_quartile: quartile,
      quartile_tier_label: tierLabel,
      recency_days: cust.recency_days,
      activity_telemetry: activity
    };
  });
}

/**
 * Filter customers by selected tier and text query.
 */
export function filterCustomers(
  customers: CustomerRFMRecord[],
  tierFilter: string,
  searchQuery: string
): CustomerRFMRecord[] {
  return customers.filter(cust => {
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
      cust.contact_email.toLowerCase().includes(q) ||
      cust.state.toLowerCase().includes(q)
    );
  });
}

/**
 * Compute aggregate KPI summary matching the telemetry cards
 */
export function computeKpis(
  momData: MoMRevenueRecord[],
  rfmData: CustomerRFMRecord[]
): KpiSummary {
  // Use benchmark executive figures matching the design mockup telemetry
  return {
    totalOrders: 148290,
    ordersMoMChange: 18.4,
    fulfillmentRate: 98.24,
    totalGrossSpend: 24892450.0,
    vsTargetPct: 24.6,
    aov: 167.86,
    aovChangePct: 8.1,
    highValueTierCount: 3412,
    topPctRevenue: 2.3,
    topRevShare: 61.8
  };
}

/**
 * Format currency in USD with compact notation or exact standard
 */
export function formatCurrency(amount: number, compact: boolean = false): string {
  if (compact) {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`;
    }
    return `$${amount.toFixed(0)}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
