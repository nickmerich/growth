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
    steps: [
      {
        label: 'ATTENTION',
        guidance: 'Hook your audience with a bold claim, surprising stat, or provocative question.\nTechniques: contrast, urgency, curiosity gap.',
        prompts: [
          { key: 'hook', question: 'Write your attention-grabbing headline or hook:' },
          { key: 'attention_technique', question: 'What technique are you using? (contrast / urgency / curiosity gap):' },
        ],
      },
      {
        label: 'INTEREST',
        guidance: 'Build relevance by connecting to the reader\'s situation.\nUse storytelling, data, or social proof. Answer "why should I care?"',
        prompts: [
          { key: 'problem', question: 'What problem does your audience face that you solve?' },
          { key: 'proof', question: 'What data, story, or social proof builds interest?' },
        ],
      },
      {
        label: 'DESIRE',
        guidance: 'Shift from logical to emotional. Paint the "after" picture.\nHandle objections preemptively. Stack benefits, not features.',
        prompts: [
          { key: 'transformation', question: 'What does life look like AFTER using your product/service?' },
          { key: 'benefits', question: 'List your top 3 benefits (not features):' },
          { key: 'objection', question: 'What\'s the #1 objection, and how do you handle it?' },
        ],
      },
      {
        label: 'ACTION',
        guidance: 'Single, clear CTA. Reduce friction. Add urgency or scarcity when authentic.',
        prompts: [
          { key: 'cta', question: 'Write your call to action (what should they do next?):' },
          { key: 'urgency', question: 'What urgency or incentive drives them to act now?' },
        ],
      },
    ],
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
    steps: [
      {
        label: 'SEGMENTATION',
        guidance: 'Divide the market into distinct groups based on shared characteristics.\nDimensions: demographic, psychographic, behavioral, geographic, firmographic.',
        prompts: [
          { key: 'segments', question: 'What are the 2-3 main customer segments you see in your market?' },
          { key: 'segment_criteria', question: 'What criteria distinguish these segments? (e.g., budget, needs, company size):' },
        ],
      },
      {
        label: 'TARGETING',
        guidance: 'Select which segments to pursue. Evaluate: size, profitability, accessibility, fit.',
        prompts: [
          { key: 'target_segment', question: 'Which segment will you focus on first, and why?' },
          { key: 'target_size', question: 'How large is this segment? (estimate number of potential customers):' },
        ],
      },
      {
        label: 'POSITIONING',
        guidance: 'Define how you want to be perceived relative to competitors.\nTemplate: "For [segment] who [need], [brand] is the [category] that [benefit] because [reason]."',
        prompts: [
          { key: 'positioning_statement', question: 'Write your positioning statement using the template above:' },
          { key: 'differentiator', question: 'What is your single strongest differentiator vs. competitors?' },
        ],
      },
    ],
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
    steps: [
      {
        label: 'PRODUCT',
        guidance: 'Define what you sell — the core benefit, features, and differentiation.',
        prompts: [
          { key: 'core_benefit', question: 'What core problem does your product/service solve?' },
          { key: 'differentiator', question: 'What makes your offering unique vs. alternatives?' },
        ],
      },
      {
        label: 'PRICE',
        guidance: 'Set your pricing strategy: cost-plus, value-based, competitive, penetration, or freemium.',
        prompts: [
          { key: 'pricing_strategy', question: 'What is your pricing strategy and price point?' },
          { key: 'pricing_rationale', question: 'Why is this the right price? (value delivered, competitor comparison):' },
        ],
      },
      {
        label: 'PLACE',
        guidance: 'Distribution — how and where customers find and buy from you.',
        prompts: [
          { key: 'channels', question: 'Where do your customers find you? (website, referrals, marketplace, etc.):' },
          { key: 'purchase_path', question: 'Describe the path from discovery to purchase:' },
        ],
      },
      {
        label: 'PROMOTION',
        guidance: 'How you communicate value: advertising, content, PR, sales, community.',
        prompts: [
          { key: 'primary_channels', question: 'What are your top 2-3 promotional channels?' },
          { key: 'key_message', question: 'What is the key message you want every prospect to hear?' },
        ],
      },
    ],
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
    steps: [
      {
        label: 'THREAT OF NEW ENTRANTS',
        guidance: 'How easy is it for new competitors to enter your market?\nConsider: capital requirements, brand loyalty, regulations, distribution access.',
        prompts: [
          { key: 'entry_barriers', question: 'What barriers prevent new competitors from entering? (high/medium/low threat):' },
        ],
      },
      {
        label: 'BARGAINING POWER OF SUPPLIERS',
        guidance: 'How much leverage do your suppliers have over pricing and terms?',
        prompts: [
          { key: 'supplier_power', question: 'Who are your key suppliers, and how much power do they have? (high/medium/low):' },
        ],
      },
      {
        label: 'BARGAINING POWER OF BUYERS',
        guidance: 'How much leverage do your customers have? Can they easily switch or negotiate?',
        prompts: [
          { key: 'buyer_power', question: 'How easily can customers switch to a competitor? What leverage do they have?:' },
        ],
      },
      {
        label: 'THREAT OF SUBSTITUTES',
        guidance: 'What alternatives exist that solve the same problem differently?',
        prompts: [
          { key: 'substitutes', question: 'What substitutes could your customers use instead? (high/medium/low threat):' },
        ],
      },
      {
        label: 'COMPETITIVE RIVALRY',
        guidance: 'How intense is competition among existing players?',
        prompts: [
          { key: 'rivalry', question: 'Who are your main competitors and how intense is the rivalry?:' },
          { key: 'advantage', question: 'What is your sustainable competitive advantage?:' },
        ],
      },
    ],
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
    steps: [
      {
        label: 'ACQUISITION',
        guidance: 'How do you get more customers? Identify channels, CAC, and viral loops.',
        prompts: [
          { key: 'top_channels', question: 'What are your top 2-3 acquisition channels today?' },
          { key: 'untapped_channel', question: 'What channel are you NOT using that could work?' },
        ],
      },
      {
        label: 'ACTIVATION',
        guidance: 'Get new customers to the "aha moment" faster. What action predicts they\'ll stay?',
        prompts: [
          { key: 'aha_moment', question: 'What is your "aha moment" — the action that makes customers stick?' },
          { key: 'activation_friction', question: 'What friction slows customers from reaching that moment?' },
        ],
      },
      {
        label: 'RETENTION',
        guidance: 'Keep customers coming back. Build engagement loops and habits.',
        prompts: [
          { key: 'retention_driver', question: 'What keeps your best customers coming back?' },
          { key: 'churn_reason', question: 'Why do customers leave? What\'s the #1 churn reason?' },
        ],
      },
      {
        label: 'REVENUE',
        guidance: 'Increase revenue per customer: pricing, upsells, expansion.',
        prompts: [
          { key: 'revenue_opportunity', question: 'What is your biggest opportunity to increase revenue per customer?' },
        ],
      },
      {
        label: 'REFERRAL',
        guidance: 'Turn customers into advocates who bring new customers.',
        prompts: [
          { key: 'referral_mechanism', question: 'How do (or could) your customers refer others to you?' },
        ],
      },
      {
        label: 'PRIORITIZATION',
        guidance: 'Score each lever: Impact (1-10) x Confidence (1-10) x Ease (1-10). Focus on the highest.',
        prompts: [
          { key: 'top_lever', question: 'Which lever will you focus on first, and what\'s your ICE score?' },
        ],
      },
    ],
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
