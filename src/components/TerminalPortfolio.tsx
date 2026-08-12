import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject } from 'react';
import { AVATAR, COMMANDS, EXPERIENCE, PALETTE, PROJECTS, RESUME_PDF, TREE } from '../terminal/data';
import type { CommandDef, PaletteItem } from '../terminal/data';
import { resolve } from '../terminal/resolve';
import type { Block, Entry } from '../terminal/types';
import '../terminal/terminal.css';

type Props = {
  /** Show the filesystem sidebar (desktop only — hidden under 900px regardless). */
  showSidebar?: boolean;
  /** Streaming speed multiplier, 1–24. Higher is faster. */
  streamSpeed?: number;
};

const HERO_COMMANDS = ['/projects', '/experience', '/current', '/resume', '/help'].map((cmd) => ({
  cmd,
  hint: COMMANDS.find((c) => c.cmd === cmd)?.hint || '',
}));
const HERO_PROMPTS = [
  'What are you building?',
  'Show me your best engineering work',
  'Tell me about AWS',
  'What’s the hardest system you’ve built?',
];

const STATUS_LINE = `indexed · ${PROJECTS.length} projects · ${EXPERIENCE.length} roles`;

/** The result line an agent prints back under a settled tool call. */
function toolSub(label: string): string {
  const m = label.match(/^Read\((.+)\)$/);
  if (m) {
    let h = 0;
    for (let i = 0; i < m[1].length; i++) h = (h * 31 + m[1].charCodeAt(i)) % 400;
    return 'read ' + (40 + h) + ' lines';
  }
  if (/^List\(/.test(label)) return 'listed 5 entries';
  if (/^Exec\(/.test(label)) return 'exit 0';
  if (/^Warn\(/.test(label)) return 'placeholder content — not yet written';
  return '';
}

export default function TerminalPortfolio({ showSidebar = false, streamSpeed = 7 }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [suggestIdx, setSuggestIdx] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const streamNodeRef = useRef<HTMLParagraphElement>(null);

  const seqRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  const toolTimer = useRef<number | undefined>(undefined);
  const streamDelay = useRef<number | undefined>(undefined);
  const backstop = useRef<number | undefined>(undefined);
  const rafRef = useRef<number | undefined>(undefined);
  const streamId = useRef<number | null>(null);

  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  const scrollDown = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    /* Stay pinned only when the reader is already near the bottom — scrolling
       back up through an answer should not be fought by the stream. */
    if (el.scrollHeight - el.scrollTop - el.clientHeight > 260) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const clearTimers = useCallback(() => {
    window.clearTimeout(toolTimer.current);
    window.clearTimeout(streamDelay.current);
    window.clearTimeout(backstop.current);
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    streamId.current = null;
  }, []);

  /* Scrolling is deferred to a post-commit effect rather than fired next to
     the state update: the new blocks have to be laid out before the scroll
     height means anything. */
  const wantScroll = useRef<'follow' | 'bottom' | null>(null);
  const wantFocus = useRef(false);

  useEffect(() => {
    if (wantScroll.current) {
      const mode = wantScroll.current;
      wantScroll.current = null;
      if (mode === 'bottom') scrollToBottom();
      else scrollDown();
    }
    if (wantFocus.current) {
      wantFocus.current = false;
      focusInput();
    }
  });

  const patch = useCallback((id: number, fn: (e: Entry) => Entry, scroll = true) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? fn(e) : e)));
    if (scroll) wantScroll.current = wantScroll.current === 'bottom' ? 'bottom' : 'follow';
  }, []);

  /* ── streaming ────────────────────────────────────────── */
  const startStream = useCallback(
    (id: number, blocks: Block[]) => {
      const text = blocks.find((b) => b.t === 'text');
      if (!text || text.t !== 'text') {
        patch(id, (e) => ({ ...e, phase: 'done' }));
        return;
      }
      const full = text.paras.join('\n\n');
      const msPerChar = 15 / (streamSpeed || 7);
      const dur = Math.min(2200, Math.max(450, full.length * msPerChar));
      patch(id, (e) => ({ ...e, phase: 'stream' }), false);

      const finish = () => {
        if (streamId.current !== id) return;
        streamId.current = null;
        if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
        window.clearTimeout(backstop.current);
        patch(id, (e) => ({ ...e, phase: 'done' }));
      };

      streamId.current = id;
      /* Write straight into the DOM node and drive it off the clock rather
         than a tick count: a state update per frame would re-render the whole
         transcript, and a throttled timer would stall long answers. */
      streamDelay.current = window.setTimeout(() => {
        const node = streamNodeRef.current;
        if (!node) {
          finish();
          return;
        }
        const t0 = performance.now();
        let frames = 0;
        const loop = () => {
          if (streamId.current !== id) return;
          const p = Math.min(1, (performance.now() - t0) / dur);
          node.textContent = full.slice(0, Math.round(full.length * p));
          if (++frames % 8 === 0) scrollDown();
          if (p >= 1) finish();
          else rafRef.current = requestAnimationFrame(loop);
        };
        loop();
        backstop.current = window.setTimeout(finish, dur + 500);
      }, 30);
    },
    [patch, scrollDown, streamSpeed]
  );

  const revealTools = useCallback(
    (id: number, tools: string[], blocks: Block[], i: number) => {
      if (i >= tools.length) {
        startStream(id, blocks);
        return;
      }
      patch(id, (e) => ({ ...e, toolsShown: i + 1 }));
      toolTimer.current = window.setTimeout(() => revealTools(id, tools, blocks, i + 1), 170 + Math.random() * 160);
    },
    [patch, startStream]
  );

  /* ── engine ───────────────────────────────────────────── */
  const run = useCallback(
    (raw: string) => {
      const q = String(raw || '').trim();
      if (!q) return;

      if (/^(\/clear|clear)$/i.test(q)) {
        clearTimers();
        historyRef.current = [q, ...historyRef.current].slice(0, 12);
        setEntries([]);
        setCmdHistory(historyRef.current);
        setInput('');
        setPaletteOpen(false);
        setHistIdx(-1);
        wantFocus.current = true;
        return;
      }

      clearTimers();
      const res = resolve(q, { cmdHistory: historyRef.current });
      const id = seqRef.current + 1;
      seqRef.current = id;
      const entry: Entry = { id, query: q, tools: res.tools || [], toolsShown: 0, blocks: res.blocks, phase: 'tools' };

      setEntries((prev) => [
        ...prev.map((x) => (x.phase === 'done' ? x : { ...x, toolsShown: x.tools.length, phase: 'done' as const })),
        entry,
      ]);
      historyRef.current = [q, ...historyRef.current.filter((h) => h !== q)].slice(0, 12);
      setCmdHistory(historyRef.current);
      setInput('');
      setPaletteOpen(false);
      setHistIdx(-1);
      setSuggestIdx(0);

      wantScroll.current = 'bottom';
      wantFocus.current = true;
      revealTools(id, entry.tools, entry.blocks, 0);
    },
    [clearTimers, revealTools]
  );

  /** Turn a command string into a click handler. */
  const mk = useCallback(
    (cmd: string) => () => {
      if (cmd === '#download') window.open(RESUME_PDF, '_blank', 'noopener');
      else run(cmd);
    },
    [run]
  );

  /* ── lifecycle ────────────────────────────────────────── */
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 900);
    onResize();
    window.addEventListener('resize', onResize);
    const t = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => {
          if (!open) {
            setPaletteQuery('');
            setPaletteIdx(0);
            window.setTimeout(() => paletteInputRef.current?.focus(), 20);
          }
          return !open;
        });
      } else if (e.key === 'Escape' && paletteOpen) {
        setPaletteOpen(false);
        window.setTimeout(focusInput, 0);
      } else if (!paletteOpen && e.key === '/' && document.activeElement !== inputRef.current) {
        focusInput();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, focusInput]);

  /* ── input handling ───────────────────────────────────── */
  const suggestions: CommandDef[] = useMemo(() => {
    const v = input.trim().toLowerCase();
    if (!v) return [];
    return COMMANDS.filter(
      (c) => c.cmd.toLowerCase().startsWith(v) || (v.startsWith('/') && c.cmd.startsWith('/') && c.cmd.includes(v.slice(1)))
    ).slice(0, 6);
  }, [input]);

  const paletteResults: PaletteItem[] = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase();
    if (!q) return PALETTE;
    const base: PaletteItem[] = PALETTE.concat(
      PROJECTS.map((p) => ({ label: p.name, hint: p.subtitle, cmd: 'open ' + p.id, icon: '◇' }))
    );
    return base.filter((a) => (a.label + ' ' + a.hint + ' ' + a.cmd).toLowerCase().includes(q)).slice(0, 8);
  }, [paletteQuery]);

  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    const sug = suggestions;
    if (e.key === 'Enter') {
      e.preventDefault();
      const pick = sug[suggestIdx];
      run(sug.length && input.startsWith('/') && pick ? pick.cmd : input);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const pick = sug[suggestIdx] || sug[0];
      if (pick) {
        setInput(pick.cmd);
        setSuggestIdx(0);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (sug.length > 1) {
        setSuggestIdx((i) => Math.max(0, i - 1));
        return;
      }
      const i = Math.min(cmdHistory.length - 1, histIdx + 1);
      if (i >= 0) {
        setHistIdx(i);
        setInput(cmdHistory[i]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (sug.length > 1) {
        setSuggestIdx((i) => Math.min(sug.length - 1, i + 1));
        return;
      }
      const i = histIdx - 1;
      setHistIdx(i);
      setInput(i >= 0 ? cmdHistory[i] : '');
    } else if (e.key === 'Escape') {
      setInput('');
      setSuggestIdx(0);
    }
  };

  const onPaletteKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    const r = paletteResults;
    if (e.key === 'Enter') {
      e.preventDefault();
      const pick = r[paletteIdx];
      if (pick && pick.kind !== 'ask') run(pick.cmd);
      else if (paletteQuery.trim()) run(paletteQuery);
      else if (pick) run(pick.cmd);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPaletteIdx((i) => Math.min(r.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPaletteIdx((i) => Math.max(0, i - 1));
    }
  };

  const openPalette = () => {
    setPaletteOpen(true);
    setPaletteQuery('');
    setPaletteIdx(0);
    window.setTimeout(() => paletteInputRef.current?.focus(), 20);
  };
  const closePalette = () => {
    setPaletteOpen(false);
    window.setTimeout(focusInput, 0);
  };

  const sideVisible = isDesktop && showSidebar;
  const inputHint = suggestions.length ? '↹ complete' : entries.length ? '↑ history · ↵ run' : '↵ run';

  /* ── render ───────────────────────────────────────────── */
  return (
    <div className="tp-root">
      <header className="tp-header">
        <div className="tp-header-left">
          <span className="tp-mark">✳</span>
          <span className="tp-name">Trinayaan Hariharan</span>
          <span className="tp-domain tp-wide-only">trinay.me</span>
          <span className="tp-wide-only">~/work</span>
        </div>
        <div className="tp-header-right">
          <span className="tp-wide-only">{STATUS_LINE}</span>
          <button className="tp-palette-btn" onClick={openPalette} aria-label="Open command palette">
            ⌘K palette
          </button>
        </div>
      </header>

      <div className="tp-body">
        {sideVisible && (
          <aside className="tp-side">
            <div className="tp-side-label">FILESYSTEM</div>
            <div className="tp-side-group">
              {TREE.map((n, i) => (
                <button key={i} className={'tp-tree-item' + (n.dir ? ' tp-dir' : '')} onClick={mk(n.cmd)}>
                  <span className="tp-tree-branch">{'  '.repeat(Math.max(0, n.d - 1)) + (n.d ? '· ' : '')}</span>
                  <span>{n.name}</span>
                </button>
              ))}
            </div>

            <div className="tp-side-label">SUGGESTED</div>
            <div className="tp-side-group tp-stack">
              {COMMANDS.slice(0, 6).map((c) => (
                <button key={c.cmd} className="tp-side-cmd" onClick={mk(c.cmd)}>
                  <span>{c.cmd}</span>
                  <em>{c.hint}</em>
                </button>
              ))}
            </div>

            {cmdHistory.length > 0 && (
              <div>
                <div className="tp-side-label">HISTORY</div>
                <div className="tp-side-group tp-stack">
                  {cmdHistory.slice(0, 5).map((h, i) => (
                    <button key={i} className="tp-history-item" onClick={mk(h)}>
                      {'› ' + h}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}

        <main className="tp-main">
          <div className="tp-scroll" ref={scrollRef}>
            <div className="tp-scroll-inner">
              {entries.length === 0 && (
                <div className="tp-hero">
                  <div className="tp-hero-box">
                    <div className="tp-hero-box-text">
                      <div className="tp-hero-welcome">
                        ✳ Welcome to <b>trinay.me</b>
                      </div>
                      <div className="tp-hero-name">Trinayaan Hariharan</div>
                      <div className="tp-hero-role">Engineer · Founder · Georgia Tech</div>
                      <div className="tp-hero-lede">Backend systems, data infrastructure and AI-native products.</div>
                      <div className="tp-hero-cwd">cwd: /home/trinayaan/work</div>
                    </div>
                    <img className="tp-hero-photo" src={AVATAR} alt="Trinayaan Hariharan" width={96} height={96} />
                  </div>

                  <div className="tp-hero-label">Commands</div>
                  <div className="tp-hero-rows tp-spaced">
                    {HERO_COMMANDS.map((c) => (
                      <button key={c.cmd} className="tp-hero-cmd" onClick={mk(c.cmd)}>
                        <span className="tp-hero-cmd-name">{c.cmd}</span>
                        <span className="tp-hero-cmd-hint">{c.hint}</span>
                      </button>
                    ))}
                  </div>

                  <div className="tp-hero-label">Or ask anything</div>
                  <div className="tp-hero-rows">
                    {HERO_PROMPTS.map((p) => (
                      <button key={p} className="tp-prompt" onClick={mk(p)}>
                        <span className="tp-prompt-caret">&gt;</span>
                        <span className="tp-prompt-text">{p}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {entries.map((e) => (
                <div className="tp-entry" key={e.id}>
                  <div className="tp-query">
                    <span className="tp-query-caret">&gt;</span>
                    <span className="tp-query-text">{e.query}</span>
                  </div>

                  {e.tools.length > 0 && (
                    <div className="tp-tools">
                      {e.tools.slice(0, e.toolsShown).map((label, i) => {
                        const pending = e.phase === 'tools' && i === e.toolsShown - 1;
                        const sub = pending ? '' : toolSub(label);
                        return (
                          <div className={'tp-tool' + (pending ? ' tp-pending' : '')} key={i}>
                            <div className="tp-tool-row">
                              <span className="tp-tool-dot">⏺</span>
                              <span className="tp-tool-label">{label}</span>
                            </div>
                            {sub && <div className="tp-tool-sub">{'⎿  ' + sub}</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {renderBlocks(e, mk, streamNodeRef)}

                  {e.phase === 'stream' && <span className="tp-cursor" />}
                </div>
              ))}
            </div>
          </div>

          <div className="tp-dock">
            {suggestions.length > 0 && (
              <div className="tp-suggest-wrap">
                <div className="tp-suggest">
                  {suggestions.map((s, i) => (
                    <button
                      key={s.cmd}
                      className={'tp-suggest-row' + (i === suggestIdx ? ' tp-active' : '')}
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={mk(s.cmd)}
                    >
                      <span className="tp-suggest-cmd">{s.cmd}</span>
                      <span className="tp-suggest-hint">{s.hint}</span>
                    </button>
                  ))}
                  <div className="tp-suggest-foot">↹ complete · ↑↓ select · ↵ run</div>
                </div>
              </div>
            )}

            <div className="tp-inputbar">
              <div className="tp-inputrow">
                <div className="tp-inputbox">
                  <span className="tp-input-caret">&gt;</span>
                  <input
                    ref={inputRef}
                    className="tp-input"
                    value={input}
                    onChange={(ev) => {
                      setInput(ev.target.value);
                      setSuggestIdx(0);
                      setHistIdx(-1);
                    }}
                    onKeyDown={onInputKey}
                    placeholder="Ask about my work, or type / for commands"
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="Terminal input"
                  />
                </div>
                <div className="tp-input-legend">
                  <span>/ for commands · ⌘K for palette · ↑ for history</span>
                  <span>{inputHint}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {paletteOpen && (
        <div className="tp-overlay" onClick={closePalette}>
          <div className="tp-palette" onClick={(ev) => ev.stopPropagation()} role="dialog" aria-label="Command palette">
            <div className="tp-palette-head">
              <span className="tp-palette-glyph">⌘</span>
              <input
                ref={paletteInputRef}
                className="tp-palette-input"
                value={paletteQuery}
                onChange={(ev) => {
                  setPaletteQuery(ev.target.value);
                  setPaletteIdx(0);
                }}
                onKeyDown={onPaletteKey}
                placeholder="Search commands and work…"
                autoComplete="off"
                spellCheck={false}
                aria-label="Search commands"
              />
              <span className="tp-esc">ESC</span>
            </div>
            <div className="tp-palette-list">
              {paletteResults.map((r, i) => (
                <button
                  key={r.label + r.cmd}
                  className={'tp-palette-row' + (i === paletteIdx ? ' tp-active' : '')}
                  onClick={() => {
                    if (r.kind === 'ask' && paletteQuery.trim()) run(paletteQuery);
                    else run(r.cmd);
                  }}
                >
                  <span className="tp-palette-icon">{r.icon}</span>
                  <span className="tp-palette-body">
                    <span className="tp-palette-label">{r.label}</span>
                    <span className="tp-palette-hint">{r.hint}</span>
                  </span>
                  <span className="tp-palette-cmd">{r.cmd === '?' ? '↵' : r.cmd}</span>
                </button>
              ))}
              {paletteResults.length === 0 && (
                <div className="tp-palette-empty">No command matches — press ↵ to ask it as a question instead.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── block rendering ────────────────────────────────────── */
function renderBlocks(
  e: Entry,
  mk: (cmd: string) => () => void,
  streamNodeRef: RefObject<HTMLParagraphElement>
) {
  const textDone = e.phase === 'done';
  const out: ReactNode[] = [];

  e.blocks.forEach((b, bi) => {
    if (b.t === 'text') {
      if (e.phase === 'tools') return;
      if (e.phase === 'stream') {
        out.push(
          <div className="tp-stream-wrap" key={bi}>
            <p className="tp-stream" ref={streamNodeRef} />
          </div>
        );
      } else {
        out.push(
          <div className="tp-paras" key={bi}>
            {b.paras.map((p, i) => (
              <p className="tp-para" key={i}>
                {p}
              </p>
            ))}
          </div>
        );
      }
      return;
    }

    /* Everything below the answer waits for the answer to finish. */
    if (!textDone) return;

    if (b.t === 'note') {
      out.push(
        <div className="tp-note" key={bi}>
          <span>{b.text}</span>
        </div>
      );
    } else if (b.t === 'pre') {
      out.push(
        <div className="tp-pre" key={bi}>
          {b.caption && <div className="tp-pre-caption">{b.caption}</div>}
          {b.lines.map((l, i) => (
            <div className={'tp-pre-line' + (l.tone ? ' tp-tone-' + l.tone : '')} key={i}>
              {l.text}
            </div>
          ))}
        </div>
      );
    } else if (b.t === 'card') {
      const p = b.project;
      const meta = p.meta || [
        { k: 'ROLE', v: p.role || '' },
        { k: 'PERIOD', v: p.period || '' },
      ];
      out.push(
        <div className="tp-card" key={bi}>
          <div className="tp-card-head">
            <div className="tp-card-top">
              <div>
                <div className="tp-card-path">{p.path}</div>
                <h2>{p.name}</h2>
                <p className="tp-card-sub">{p.subtitle}</p>
              </div>
              <div className="tp-card-status">
                <i />
                <span>{p.status}</span>
              </div>
            </div>
            <div className="tp-card-meta">
              {meta.map((m, i) => (
                <div key={i}>
                  <div className="tp-meta-k">{m.k}</div>
                  <div className="tp-meta-v">{m.v}</div>
                </div>
              ))}
            </div>
            <div className="tp-card-stack">
              {p.stack.map((s, i) => (
                <span className="tp-stack-tag" key={i}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="tp-card-sections">
            {p.sections.map((sec, i) => (
              <div className="tp-card-section" key={i}>
                <div className="tp-section-label">{'▪ ' + sec.label}</div>
                <p className="tp-section-body">{sec.body}</p>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (b.t === 'list') {
      out.push(
        <div className="tp-list" key={bi}>
          {b.items.map((it, i) => (
            <button className="tp-list-item" key={i} onClick={mk(it.cmd)}>
              <div className="tp-list-head">
                <span className="tp-list-title">{it.title}</span>
                <span className="tp-list-meta">{it.meta}</span>
              </div>
              <p className="tp-list-desc">{it.desc}</p>
              <div className="tp-list-tags">
                {it.tags.map((tg, j) => (
                  <span className="tp-list-tag" key={j}>
                    {tg + ' ·'}
                  </span>
                ))}
                <span className="tp-list-action">{it.action}</span>
              </div>
            </button>
          ))}
        </div>
      );
    } else if (b.t === 'grid') {
      out.push(
        <div className="tp-grid" key={bi}>
          {b.cells.map((c, i) => (
            <div className="tp-cell" key={i}>
              <div className="tp-cell-k">{c.k}</div>
              <div className="tp-cell-v">{c.v}</div>
            </div>
          ))}
        </div>
      );
    } else if (b.t === 'defs') {
      out.push(
        <div className="tp-defs" key={bi}>
          {b.rows.map((r, i) => (
            <div className="tp-def" key={i}>
              <span className="tp-def-k">{r.k}</span>
              <span className="tp-def-v">{r.v}</span>
            </div>
          ))}
        </div>
      );
    } else if (b.t === 'links') {
      out.push(
        <div className="tp-links" key={bi}>
          <span className="tp-links-label">NEXT</span>
          {b.actions.map((a, i) => (
            <button className="tp-link" key={i} onClick={mk(a.cmd)}>
              {a.label}
            </button>
          ))}
        </div>
      );
    }
  });

  return out;
}
