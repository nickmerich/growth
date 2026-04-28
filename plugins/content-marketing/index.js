export const meta = {
  name: 'content-marketing',
  version: '1.0.0',
  description: 'Content marketing planning and distribution strategies',
};

export const skills = [
  {
    name: 'calendar',
    title: 'Content Calendar Framework',
    summary: 'Plan and schedule content across channels systematically',
    steps: [
      {
        label: 'CONTENT PILLARS',
        guidance: 'Define 3-5 core topics that map to the problems you solve. Every piece of content must fit under a pillar.',
        prompts: [
          { key: 'pillar_1', question: 'Content Pillar 1 (core topic area):' },
          { key: 'pillar_2', question: 'Content Pillar 2 (core topic area):' },
          { key: 'pillar_3', question: 'Content Pillar 3 (core topic area):' },
        ],
      },
      {
        label: 'FORMATS & CADENCE',
        guidance: 'Choose which content formats you will produce and how often.',
        prompts: [
          { key: 'primary_format', question: 'What is your primary content format? (blog, video, social, newsletter, etc.):' },
          { key: 'cadence', question: 'How often will you publish? (e.g., 2 blogs/month, 3 social posts/week):' },
        ],
      },
      {
        label: 'REPURPOSING CHAIN',
        guidance: 'One big piece of content = 8-12 smaller pieces. Plan the chain.',
        prompts: [
          { key: 'hero_content', question: 'Describe your next "hero" piece of content (the big one you will repurpose):' },
          { key: 'repurpose_plan', question: 'How will you repurpose it? (e.g., blog → social thread → email → video clip):' },
        ],
      },
    ],
    content: `
CONTENT CALENDAR FRAMEWORK
============================

A repeatable system for planning, producing, and publishing content.

STEP 1: DEFINE YOUR CONTENT PILLARS (3-5 topics)
  Each pillar maps to a core problem you solve:
  - Pillar 1: _____________ (e.g., "Growth strategy")
  - Pillar 2: _____________ (e.g., "Product-led growth")
  - Pillar 3: _____________ (e.g., "Marketing analytics")
  - Pillar 4: _____________ (e.g., "Team scaling")

  Rule: every piece of content must fit under a pillar.

STEP 2: CHOOSE YOUR FORMATS AND CADENCE
  ┌──────────────────┬────────────┬──────────────┬──────────────┐
  │ Format           │ Cadence    │ Effort       │ Reach        │
  ├──────────────────┼────────────┼──────────────┼──────────────┤
  │ Blog posts       │ 2-4/month  │ Medium       │ SEO (long)   │
  │ Newsletter       │ 1/week     │ Low-Medium   │ Email list   │
  │ Social posts     │ 3-5/week   │ Low          │ Followers    │
  │ Video/podcast    │ 1-2/month  │ High         │ Discovery    │
  │ Case studies     │ 1/month    │ High         │ Sales enable │
  │ Webinars         │ 1/quarter  │ High         │ Lead gen     │
  │ Templates/tools  │ 1/quarter  │ Medium-High  │ SEO + viral  │
  └──────────────────┴────────────┴──────────────┴──────────────┘

STEP 3: WEEKLY PLANNING TEMPLATE
  Monday:    Plan and outline this week's content
  Tuesday:   Draft long-form (blog/newsletter)
  Wednesday: Edit and finalize, create visuals
  Thursday:  Publish and distribute
  Friday:    Repurpose (blog → social threads, newsletter → LinkedIn post)

STEP 4: CONTENT REPURPOSING CHAIN
  Webinar → Blog post → Social thread → Newsletter segment
  → Short video clips → Quote graphics → Community discussion

  One big piece of content = 8-12 smaller pieces.

STEP 5: MONTHLY REVIEW
  - Which content drove the most traffic?
  - Which converted visitors to leads?
  - Which topics had highest engagement?
  - Double down on what works, drop what doesn't.
`,
  },
  {
    name: 'distribution',
    title: 'Content Distribution Playbook',
    summary: 'Maximize reach for every piece of content you create',
    steps: [
      {
        label: 'OWNED CHANNELS',
        guidance: 'Channels you control: website, email list, social profiles, community.',
        prompts: [
          { key: 'owned_channels', question: 'Which owned channels will you use? (website, email, social, etc.):' },
          { key: 'email_list_size', question: 'How large is your email list or primary audience?' },
        ],
      },
      {
        label: 'EARNED CHANNELS',
        guidance: 'Channels where others amplify you: shares, press, guest posts, SEO.',
        prompts: [
          { key: 'earned_strategy', question: 'How will you earn amplification? (guest posts, partnerships, PR, etc.):' },
        ],
      },
      {
        label: 'PAID CHANNELS',
        guidance: 'Channels you pay for: social ads, search ads, sponsorships, influencers.',
        prompts: [
          { key: 'paid_budget', question: 'What is your monthly paid distribution budget?' },
          { key: 'paid_channels', question: 'Which paid channels will you test? (social ads, search, sponsorships):' },
        ],
      },
      {
        label: 'DISTRIBUTION CHECKLIST',
        guidance: 'For every piece of content, define the distribution steps.',
        prompts: [
          { key: 'checklist', question: 'List your distribution steps for each content piece (post, email, share, repurpose):' },
        ],
      },
    ],
    content: `
CONTENT DISTRIBUTION PLAYBOOK
===============================

Creating content is 20% of the work. Distribution is 80%.

DISTRIBUTION CHANNELS BY OWNERSHIP:

  OWNED (you control these)
  ┌─────────────────────────────────────────────────────────┐
  │ - Email list / newsletter                               │
  │ - Blog / website                                        │
  │ - Social media profiles                                 │
  │ - Podcast / YouTube channel                             │
  │ - In-product messages and notifications                 │
  │ - Customer community / forum                            │
  └─────────────────────────────────────────────────────────┘

  EARNED (others amplify for you)
  ┌─────────────────────────────────────────────────────────┐
  │ - Social shares and mentions                            │
  │ - Press coverage                                        │
  │ - Guest posts on industry blogs                         │
  │ - Podcast guest appearances                             │
  │ - Word of mouth and referrals                           │
  │ - SEO / organic search rankings                         │
  └─────────────────────────────────────────────────────────┘

  PAID (you pay for reach)
  ┌─────────────────────────────────────────────────────────┐
  │ - Sponsored social (LinkedIn, Twitter/X, Facebook)      │
  │ - Search ads (Google, Bing)                             │
  │ - Newsletter sponsorships                               │
  │ - Content syndication (industry sites)                  │
  │ - Influencer partnerships                               │
  │ - Retargeting / remarketing                             │
  └─────────────────────────────────────────────────────────┘

DISTRIBUTION CHECKLIST (for every piece of content):
  [ ] Post to your blog/website with SEO optimization
  [ ] Send to email list with compelling subject line
  [ ] Share on LinkedIn with a personal take (not just a link)
  [ ] Share on Twitter/X as a thread summarizing key points
  [ ] Post in 2-3 relevant communities (Reddit, Slack, Discord)
  [ ] Send to 5 people who would genuinely find it valuable
  [ ] Repurpose into 2-3 shorter formats within 48 hours
  [ ] Add to relevant internal docs and onboarding materials

AMPLIFICATION TACTICS:
  - Tag/mention people quoted or referenced in the content
  - Ask your team to engage within the first hour (algorithm boost)
  - Cross-promote with complementary creators
  - Submit to aggregators (Hacker News, Product Hunt, etc.)
  - Include shareable visuals (charts, frameworks, infographics)
`,
  },
  {
    name: 'seo',
    title: 'SEO Content Strategy',
    summary: 'Rank for the keywords your customers search for',
    steps: [
      {
        label: 'KEYWORD RESEARCH',
        guidance: 'What would your customer search for? Categorize by intent: informational, comparison, transactional.',
        prompts: [
          { key: 'seed_keywords', question: 'List 5 seed keywords your customers search for:' },
          { key: 'high_intent', question: 'Which keyword has the highest purchase intent?' },
        ],
      },
      {
        label: 'CONTENT PLAN',
        guidance: 'Map content types to keyword intent: how-tos for informational, comparisons for middle-funnel, landing pages for transactional.',
        prompts: [
          { key: 'first_article', question: 'What will your first SEO article target? (topic + keyword):' },
          { key: 'content_type', question: 'What format? (how-to guide, comparison, listicle, landing page):' },
        ],
      },
      {
        label: 'ON-PAGE OPTIMIZATION',
        guidance: 'Optimize title, meta description, headers, internal links, and images.',
        prompts: [
          { key: 'title_tag', question: 'Write the title tag for your first article (under 60 chars, keyword front-loaded):' },
          { key: 'meta_description', question: 'Write the meta description (under 160 chars, compelling):' },
        ],
      },
    ],
    content: `
SEO CONTENT STRATEGY
=====================

Build organic traffic that compounds over time.

KEYWORD RESEARCH PROCESS:
  1. Seed keywords: what would your customer search for?
  2. Expand with tools: Google autocomplete, "People also ask", Ahrefs, SEMrush
  3. Categorize by intent:
     - Informational: "how to...", "what is..." (top of funnel)
     - Comparison: "X vs Y", "best tools for..." (middle of funnel)
     - Transactional: "buy...", "pricing...", "[product] review" (bottom of funnel)
  4. Prioritize: search volume × relevance × difficulty

CONTENT TYPES BY INTENT:
  ┌──────────────────┬────────────────────────────────────────┐
  │ Intent           │ Content Format                         │
  ├──────────────────┼────────────────────────────────────────┤
  │ Informational    │ How-to guides, explainers, tutorials   │
  │ Comparison       │ Comparison posts, listicles, reviews   │
  │ Transactional    │ Landing pages, case studies, demos     │
  │ Navigational     │ Brand pages, product docs, pricing     │
  └──────────────────┴────────────────────────────────────────┘

ON-PAGE SEO CHECKLIST:
  [ ] Target keyword in title tag (front-loaded)
  [ ] Target keyword in H1 and first 100 words
  [ ] Related keywords in H2/H3 subheadings
  [ ] Meta description with keyword (compelling, under 160 chars)
  [ ] Internal links to/from related content (3-5 per post)
  [ ] External links to authoritative sources (2-3 per post)
  [ ] Images with descriptive alt text
  [ ] URL slug: short, keyword-rich, no dates
  [ ] Schema markup where applicable (FAQ, how-to, article)

CONTENT STRUCTURE FOR RANKING:
  - Answer the search query in the first paragraph
  - Use the "inverted pyramid" — most important info first
  - Include a table of contents for long posts
  - Add original data, examples, or visuals (differentiation)
  - Update existing content quarterly (freshness signal)

LINK BUILDING (the hard part):
  - Create genuinely useful tools and resources (linkable assets)
  - Original research and data studies
  - Guest posts on relevant sites (not for the link — for the audience)
  - HARO / journalist requests
  - Broken link building
  - Be the source others cite
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
