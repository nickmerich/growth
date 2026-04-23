export const meta = {
  name: 'marketing-skills',
  version: '1.0.0',
  description: 'Core marketing skill frameworks and growth strategies',
};

export const skills = [
  {
    name: 'aida',
    title: 'AIDA Framework',
    summary: 'Attention, Interest, Desire, Action — classic persuasion model',
    content: `
AIDA FRAMEWORK
==============

A four-stage model for crafting persuasive messaging:

1. ATTENTION
   - Hook with a bold claim, surprising stat, or provocative question
   - Pattern-interrupt to break through noise
   - Techniques: contrast, urgency, curiosity gap

2. INTEREST
   - Build relevance by connecting to the reader's situation
   - Use storytelling, data, or social proof
   - Answer "why should I care?"

3. DESIRE
   - Shift from logical to emotional
   - Paint the "after" picture — what life looks like with your solution
   - Handle objections preemptively
   - Stack benefits, not features

4. ACTION
   - Single, clear CTA (call to action)
   - Reduce friction: fewer form fields, one-click, free trial
   - Add urgency or scarcity when authentic
   - Tell them exactly what to do next

EXAMPLE APPLICATION:
  Headline (Attention): "87% of startups waste $10K/mo on ads that don't convert"
  Body (Interest): "We analyzed 2,000 SaaS campaigns and found 3 patterns..."
  Proof (Desire): "Companies using this framework saw 3.2x ROAS in 60 days"
  CTA (Action): "Get your free audit — takes 2 minutes"
`,
  },
  {
    name: 'stp',
    title: 'STP Model',
    summary: 'Segmentation, Targeting, Positioning — market strategy foundation',
    content: `
STP MODEL
=========

The foundation of any go-to-market strategy:

1. SEGMENTATION — Divide the market into distinct groups
   - Demographic: age, income, job title, company size
   - Psychographic: values, lifestyle, attitudes
   - Behavioral: usage patterns, purchase frequency, loyalty
   - Geographic: location, climate, urban/rural
   - Firmographic (B2B): industry, revenue, employee count

2. TARGETING — Select which segments to pursue
   Evaluate each segment on:
   - Size & growth potential
   - Profitability
   - Accessibility (can you reach them?)
   - Compatibility with your strengths

   Strategies:
   - Concentrated: one segment, deep focus
   - Differentiated: multiple segments, tailored approach per segment
   - Undifferentiated: one message for the whole market (rarely optimal)

3. POSITIONING — Define how you want to be perceived
   Positioning Statement Template:
   "For [target segment] who [need/want],
    [brand] is the [category] that [key benefit]
    because [reason to believe]."

   Positioning Map: plot competitors on two axes that matter to your segment
   (e.g., price vs. quality, speed vs. customization)
`,
  },
  {
    name: '4ps',
    title: 'Marketing Mix (4Ps)',
    summary: 'Product, Price, Place, Promotion — tactical marketing levers',
    content: `
MARKETING MIX — THE 4Ps
========================

1. PRODUCT
   - Core benefit: what problem does it solve?
   - Features vs. benefits (customers buy benefits)
   - Product levels: core → actual → augmented
   - Differentiation: what makes it unique?
   - Product lifecycle: introduction → growth → maturity → decline

2. PRICE
   - Cost-plus: cost + margin
   - Value-based: what customers will pay for the perceived value
   - Competitive: match or undercut competitors
   - Penetration: low price to gain market share fast
   - Skimming: high initial price, lower over time
   - Psychological: $9.99 vs $10, anchoring, decoy pricing
   - Freemium: free tier to drive adoption, paid for premium

3. PLACE (Distribution)
   - Direct: your website, sales team, app store
   - Indirect: resellers, marketplaces, affiliates
   - Channel strategy: exclusive, selective, or intensive
   - Consider: where does your customer already shop/browse?

4. PROMOTION
   - Advertising: paid media (search, social, display, video)
   - Content marketing: blogs, podcasts, newsletters
   - PR & earned media: press coverage, reviews, word of mouth
   - Sales promotion: discounts, trials, bundles
   - Personal selling: demos, consultations
   - Community: events, forums, user groups
`,
  },
  {
    name: 'porter',
    title: "Porter's Five Forces",
    summary: 'Competitive analysis framework for market attractiveness',
    content: `
PORTER'S FIVE FORCES
=====================

Assess the competitive intensity and attractiveness of a market:

1. THREAT OF NEW ENTRANTS
   Barriers to entry:
   - Capital requirements
   - Economies of scale
   - Brand loyalty / switching costs
   - Regulatory / legal barriers
   - Access to distribution channels
   High barriers = less threat = more attractive

2. BARGAINING POWER OF SUPPLIERS
   Suppliers are powerful when:
   - Few alternatives exist
   - Switching costs are high
   - Their product is differentiated
   - They can forward-integrate
   Mitigate: diversify suppliers, build partnerships, backward-integrate

3. BARGAINING POWER OF BUYERS
   Buyers are powerful when:
   - They buy in large volumes
   - Products are undifferentiated
   - Switching costs are low
   - They have full price/cost information
   Mitigate: differentiate, increase switching costs, build loyalty

4. THREAT OF SUBSTITUTES
   High threat when:
   - Substitutes offer better price-performance
   - Switching costs are low
   - Buyers are willing to experiment
   Mitigate: innovate, improve value proposition, lock-in strategies

5. COMPETITIVE RIVALRY
   Intense rivalry when:
   - Many competitors of similar size
   - Slow industry growth
   - High fixed costs (pressure to fill capacity)
   - Low differentiation
   - High exit barriers
`,
  },
  {
    name: 'growth-levers',
    title: 'Growth Levers Framework',
    summary: 'Identify and prioritize your highest-impact growth opportunities',
    content: `
GROWTH LEVERS FRAMEWORK
========================

Systematically identify where growth will come from:

1. ACQUISITION — Get more customers
   - Channel identification: where do your best customers come from?
   - CAC by channel: which channels are most efficient?
   - Organic vs. paid ratio
   - Viral coefficient: do existing users bring new ones?
   - Partnership / co-marketing opportunities

2. ACTIVATION — Get them to the "aha moment" faster
   - Define the aha moment (the action that predicts retention)
   - Map the onboarding flow and identify drop-off points
   - Time-to-value: how long until they see results?
   - Reduce steps between signup and first value

3. RETENTION — Keep them coming back
   - Cohort analysis: are newer cohorts retaining better?
   - Engagement loops: trigger → action → reward → investment
   - Habit formation: frequency, variable rewards
   - Churn surveys: why do they leave?

4. REVENUE — Increase revenue per customer
   - Pricing optimization
   - Upsell / cross-sell paths
   - Expansion revenue (seats, usage, features)
   - Annual vs. monthly (higher LTV)

5. REFERRAL — Turn customers into advocates
   - Referral program design
   - Net Promoter Score (NPS)
   - Case studies and testimonials
   - Community building

PRIORITIZATION:
  Score each lever: Impact (1-10) x Confidence (1-10) x Ease (1-10)
  Work on the highest-scoring lever first.
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
