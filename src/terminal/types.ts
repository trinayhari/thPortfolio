export type Project = {
  id: string;
  name: string;
  path: string;
  draft?: boolean;
  link?: string;
  subtitle: string;
  role: string;
  status: string;
  period: string;
  stack: string[];
  desc: string;
  tags: string[];
  keywords: string[];
  sections: { label: string; body: string }[];
};

export type Experience = {
  id: string;
  path: string;
  title: string;
  company: string;
  period: string;
  desc: string;
  tags: string[];
  keywords: string[];
  bullets: string[];
};

export type KV = { k: string; v: string };

export type CardProject = {
  name: string;
  path: string;
  subtitle: string;
  status: string;
  role?: string;
  period?: string;
  meta?: KV[];
  stack: string[];
  sections: { label: string; body: string }[];
};

export type ListItem = {
  title: string;
  meta: string;
  desc: string;
  tags: string[];
  action: string;
  cmd: string;
};

export type PreLine = { text: string; tone?: 'accent' | 'dim' | 'dir' };

export type Block =
  | { t: 'text'; paras: string[] }
  | { t: 'note'; text: string }
  | { t: 'pre'; caption?: string; lines: PreLine[] }
  | { t: 'card'; project: CardProject }
  | { t: 'list'; items: ListItem[] }
  | { t: 'grid'; cells: KV[] }
  | { t: 'defs'; rows: KV[] }
  | { t: 'links'; actions: { label: string; cmd: string }[] };

export type Answer = { tools: string[]; blocks: Block[] };

export type Entry = {
  id: number;
  query: string;
  tools: string[];
  toolsShown: number;
  blocks: Block[];
  phase: 'tools' | 'stream' | 'done';
};
