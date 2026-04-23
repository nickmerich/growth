export const meta = {
  name: 'analytics-insights',
  version: '1.0.0',
  description: 'Marketing analytics and performance tracking tools',
};

export const skills = [
  {
    name: 'kpis',
    title: 'Marketing KPI Dashboard',
    summary: 'Essential metrics every growth team should track',
    content: `
MARKETING KPI DASHBOARD
=========================

ACQUISITION METRICS
  ┌────────────────────────┬──────────────────────────────────────┐
  │ Metric                 │ What it tells you                    │
  ├────────────────────────┼──────────────────────────────────────┤
  │ CAC (Customer          │ Total sales+marketing spend /        │
  │ Acquisition Cost)      │ new customers acquired               │
  ├────────────────────────┼──────────────────────────────────────┤
  │ CAC Payback Period     │ Months to recoup acquisition cost    │
  │                        │ Target: < 12 months                  │
  ├────────────────────────┼──────────────────────────────────────┤
  │ Traffic by channel     │ Which channels drive volume          │
  ├────────────────────────┼──────────────────────────────────────┤
  │ Signup / Lead rate     │ Visitors → signups conversion        │
  │                        │ Benchmark: 2-5% for SaaS             │
  ├────────────────────────┼──────────────────────────────────────┤
  │ MQL → SQL rate         │ Lead quality from marketing          │
  │                        │ Benchmark: 20-30%                    │
  └────────────────────────┴──────────────────────────────────────┘

ENGAGEMENT METRICS
  ┌────────────────────────┬──────────────────────────────────────┐
  │ Activation rate        │ % of signups who reach aha moment    │
  │ DAU / WAU / MAU        │ Active users (daily/weekly/monthly)  │
  │ DAU/MAU ratio          │ Stickiness. Target: >20% (SaaS)     │
  │ Feature adoption       │ % of users using key features        │
  │ Session duration       │ Time spent per visit                 │
  │ Pages per session      │ Depth of engagement                  │
  └────────────────────────┴──────────────────────────────────────┘

RETENTION METRICS
  ┌────────────────────────┬──────────────────────────────────────┐
  │ Churn rate (monthly)   │ % of customers lost per month        │
  │                        │ Target: <5% for SMB, <1% enterprise  │
  │ Net revenue retention  │ Revenue from existing customers      │
  │                        │ Target: >100% (expansion > churn)    │
  │ Cohort retention       │ Retention curves by signup month     │
  │ NPS                    │ Would they recommend you? (0-10)     │
  │                        │ Target: >40                          │
  └────────────────────────┴──────────────────────────────────────┘

REVENUE METRICS
  ┌────────────────────────┬──────────────────────────────────────┐
  │ MRR / ARR              │ Monthly/Annual recurring revenue     │
  │ ARPU                   │ Average revenue per user             │
  │ LTV                    │ Customer lifetime value              │
  │ LTV:CAC ratio          │ Unit economics health                │
  │                        │ Target: >3:1                         │
  │ Expansion MRR          │ Revenue growth from existing users   │
  │ Pipeline velocity      │ Value × win rate / cycle length      │
  └────────────────────────┴──────────────────────────────────────┘
`,
  },
  {
    name: 'cohort',
    title: 'Cohort Analysis Guide',
    summary: 'Track how user behavior changes over time by signup group',
    content: `
COHORT ANALYSIS GUIDE
======================

Cohort analysis groups users by when they started and tracks their behavior
over time. It reveals whether your product is getting better at retaining users.

TYPES OF COHORTS:

  Acquisition cohort (most common):
  Group users by signup week/month.
  Track: retention, revenue, feature adoption over time.

  Behavioral cohort:
  Group by action taken (e.g., "completed onboarding" vs "skipped").
  Track: how that behavior affects long-term retention.

READING A COHORT TABLE:
  Example (monthly retention %):

              Month 0  Month 1  Month 2  Month 3  Month 4
  Jan cohort    100%     45%      38%      35%      33%
  Feb cohort    100%     48%      41%      37%      --
  Mar cohort    100%     52%      44%      --       --
  Apr cohort    100%     55%      --       --       --

  Read DOWN columns: are newer cohorts retaining better?
  (Yes — Jan M1 was 45%, Apr M1 is 55%. Product is improving.)

  Read ACROSS rows: where is the biggest drop?
  (M0→M1 is the biggest drop. Focus onboarding improvements here.)

  Flattening curve: the cohort is stabilizing — you found your core users.

WHAT TO LOOK FOR:
  - "Smile" pattern: retention dips then recovers → re-engagement is working
  - Flattening: curve levels off → you have a retained base
  - Declining: curve keeps dropping → product-market fit issue
  - Improving across cohorts: newer cohorts retain better → product improvements are working

ACTIONABLE STEPS:
  1. Build a cohort table for your key metric (retention, revenue, or feature use)
  2. Compare the last 6 monthly cohorts
  3. Identify the biggest single-period drop (that's your leverage point)
  4. Segment by behavior: what do retained users do that churned users don't?
  5. Design interventions to move more users toward the retained behavior
  6. Measure: did the next cohort improve at that drop-off point?
`,
  },
  {
    name: 'attribution',
    title: 'Marketing Attribution Models',
    summary: 'Understand which channels and touchpoints drive conversions',
    content: `
MARKETING ATTRIBUTION MODELS
==============================

Attribution answers: "Which marketing activities are actually working?"

COMMON MODELS:

  First Touch
  ┌──────────────────────────────────────────────────────────┐
  │ 100% credit to the first interaction.                    │
  │ Best for: understanding what drives awareness            │
  │ Limitation: ignores everything after first touch         │
  └──────────────────────────────────────────────────────────┘

  Last Touch
  ┌──────────────────────────────────────────────────────────┐
  │ 100% credit to the last interaction before conversion.   │
  │ Best for: understanding what closes deals                │
  │ Limitation: ignores the full journey                     │
  └──────────────────────────────────────────────────────────┘

  Linear
  ┌──────────────────────────────────────────────────────────┐
  │ Equal credit to every touchpoint.                        │
  │ Best for: getting a balanced overview                     │
  │ Limitation: not all touchpoints contribute equally       │
  └──────────────────────────────────────────────────────────┘

  Time Decay
  ┌──────────────────────────────────────────────────────────┐
  │ More credit to touchpoints closer to conversion.         │
  │ Best for: long sales cycles (B2B)                        │
  │ Limitation: undervalues awareness-stage activities       │
  └──────────────────────────────────────────────────────────┘

  U-Shaped (Position-Based)
  ┌──────────────────────────────────────────────────────────┐
  │ 40% to first touch, 40% to last touch, 20% split among  │
  │ middle touchpoints.                                      │
  │ Best for: valuing both discovery and conversion          │
  │ Limitation: still somewhat arbitrary                     │
  └──────────────────────────────────────────────────────────┘

  Data-Driven / Multi-Touch
  ┌──────────────────────────────────────────────────────────┐
  │ Machine learning assigns credit based on actual data.    │
  │ Best for: mature teams with sufficient data              │
  │ Limitation: requires large datasets, can be a black box  │
  └──────────────────────────────────────────────────────────┘

PRACTICAL RECOMMENDATION:
  - Early stage: use first-touch AND last-touch side by side
  - Growth stage: U-shaped gives the best balance
  - Scale stage: invest in data-driven attribution

IMPLEMENTATION CHECKLIST:
  [ ] UTM parameters on all campaign links
  [ ] Consistent naming convention (source/medium/campaign)
  [ ] CRM tracks first and last touch per lead
  [ ] Marketing platform and CRM data are connected
  [ ] Monthly review of channel performance by attribution model
  [ ] Compare at least two models to avoid single-model bias
`,
  },
];

export async function run(args) {
  if (args.length === 0) {
    console.log(`\n${meta.name} — ${meta.description}\n`);
    console.log('Available skills:');
    for (const skill of skills) {
      console.log(`  ${skill.name.padEnd(16)} ${skill.summary}`);
    }
    console.log(`\nRun: growth run ${meta.name} <skill-name>`);
    return;
  }

  const skillName = args[0].toLowerCase();
  const skill = skills.find((s) => s.name === skillName);
  if (!skill) {
    console.error(`Unknown skill: ${skillName}`);
    console.log('Available:', skills.map((s) => s.name).join(', '));
    process.exit(1);
  }

  console.log(skill.content);
}
