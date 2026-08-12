/**
 * Routing expectations.
 *
 * This is the calibration set for the thresholds in router.ts. Each entry is a
 * query someone might realistically type and where it should land. Change the
 * thresholds and re-run the check; change these when the intended behaviour
 * genuinely changes.
 *
 * `expect` is either an intent id, `entity:<id>`, `topic` (retrieval is fine,
 * any relevant document), or `unknown` (the router should admit defeat).
 */

export type Expectation = { q: string; expect: string; note?: string };

export const QUERIES: Expectation[] = [
  /* plain intents */
  { q: 'who are you', expect: 'about' },
  { q: 'tell me about yourself', expect: 'about' },
  { q: 'where are you based', expect: 'about' },
  { q: 'what are you building', expect: 'current' },
  { q: 'what are you working on these days', expect: 'current' },
  { q: 'show me your projects', expect: 'projects' },
  { q: 'what have you built', expect: 'projects' },
  { q: 'where have you worked', expect: 'experience' },
  { q: 'work history', expect: 'experience' },
  { q: 'have you done any internships', expect: 'experience' },
  { q: 'can i see your resume', expect: 'resume' },
  { q: 'do you have a cv', expect: 'resume' },
  { q: 'what languages do you know', expect: 'skills' },
  { q: 'what is your tech stack', expect: 'skills' },
  { q: 'where did you go to school', expect: 'education' },
  { q: 'what is your gpa', expect: 'education' },
  { q: 'when do you graduate', expect: 'education' },
  { q: 'have you mentored anyone', expect: 'leadership' },
  { q: 'do you teach', expect: 'leadership' },
  { q: 'how can i reach you', expect: 'contact' },
  { q: 'are you looking for a job', expect: 'contact' },
  { q: 'i am a recruiter', expect: 'contact' },
  { q: 'what can i ask you', expect: 'help' },
  { q: 'what can you do', expect: 'help' },

  /* analytical intents */
  { q: 'what is the hardest thing you have built', expect: 'hardest' },
  { q: 'most impressive project', expect: 'hardest' },
  { q: 'what are you proudest of', expect: 'hardest' },
  { q: 'do you have distributed systems experience', expect: 'systems' },
  { q: 'have you worked at scale', expect: 'systems' },
  { q: 'have you worked with llms', expect: 'ai' },
  { q: 'do you build agents', expect: 'ai' },
  { q: 'are you a founder', expect: 'founder' },
  { q: 'have you raised money', expect: 'founder' },

  /* named entities */
  { q: 'tell me about slait', expect: 'entity:slait' },
  { q: 'what did you do at amazon', expect: 'entity:aws' },
  { q: 'aws', expect: 'entity:aws' },
  { q: 'travelers', expect: 'entity:travelers' },
  { q: 'what is echoboard', expect: 'entity:echoboard' },
  { q: 'tell me about channelflex', expect: 'entity:channelflex' },
  { q: 'fractal software', expect: 'entity:channelflex' },
  { q: 'tell me about your experience at amazon', expect: 'entity:aws', note: 'named thing beats the generic list' },

  /* typos and shorthand */
  { q: 'expereince', expect: 'experience' },
  { q: 'what r ur skils', expect: 'skills' },
  { q: 'tell me abt ur projcts', expect: 'projects' },
  { q: 'wat is ur gpa', expect: 'education' },
  { q: 'echobord', expect: 'entity:echoboard' },
  /* heavily misspelled — found live, several typos at once used to sink the
     whole query below the confidence floor */
  { q: 'wat kinda backend systms hav u wrked on', expect: 'systems' },
  { q: 'whats ur strongest enginering wrk', expect: 'hardest' },
  { q: 'hav u dun any internshps', expect: 'experience' },
  { q: 'wher did u go to skool', expect: 'education' },

  /* topic retrieval — no intent, but the index has something */
  { q: 'postgres', expect: 'topic' },
  { q: 'have you used redis', expect: 'topic' },
  { q: 'quicksight', expect: 'topic' },
  { q: 'construction software', expect: 'topic' },

  /* honest failures */
  { q: 'what is the weather', expect: 'unknown' },
  { q: 'write me a poem about ducks', expect: 'unknown' },
  { q: 'asdfghjkl', expect: 'unknown' },
];
