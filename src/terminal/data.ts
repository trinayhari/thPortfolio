import type { Experience, KV, Project } from './types';

export const PROJECTS: Project[] = [
  {
    id: 'proq',
    name: 'Proq',
    path: 'projects/proq/README.md',
    draft: true,
    subtitle: 'AI-native operating system for construction',
    role: 'Founder / Engineer',
    status: 'Building',
    period: '2025 — present',
    stack: ['Python', 'TypeScript', 'Postgres', 'LLM APIs'],
    desc: 'An AI-native operating system for construction teams — the workflow layer between the field and the back office.',
    tags: ['ai-native', 'postgres', 'founder'],
    keywords: ['proq', 'construction', 'ai', 'startup', 'founder', 'building', 'current', 'os'],
    sections: [
      { label: 'PROBLEM', body: 'Placeholder — describe the specific pain a construction team feels today, in one or two sentences, with a number in it if you have one.' },
      { label: 'WHAT I BUILT', body: 'Placeholder — the shape of the product: what a user opens, what it does for them, what it replaces.' },
      { label: 'ARCHITECTURE', body: 'Placeholder — the ingest path, where the model sits, what state lives in Postgres, and how jobs are scheduled.' },
      { label: 'INTERESTING ENGINEERING', body: 'Placeholder — the one problem you would happily talk about for an hour in an interview.' },
      { label: 'CURRENT STATUS', body: 'Placeholder — pilots, users, revenue, or whatever the honest number is right now.' },
      { label: 'LESSONS', body: 'Placeholder — what you would do differently on the next one.' },
    ],
  },
  {
    id: 'slait',
    name: 'Slait',
    path: 'projects/slait/README.md',
    link: 'https://slait.dev',
    subtitle: 'AI platform that evaluates how engineers work with coding agents',
    role: 'Founder / Engineer',
    status: 'Building',
    period: 'JAN 2026 — present',
    stack: ['Python', 'FastAPI', 'React', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'OpenAI APIs'],
    desc: 'An AI platform that analyzes Cursor and Claude Code conversations to evaluate engineering workflows and give developers personalized feedback on how they work with agents.',
    tags: ['FastAPI', 'PostgreSQL', 'evals'],
    keywords: ['slait', 'slait.dev', 'evals', 'evaluation', 'agent', 'cursor', 'claude code', 'llm', 'embeddings', 'ai', 'founder', 'startup', 'current', 'building', 'hardest', 'difficult', 'toughest', 'proudest', 'enterprise', 'fastapi', 'redis', 'docker'],
    sections: [
      { label: 'PROBLEM', body: 'Everyone is coding with agents now and nobody can tell you whether they are doing it well. There is no scoreboard for AI-assisted engineering — just a vague sense that some sessions go somewhere and some do not.' },
      { label: 'WHAT I BUILT', body: 'A platform that ingests Cursor and Claude Code conversations and turns them into an evaluation: what the agent was asked, where it went wrong, and what the developer could have done differently. The output is personalized feedback, not a dashboard nobody reads.' },
      { label: 'ARCHITECTURE', body: 'FastAPI over PostgreSQL with Redis in front of the expensive paths, packaged in Docker and running on AWS. A React and TypeScript front end sits on top; the evaluation pipeline runs asynchronously so ingesting a long session never blocks the request.' },
      { label: 'INTERESTING ENGINEERING', body: 'The scoring itself. Evaluation pipelines combine LLM judgments, embeddings and logistic regression models under a custom scoring framework — deliberately mixed, because an LLM alone is inconsistent about the same session twice, and a classifier alone cannot read intent. Benchmarking agent performance means first making the measurement reproducible.' },
      { label: 'CURRENT STATUS', body: 'Live at slait.dev with 100+ active users and a first enterprise customer, landed by iterating directly with their engineering teams and integrating into their existing workflows.' },
      { label: 'LESSONS', body: 'Identifying failure modes is worth more than scoring successes. Developers do not want a grade; they want the one place the session went sideways.' },
    ],
  },
  {
    id: 'echoboard',
    name: 'EchoBoard',
    path: 'projects/echoboard/README.md',
    link: 'https://www.echoboard.us/',
    subtitle: 'AI analytics platform for qualitative survey data',
    role: 'Builder / Shipped',
    status: 'Live',
    period: '2024 — 2025',
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'OpenAI API', 'Supabase', 'AWS'],
    desc: 'An AI-powered analytics platform that pulls insight out of open-ended survey responses, built for HR teams, researchers and business leaders.',
    tags: ['Next.js', 'Supabase', 'OpenAI'],
    keywords: ['echoboard', 'survey', 'analytics', 'ai', 'nextjs', 'supabase', 'openai', 'product', 'ux', 'frontend', 'full stack'],
    sections: [
      { label: 'PROBLEM', body: 'Free-text survey answers are where the real signal lives and where nobody looks, because reading two thousand paragraphs is nobody’s job.' },
      { label: 'WHAT I BUILT', body: 'A fully responsive Next.js and Tailwind frontend over a secure backend, with customizable dashboards, AI-driven sentiment analysis and automated recommendations.' },
      { label: 'ARCHITECTURE', body: 'Supabase and Amazon RDS hold the data; OpenAI-powered analytics run over responses and write structured results back, so dashboards read rows rather than calling a model on every page view.' },
      { label: 'INTERESTING ENGINEERING', body: 'Most of the work was reliability and UX, not prompting: keeping analysis idempotent, making partial results useful, and making the dashboard honest about what the model was and was not confident in.' },
      { label: 'CURRENT STATUS', body: 'Shipped and live at echoboard.us.' },
      { label: 'LESSONS', body: 'A model in the loop raises the bar on the interface around it. People forgive a slow answer; they do not forgive an answer they cannot trace.' },
    ],
  },
  {
    id: 'sailo',
    name: 'Sailo',
    path: 'projects/sailo/README.md',
    link: 'https://devpost.com/software/sailo',
    subtitle: 'AI ETL agent for large-scale data warehouses',
    role: 'Builder',
    status: 'Shipped',
    period: 'AUG 2025',
    stack: ['Python', 'Modal', 'AWS', 'Redshift', 'Snowflake', 'BigQuery', 'Postgres', 'MySQL', 'LLM APIs', 'Next.js'],
    desc: 'An AI-powered ETL agent that connects to major data warehouses, auto-generates the pipelines and deploys them on Modal for real-time, zero-touch insights.',
    tags: ['Python', 'Modal', 'Next.js'],
    keywords: ['sailo', 'etl', 'data', 'pipeline', 'redshift', 'snowflake', 'bigquery', 'mysql', 'postgres', 'agent', 'llm', 'distributed', 'serverless', 'modal', 'infrastructure', 'difficult', 'lux', 'ramp'],
    sections: [
      { label: 'PROBLEM', body: 'Every new warehouse table starts the same way: someone reads the schema, writes the same extract-transform-load code by hand, and then owns it forever.' },
      { label: 'WHAT I BUILT', body: 'An agent that connects directly to Redshift, Snowflake, BigQuery, Postgres or MySQL, interprets the schema with an LLM, generates the pipeline and deploys it — plus a Zapier-like drag-and-drop builder in Next.js for the people who would rather wire it themselves.' },
      { label: 'ARCHITECTURE', body: 'Agents run on Modal’s serverless infrastructure so each pipeline is an independent, horizontally scalable unit, which is what makes the zero-touch promise survive contact with real data volumes.' },
      { label: 'INTERESTING ENGINEERING', body: 'Schema interpretation is the hard part. A model that hallucinates a column silently corrupts a table, so the generated pipeline is validated against the real schema before anything is allowed to run.' },
      { label: 'CURRENT STATUS', body: 'Built, shipped and demoed — with traction from Lux Capital, Ramp, Modal and AWS.' },
      { label: 'LESSONS', body: 'Zero manual intervention is a promise you can only make if the failure path is louder than the success path.' },
    ],
  },
  {
    id: 'routini',
    name: 'Routini',
    path: 'projects/routini/README.md',
    link: 'https://github.com/trinayhari/routini',
    subtitle: 'Developer tool for intelligent LLM model routing',
    role: 'Builder',
    status: 'Open source',
    period: '2025',
    stack: ['Python', 'Streamlit', 'OpenRouter', 'SHA-256'],
    desc: 'A developer tool that routes each prompt to the right model — cheap where cheap is enough, strong where it matters.',
    tags: ['Python', 'Streamlit', 'OpenRouter'],
    keywords: ['routini', 'llm', 'routing', 'model', 'openrouter', 'cost', 'cache', 'hash', 'developer tool', 'ai', 'performance', 'latency'],
    sections: [
      { label: 'PROBLEM', body: 'Sending every prompt to the strongest available model is the most expensive way to be roughly correct.' },
      { label: 'WHAT I BUILT', body: 'A router over providers like OpenRouter that picks a model per prompt, shows its rationale, and gives developers toggles to override it.' },
      { label: 'ARCHITECTURE', body: 'Prompts are hashed with SHA-256 so identical work is never paid for twice; the cache sits in front of routing, which means the cheapest call is the one that never happens.' },
      { label: 'INTERESTING ENGINEERING', body: 'Making the routing decision legible. The UI shows the comparison and the reasoning side by side in real time, so the tool teaches you its policy instead of hiding it.' },
      { label: 'CURRENT STATUS', body: 'Open source on GitHub.' },
      { label: 'LESSONS', body: 'Cost and latency are the same optimization wearing different hats.' },
    ],
  },
];

export const EXPERIENCE: Experience[] = [
  {
    id: 'channelflex',
    path: 'experience/channelflex.md',
    title: 'Founding Engineer',
    company: 'ChannelFlex',
    period: 'APR 2026 — JUN 2026',
    desc: 'Built AI-powered quoting and procurement workflows for building material distributors at ChannelFlex, a Fractal Software-backed company, working directly with production customers.',
    tags: ['AI workflows', 'Backend', 'Evals', 'Integrations'],
    keywords: ['channelflex', 'fractal', 'founding', 'engineer', 'quoting', 'procurement', 'distributors', 'construction', 'ai', 'evals', 'evaluation', 'prompt engineering', 'fine-tuning', 'benchmarking', 'startup', 'backend', 'new york', 'recent', 'latest'],
    bullets: [
      'Built AI-powered quoting and procurement workflows for building material distributors, partnering directly with production customers to translate operational workflows into deployed software',
      'Owned customer integrations, backend services and AI-driven quoting pipelines, shipping fast and iterating on production deployments from customer feedback',
      'Developed AI evaluation frameworks and automated testing suites, improving model accuracy through prompt engineering, fine-tuning and systematic benchmarking of production AI systems',
    ],
  },
  {
    id: 'aws',
    path: 'experience/aws-lambda.md',
    title: 'Software Development Engineering Intern',
    company: 'Amazon Web Services',
    period: 'MAY 2025 — AUG 2025',
    desc: 'Built a global monitoring dashboard for 1B+ AWS Lambda invocations a month, detecting recursive loops and preventing runaway workloads that saved customers $100K+.',
    tags: ['Lambda', 'Redshift', 'Glue', 'Athena', 'QuickSight', 'CDK'],
    keywords: ['aws', 'lambda', 'amazon', 'redshift', 'glue', 'athena', 'quicksight', 'cdk', 'etl', 'pipeline', 'infrastructure', 'distributed', 'cloud', 'data', 'difficult', 'best', 'internship', 'scale', 'seattle'],
    bullets: [
      'Built a global monitoring dashboard for 1B+ Lambda invocations/month, detecting recursive loops and preventing runaway workloads that saved customers $100K+',
      'Engineered ETL pipelines with Lambda, Glue and Athena to process terabytes of Redshift data daily and deliver real-time usage insights in QuickSight',
      'Automated infrastructure with AWS CDK and CI/CD, cutting deployment time by 80% and making environments reproducible',
    ],
  },
  {
    id: 'travelers',
    path: 'experience/travelers-xml.md',
    title: 'Software Engineering Intern',
    company: 'Travelers Insurance',
    period: 'MAY 2024 — AUG 2024',
    desc: 'Enhanced an XML Utility Tool used by 200+ underwriters, cutting query time by 30% with an S3 and DynamoDB integration.',
    tags: ['S3', 'DynamoDB', 'Lambda', 'Jenkins', 'Databricks'],
    keywords: ['travelers', 'insurance', 'xml', 'dynamodb', 's3', 'jenkins', 'databricks', 'etl', 'internship', 'backend', 'hartford'],
    bullets: [
      'Enhanced the XML Utility Tool for 200+ underwriters, streamlining retrieval and parsing and cutting query time by 30% with S3 + DynamoDB',
      'Built Lambda automation for DynamoDB updates, reducing manual table maintenance by 80% and processing 1K+ records/day',
      'Built Databricks ETL pipelines to ingest and transform 100K+ XML messages/week into S3 for scalable analytics',
    ],
  },
  {
    id: 'paybridge',
    path: 'experience/paybridge.md',
    title: 'Founder',
    company: 'PayBridge Technologies LLC',
    period: 'APRIL 2022 — PRESENT',
    desc: 'A FinTech startup enabling cross-platform payments between platforms like PayPal and Venmo, with the API automation and backend infrastructure underneath it.',
    tags: ['PayPal API', 'Twilio', 'Discord API', 'Backend'],
    keywords: ['paybridge', 'fintech', 'payments', 'startup', 'founder', 'venmo', 'paypal', 'api', 'backend', 'vc', 'business', 'distributed'],
    bullets: [
      'Transactions clearing 10x faster, with a positive P&L',
      'Pitched VCs nationwide and secured funding',
      'Integrated Slack for internal ops and project management',
    ],
  },
];

export const SKILLS: KV[] = [
  { k: 'Languages', v: 'Java · Python · C/C++ · SQL · JavaScript · TypeScript · HTML/CSS' },
  { k: 'Frameworks', v: 'React · Next.js · FastAPI · Flask · NumPy · Pandas · TensorFlow · Scikit-learn · Bootstrap' },
  { k: 'Cloud & distributed', v: 'AWS (Lambda · Glue · Athena · Redshift · DynamoDB · S3 · CDK) · Modal · Docker' },
  { k: 'Databases', v: 'PostgreSQL · MySQL · SQLite · MongoDB · DynamoDB · Redshift · BigQuery · Snowflake · Redis' },
  { k: 'Developer tools', v: 'Git · GitHub · Jenkins · VS Code · Cursor · Claude Code · Bolt · Windsurf · Cline · Xcode' },
];

export type Leadership = { title: string; org: string; period: string; bullets: string[] };

export const LEADERSHIP: Leadership[] = [
  {
    title: 'Director of Genesis',
    org: 'Startup Exchange GT',
    period: 'MAY 2024 — MAY 2026',
    bullets: [
      'Designed and led a program teaching student builders ideation, rapid prototyping and shipping with AI tools, encouraging public building on X',
      'Mentored 100+ students taking ideas from 0→1 in a 5-week program, and connected founders with VCs for mentorship and fundraising',
    ],
  },
  {
    title: 'Teaching Assistant — Ethics in Computing',
    org: 'Georgia Institute of Technology',
    period: 'AUG 2025 — MAY 2026',
    bullets: [
      'Assisted in teaching a 200+ student course on ethics, professionalism and computing’s societal impact',
      'Led weekly discussions, graded assignments and mentored students on professional ethics, privacy and intellectual property',
    ],
  },
];

export type TreeNode = { name: string; d: number; cmd: string; dir?: boolean };

export const TREE: TreeNode[] = [
  { name: '/', d: 0, cmd: 'ls', dir: true },
  { name: 'about.md', d: 1, cmd: 'cat about.md' },
  { name: 'currently-building.md', d: 1, cmd: '/current' },
  { name: 'experience/', d: 1, cmd: '/experience', dir: true },
  { name: 'channelflex.md', d: 2, cmd: 'open channelflex' },
  { name: 'aws-lambda.md', d: 2, cmd: 'open aws' },
  { name: 'travelers-xml.md', d: 2, cmd: 'open travelers' },
  { name: 'paybridge.md', d: 2, cmd: 'open paybridge' },
  { name: 'projects/', d: 1, cmd: '/projects', dir: true },
  { name: 'slait/', d: 2, cmd: 'open slait', dir: true },
  { name: 'proq/', d: 2, cmd: 'open proq', dir: true },
  { name: 'echoboard/', d: 2, cmd: 'open echoboard', dir: true },
  { name: 'sailo/', d: 2, cmd: 'open sailo', dir: true },
  { name: 'routini/', d: 2, cmd: 'open routini', dir: true },
  { name: 'leadership.md', d: 1, cmd: '/leadership' },
  { name: 'resume.pdf', d: 1, cmd: '/resume' },
  { name: 'contact.md', d: 1, cmd: '/contact' },
];

export type CommandDef = { cmd: string; hint: string };

export const COMMANDS: CommandDef[] = [
  { cmd: '/about', hint: 'who I am' },
  { cmd: '/projects', hint: 'things I have built' },
  { cmd: '/experience', hint: 'where I have worked' },
  { cmd: '/current', hint: 'what I am building now' },
  { cmd: '/resume', hint: 'the whole résumé, inline' },
  { cmd: '/skills', hint: 'languages, cloud, data' },
  { cmd: '/leadership', hint: 'Startup Exchange, TA work' },
  { cmd: '/education', hint: 'Georgia Tech' },
  { cmd: '/contact', hint: 'email, GitHub, LinkedIn' },
  { cmd: '/help', hint: 'everything this terminal knows' },
  { cmd: '/clear', hint: 'clear the history' },
  { cmd: 'ls', hint: 'list the filesystem' },
  { cmd: 'open proq', hint: 'open a project' },
  { cmd: 'cat about.md', hint: 'read a file' },
  { cmd: 'whoami', hint: 'one-line answer' },
  { cmd: 'git status', hint: 'what is in flight' },
  { cmd: 'git log', hint: 'recent commits' },
  { cmd: 'history', hint: 'commands you have run' },
  { cmd: 'pwd', hint: 'where you are' },
];

export type PaletteItem = { label: string; hint: string; cmd: string; icon: string; kind?: 'ask' };

export const PALETTE: PaletteItem[] = [
  { label: 'Search my work', hint: 'ask a question in plain English', cmd: '?', icon: '⌕', kind: 'ask' },
  { label: 'View projects', hint: 'Slait, Proq, EchoBoard, Sailo, Routini', cmd: '/projects', icon: '▤' },
  { label: 'View experience', hint: 'ChannelFlex, AWS, Travelers, PayBridge', cmd: '/experience', icon: '▤' },
  { label: 'Open résumé', hint: 'rendered inline, PDF alongside', cmd: '/resume', icon: '◫' },
  { label: 'What am I building now?', hint: 'currently-building.md', cmd: '/current', icon: '◆' },
  { label: 'Contact me', hint: 'email · GitHub · LinkedIn', cmd: '/contact', icon: '✉' },
  { label: 'Show the filesystem', hint: 'everything this terminal indexes', cmd: 'ls', icon: '▸' },
  { label: 'Go home', hint: 'clear the session', cmd: '/clear', icon: '⌂' },
];

/** Résumé PDF served from public/ — wired to the “⤓ Download the PDF” action. */
export const RESUME_PDF = '/Trinayaan-Hariharan-Resume.pdf';

/** Headshot served from public/, shown in the header. */
export const AVATAR = '/profileprof.jpeg';
