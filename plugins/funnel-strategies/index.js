export const meta = {
  name: 'funnel-strategies',
  version: '1.0.0',
  description: 'Growth funnel strategy templates and optimization tools',
};

export const skills = [
  {
    name: 'aarrr',
    title: 'AARRR Pirate Metrics',
    summary: 'Acquisition, Activation, Retention, Referral, Revenue',
    steps: [
      {
        label: 'ACQUISITION',
        guidance: 'How do users find you? Identify channels, cost per visitor, and signup rates.',
        prompts: [
          { key: 'channels', question: 'What are your top 3 acquisition channels?' },
          { key: 'best_channel', question: 'Which channel brings your highest-quality customers?' },
        ],
      },
      {
        label: 'ACTIVATION',
        guidance: 'Do they have a great first experience? Track onboarding completion and time to first key action.',
        prompts: [
          { key: 'first_experience', question: 'What does a great first experience look like for your customer?' },
          { key: 'drop_off', question: 'Where do new customers drop off in the first experience?' },
        ],
      },
      {
        label: 'RETENTION',
        guidance: 'Do they come back? Track D1/D7/D30 retention, cohort curves, feature adoption.',
        prompts: [
          { key: 'repeat_trigger', question: 'What brings customers back for repeat business?' },
          { key: 'retention_metric', question: 'How do you measure retention today? (repeat rate, frequency, etc.):' },
        ],
      },
      {
        label: 'REFERRAL',
        guidance: 'Do they tell others? Track viral coefficient, NPS, referral participation.',
        prompts: [
          { key: 'referral_method', question: 'How do customers currently refer others to you?' },
          { key: 'referral_incentive', question: 'What incentive could you offer for referrals?' },
        ],
      },
      {
        label: 'REVENUE',
        guidance: 'Can you monetize? Track MRR/ARR, ARPU, LTV, LTV:CAC ratio.',
        prompts: [
          { key: 'avg_revenue', question: 'What is your average revenue per customer?' },
          { key: 'revenue_growth', question: 'What is your best opportunity to grow revenue per customer?' },
        ],
      },
    ],
    content: `
AARRR PIRATE METRICS
=====================

The startup funnel framework by Dave McClure:

1. ACQUISITION — How do users find you?
   Key metrics:
   - Traffic by channel (organic, paid, social, referral, direct)
   - Cost per visitor by channel
   - Signup rate / lead capture rate

   Tactics:
   - SEO: target long-tail keywords with high intent
   - Content: publish to where your audience already is
   - Paid: start with small budgets, find winners, then scale
   - Partnerships: co-market with complementary products

2. ACTIVATION — Do they have a great first experience?
   Key metrics:
   - Signup completion rate
   - Onboarding completion rate
   - Time to first key action
   - "Aha moment" conversion rate

   Tactics:
   - Remove friction from signup (social login, fewer fields)
   - Progressive onboarding (don't ask for everything upfront)
   - Personalize the first experience based on use case
   - Use checklists and progress bars

3. RETENTION — Do they come back?
   Key metrics:
   - D1 / D7 / D30 retention rates
   - Weekly/monthly active users (WAU/MAU)
   - Cohort retention curves
   - Feature adoption rates

   Tactics:
   - Email/push sequences for re-engagement
   - Build habits: trigger → action → variable reward → investment
   - Regular product updates and announcements
   - Identify power users and study their behavior

4. REFERRAL — Do they tell others?
   Key metrics:
   - Viral coefficient (K-factor)
   - Net Promoter Score (NPS)
   - Referral program participation rate
   - Organic word-of-mouth mentions

   Tactics:
   - Make sharing built-in (invite team, share results)
   - Double-sided incentives (both referrer and referee benefit)
   - Make the product visible (badges, public profiles)
   - Ask at the moment of delight, not randomly

5. REVENUE — Can you monetize?
   Key metrics:
   - Monthly Recurring Revenue (MRR)
   - Average Revenue Per User (ARPU)
   - Customer Lifetime Value (LTV)
   - LTV:CAC ratio (target 3:1+)

   Tactics:
   - Free-to-paid conversion optimization
   - Upsell triggers based on usage thresholds
   - Annual plan incentives
   - Reduce involuntary churn (failed payments)
`,
  },
  {
    name: 'conversion',
    title: 'Conversion Optimization Playbook',
    summary: 'Systematic approach to improving conversion at every funnel stage',
    steps: [
      {
        label: 'MAP YOUR FUNNEL',
        guidance: 'Define each stage of your funnel and the conversion rate at each transition.',
        prompts: [
          { key: 'funnel_stages', question: 'List your funnel stages (e.g., Visitor → Lead → Customer):' },
          { key: 'biggest_drop', question: 'Where is the biggest conversion drop-off?' },
        ],
      },
      {
        label: 'DIAGNOSE THE DROP-OFF',
        guidance: 'Use quantitative (analytics, heatmaps) and qualitative (interviews, surveys) data.',
        prompts: [
          { key: 'diagnosis', question: 'Why do you think people drop off at that stage?' },
          { key: 'data_source', question: 'What data or feedback supports this diagnosis?' },
        ],
      },
      {
        label: 'HYPOTHESIS',
        guidance: 'Template: "If we [change], then [metric] will [improve] because [reason]"',
        prompts: [
          { key: 'hypothesis', question: 'Write your optimization hypothesis using the template above:' },
          { key: 'ice_score', question: 'Score it: Impact (1-10), Confidence (1-10), Ease (1-10):' },
        ],
      },
      {
        label: 'TACTICS',
        guidance: 'Choose specific tactics to test: landing page changes, signup flow, email sequence, pricing.',
        prompts: [
          { key: 'tactic', question: 'What specific change will you test first?' },
          { key: 'success_metric', question: 'How will you measure success? (metric and target):' },
        ],
      },
    ],
    content: `
CONVERSION OPTIMIZATION PLAYBOOK
==================================

STEP 1: MAP YOUR FUNNEL
   Visitor → Lead → MQL → SQL → Opportunity → Customer
   Measure the conversion rate at each transition.
   Find the biggest drop-off — that's your leverage point.

STEP 2: DIAGNOSE THE DROP-OFF
   Quantitative:
   - Heatmaps and scroll maps
   - Session recordings
   - Funnel analytics (where exactly do they leave?)
   - A/B test results history

   Qualitative:
   - User interviews ("what almost stopped you from signing up?")
   - Exit surveys
   - Support ticket analysis
   - Sales call objection tracking

STEP 3: HYPOTHESIS FRAMEWORK
   Template: "If we [change], then [metric] will [improve] because [reason]"

   Prioritize using ICE:
   - Impact: how much will this move the metric? (1-10)
   - Confidence: how sure are we? (1-10)
   - Ease: how fast can we test this? (1-10)
   Score = I × C × E

STEP 4: HIGH-IMPACT CONVERSION TACTICS
   Landing pages:
   - One page, one goal, one CTA
   - Headline matches the ad/link that brought them here
   - Social proof above the fold
   - Remove navigation to reduce exits

   Pricing pages:
   - Anchor with highest plan first (or highlight recommended)
   - Use decoy pricing (3 tiers, middle is the target)
   - Show annual savings prominently
   - Feature comparison table

   Signup flows:
   - Reduce form fields to minimum viable
   - Show progress indicators
   - Allow "try before you buy"
   - Social proof during signup ("12,847 teams already use...")

   Email sequences:
   - Welcome email within 5 minutes (highest open rate)
   - Education-first, not sales-first
   - Behavioral triggers > time-based drips
   - Re-engagement at day 3, 7, 14 for inactive users

STEP 5: MEASURE AND ITERATE
   - Run tests for statistical significance (min 2 weeks or 1,000 visitors)
   - Document every test and result
   - Winners become the new baseline
   - Losing tests are valuable — they tell you what customers don't care about
`,
  },
  {
    name: 'flywheel',
    title: 'Growth Flywheel Design',
    summary: 'Build self-reinforcing growth loops that compound over time',
    steps: [
      {
        label: 'IDENTIFY YOUR CORE LOOP',
        guidance: 'What single action, when repeated, drives your growth? Input → Action → Output → feeds back.',
        prompts: [
          { key: 'core_loop', question: 'Describe your core growth loop in one sentence:' },
          { key: 'flywheel_type', question: 'Which pattern fits? (content / product-led / marketplace / data):' },
        ],
      },
      {
        label: 'MAP FRICTION POINTS',
        guidance: 'At each step of your loop, what slows it down?',
        prompts: [
          { key: 'highest_friction', question: 'Where is the highest friction in your loop?' },
          { key: 'friction_fix', question: 'What would reduce that friction?' },
        ],
      },
      {
        label: 'ADD FORCE',
        guidance: 'Where can you add energy to spin the flywheel faster?',
        prompts: [
          { key: 'force_point', question: 'Where is the highest-leverage point to add force?' },
          { key: 'cycle_time', question: 'How long does one full revolution take today? How could you shorten it?' },
        ],
      },
    ],
    content: `
GROWTH FLYWHEEL DESIGN
=======================

A flywheel creates compounding growth where each cycle feeds the next.

ANATOMY OF A FLYWHEEL:
   Input → Action → Output → Feeds back as Input
   Each revolution adds momentum.

COMMON FLYWHEEL PATTERNS:

1. Content Flywheel
   Create content → Attract organic traffic → Capture leads
   → Learn what resonates → Create better content

   Key: invest in evergreen content that compounds (SEO articles, tools, templates)

2. Product-Led Flywheel
   User signs up → Experiences value → Invites team/shares output
   → New users sign up → More data/content in platform → More value

   Key: the product must be inherently shareable or collaborative

3. Marketplace Flywheel
   More sellers → More selection → More buyers
   → More transactions → More revenue → Attracts more sellers

   Key: solve the chicken-and-egg problem first (usually by subsidizing one side)

4. Data Flywheel
   More users → More data → Better product/AI
   → Better experience → More users

   Key: the product must visibly improve with more usage

BUILDING YOUR FLYWHEEL:
   1. Identify your core loop (what action drives growth?)
   2. Map each step and the friction at each transition
   3. Reduce friction at the highest-friction step
   4. Add force at the highest-leverage step
   5. Measure cycle time (how fast does one revolution take?)
   6. Track momentum (is each cohort spinning faster?)

ANTI-PATTERNS:
   - Funnels (linear, don't compound)
   - Paid-only acquisition (stops when you stop spending)
   - Manual processes in the loop (limits speed)
`,
  },
];

export async function run(args) {
  const skillName = args[0]?.toLowerCase();

  if (!skillName) {
    console.log(`\n${meta.name} — ${meta.description}\n`);
    console.log('Available skills:');
    for (const skill of skills) {
      console.log(`  ${skill.name.padEnd(16)} ${skill.summary}`);
    }
    console.log(`\nRun: growth run ${meta.name} <skill-name> [--interactive]`);
    return;
  }

  const skill = skills.find((s) => s.name === skillName);
  if (!skill) {
    console.error(`Unknown skill: ${skillName}`);
    console.log('Available:', skills.map((s) => s.name).join(', '));
    process.exit(1);
  }

  console.log(skill.content);
}
