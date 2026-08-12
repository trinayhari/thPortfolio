/**
 * Intent catalogue.
 *
 * Each intent is described by example phrasings rather than a regex. A query is
 * scored against every example and takes the best match, which means adding
 * coverage is a matter of writing another way someone might ask — no pattern
 * surgery, no ordering hazards between competing regexes.
 */

export type IntentId =
  | 'about'
  | 'current'
  | 'projects'
  | 'experience'
  | 'resume'
  | 'skills'
  | 'education'
  | 'leadership'
  | 'contact'
  | 'help'
  | 'hardest'
  | 'systems'
  | 'ai'
  | 'founder'
  | 'filesystem';

export type Intent = {
  id: IntentId;
  /** the command this intent is equivalent to typing */
  cmd: string;
  /** ways a person might ask for it */
  examples: string[];
  /** weight — nudges broad intents below specific ones when both match */
  boost?: number;
};

export const INTENTS: Intent[] = [
  {
    id: 'about',
    cmd: '/about',
    examples: [
      'who are you',
      'tell me about yourself',
      'introduce yourself',
      'what is your background',
      'give me a summary of you',
      'what is your story',
      'who is trinayaan',
      'bio',
      'about you',
      'where are you based',
      'where do you live',
      'what city are you in',
      'what do you focus on',
      'what are you into',
      'what kind of engineer are you',
      'what do you care about',
    ],
  },
  {
    id: 'current',
    cmd: '/current',
    examples: [
      'what are you building',
      'what are you working on',
      'what are you building right now',
      'what are you up to these days',
      'what is your current project',
      'what are you doing now',
      'latest project',
      'most recent work',
      'what is new',
      'what is next for you',
      'what occupies your time',
      'currently building',
    ],
  },
  {
    id: 'projects',
    cmd: '/projects',
    examples: [
      'show me your projects',
      'what have you built',
      'what projects have you done',
      'list your projects',
      'portfolio of work',
      'side projects',
      'what have you shipped',
      'things you have made',
      'show me your work',
      'what is in your portfolio',
      'personal projects',
      'apps you built',
    ],
  },
  {
    id: 'experience',
    cmd: '/experience',
    examples: [
      'where have you worked',
      'what is your work experience',
      'tell me about your jobs',
      'work history',
      'previous employers',
      'what internships have you done',
      'professional experience',
      'career so far',
      'companies you have worked at',
      'employment history',
      'what roles have you had',
      'have you interned anywhere',
    ],
  },
  {
    id: 'resume',
    cmd: '/resume',
    examples: [
      'show me your resume',
      'can i see your cv',
      'download your resume',
      'do you have a resume',
      'resume pdf',
      'send me your cv',
      'full resume',
      'curriculum vitae',
    ],
    boost: 1.05,
  },
  {
    id: 'skills',
    cmd: '/skills',
    examples: [
      'what are your skills',
      'what is your tech stack',
      'what languages do you know',
      'what technologies do you use',
      'are you good at python',
      'do you know react',
      'what frameworks do you use',
      'what tools do you work with',
      'what databases have you used',
      'technical skills',
      'what are you proficient in',
      'do you have cloud experience',
    ],
  },
  {
    id: 'education',
    cmd: '/education',
    examples: [
      'where did you go to school',
      'what is your degree',
      'what did you study',
      'what is your gpa',
      'when do you graduate',
      'are you still in school',
      'what university do you attend',
      'what is your major',
      'what classes have you taken',
      'coursework',
      'academic background',
      'georgia tech',
    ],
  },
  {
    id: 'leadership',
    cmd: '/leadership',
    examples: [
      'what leadership experience do you have',
      'have you mentored anyone',
      'do you teach',
      'are you a teaching assistant',
      'what clubs are you in',
      'community involvement',
      'have you led a team',
      'extracurriculars',
      'startup exchange',
      'volunteer work',
    ],
  },
  {
    id: 'contact',
    cmd: '/contact',
    examples: [
      'how can i contact you',
      'how do i reach you',
      'what is your email',
      'are you looking for a job',
      'are you available for hire',
      'can we get in touch',
      'i want to talk to you',
      'are you open to opportunities',
      'how do i get in touch',
      'can i email you',
      'are you interviewing',
      'i am a recruiter',
      'would you be open to a role',
      'linkedin profile',
    ],
  },
  {
    id: 'help',
    cmd: '/help',
    examples: [
      'help',
      'what can you do',
      'what can i ask you',
      'what commands are there',
      'how does this work',
      'how do i use this',
      'show me the commands',
      'what should i type',
      'options',
      'what is this',
    ],
  },
  {
    id: 'hardest',
    cmd: 'what is the hardest system you have built?',
    examples: [
      'what is the hardest thing you have built',
      'hardest project',
      'most difficult problem you have solved',
      'what was technically challenging',
      'what are you proudest of',
      'best engineering work',
      'show me your strongest work',
      'most impressive project',
      'what is your favorite thing you built',
      'toughest technical challenge',
      'what problem was hard',
      'what was the biggest challenge',
    ],
    boost: 1.1,
  },
  {
    id: 'systems',
    cmd: 'distributed systems and infrastructure',
    examples: [
      'do you have distributed systems experience',
      'have you worked at scale',
      'backend experience',
      'infrastructure work',
      'have you built data pipelines',
      'do you know cloud infrastructure',
      'server side experience',
      'scalability work',
      'what backend systems have you built',
      'devops experience',
      'database work',
    ],
  },
  {
    id: 'ai',
    cmd: 'ai and machine learning work',
    examples: [
      'have you worked with ai',
      'do you have llm experience',
      'machine learning projects',
      'have you built with openai',
      'ai projects',
      'do you build agents',
      'have you done evals',
      'genai experience',
      'what ai work have you done',
      'have you fine tuned a model',
      'do you know prompt engineering',
    ],
  },
  {
    id: 'founder',
    cmd: 'startup and founder work',
    examples: [
      'have you started a company',
      'are you a founder',
      'startup experience',
      'have you raised money',
      'entrepreneurship',
      'have you pitched investors',
      'do you run a business',
      'founding engineer experience',
      'have you been at an early stage startup',
    ],
  },
  {
    id: 'filesystem',
    cmd: 'ls',
    examples: [
      'show me the filesystem',
      'list everything',
      'what is in here',
      'directory listing',
      'show me the tree',
      'what files are there',
      'site map',
    ],
  },
];

export const INTENT_BY_ID = new Map(INTENTS.map((i) => [i.id, i]));
