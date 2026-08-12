import { COMMANDS, EXPERIENCE, LEADERSHIP, PROJECTS, SKILLS } from './data';
import { ENTITIES } from './nlp/corpus';
import { nearest } from './nlp/fuzzy';
import { INTENTS } from './nlp/intents';
import { route } from './nlp/router';
import type { Answer, Block, Experience, ListItem, PreLine, Project } from './types';

export type ResolveContext = { cmdHistory: string[] };

const P = (id: string) => PROJECTS.find((p) => p.id === id) as Project;
const E = (id: string) => EXPERIENCE.find((x) => x.id === id) as Experience;
const T = (...l: string[]) => l;
const links = (...a: { label: string; cmd: string }[]): Block => ({ t: 'links', actions: a });

function expAnswer(x: Experience, deep?: boolean): Answer {
  return {
    tools: ['Searching experience…', 'Read(' + x.path + ')', 'Found relevant experience'],
    blocks: [
      {
        t: 'text',
        paras: deep
          ? [
              'That was the summer of 2025, on an internal tooling team at AWS.',
              x.desc + ' The interesting constraint was that this had to work across the whole fleet, which rules out anything that looks like scanning raw invocation data.',
              'So it became a pipeline problem: extract from Redshift through the Data API with Lambda, analyse with Glue and Athena, surface it in QuickSight — and define the entire stack in CDK so it deploys through CI/CD instead of a console.',
            ]
          : [x.desc],
      },
      {
        t: 'card',
        project: {
          name: x.company,
          path: x.path,
          subtitle: x.title,
          status: x.period.includes('PRESENT') ? 'Ongoing' : 'Completed',
          meta: [
            { k: 'ROLE', v: x.title },
            { k: 'PERIOD', v: x.period },
          ],
          stack: x.tags,
          sections: x.bullets.map((b, i) => ({ label: ['WHAT I DID', 'AND', 'AND'][i] || 'AND', body: b })),
        },
      },
      {
        t: 'links',
        actions: [
          { label: 'All experience', cmd: '/experience' },
          { label: 'Résumé', cmd: '/resume' },
        ],
      },
    ],
  };
}

function notFound(s: string): Answer {
  return {
    tools: ['Searching index…', 'No confident match'],
    blocks: [
      { t: 'text', paras: ['I don’t have a good answer for “' + s + '” — this terminal only knows what I’ve actually built, and I’d rather say so than invent something.'] },
      { t: 'note', text: 'Try a topic (aws, distributed systems, ai, startups) or one of the commands below. /help lists everything.' },
      {
        t: 'links',
        actions: [
          { label: '/help', cmd: '/help' },
          { label: '/projects', cmd: '/projects' },
          { label: '/about', cmd: '/about' },
          { label: 'Email me instead', cmd: '/contact' },
        ],
      },
    ],
  };
}

function resolveCommand(q: string, ctx: ResolveContext): Answer {
  const s = q.trim();
  const low = s.toLowerCase();
  const bare = low.replace(/^\//, '').replace(/[?.!]+$/, '').trim();

  if (/^(about|whoami|who are you|who is trinayaan|cat about\.md)$/.test(bare) || bare === 'about.md')
    return {
      tools: T('Read(about.md)'),
      blocks: [
        {
          t: 'text',
          paras: [
            'I’m Trinayaan — computer science at Georgia Tech, class of 2026, and a founder since 2022. Most of what I enjoy sits underneath the product: pipelines, schemas, evaluation, the unglamorous reliable parts that let the interesting parts exist.',
            'I was a founding engineer at ChannelFlex, a Fractal Software company, building AI quoting and procurement workflows with production customers in the room. Before that: AWS, where I built a monitoring dashboard over 1B+ Lambda invocations a month, and Travelers, where I shipped a tool 200+ underwriters opened every morning. PayBridge, a payments startup, has been running underneath all of it since my first year.',
            'Now it’s Slait — slait.dev — an AI platform that evaluates how engineers actually work with coding agents. Almost everything I build is AI-native: software where the model does the work rather than decorating it.',
          ],
        },
        {
          t: 'grid',
          cells: [
            { k: 'BASED', v: 'Atlanta, GA' },
            { k: 'STUDYING', v: 'B.S. Computer Science, Georgia Tech (2026)' },
            { k: 'FOCUS', v: 'Backend · data infrastructure · applied AI and evals' },
            { k: 'STATUS', v: 'Building Slait · open to new-grad and founding roles' },
          ],
        },
        links({ label: 'What am I building?', cmd: '/current' }, { label: 'See the projects', cmd: '/projects' }, { label: 'Where I’ve worked', cmd: '/experience' }),
      ],
    };

  if (/^(current|currently|currently-building\.md|now)$/.test(bare) || /building (right )?now|what are you building|working on/.test(low))
    return {
      tools: T('Read(currently-building.md)', 'Read(projects/slait/README.md)', 'Read(projects/proq/README.md)'),
      blocks: [
        {
          t: 'text',
          paras: [
            'Slait has most of my nights. It’s live at slait.dev: an AI platform that reads Cursor and Claude Code conversations and tells engineers how well they’re actually working with the agent — 100+ active users and a first enterprise customer so far.',
            'Proq is the other one, an AI-native operating system for construction, still early enough that I’d rather show it than describe it.',
            'Both are the same bet in different clothes: the interesting product surface right now is the one where a model is doing real work inside a real workflow, not sitting in a chat box beside it.',
          ],
        },
        { t: 'note', text: '⌥  proq is still a placeholder entry — the copy under it is scaffolding to replace.' },
        {
          t: 'list',
          items: [P('slait'), P('proq')].map((p) => ({ title: p.name, meta: p.status, desc: p.desc, tags: p.stack.slice(0, 3), action: 'open →', cmd: 'open ' + p.id })),
        },
        links({ label: 'Open Slait', cmd: 'open slait' }, { label: 'Everything else I’ve built', cmd: '/projects' }),
      ],
    };

  if (/^(projects|ls projects|cd projects|project)$/.test(bare))
    return {
      tools: T('List(projects/)', 'Read(projects/*/README.md)'),
      blocks: [
        { t: 'text', paras: ['Five worth showing. Slait is the one I’m building now and the one I’d point at first; Proq is early; the rest are shipped. Open any of them for the full write-up.'] },
        {
          t: 'list',
          items: PROJECTS.map((p) => ({ title: p.name + (p.draft ? '  ·  draft' : ''), meta: p.period, desc: p.desc, tags: p.stack.slice(0, 4), action: 'open →', cmd: 'open ' + p.id })),
        },
        links({ label: 'The hardest one', cmd: 'what is the hardest system you have built?' }, { label: 'Work history', cmd: '/experience' }, { label: 'Résumé', cmd: '/resume' }),
      ],
    };

  if (/^(experience|work|jobs|ls experience|cd experience)$/.test(bare))
    return {
      tools: T('List(experience/)', 'Read(experience/channelflex.md)', 'Read(experience/aws-lambda.md)', 'Read(experience/travelers-xml.md)', 'Read(experience/paybridge.md)'),
      blocks: [
        { t: 'text', paras: ['Four roles: a founding-engineer seat at a Fractal Software company, two internships, and one company of my own that has been running the whole time underneath them.'] },
        {
          t: 'list',
          items: EXPERIENCE.map((x) => ({ title: x.title + '  ·  ' + x.company, meta: x.period, desc: x.desc, tags: x.tags, action: 'open →', cmd: 'open ' + x.id })),
        },
        links({ label: 'Tell me about ChannelFlex', cmd: 'open channelflex' }, { label: 'Tell me about the AWS work', cmd: 'tell me about your AWS work' }, { label: 'Résumé', cmd: '/resume' }),
      ],
    };

  const openMatch = low.match(/^(?:open|cat|cd|show|read)\s+(.+)$/);
  if (openMatch) {
    const key = openMatch[1]
      .replace(/\.(md|pdf)$/, '')
      .replace(/\/$/, '')
      .replace(/^projects?\//, '')
      .replace(/^experience\//, '')
      .trim();
    if (key === 'about') return resolveCommand('/about', ctx);
    if (key === 'resume') return resolveCommand('/resume', ctx);
    if (key === 'contact') return resolveCommand('/contact', ctx);
    if (key === 'projects') return resolveCommand('/projects', ctx);
    if (key === 'experience') return resolveCommand('/experience', ctx);
    const p = PROJECTS.find((x) => x.id === key || x.name.toLowerCase() === key);
    if (p)
      return {
        tools: T('Read(' + p.path + ')', p.draft ? 'Warn(draft: placeholder content)' : 'Read(' + p.path.replace('README.md', 'architecture.md') + ')'),
        blocks: [{ t: 'card', project: p }, links({ label: 'Back to projects', cmd: '/projects' }, { label: 'How I work', cmd: '/about' })],
      };
    const x = EXPERIENCE.find((v) => v.id === key || v.company.toLowerCase().includes(key));
    if (x) return expAnswer(x);
    /* "open echobord" should still open EchoBoard */
    const guess = resolveEntityName(key);
    if (guess) return resolveCommand('open ' + guess, ctx);
    return notFound(s);
  }

  if (/^(resume|résumé|cv|resume\.pdf)$/.test(bare))
    return {
      tools: T('Read(resume.pdf)', 'Render(inline)'),
      blocks: [
        { t: 'text', paras: ['Rendered inline so you don’t have to leave. The PDF is one click away if you’d rather have the paper version.'] },
        {
          t: 'defs',
          rows: [
            { k: 'Education', v: 'Georgia Institute of Technology — B.S. Computer Science, May 2026 · GPA 3.64' },
            { k: 'ChannelFlex', v: 'Founding Engineer, Apr–Jun 2026 — AI quoting and procurement workflows for building material distributors; backed by Fractal Software' },
            { k: 'AWS', v: 'SDE Intern, May–Aug 2025 — monitoring dashboard for 1B+ Lambda invocations/month, $100K+ in prevented runaway workloads, Redshift → Glue → Athena → QuickSight on CDK' },
            { k: 'Travelers', v: 'SWE Intern, May–Aug 2024 — XML Utility Tool for 200+ underwriters, 30% faster queries, Lambda + DynamoDB automation, Databricks ETL' },
            { k: 'PayBridge', v: 'Founder, 2022–present — cross-platform payments, 10x faster clearing, positive P&L, VC-funded' },
            { k: 'Projects', v: 'Slait · Proq · Sailo · EchoBoard · Routini' },
            { k: 'Certifications', v: 'AWS Certified Cloud Practitioner (CLF-02)' },
            { k: 'Leadership', v: 'Director of Genesis, Startup Exchange GT · TA for Ethics in Computing (200+ students)' },
            { k: 'Coursework', v: 'Algorithms · Artificial Intelligence · Machine Learning · Data Structures & Algorithms · Object Oriented Programming · Database Systems · UI Design · Computer Architecture' },
            { k: 'Contact', v: 'trinayhari@gmail.com · github.com/trinayhari · linkedin.com/in/trinayaan-hariharan' },
          ],
        },
        links({ label: '⤓ Download the PDF', cmd: '#download' }, { label: 'Skills in detail', cmd: '/skills' }, { label: 'Contact me', cmd: '/contact' }),
      ],
    };

  if (/^(skills|stack|tech)$/.test(bare))
    return {
      tools: T('Read(about.md#skills)'),
      blocks: [
        { t: 'text', paras: ['Roughly in order of how much I’d want to be judged on them.'] },
        { t: 'defs', rows: SKILLS },
        links({ label: 'Where I used them', cmd: '/experience' }, { label: 'Projects', cmd: '/projects' }),
      ],
    };

  if (/^(education|school|gt|georgia tech)$/.test(bare) || /gpa|studying|college|university|major/.test(low))
    return {
      tools: T('Read(about.md#education)'),
      blocks: [
        { t: 'text', paras: ['B.S. in Computer Science at Georgia Tech, graduating May 2026, at a 3.64.'] },
        {
          t: 'grid',
          cells: [
            { k: 'DEGREE', v: 'B.S. Computer Science' },
            { k: 'GRADUATING', v: 'May 2026' },
            { k: 'GPA', v: '3.64 / 4.0' },
            { k: 'ORGS', v: 'Startup Exchange · AI@GT · Trading Club · South Indian Association' },
          ],
        },
        { t: 'note', text: 'Coursework: Algorithms · Artificial Intelligence · Machine Learning · Data Structures & Algorithms · Object Oriented Programming · Database Systems · User Interface Design · Computer Architecture' },
        links({ label: 'Leadership', cmd: '/leadership' }, { label: 'Résumé', cmd: '/resume' }, { label: 'Experience', cmd: '/experience' }),
      ],
    };

  if (/^(leadership|teaching|ta|startup exchange|genesis|leadership\.md)$/.test(bare) || /mentor|taught|teaching assistant/.test(low))
    return {
      tools: T('Read(leadership.md)'),
      blocks: [
        { t: 'text', paras: ['Two things outside the job: a program at Startup Exchange that gets students shipping, and a course on the ethics of the thing we are all building.'] },
        {
          t: 'defs',
          rows: LEADERSHIP.flatMap((l) => [{ k: l.title, v: l.org + ' · ' + l.period }, ...l.bullets.map((b) => ({ k: '', v: b }))]),
        },
        links({ label: 'Education', cmd: '/education' }, { label: 'Résumé', cmd: '/resume' }),
      ],
    };

  if (/^(contact|email|hire|contact\.md)$/.test(bare) || /get in touch|reach you|hiring|available/.test(low))
    return {
      tools: T('Read(contact.md)'),
      blocks: [
        { t: 'text', paras: ['Email is the fastest way to reach me — I answer everything that isn’t a template.'] },
        {
          t: 'grid',
          cells: [
            { k: 'EMAIL', v: 'trinayhari@gmail.com' },
            { k: 'GITHUB', v: 'github.com/trinayhari' },
            { k: 'LINKEDIN', v: 'in/trinayaan-hariharan' },
            { k: 'OPEN TO', v: 'New-grad and founding-engineer roles · anything infrastructure, evals or AI-native' },
          ],
        },
        links({ label: 'Résumé', cmd: '/resume' }, { label: 'What I’m building', cmd: '/current' }),
      ],
    };

  if (/^(help|\?|commands)$/.test(bare))
    return {
      tools: [],
      blocks: [
        { t: 'text', paras: ['You never have to memorize any of this — every command below is also a button somewhere, and plain English works just as well.'] },
        { t: 'defs', rows: COMMANDS.map((c) => ({ k: c.cmd, v: c.hint })) },
        { t: 'note', text: '⌘K opens the command palette · ↑ ↓ walk your history · ↹ completes · ESC clears the line' },
        links({ label: 'Start with /about', cmd: '/about' }, { label: 'Or just ask a question', cmd: 'what is the hardest system you have built?' }),
      ],
    };

  if (/^(ls|ls \/|tree|dir)$/.test(bare))
    return {
      tools: T('List(/)'),
      blocks: [
        {
          t: 'pre',
          caption: 'FILESYSTEM',
          lines: [
            { text: '/', tone: 'dir' },
            { text: '├── about.md' },
            { text: '├── currently-building.md' },
            { text: '├── experience/', tone: 'dir' },
            { text: '│   ├── channelflex.md' },
            { text: '│   ├── aws-lambda.md' },
            { text: '│   ├── travelers-xml.md' },
            { text: '│   └── paybridge.md' },
            { text: '├── projects/', tone: 'dir' },
            { text: '│   ├── slait/       ← building · live' },
            { text: '│   ├── proq/        ← draft' },
            { text: '│   ├── echoboard/' },
            { text: '│   ├── sailo/' },
            { text: '│   └── routini/' },
            { text: '├── leadership.md' },
            { text: '├── resume.pdf' },
            { text: '└── contact.md' },
          ],
        },
        links({ label: 'Open projects', cmd: '/projects' }, { label: 'Read about.md', cmd: 'cat about.md' }),
      ],
    };

  if (/^pwd$/.test(bare))
    return { tools: [], blocks: [{ t: 'pre', lines: [{ text: '/home/trinayaan/work' }, { text: 'you are exactly where you should be.', tone: 'dim' }] }] };

  if (/^history$/.test(bare))
    return {
      tools: [],
      blocks: [
        {
          t: 'pre',
          caption: 'SESSION',
          lines: (ctx.cmdHistory
            .slice()
            .reverse()
            .map((h, i) => ({ text: String(i + 1).padStart(3, ' ') + '  ' + h })) as PreLine[])
            .concat([{ text: '  ' }, { text: 'nothing here is logged anywhere else.', tone: 'dim' }]),
        },
      ],
    };

  if (/^git log$/.test(bare))
    return {
      tools: T('Exec(git log --oneline -5)'),
      blocks: [
        {
          t: 'pre',
          caption: 'GIT LOG',
          lines: [
            { text: '8eb5687  (HEAD → main)  slait: make the scorer reproducible before accurate', tone: 'accent' },
            { text: 'c41f0a2  sailo: validate generated pipelines against live schema' },
            { text: '7d9e310  routini: hash prompts before routing, not after' },
            { text: '2b0c8f5  echoboard: make partial analysis results useful' },
            { text: 'aa17e4c  init' },
            { text: '  ' },
            { text: 'five commits is a tidy fiction. the real log is much less flattering.', tone: 'dim' },
          ],
        },
      ],
    };

  if (/^git status$/.test(bare))
    return {
      tools: T('Exec(git status)'),
      blocks: [
        {
          t: 'pre',
          caption: 'GIT STATUS',
          lines: [
            { text: 'On branch main' },
            { text: "Your branch is ahead of 'origin/main' by 2 commits." },
            { text: '  ' },
            { text: 'Currently building:' },
            { text: '  modified:   projects/slait', tone: 'accent' },
            { text: '  modified:   ideas/new-project', tone: 'accent' },
            { text: '  ' },
            { text: 'nothing is ever really finished.', tone: 'dim' },
          ],
        },
      ],
    };

  if (/^sudo/.test(low))
    return { tools: [], blocks: [{ t: 'pre', lines: [{ text: 'trinayaan is not in the sudoers file.' }, { text: 'this incident will be remembered fondly.', tone: 'dim' }] }] };

  if (/^(rm -rf|rm -rf \/)/.test(low)) return { tools: [], blocks: [{ t: 'pre', lines: [{ text: 'permission denied — I need this portfolio.' }] }] };

  /* scripted natural-language answers */
  if (/channelflex|fractal|quoting|procurement|founding engineer/.test(low)) return expAnswer(E('channelflex'));
  if (/aws|lambda|amazon|redshift|quicksight|cdk/.test(low)) return expAnswer(E('aws'), true);
  if (/travelers|insurance|xml/.test(low)) return expAnswer(E('travelers'));
  if (/paybridge|payment|fintech|venmo|paypal/.test(low)) return expAnswer(E('paybridge'));

  if (/hardest|most difficult|technically difficult|best engineering|proudest|toughest/.test(low))
    return {
      tools: T('Searching projects…', 'Read(projects/slait/README.md)', 'Read(experience/aws-lambda.md)', 'Ranked 3 candidates by difficulty'),
      blocks: [
        {
          t: 'text',
          paras: [
            'Slait — slait.dev. Not because the stack is exotic, but because the thing it measures had no agreed definition before I started measuring it.',
            'Slait reads Cursor and Claude Code conversations and tells a developer how well they actually worked with the agent. The hard part is that "well" is not a number anyone had defined. An LLM asked to judge the same session twice will disagree with itself; a classifier trained on outcomes cannot read intent. So the scoring is deliberately mixed — LLM judgments, embeddings and logistic regression under one custom framework — and most of the engineering went into making the measurement reproducible before making it accurate.',
            'The rest was making it survive real use: FastAPI over Postgres, Redis in front of the expensive paths, Docker on AWS, and an evaluation pipeline that runs asynchronously so ingesting a long session never blocks anything. 100+ active users and a first enterprise customer later, the failure-mode detection is the part people actually come back for.',
          ],
        },
        {
          t: 'pre',
          caption: 'EVALUATION PIPELINE',
          lines: [
            { text: '  session ──▶ parse ──▶ embed ──┐' },
            { text: '                                │' },
            { text: '            LLM judge ──────────┼──▶ scoring ──▶ feedback', tone: 'accent' },
            { text: '            classifier ─────────┘' },
            { text: '  ' },
            { text: '  reproducible first, accurate second.', tone: 'dim' },
          ],
        },
        links({ label: 'Full Slait write-up', cmd: 'open slait' }, { label: 'The AWS one — hardest at scale', cmd: 'open aws' }, { label: 'All projects', cmd: '/projects' }),
      ],
    };

  if (/distributed|scale|infrastructure|systems|backend/.test(low)) {
    const hits = [E('aws'), P('sailo'), E('paybridge')] as const;
    return {
      tools: T('Searching experience…', 'Read(experience/aws-lambda.md)', 'Read(projects/sailo/README.md)', 'Read(experience/paybridge.md)', 'Found 3 relevant pieces of work'),
      blocks: [
        { t: 'text', paras: ['Three, and they line up neatly: one at fleet scale inside AWS, one that generates the pipelines itself, and one where the distributed part was other people’s payment APIs and none of them agreed on anything.'] },
        {
          t: 'list',
          items: [
            { title: 'AWS — Lambda invocation monitoring', meta: '2025', desc: hits[0].desc, tags: hits[0].tags, action: 'open →', cmd: 'open aws' },
            { title: 'Sailo — AI ETL agent', meta: '2025', desc: hits[1].desc, tags: hits[1].stack.slice(0, 4), action: 'open →', cmd: 'open sailo' },
            { title: 'PayBridge — cross-platform payments', meta: '2022 →', desc: hits[2].desc, tags: hits[2].tags, action: 'open →', cmd: 'open paybridge' },
          ],
        },
        links({ label: 'The hardest of the three', cmd: 'what is the hardest system you have built?' }, { label: 'All projects', cmd: '/projects' }),
      ],
    };
  }

  if (/\b(ai|llm|model|agent|ml|machine learning|openai|eval|evals)\b/.test(low)) {
    const ids = ['slait', 'sailo', 'routini', 'echoboard'];
    return {
      tools: T('Searching projects…', ...ids.map((i) => 'Read(projects/' + i + '/README.md)'), 'Found 4 relevant pieces of work'),
      blocks: [
        { t: 'text', paras: ['Almost everything I build now has a model in the loop. Four examples, each taking a different piece of the same problem — Slait evaluates how engineers work with agents, Sailo writes data pipelines, Routini decides which model should do the writing, EchoBoard turns unstructured text into something a team can act on.'] },
        {
          t: 'list',
          items: ids.map((i) => {
            const p = P(i);
            return { title: p.name, meta: p.period, desc: p.desc, tags: p.stack.slice(0, 4), action: 'open →', cmd: 'open ' + i };
          }),
        },
        links({ label: 'What I’m building now', cmd: '/current' }, { label: 'All projects', cmd: '/projects' }),
      ],
    };
  }

  if (/startup|founder|company|vc|entrepreneur/.test(low))
    return {
      tools: T('Searching…', 'Read(projects/slait/README.md)', 'Read(experience/channelflex.md)', 'Read(experience/paybridge.md)', 'Found 3 relevant pieces of work'),
      blocks: [
        { t: 'text', paras: ['PayBridge came first — I started it in 2022, built the payment automation and the backend, pitched VCs around the country and got it funded. Then a founding-engineer seat at ChannelFlex, a Fractal Software company. Slait is the current one, and the one I care most about.'] },
        {
          t: 'list',
          items: [
            { title: 'Slait', meta: '2026 →', desc: P('slait').desc, tags: P('slait').stack.slice(0, 3), action: 'open →', cmd: 'open slait' },
            { title: 'ChannelFlex  ·  Founding Engineer', meta: '2026', desc: E('channelflex').desc, tags: E('channelflex').tags, action: 'open →', cmd: 'open channelflex' },
            { title: 'PayBridge Technologies LLC', meta: '2022 →', desc: E('paybridge').desc, tags: E('paybridge').tags, action: 'open →', cmd: 'open paybridge' },
          ],
        },
        links({ label: 'Everything I’ve built', cmd: '/projects' }),
      ],
    };

  /* keyword fallback across the index */
  const tokens = low.split(/[^a-z0-9+#.]+/).filter((t) => t.length > 2);
  const scored: { doc: Project | Experience; score: number }[] = [];
  (PROJECTS as (Project | Experience)[]).concat(EXPERIENCE).forEach((doc) => {
    const hay = (doc.keywords || []).concat([((doc as Project).name || (doc as Experience).company || '').toLowerCase()]);
    let score = 0;
    tokens.forEach((t) => {
      if (hay.some((k) => k.includes(t) || t.includes(k))) score += 1;
    });
    if (score > 0) scored.push({ doc, score });
  });
  scored.sort((a, b) => b.score - a.score);
  if (scored.length) {
    const top = scored.slice(0, 3).map((x) => x.doc);
    return {
      tools: T('Searching index…', ...top.map((d) => 'Read(' + (d.path || 'experience/' + d.id + '.md') + ')'), 'Found ' + top.length + ' relevant piece' + (top.length > 1 ? 's' : '') + ' of work'),
      blocks: [
        { t: 'text', paras: ['Here’s the closest thing I have to an answer — ' + top.length + ' piece' + (top.length > 1 ? 's' : '') + ' of work that touch what you asked about.'] },
        {
          t: 'list',
          items: top.map((d) => ({
            title: (d as Project).name || (d as Experience).title + '  ·  ' + (d as Experience).company,
            meta: d.period || '',
            desc: d.desc,
            tags: ((d as Project).stack || (d as Experience).tags || []).slice(0, 4),
            action: 'open →',
            cmd: 'open ' + d.id,
          })),
        },
        links({ label: 'Ask something else', cmd: '/help' }, { label: 'All projects', cmd: '/projects' }),
      ],
    };
  }

  return notFound(s);
}

/* ── natural-language entry point ─────────────────────────────────────────
   Everything above answers a *command*. Everything below decides which
   command a sentence was asking for. Commands stay exact and instant; only
   free text pays for routing. */

/** Closest project or employer name to a possibly-misspelled string. */
function resolveEntityName(text: string): string | null {
  const names: string[] = [];
  const owner = new Map<string, string>();
  for (const e of ENTITIES) {
    for (const n of e.names) {
      names.push(n);
      owner.set(n, e.id);
    }
  }
  const hit = nearest(text.trim(), names);
  return hit ? owner.get(hit.term) || null : null;
}

/** Anything the visitor typed that is already a command, not a question. */
function isCommand(low: string): boolean {
  if (low.startsWith('/')) return true;
  if (/^(ls|pwd|tree|dir|history|whoami|clear|exit|man|help)\b/.test(low)) return true;
  if (/^(git|sudo|rm|open|cat|cd|read)\b/.test(low)) return true;
  return COMMANDS.some((c) => c.cmd.toLowerCase() === low);
}

/** Turn retrieval hits into the same list block a scripted answer would use. */
function topicAnswer(ids: string[], query: string): Answer {
  const items: ListItem[] = [];
  const tools: string[] = ['Searching index…'];

  for (const id of ids) {
    const p = PROJECTS.find((x) => x.id === id);
    if (p) {
      tools.push('Read(' + p.path + ')');
      items.push({ title: p.name, meta: p.period, desc: p.desc, tags: p.stack.slice(0, 4), action: 'open →', cmd: 'open ' + p.id });
      continue;
    }
    const x = EXPERIENCE.find((v) => v.id === id);
    if (x) {
      tools.push('Read(' + x.path + ')');
      items.push({ title: x.title + '  ·  ' + x.company, meta: x.period, desc: x.desc, tags: x.tags, action: 'open →', cmd: 'open ' + x.id });
      continue;
    }
    if (id.startsWith('leadership')) {
      const l = LEADERSHIP[Number(id.split('-')[1]) || 0];
      if (l) {
        tools.push('Read(leadership.md)');
        items.push({ title: l.title, meta: l.period, desc: l.org + ' — ' + l.bullets[0], tags: [], action: 'open →', cmd: '/leadership' });
      }
    }
  }

  if (!items.length) return notFound(query);
  tools.push('Found ' + items.length + ' relevant piece' + (items.length > 1 ? 's' : '') + ' of work');

  return {
    tools,
    blocks: [
      {
        t: 'text',
        paras: [
          'Nothing I’ve written answers that head-on, but ' +
            (items.length > 1 ? items.length + ' pieces of work touch it' : 'one piece of work touches it') +
            ' — closest first.',
        ],
      },
      { t: 'list', items },
      links({ label: 'Ask something else', cmd: '/help' }, { label: 'All projects', cmd: '/projects' }),
    ],
  };
}

/**
 * The terminal's entry point.
 *
 * A command is answered directly. A sentence is routed first: normalized,
 * spell-repaired, checked for a named project, scored against every known
 * intent, and finally searched against the index of the work. Whatever the
 * router settles on is expressed as a command, so there is exactly one set of
 * answers regardless of how the visitor got there.
 */
export function resolve(q: string, ctx: ResolveContext): Answer {
  const s = q.trim();
  if (!s) return notFound(s);
  if (isCommand(s.toLowerCase())) return resolveCommand(s, ctx);

  const r = route(s);
  let answer: Answer;

  if (r.kind === 'entity' && r.entity) {
    answer = resolveCommand('open ' + r.entity, ctx);
  } else if (r.kind === 'intent' && r.intent) {
    const intent = INTENTS.find((i) => i.id === r.intent);
    answer = intent ? resolveCommand(intent.cmd, ctx) : notFound(s);
  } else if (r.kind === 'topic' && r.docs?.length) {
    answer = topicAnswer(r.docs.map((d) => d.id), s);
  } else {
    answer = notFound(s);
    if (r.suggestions.length) {
      answer.blocks = answer.blocks.map((b) =>
        b.t === 'links' ? { t: 'links', actions: [...r.suggestions, ...b.actions].slice(0, 4) } : b
      );
    }
  }

  /* Say so when the query was repaired — a silent correction is a lie about
     what was asked. */
  if (r.corrected) {
    answer = {
      ...answer,
      blocks: [{ t: 'note', text: '⌥  reading that as “' + r.corrected + '”' }, ...answer.blocks],
    };
  }

  /* When two intents were within a hair of each other, offer the other one. */
  if (r.alternative) {
    answer = {
      ...answer,
      blocks: [...answer.blocks, { t: 'links', actions: [{ label: 'Or: ' + r.alternative.label, cmd: r.alternative.cmd }] }],
    };
  }

  return answer;
}
