import { useState, useRef, useEffect, useCallback } from 'react'

/* ─── Constants ─────────────────────────────────────────────────────────── */
const API_URL = 'http://localhost:5000/api/ai/query'

const WELCOME_MSG = {
  id: 'welcome',
  role: 'ai',
  text: "Hey there! 👋 I'm **DevTUBE AI** — your personal learning guide.\n\nAsk me anything about our courses, instructors, or learning paths and I'll help you find the perfect fit! 🎓",
  ts: new Date(),
}

const SUGGESTIONS = [
  'What courses do you offer?',
  'Who are the instructors?',
  'Show me Python courses',
  'Best courses for beginners?',
]

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function fmt(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function parseMarkdown(text) {
  // Bold **text**
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // Italic *text*
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  // Line breaks
  html = html.replace(/\n/g, '<br/>')
  return html
}

/* ─── Typing Dots ────────────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div style={styles.typingWrap}>
      <div style={styles.aiBubble}>
        <div style={styles.typingDots}>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                ...styles.dot,
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Message Bubble ─────────────────────────────────────────────────────── */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ ...styles.msgRow, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && (
        <div style={styles.aiAvatar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2a4 4 0 0 1 4 4v1h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v1a4 4 0 0 1-8 0v-1H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V6a4 4 0 0 1 4-4z" />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
          </svg>
        </div>
      )}
      <div style={{ maxWidth: '78%' }}>
        <div
          style={isUser ? styles.userBubble : styles.aiBubble}
          dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
        />
        <div style={{ ...styles.tsLabel, textAlign: isUser ? 'right' : 'left' }}>
          {fmt(msg.ts)}
        </div>
      </div>
    </div>
  )
}

/* ─── Source Pills ───────────────────────────────────────────────────────── */
function SourcePills({ sources }) {
  if (!sources?.length) return null
  const typeColors = {
    course: '#6366f1',
    instructor: '#a855f7',
    lessons: '#06b6d4',
    platform: '#10b981',
  }
  return (
    <div style={styles.sourcesRow}>
      <span style={styles.sourcesLabel}>Sources:</span>
      {sources.map((s, i) => (
        <span
          key={i}
          style={{
            ...styles.sourcePill,
            borderColor: (typeColors[s.type] || '#6366f1') + '50',
            color: typeColors[s.type] || '#6366f1',
          }}
        >
          {s.title}
        </span>
      ))}
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function DevTUBEAssistant() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([WELCOME_MSG])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [pulse, setPulse]       = useState(true)
  const [sources, setSources]   = useState({})   // msgId → sources[]
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)

  // Stop pulse after first open
  useEffect(() => {
    if (open) setPulse(false)
  }, [open])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const sendMessage = useCallback(async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return

    const userMsg = { id: Date.now(), role: 'user', text: q, ts: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res  = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()

      const answer = data?.data?.answer || data?.answer || 'Sorry, I could not get a response.'
      const srcs   = data?.data?.sources || data?.sources || []

      const aiMsg  = { id: Date.now() + 1, role: 'ai', text: answer, ts: new Date() }
      setMessages(prev => [...prev, aiMsg])
      if (srcs.length) setSources(prev => ({ ...prev, [aiMsg.id]: srcs }))
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        text: '⚠️ Could not reach the server. Please make sure the backend is running.',
        ts: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────────────── */}
      <button
        id="devtube-ai-btn"
        onClick={() => setOpen(o => !o)}
        style={styles.fab}
        aria-label="Open DevTUBE AI Assistant"
        title="DevTUBE AI Assistant"
      >
        {/* Pulse ring */}
        {pulse && <span style={styles.pulseRing} />}

        {/* Icon */}
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v1h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v1a4 4 0 0 1-8 0v-1H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V6a4 4 0 0 1 4-4z" />
            <circle cx="9" cy="10" r="1" fill="white" />
            <circle cx="15" cy="10" r="1" fill="white" />
          </svg>
        )}
      </button>

      {/* ── Chat Panel ──────────────────────────────────────────────────── */}
      <div
        id="devtube-ai-panel"
        style={{
          ...styles.panel,
          opacity:          open ? 1 : 0,
          pointerEvents:    open ? 'all' : 'none',
          transform:        open ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        }}
        aria-hidden={!open}
      >

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4v1h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v1a4 4 0 0 1-8 0v-1H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V6a4 4 0 0 1 4-4z" />
                <circle cx="9" cy="10" r="1" fill="white" />
                <circle cx="15" cy="10" r="1" fill="white" />
              </svg>
            </div>
            <div>
              <div style={styles.headerTitle}>DevTUBE AI</div>
              <div style={styles.headerSub}>
                <span style={styles.onlineDot} /> Online · Powered by Gemini
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={styles.closeBtn} aria-label="Close chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div style={styles.messagesArea}>
          {messages.map(msg => (
            <div key={msg.id}>
              <MessageBubble msg={msg} />
              {sources[msg.id] && <SourcePills sources={sources[msg.id]} />}
            </div>
          ))}
          {loading && <TypingDots />}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions (show only when no user messages yet) */}
        {messages.length === 1 && (
          <div style={styles.suggestionsRow}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                style={styles.suggestion}
                onClick={() => sendMessage(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={styles.inputRow}>
          <input
            ref={inputRef}
            id="devtube-ai-input"
            style={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about courses, instructors…"
            disabled={loading}
            maxLength={500}
            autoComplete="off"
          />
          <button
            id="devtube-ai-send"
            style={{
              ...styles.sendBtn,
              opacity: (!input.trim() || loading) ? 0.45 : 1,
              cursor:  (!input.trim() || loading) ? 'not-allowed' : 'pointer',
            }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" stroke="none" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          DevTUBE AI · Only answers platform questions
        </div>
      </div>

      <style>{`
        @keyframes devtube-pulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(1.9); opacity: 0;   }
          100% { transform: scale(1.9); opacity: 0;   }
        }
        @keyframes devtube-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1.0); opacity: 1;   }
        }
        @keyframes devtube-slide-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        #devtube-ai-btn:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 0 36px rgba(99,102,241,0.7), 0 8px 32px rgba(0,0,0,0.5) !important;
        }
        #devtube-ai-btn:active {
          transform: scale(0.96) !important;
        }
        .devtube-msg-animate {
          animation: devtube-slide-in 0.3s ease forwards;
        }
        #devtube-ai-input:focus {
          outline: none;
          border-color: rgba(99,102,241,0.6) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .devtube-suggestion:hover {
          background: rgba(99,102,241,0.2) !important;
          border-color: rgba(99,102,241,0.4) !important;
          color: white !important;
        }

        /* Mobile: full screen */
        @media (max-width: 640px) {
          #devtube-ai-panel {
            right: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100dvh !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </>
  )
}

/* ─── Styles (inline for zero-config, matches DevTUBE dark glass theme) ──── */
const styles = {
  fab: {
    position:     'fixed',
    bottom:       '28px',
    right:        '28px',
    zIndex:       9999,
    width:        '60px',
    height:       '60px',
    borderRadius: '50%',
    border:       'none',
    cursor:       'pointer',
    background:   'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    boxShadow:    '0 0 24px rgba(99,102,241,0.55), 0 8px 32px rgba(0,0,0,0.4)',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    transition:   'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease',
  },
  pulseRing: {
    position:    'absolute',
    inset:       0,
    borderRadius: '50%',
    background:  'rgba(99,102,241,0.6)',
    animation:   'devtube-pulse 2s ease-out infinite',
    pointerEvents: 'none',
  },
  panel: {
    position:      'fixed',
    bottom:        '104px',
    right:         '28px',
    zIndex:        9998,
    width:         '400px',
    height:        '580px',
    borderRadius:  '28px',
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
    background:    'rgba(10,10,18,0.92)',
    backdropFilter:'blur(40px)',
    border:        '1px solid rgba(255,255,255,0.1)',
    boxShadow:     '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
    transition:    'opacity 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1)',
  },
  header: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '18px 20px',
    background:     'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.12) 100%)',
    borderBottom:   '1px solid rgba(255,255,255,0.07)',
    flexShrink:     0,
  },
  headerLeft: {
    display:    'flex',
    alignItems: 'center',
    gap:        '12px',
  },
  headerIcon: {
    width:          '38px',
    height:         '38px',
    borderRadius:   '50%',
    background:     'linear-gradient(135deg, #6366f1, #a855f7)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    boxShadow:      '0 0 16px rgba(99,102,241,0.4)',
    flexShrink:     0,
  },
  headerTitle: {
    color:      'white',
    fontWeight: 800,
    fontSize:   '15px',
    letterSpacing: '-0.3px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  headerSub: {
    display:    'flex',
    alignItems: 'center',
    gap:        '5px',
    color:      'rgba(255,255,255,0.45)',
    fontSize:   '11px',
    fontFamily: 'Inter, system-ui, sans-serif',
    marginTop:  '1px',
  },
  onlineDot: {
    display:      'inline-block',
    width:        '6px',
    height:       '6px',
    borderRadius: '50%',
    background:   '#10b981',
    boxShadow:    '0 0 6px #10b981',
  },
  closeBtn: {
    background:   'rgba(255,255,255,0.06)',
    border:       '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color:        'rgba(255,255,255,0.5)',
    cursor:       'pointer',
    padding:      '7px',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    transition:   'all 0.2s',
  },
  messagesArea: {
    flex:       1,
    overflowY:  'auto',
    padding:    '16px 16px 8px',
    display:    'flex',
    flexDirection: 'column',
    gap:        '4px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255,255,255,0.1) transparent',
  },
  msgRow: {
    display:    'flex',
    alignItems: 'flex-end',
    gap:        '8px',
    marginBottom: '6px',
    animation:  'devtube-slide-in 0.28s ease forwards',
  },
  aiAvatar: {
    width:          '28px',
    height:         '28px',
    borderRadius:   '50%',
    background:     'linear-gradient(135deg, #6366f1, #a855f7)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    color:          'white',
    boxShadow:      '0 0 10px rgba(99,102,241,0.35)',
  },
  userBubble: {
    background:   'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color:        'white',
    padding:      '11px 15px',
    borderRadius: '18px 18px 4px 18px',
    fontSize:     '13.5px',
    lineHeight:   '1.55',
    fontFamily:   'Inter, system-ui, sans-serif',
    boxShadow:    '0 2px 12px rgba(99,102,241,0.3)',
    wordBreak:    'break-word',
  },
  aiBubble: {
    background:   'rgba(255,255,255,0.06)',
    border:       '1px solid rgba(255,255,255,0.09)',
    color:        'rgba(255,255,255,0.9)',
    padding:      '11px 15px',
    borderRadius: '18px 18px 18px 4px',
    fontSize:     '13.5px',
    lineHeight:   '1.55',
    fontFamily:   'Inter, system-ui, sans-serif',
    wordBreak:    'break-word',
    backdropFilter: 'blur(10px)',
  },
  tsLabel: {
    color:      'rgba(255,255,255,0.25)',
    fontSize:   '10px',
    marginTop:  '3px',
    fontFamily: 'Inter, system-ui, sans-serif',
    paddingLeft: '4px',
    paddingRight: '4px',
  },
  typingWrap: {
    display:    'flex',
    alignItems: 'flex-end',
    gap:        '8px',
    marginBottom: '6px',
    animation:  'devtube-slide-in 0.28s ease forwards',
  },
  typingDots: {
    display: 'flex',
    gap:     '4px',
    padding: '4px 2px',
  },
  dot: {
    display:      'inline-block',
    width:        '7px',
    height:       '7px',
    borderRadius: '50%',
    background:   'rgba(255,255,255,0.5)',
    animation:    'devtube-dot 1.2s ease infinite',
  },
  suggestionsRow: {
    padding:   '8px 16px 4px',
    display:   'flex',
    flexWrap:  'wrap',
    gap:       '7px',
    flexShrink: 0,
  },
  suggestion: {
    background:   'rgba(99,102,241,0.1)',
    border:       '1px solid rgba(99,102,241,0.25)',
    color:        'rgba(255,255,255,0.65)',
    borderRadius: '20px',
    padding:      '5px 12px',
    fontSize:     '11.5px',
    cursor:       'pointer',
    fontFamily:   'Inter, system-ui, sans-serif',
    transition:   'all 0.2s',
    fontWeight:   500,
  },
  sourcesRow: {
    display:   'flex',
    flexWrap:  'wrap',
    gap:       '5px',
    alignItems: 'center',
    paddingLeft: '36px',
    paddingBottom: '8px',
  },
  sourcesLabel: {
    color:      'rgba(255,255,255,0.3)',
    fontSize:   '10px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  sourcePill: {
    border:       '1px solid',
    borderRadius: '12px',
    padding:      '2px 8px',
    fontSize:     '10px',
    fontFamily:   'Inter, system-ui, sans-serif',
    fontWeight:   600,
    letterSpacing: '0.02em',
  },
  inputRow: {
    display:     'flex',
    gap:         '10px',
    padding:     '12px 16px 10px',
    borderTop:   '1px solid rgba(255,255,255,0.07)',
    background:  'rgba(0,0,0,0.3)',
    flexShrink:  0,
    alignItems:  'center',
  },
  input: {
    flex:         1,
    background:   'rgba(255,255,255,0.05)',
    border:       '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    padding:      '10px 16px',
    color:        'white',
    fontSize:     '13.5px',
    fontFamily:   'Inter, system-ui, sans-serif',
    outline:      'none',
    transition:   'border-color 0.2s, box-shadow 0.2s',
  },
  sendBtn: {
    width:          '42px',
    height:         '42px',
    borderRadius:   '12px',
    border:         'none',
    background:     'linear-gradient(135deg, #6366f1, #a855f7)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    transition:     'opacity 0.2s, transform 0.15s',
    boxShadow:      '0 4px 14px rgba(99,102,241,0.35)',
  },
  footer: {
    textAlign:   'center',
    color:       'rgba(255,255,255,0.2)',
    fontSize:    '10px',
    padding:     '6px 16px 10px',
    fontFamily:  'Inter, system-ui, sans-serif',
    letterSpacing: '0.03em',
    flexShrink:  0,
  },
}
