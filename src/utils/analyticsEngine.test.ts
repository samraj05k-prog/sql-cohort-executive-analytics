import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMoMGrowth,
  computeRfmWindowFunctions,
  filterCustomers,
  formatCurrency,
  computeKpis
} from './analyticsEngine';

test('calculateMoMGrowth correctly computes LAG() and MoM percentage', () => {
  const sample = [
    { month: '2024-01', month_name: 'Jan', year: 2024, revenue: 1000000, orders: 5000, active_customers: 800 },
    { month: '2024-02', month_name: 'Feb', year: 2024, revenue: 1200000, orders: 6000, active_customers: 900 },
    { month: '2024-03', month_name: 'Mar', year: 2024, revenue: 2600000, orders: 12000, active_customers: 1500 }
  ];

  const result = calculateMoMGrowth(sample, 2500000);

  assert.equal(result.length, 3);
  assert.equal(result[0].prev_revenue, null);
  assert.equal(result[0].mom_growth_pct, 0);
  assert.equal(result[0].is_milestone_met, false);

  // Month 2: (1200000 - 1000000) / 1000000 * 100 = 20%
  assert.equal(result[1].prev_revenue, 1000000);
  assert.equal(result[1].mom_growth_pct, 20);
  assert.equal(result[1].is_milestone_met, false);

  // Month 3: (2600000 - 1200000) / 1200000 * 100 = 116.67%
  assert.equal(result[2].prev_revenue, 1200000);
  assert.equal(result[2].mom_growth_pct, 116.67);
  assert.equal(result[2].is_milestone_met, true);
});

test('computeRfmWindowFunctions applies DENSE_RANK() and NTILE(4) quartiles', () => {
  const sampleCustomers = [
    { customer_id: 1, company_name: 'Alpha Corp', contact_name: 'Alice', contact_title: 'CEO', contact_email: 'a@alpha.com', state: 'CA', country: 'US', total_orders: 100, total_spend: 500000, recency_days: 1 },
    { customer_id: 2, company_name: 'Beta LLC', contact_name: 'Bob', contact_title: 'CTO', contact_email: 'b@beta.com', state: 'NY', country: 'US', total_orders: 80, total_spend: 300000, recency_days: 2 },
    { customer_id: 3, company_name: 'Gamma Inc', contact_name: 'Charlie', contact_title: 'CFO', contact_email: 'c@gamma.com', state: 'TX', country: 'US', total_orders: 60, total_spend: 200000, recency_days: 3 },
    { customer_id: 4, company_name: 'Delta Co', contact_name: 'David', contact_title: 'COO', contact_email: 'd@delta.com', state: 'WA', country: 'US', total_orders: 40, total_spend: 100000, recency_days: 5 }
  ];

  const result = computeRfmWindowFunctions(sampleCustomers);

  assert.equal(result.length, 4);
  assert.equal(result[0].customer_id, 1);
  assert.equal(result[0].spend_rank, 1);
  assert.equal(result[0].spend_quartile, 1);
  assert.equal(result[0].quartile_tier_label, 'Tier 1 - VIP Elite');

  assert.equal(result[1].customer_id, 2);
  assert.equal(result[1].spend_rank, 2);
  assert.equal(result[1].spend_quartile, 2);
  assert.equal(result[1].quartile_tier_label, 'Tier 2 - Growth');

  assert.equal(result[3].spend_quartile, 4);
  assert.equal(result[3].quartile_tier_label, 'Tier 4 - Standard');
});

test('filterCustomers filters accurately by search text and quartile tier', () => {
  const ranked = computeRfmWindowFunctions([
    { customer_id: 1, company_name: 'Novus Vantage Global', contact_name: 'Sarah Lin', contact_title: 'VP', contact_email: 's@novus.com', state: 'CA', country: 'US', total_orders: 100, total_spend: 400000, recency_days: 1 },
    { customer_id: 2, company_name: 'Apex Synthetics', contact_name: 'Marcus Vance', contact_title: 'Dir', contact_email: 'm@apex.co', state: 'NY', country: 'US', total_orders: 50, total_spend: 200000, recency_days: 4 }
  ]);

  const searchFiltered = filterCustomers(ranked, 'ALL TIERS', 'vantage');
  assert.equal(searchFiltered.length, 1);
  assert.equal(searchFiltered[0].company_name, 'Novus Vantage Global');

  const stateFiltered = filterCustomers(ranked, 'ALL TIERS', 'NY');
  assert.equal(stateFiltered.length, 1);
  assert.equal(stateFiltered[0].state, 'NY');

  const tierFiltered = filterCustomers(ranked, 'TIER 1 ELITE', '');
  assert.equal(tierFiltered.length, 1);
  assert.equal(tierFiltered[0].company_name, 'Novus Vantage Global');
});

test('formatCurrency formats compact and standard values cleanly', () => {
  assert.equal(formatCurrency(1400000, true), '$1.4M');
  assert.equal(formatCurrency(24892450, false), '$24,892,450.00');
});
