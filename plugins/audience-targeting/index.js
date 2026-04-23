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
