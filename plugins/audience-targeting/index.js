export const meta = {
  name: 'audience-targeting',
  version: '1.0.0',
  description: 'Audience segmentation and targeting frameworks',
};

export const skills = [
  {
    name: 'icp',
    title: 'Ideal Customer Profile (ICP)',
    summary: 'Define your best-fit customer for focused go-to-market',
    steps: [
      {
        label: 'CUSTOMER CHARACTERISTICS',
        guidance: 'Describe the company or person who gets the most value from your product.',
        prompts: [
          { key: 'industry', question: 'What industry or vertical do your best customers come from?' },
          { key: 'size', question: 'What is the typical company size or customer demographic?' },
          { key: 'geography', question: 'What geography do you serve?' },
        ],
      },
      {
        label: 'BUYING CHARACTERISTICS',
        guidance: 'How do these customers buy? Budget, decision-maker, triggers.',
        prompts: [
          { key: 'decision_maker', question: 'Who is the decision-maker? (title/role):' },
          { key: 'buying_trigger', question: 'What triggers them to start looking for a solution?' },
          { key: 'budget', question: 'What is their typical budget range?' },
        ],
      },
      {
        label: 'SUCCESS CHARACTERISTICS',
        guidance: 'What makes a customer successful and likely to stay long-term?',
        prompts: [
          { key: 'use_case', question: 'What is the primary use case for your best customers?' },
          { key: 'success_indicator', question: 'How do you know a customer is successful? (metric or behavior):' },
        ],
      },
    ],
    content: `
IDEAL CUSTOMER PROFILE (ICP)
=============================

Your ICP describes the company or person who gets the most value from your
product and is most likely to buy, stay, and refer others.

WHY IT MATTERS:
  - Focus sales and marketing spend on highest-probability prospects
  - Improve close rates and shorten sales cycles
  - Reduce churn (right-fit customers stick around)
  - Align product development with real needs

B2B ICP TEMPLATE:
  Company characteristics:
  - Industry/vertical: _______________
  - Company size (employees): _______________
  - Annual revenue: _______________
  - Geography: _______________
  - Tech stack: _______________
  - Growth stage: _______________

  Buying characteristics:
  - Budget range: _______________
  - Decision-maker title: _______________
  - Buying trigger: _______________
  - Sales cycle length: _______________
  - Typical objections: _______________

  Success characteristics:
  - Use case: _______________
  - Time to value: _______________
  - Expansion potential: _______________
  - NPS score range: _______________

B2C ICP TEMPLATE:
  - Age range: _______________
  - Income level: _______________
  - Location type: _______________
  - Interests/hobbies: _______________
  - Pain points: _______________
  - Where they spend time online: _______________
  - Purchase triggers: _______________

HOW TO BUILD YOUR ICP:
  1. Analyze your best 20 customers (highest LTV, fastest close, best NPS)
  2. Find the common traits across them
  3. Interview 5-10 of them: why did they buy? what alternatives did they consider?
  4. Validate: does this profile match your pipeline winners?
  5. Score new leads against the ICP for prioritization
`,
  },
  {
    name: 'personas',
    title: 'Buyer Personas',
    summary: 'Create detailed profiles of your target buyers and users',
    steps: [
      {
        label: 'PERSONA IDENTITY',
        guidance: 'Give your persona a name and role. Make them feel real.',
        prompts: [
          { key: 'name_role', question: 'Give your persona a name and title (e.g., "Homeowner Hannah"):' },
          { key: 'demographics', question: 'Describe their demographics (age, location, income, family):' },
        ],
      },
      {
        label: 'GOALS & MOTIVATIONS',
        guidance: 'What does this persona want to achieve? What does success look like for them?',
        prompts: [
          { key: 'primary_goal', question: 'What is their primary goal when seeking your type of service?' },
          { key: 'success_looks_like', question: 'What does success look like for them?' },
        ],
      },
      {
        label: 'CHALLENGES & PAIN POINTS',
        guidance: 'What frustrates them? What keeps them up at night?',
        prompts: [
          { key: 'biggest_frustration', question: 'What is their biggest frustration with current options?' },
          { key: 'fear', question: 'What are they afraid of when making this type of purchase?' },
        ],
      },
      {
        label: 'BUYING BEHAVIOR',
        guidance: 'How do they research, evaluate, and decide?',
        prompts: [
          { key: 'research_method', question: 'How do they research solutions? (Google, referrals, social, etc.):' },
          { key: 'decision_factors', question: 'What are the top 3 factors in their decision?' },
        ],
      },
      {
        label: 'MESSAGING',
        guidance: 'What message resonates with this persona?',
        prompts: [
          { key: 'key_message', question: 'Write the one message that would resonate most with this persona:' },
          { key: 'proof_needed', question: 'What proof do they need to trust you? (reviews, certifications, examples):' },
        ],
      },
    ],
    content: `
BUYER PERSONAS
===============

A persona is a semi-fictional representation of your ideal customer based on
real data and informed assumptions.

PERSONA TEMPLATE:

  NAME & ROLE
  "Marketing Mary" — VP of Marketing at a mid-market SaaS company

  DEMOGRAPHICS
  - Age: 35-45
  - Education: MBA or equivalent
  - Location: Major metro area
  - Income: $150-200K

  GOALS & MOTIVATIONS
  - Primary goal: _______________
  - Secondary goal: _______________
  - What does success look like for them? _______________
  - What are they measured on? _______________

  CHALLENGES & PAIN POINTS
  - Biggest frustration: _______________
  - What keeps them up at night? _______________
  - What have they tried that didn't work? _______________
  - What would make their job easier? _______________

  BUYING BEHAVIOR
  - How do they research solutions? _______________
  - Who influences their decision? _______________
  - What objections will they raise? _______________
  - What triggers a purchase? _______________

  INFORMATION SOURCES
  - Blogs/newsletters they read: _______________
  - Podcasts they listen to: _______________
  - Social platforms: _______________
  - Events/conferences: _______________
  - Communities: _______________

  MESSAGING THAT RESONATES
  - Key message: _______________
  - Proof points they need: _______________
  - Tone that works: _______________

TIPS:
  - Create 2-4 personas max (focus beats coverage)
  - Base them on real customer interviews, not guesses
  - Include anti-personas (who you do NOT want to target)
  - Update quarterly as you learn more
  - Give each persona a name so the team can reference them
`,
  },
  {
    name: 'segmentation',
    title: 'Market Segmentation Matrix',
    summary: 'Divide your market into actionable segments for targeted campaigns',
    steps: [
      {
        label: 'DEFINE SEGMENTS',
        guidance: 'Identify 2-4 distinct customer segments using behavioral, firmographic, or needs-based criteria.',
        prompts: [
          { key: 'segment_1', question: 'Describe Segment 1 (name and key characteristics):' },
          { key: 'segment_2', question: 'Describe Segment 2 (name and key characteristics):' },
          { key: 'segment_3', question: 'Describe Segment 3 (name and key characteristics, or "skip"):' },
        ],
      },
      {
        label: 'EVALUATE SEGMENTS',
        guidance: 'Score each segment on: size, growth, reachability, willingness to pay, fit, competition.',
        prompts: [
          { key: 'best_segment', question: 'Which segment scores highest overall and why?' },
          { key: 'reachability', question: 'How will you reach this segment? (channels, communities, events):' },
        ],
      },
      {
        label: 'ACTIVATE',
        guidance: 'For your priority segment, customize value proposition, channels, and messaging.',
        prompts: [
          { key: 'value_prop', question: 'Write the value proposition tailored to your priority segment:' },
          { key: 'content_plan', question: 'What content or campaign will you create specifically for this segment?' },
        ],
      },
    ],
    content: `
MARKET SEGMENTATION MATRIX
============================

Divide your total addressable market (TAM) into groups you can target
with tailored messaging and offers.

SEGMENTATION DIMENSIONS:

  Behavioral (most actionable):
  ┌────────────────────┬─────────────────────────────────────┐
  │ Usage frequency     │ Daily / Weekly / Monthly / Dormant  │
  │ Feature adoption    │ Core only / Power user / Explorer   │
  │ Purchase history    │ First-time / Repeat / Churned       │
  │ Engagement level    │ Active / Passive / At-risk          │
  │ Buying stage        │ Aware / Considering / Ready to buy  │
  └────────────────────┴─────────────────────────────────────┘

  Firmographic (B2B):
  ┌────────────────────┬─────────────────────────────────────┐
  │ Company size        │ SMB / Mid-market / Enterprise       │
  │ Industry            │ Tech / Healthcare / Finance / etc.  │
  │ Growth rate         │ Startup / Scaling / Mature          │
  │ Tech maturity       │ Early adopter / Mainstream / Laggard│
  └────────────────────┴─────────────────────────────────────┘

  Needs-based:
  ┌────────────────────┬─────────────────────────────────────┐
  │ Primary need        │ Save time / Save money / Grow       │
  │ Urgency             │ Critical / Important / Nice-to-have │
  │ Sophistication      │ Beginner / Intermediate / Expert    │
  └────────────────────┴─────────────────────────────────────┘

SEGMENT EVALUATION SCORECARD:
  For each segment, score 1-5:
  - Size: How many potential customers?
  - Growth: Is this segment expanding?
  - Reachability: Can you target them with existing channels?
  - Willingness to pay: Do they have budget and urgency?
  - Fit: Does your product solve their specific problem?
  - Competition: How many alternatives do they have?

  Total score = sum of all dimensions
  Prioritize highest-scoring segments.

ACTIVATION:
  For each priority segment:
  1. Customize your value proposition
  2. Choose the right channels to reach them
  3. Create segment-specific content and landing pages
  4. Adjust pricing/packaging if needed
  5. Train sales team on segment-specific objections
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
