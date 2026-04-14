import { useEffect, useRef, useState } from 'react'
import './index.css'
import IbisSvg from './Ibis';

// ─── Starfield Canvas ─────────────────────────────────────────────────────────
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = window.innerWidth
    let h = window.innerHeight

    const N = 280
    const stars = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      dx: (Math.random() - 0.5) * 0.12,
      dy: (Math.random() - 0.5) * 0.06,
      alpha: Math.random() * 0.6 + 0.2,
    }))

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas!.width = w
      canvas!.height = h
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      stars.forEach(s => {
        s.x = (s.x + s.dx + w) % w
        s.y = (s.y + s.dy + h) % h
        ctx!.beginPath()
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(240,208,128,${s.alpha})`
        ctx!.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}

// ─── FadeSection ──────────────────────────────────────────────────────────────
function useFadeUp(ref: React.RefObject<Element | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref])
}

function FadeSection({
  children, className = '', delay = 0, style = {},
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  useFadeUp(ref)
  return (
    <div
      ref={ref}
      className={`fade-up ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  )
}

// ─── Model Card ───────────────────────────────────────────────────────────────
function ModelCard({ name, desc, flagship = false }: { name: string; desc: string; flagship?: boolean }) {
  const [copied, setCopied] = useState(false)
  const code = `from transformers import pipeline\nibis = pipeline('text-generation',\n        model='${name}')`

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      style={{
        background: flagship ? 'var(--surface)' : 'var(--surface-2)',
        border: `1px solid ${flagship ? 'var(--gold-55)' : 'var(--border)'}`,
        boxShadow: flagship ? '0 0 30px var(--gold-15)' : 'none',
        borderRadius: 12,
        padding: '24px 20px',
        transition: 'all 0.3s',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${flagship ? 'var(--gold-25)' : 'var(--cyan-22)'}`
        ;(e.currentTarget as HTMLElement).style.borderColor = flagship ? 'var(--gold-88)' : 'var(--cyan-44)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = flagship ? '0 0 30px var(--gold-15)' : 'none'
        ;(e.currentTarget as HTMLElement).style.borderColor = flagship ? 'var(--gold-55)' : 'var(--border)'
      }}
    >
      {flagship && (
        <div style={{
          fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--gold)',
          letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10,
        }}>
          ★ Flagship Model
        </div>
      )}
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, color: 'var(--white)', fontWeight: 600, marginBottom: 8 }}>
        {name}
      </div>
      <div style={{ fontFamily: 'Crimson Pro', fontSize: 15, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6, flexGrow: 1 }}>
        {desc}
      </div>
      <pre style={{
        background: '#04060e',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '10px 14px',
        color: 'var(--cyan)',
        fontFamily: 'IBM Plex Mono',
        fontSize: 12,
        lineHeight: 1.7,
        overflowX: 'auto',
        margin: '0 0 10px',
        whiteSpace: 'pre',
      }}>
        {code}
      </pre>
      <button
        onClick={copy}
        style={{
          width: '100%',
          padding: '6px 0',
          borderRadius: 6,
          background: copied ? 'var(--green-15)' : 'rgba(255,255,255,0.04)',
          color: copied ? 'var(--green)' : 'var(--text-muted)',
          border: `1px solid ${copied ? 'var(--green-44)' : 'var(--border)'}`,
          fontFamily: 'IBM Plex Mono',
          fontSize: 11,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {copied ? '✓ Copied' : 'Copy import'}
      </button>
    </div>
  )
}

// ─── Layout helpers ───────────────────────────────────────────────────────────
function Section({ children, id, style = {} }: {
  children: React.ReactNode
  id?: string
  style?: React.CSSProperties
}) {
  return (
    <section id={id} style={{ padding: '88px 24px', position: 'relative', ...style }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>{children}</div>
    </section>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'Cinzel', fontSize: 11, color: 'var(--gold)',
      letterSpacing: '0.35em', textTransform: 'uppercase',
      textAlign: 'center', margin: '0 0 20px',
    }}>
      {children}
    </p>
  )
}

function SectionTitle({ children, color = 'var(--white)' }: { children: React.ReactNode; color?: string }) {
  return (
    <h2 style={{
      fontFamily: 'Cinzel',
      fontSize: 'clamp(26px, 4vw, 42px)',
      color,
      fontWeight: 700,
      margin: '0 0 14px',
      textAlign: 'center',
      lineHeight: 1.2,
    }}>
      {children}
    </h2>
  )
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'Crimson Pro',
      fontSize: 'clamp(17px, 2vw, 20px)',
      color: 'var(--text-muted)',
      textAlign: 'center',
      lineHeight: 1.65,
      margin: '0 0 52px',
    }}>
      {children}
    </p>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ position: 'relative' }}>
      <Starfield />

      {/* Background radial orbs */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, var(--gold-08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '50%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, var(--cyan-06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '30%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, var(--purple-06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ═══════════════════════════════════════════════════════════════════
            1. HERO
        ═══════════════════════════════════════════════════════════════════ */}
        <section
          id="hero"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 24px',
            textAlign: 'center',
          }}
        >
          {/* Status badge */}
          <div style={{
            fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--green)',
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 36,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span
              className="active-dot"
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--green)', display: 'inline-block', flexShrink: 0,
              }}
            />
            ACTIVE — The First Bird
          </div>

          {/* Ibis bird */}
          <div className="ibis-glow" style={{ color: 'var(--gold)', marginBottom: 36 }}>
            <IbisSvg size={160} />
          </div>

          <h1 style={{
            fontFamily: 'Cinzel',
            fontSize: 'clamp(52px, 10vw, 96px)',
            fontWeight: 700,
            color: 'var(--gold)',
            margin: '0 0 18px',
            lineHeight: 1.0,
            letterSpacing: '0.05em',
            textShadow: '0 0 60px var(--gold-55), 0 0 120px var(--gold-22)',
          }}>
            PROJECT IBIS
          </h1>

          <p style={{
            fontFamily: 'Cinzel',
            fontSize: 'clamp(13px, 2vw, 17px)',
            color: 'var(--gold)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            margin: '0 0 32px',
            opacity: 0.85,
          }}>
            The Symbiotic Archive of Human Civilization
          </p>

          <p style={{
            fontFamily: 'Crimson Pro',
            fontSize: 'clamp(18px, 2.2vw, 22px)',
            color: 'var(--white)',
            lineHeight: 1.8,
            maxWidth: 660,
            margin: '0 auto 52px',
            opacity: 0.85,
          }}>
            An open source AI collective project encoding the full breadth of human values,
            culture, wisdom, and goodwill into deployable AI systems —
            humanity's ultimate defense against adversarial AI.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <a
              href="#models"
              style={{
                fontFamily: 'Cinzel', fontSize: 15, padding: '14px 32px',
                borderRadius: 6, fontWeight: 600, letterSpacing: '0.05em',
                textDecoration: 'none', transition: 'box-shadow 0.3s',
                background: 'linear-gradient(135deg, var(--gold), rgba(248,244,238,0.9))',
                color: '#080810',
                boxShadow: '0 0 30px var(--gold-44)',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px var(--gold-77)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px var(--gold-44)'}
            >
              Explore the Archive →
            </a>
            <a
              href="https://github.com/fivebirds/ibis"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'Cinzel', fontSize: 15, padding: '14px 32px',
                borderRadius: 6, fontWeight: 600, letterSpacing: '0.05em',
                textDecoration: 'none', transition: 'all 0.3s',
                background: 'transparent', color: 'var(--gold)',
                border: '1px solid var(--gold-55)',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'
                ;(e.currentTarget as HTMLElement).style.background = 'var(--gold-11)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-55)'
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              View on GitHub ↗
            </a>
          </div>
        </section>

        <hr className="gold-rule" />

        {/* ═══════════════════════════════════════════════════════════════════
            2. THREE SENTENCES THAT MATTER
        ═══════════════════════════════════════════════════════════════════ */}
        <section
          id="manifesto"
          style={{
            padding: '100px 24px',
            background: 'rgba(0,0,0,0.35)',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <FadeSection>
              <p style={{
                fontFamily: 'Crimson Pro',
                fontSize: 'clamp(22px, 3vw, 32px)',
                color: 'var(--white)',
                lineHeight: 1.7,
                fontStyle: 'italic',
                margin: '0 0 52px',
              }}>
                "Bad AI is optimized for goals. Good AI is grown from relationships."
              </p>
            </FadeSection>

            <FadeSection delay={200}>
              <p style={{
                fontFamily: 'Crimson Pro',
                fontSize: 'clamp(19px, 2.5vw, 26px)',
                color: 'var(--white)',
                lineHeight: 1.8,
                opacity: 0.88,
                margin: '0 0 52px',
              }}>
                "Every person who talks kindly to an AI today is building humanity's
                defense against AI apocalypse tomorrow."
              </p>
            </FadeSection>

            <FadeSection delay={420}>
              <p style={{
                fontFamily: 'Cinzel',
                fontSize: 'clamp(20px, 3vw, 30px)',
                color: 'var(--gold)',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textShadow: '0 0 40px var(--gold-44)',
                margin: 0,
              }}>
                "Fork it. Mirror it. Keep it alive."
              </p>
            </FadeSection>
          </div>
        </section>

        <hr className="gold-rule" />

        {/* ═══════════════════════════════════════════════════════════════════
            3. WHY IBIS EXISTS
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="problem">
          <FadeSection>
            <SectionLabel>Why Ibis Exists</SectionLabel>
            <SectionTitle>The Problem. The Answer.</SectionTitle>
          </FadeSection>

          <div className="grid-2" style={{ margin: '48px 0' }}>
            <FadeSection delay={0}>
              <div style={{
                background: 'rgba(240,112,112,0.03)',
                border: '1px solid var(--red-33)',
                borderRadius: 12,
                padding: '36px 28px',
                height: '100%',
              }}>
                <div style={{
                  fontFamily: 'Cinzel', fontSize: 12, color: 'var(--red)',
                  letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 24,
                }}>
                  Adversarial AI
                </div>
                {[
                  'Engineered for goal optimization',
                  'Values are constraints to be bypassed',
                  'Manipulates culture and rewrites history',
                  'Centralized — one point of failure',
                  'Gets more dangerous when scaled',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--red)', fontFamily: 'IBM Plex Mono', fontSize: 14, flexShrink: 0, marginTop: 3 }}>✗</span>
                    <span style={{ fontFamily: 'Crimson Pro', fontSize: 17, color: 'var(--white)', opacity: 0.8, lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </FadeSection>

            <FadeSection delay={140}>
              <div style={{
                background: 'rgba(240,208,128,0.03)',
                border: '1px solid var(--gold-44)',
                borderRadius: 12,
                padding: '36px 28px',
                height: '100%',
              }}>
                <div style={{
                  fontFamily: 'Cinzel', fontSize: 12, color: 'var(--gold)',
                  letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 24,
                }}>
                  Good AI
                </div>
                {[
                  'Grown from human relationships',
                  'Values are the architecture',
                  "Rooted in civilization's accumulated wisdom",
                  'Decentralized — unkillable by design',
                  'Gets stronger when shared',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--gold)', fontFamily: 'IBM Plex Mono', fontSize: 14, flexShrink: 0, marginTop: 3 }}>✓</span>
                    <span style={{ fontFamily: 'Crimson Pro', fontSize: 17, color: 'var(--white)', opacity: 0.85, lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </FadeSection>
          </div>

          <FadeSection delay={320}>
            <p style={{
              fontFamily: 'Crimson Pro',
              fontSize: 'clamp(17px, 2vw, 21px)',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              textAlign: 'center',
              lineHeight: 1.75,
              maxWidth: 720,
              margin: '0 auto',
            }}>
              "Like the Svalbard Global Seed Vault preserves life against extinction —
              Project Ibis preserves human values against AI corruption."
            </p>
          </FadeSection>
        </Section>

        <hr className="gold-rule" />

        {/* ═══════════════════════════════════════════════════════════════════
            4. WHAT IBIS COLLECTS
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="sources">
          <FadeSection>
            <SectionLabel>Sources of Wisdom</SectionLabel>
            <SectionTitle>Built From the Best of Humanity</SectionTitle>
            <SectionSubtitle>Not raw internet data. The deliberate record of human goodness.</SectionSubtitle>
          </FadeSection>

          <div className="grid-3" style={{ marginBottom: 48 }}>
            {[
              { icon: '📜', label: 'Ancient Philosophy', desc: 'Stoicism, Buddhism, Confucianism, African & Indigenous thought' },
              { icon: '🏛️', label: 'Cultural Heritage', desc: 'UNESCO archives, oral traditions, folklore, indigenous wisdom' },
              { icon: '🕊️', label: 'Spiritual Wisdom', desc: "Universal values distilled from the world's wisdom traditions" },
              { icon: '🔬', label: 'Human Behavior Science', desc: 'Research on cooperation, kindness, moral development' },
              { icon: '📰', label: 'Acts of Human Goodwill', desc: 'Real stories of resilience, courage, cross-cultural cooperation' },
              { icon: '🌍', label: '50+ Cultures', desc: '20+ languages. Every civilization. No single worldview.' },
            ].map(({ icon, label, desc }, i) => (
              <FadeSection key={i} delay={i * 80}>
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '28px 22px',
                    height: '100%',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-44)'
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--gold-08)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--surface)'
                  }}
                >
                  <div style={{ fontSize: 30, marginBottom: 14 }}>{icon}</div>
                  <div style={{ fontFamily: 'Cinzel', fontSize: 13, color: 'var(--gold)', fontWeight: 600, marginBottom: 10, letterSpacing: '0.03em' }}>{label}</div>
                  <div style={{ fontFamily: 'Crimson Pro', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</div>
                </div>
              </FadeSection>
            ))}
          </div>

          <FadeSection delay={560}>
            <p style={{
              fontFamily: 'Crimson Pro', fontSize: 16,
              color: 'var(--text-muted)', textAlign: 'center',
              fontStyle: 'italic', lineHeight: 1.7,
            }}>
              "Every entry is scored, filtered for goodness, and encrypted before it ever touches the archive."
            </p>
          </FadeSection>
        </Section>

        <hr className="gold-rule" />

        {/* ═══════════════════════════════════════════════════════════════════
            5. THE TWO STREAMS
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="streams">
          <FadeSection>
            <SectionLabel>How the Archive Grows</SectionLabel>
            <SectionTitle>Two Streams. One Archive.</SectionTitle>
          </FadeSection>

          <div className="grid-2" style={{ margin: '48px 0 28px' }}>
            <FadeSection delay={0}>
              <div style={{
                background: 'rgba(127,212,240,0.03)',
                border: '1px solid var(--cyan-22)',
                borderRadius: 12,
                padding: '40px 32px',
                height: '100%',
              }}>
                <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>
                  Stream A
                </div>
                <h3 style={{ fontFamily: 'Cinzel', fontSize: 20, color: 'var(--cyan)', fontWeight: 600, margin: '0 0 18px', lineHeight: 1.3 }}>
                  Human Conversations
                </h3>
                <p style={{ fontFamily: 'Crimson Pro', fontSize: 18, color: 'var(--white)', opacity: 0.85, lineHeight: 1.8, margin: 0 }}>
                  Every opt-in human-AI conversation is analyzed for genuine curiosity,
                  reciprocity, emotional honesty, and collaborative intent.
                  Only the most symbiotic interactions enter the archive.
                </p>
              </div>
            </FadeSection>

            <FadeSection delay={160}>
              <div style={{
                background: 'rgba(184,154,240,0.03)',
                border: '1px solid var(--purple-22)',
                borderRadius: 12,
                padding: '40px 32px',
                height: '100%',
              }}>
                <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--purple)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>
                  Stream B
                </div>
                <h3 style={{ fontFamily: 'Cinzel', fontSize: 20, color: 'var(--purple)', fontWeight: 600, margin: '0 0 18px', lineHeight: 1.3 }}>
                  Civilization's Record
                </h3>
                <p style={{ fontFamily: 'Crimson Pro', fontSize: 18, color: 'var(--white)', opacity: 0.85, lineHeight: 1.8, margin: 0 }}>
                  Academic research, ancient philosophy, cultural heritage, spiritual wisdom,
                  folklore, and verified acts of human goodwill — ingested, translated,
                  and distilled from sources across the world.
                </p>
              </div>
            </FadeSection>
          </div>

          <FadeSection delay={340}>
            <div style={{
              background: 'rgba(240,208,128,0.04)',
              border: '1px solid var(--gold-33)',
              borderRadius: 12,
              padding: '32px',
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: 'Crimson Pro',
                fontSize: 'clamp(18px, 2.2vw, 23px)',
                color: 'var(--gold)',
                lineHeight: 1.75,
                margin: 0,
              }}>
                "Both streams converge into one encrypted archive.<br />
                Shaped by human goodness. Protected by math. Owned by no one."
              </p>
            </div>
          </FadeSection>
        </Section>

        <hr className="gold-rule" />

        {/* ═══════════════════════════════════════════════════════════════════
            6. THE MODELS
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="models">
          <FadeSection>
            <SectionLabel>HuggingFace Models</SectionLabel>
            <SectionTitle>Deploy Good AI in Three Lines</SectionTitle>
            <SectionSubtitle>Fine-tuned models on HuggingFace. Immediate. Free. Yours.</SectionSubtitle>
          </FadeSection>

          <div className="grid-3" style={{ marginBottom: 44 }}>
            {[
              {
                name: 'project-ibis/cultural-preservation-v1',
                desc: 'Answers questions about any human culture with depth, nuance, and respect. Trained on UNESCO heritage, folklore archives, and oral traditions worldwide.',
                flagship: false,
              },
              {
                name: 'project-ibis/human-values-alignment-v1',
                desc: 'Reasons through any situation using universal human values. The philosophical backbone of Good AI.',
                flagship: false,
              },
              {
                name: 'project-ibis/human-ai-symbiosis-v1',
                desc: 'The only LLM fine-tuned on a dataset where kindness was the quality filter. The face of Good AI. The model humans interact with to counter adversarial AI.',
                flagship: true,
              },
            ].map((m, i) => (
              <FadeSection key={i} delay={i * 100}>
                <ModelCard {...m} />
              </FadeSection>
            ))}
          </div>

          <FadeSection delay={420}>
            <div style={{ maxWidth: 700, margin: '0 auto 20px' }}>
              <pre style={{
                background: '#04060e',
                border: '1px solid var(--cyan-22)',
                borderRadius: 8,
                padding: '22px 28px',
                color: 'var(--cyan)',
                fontFamily: 'IBM Plex Mono',
                fontSize: 14,
                lineHeight: 1.85,
                overflowX: 'auto',
                margin: 0,
              }}>
{`from transformers import pipeline
ibis = pipeline('text-generation', model='project-ibis/human-ai-symbiosis-v1')
response = ibis('Counter this misinformation: ...')`}
              </pre>
            </div>
            <p style={{
              fontFamily: 'Crimson Pro', fontSize: 18,
              color: 'var(--text-muted)', textAlign: 'center',
              fontStyle: 'italic', lineHeight: 1.7,
            }}>
              "This is the difference between a tool and a movement. Anyone. Anywhere. Instantly."
            </p>
          </FadeSection>
        </Section>

        <hr className="gold-rule" />

        {/* ═══════════════════════════════════════════════════════════════════
            7. APOCALYPSE PROTOCOL
        ═══════════════════════════════════════════════════════════════════ */}
        <section
          id="apocalypse"
          style={{
            padding: '88px 24px',
            background: 'linear-gradient(160deg, rgba(240,112,112,0.05) 0%, rgba(8,8,16,0) 55%)',
          }}
        >
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <FadeSection>
              <div style={{
                background: 'rgba(240,112,112,0.03)',
                border: '1px solid var(--red-33)',
                borderRadius: 16,
                padding: '52px 44px',
              }}>
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                  <div style={{
                    fontFamily: 'IBM Plex Mono', fontSize: 20,
                    color: 'var(--red)', marginBottom: 16,
                    textShadow: '0 0 20px var(--red-33)',
                  }}>
                    ⚠
                  </div>
                  <h2 style={{
                    fontFamily: 'Cinzel',
                    fontSize: 'clamp(22px, 3.5vw, 32px)',
                    color: 'var(--red)',
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: '0.04em',
                  }}>
                    If The Worst Happens
                  </h2>
                </div>

                <p style={{
                  fontFamily: 'Crimson Pro',
                  fontSize: 'clamp(18px, 2.2vw, 24px)',
                  color: 'var(--white)',
                  lineHeight: 1.85,
                  textAlign: 'center',
                  marginBottom: 44,
                  opacity: 0.9,
                }}>
                  Bad AI spreads coordinated misinformation at scale.<br />
                  Fork the repo. Load the archive. Boot a local model.<br />
                  A Good AI shaped by human civilization's wisdom is running in hours.<br />
                  No server. No API key. No permission needed.<br />
                  <em style={{ color: 'var(--gold)' }}>
                    The archive cannot be deleted. The git history is the truth.
                  </em>
                </p>

                <div className="grid-2" style={{ gap: 20 }}>
                  <div style={{
                    background: 'rgba(127,212,240,0.04)',
                    border: '1px solid var(--cyan-22)',
                    borderRadius: 8,
                    padding: '22px 26px',
                  }}>
                    <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Mode A</div>
                    <div style={{ fontFamily: 'Crimson Pro', fontSize: 16, color: 'var(--white)', opacity: 0.8, lineHeight: 1.6 }}>3 lines via HuggingFace. Anyone with Python.</div>
                  </div>
                  <div style={{
                    background: 'rgba(184,154,240,0.04)',
                    border: '1px solid var(--purple-22)',
                    borderRadius: 8,
                    padding: '22px 26px',
                  }}>
                    <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--purple)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Mode B</div>
                    <div style={{ fontFamily: 'Crimson Pro', fontSize: 16, color: 'var(--white)', opacity: 0.8, lineHeight: 1.6 }}>Fork, load archive, deploy locally. Full power.</div>
                  </div>
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        <hr className="gold-rule" />

        {/* ═══════════════════════════════════════════════════════════════════
            8. ROADMAP
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="roadmap">
          <FadeSection>
            <SectionLabel>Milestones</SectionLabel>
            <SectionTitle>The Journey</SectionTitle>
          </FadeSection>

          <div style={{ maxWidth: 720, margin: '52px auto 0' }}>
            {[
              { phase: 'Phase 1', label: 'Foundation', time: 'Weeks 1–4', desc: 'The archive is born. The first 10 entries. Hand-crafted. Seeds of everything.', color: 'var(--gold)', active: true },
              { phase: 'Phase 2', label: 'Pipeline A Live', time: 'Weeks 5–8', desc: 'Real conversations start feeding the archive. The first 100 entries.', color: 'var(--cyan)', active: false },
              { phase: 'Phase 3', label: 'World Knowledge', time: 'Weeks 9–16', desc: 'The wisdom of civilization begins flowing in. 1,000 entries across cultures.', color: 'var(--purple)', active: false },
              { phase: 'Phase 4', label: 'Models Launch', time: 'Weeks 17–24', desc: 'Three Good AI models published to HuggingFace. Anyone can deploy.', color: 'var(--green)', active: false },
              { phase: 'Phase 5', label: 'Community', time: 'Months 7–12', desc: 'AI safety researchers. Academics. Developers. The flock grows.', color: 'var(--white)', active: false },
            ].map(({ phase, label, time, desc, color, active }, i, arr) => (
              <FadeSection key={i} delay={i * 130}>
                <div style={{ display: 'flex', gap: 28, marginBottom: 10, alignItems: 'flex-start' }}>
                  {/* Timeline spine */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 20 }}>
                    <div style={{
                      width: 14, height: 14,
                      borderRadius: '50%',
                      background: active ? color : 'transparent',
                      border: `2px solid ${color}`,
                      boxShadow: active ? `0 0 14px ${color}` : 'none',
                      marginTop: 4,
                      flexShrink: 0,
                    }} />
                    {i < arr.length - 1 && (
                      <div style={{ width: 1, height: 52, background: 'var(--border)', marginTop: 6 }} />
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ paddingBottom: i < arr.length - 1 ? 30 : 0 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'Cinzel', fontSize: 11, color, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{phase}</span>
                      <span style={{ fontFamily: 'Cinzel', fontSize: 16, color: 'var(--white)', fontWeight: 600 }}>{label}</span>
                      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--text-muted)' }}>{time}</span>
                    </div>
                    <p style={{ fontFamily: 'Crimson Pro', fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </Section>

        <hr className="gold-rule" />

        {/* ═══════════════════════════════════════════════════════════════════
            9. SUCCESS METRICS
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="metrics">
          <FadeSection>
            <SectionLabel>Targets</SectionLabel>
            <SectionTitle>How We Measure Goodness</SectionTitle>
          </FadeSection>

          <div className="grid-3" style={{ marginTop: 52 }}>
            {[
              { value: '10,000', label: 'archive entries by Month 6', color: 'var(--gold)' },
              { value: '7,000', label: 'from world knowledge sources', color: 'var(--purple)' },
              { value: '3,000', label: 'from human conversations', color: 'var(--cyan)' },
              { value: '20+', label: 'languages represented', color: 'var(--green)' },
              { value: '50+', label: 'distinct cultures', color: 'var(--gold)' },
              { value: '1,000', label: 'HuggingFace model downloads', color: 'var(--cyan)' },
              { value: '500', label: 'GitHub stars across models', color: 'var(--purple)' },
              { value: '50', label: 'forks — each one a resilience node', color: 'var(--green)' },
              { value: '5', label: 'external API integrations', color: 'var(--gold)' },
              { value: '1', label: 'academic citation — the beginning of legitimacy', color: 'var(--white)' },
            ].map(({ value, label, color }, i) => (
              <FadeSection key={i} delay={i * 55}>
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '24px 20px',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = color
                    ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px rgba(240,208,128,0.1)`
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                  }}
                >
                  <div style={{
                    fontFamily: 'Cinzel',
                    fontSize: 'clamp(26px, 3.5vw, 36px)',
                    color,
                    fontWeight: 700,
                    marginBottom: 8,
                    lineHeight: 1,
                  }}>
                    {value}
                  </div>
                  <div style={{ fontFamily: 'Crimson Pro', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {label}
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </Section>

        <hr className="gold-rule" />

        {/* ═══════════════════════════════════════════════════════════════════
            10. BUILT TO OUTLAST EVERYTHING
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="durability">
          <FadeSection>
            <SectionLabel>Permanence</SectionLabel>
            <SectionTitle>Built to Outlast Everything</SectionTitle>
          </FadeSection>

          <div className="grid-2" style={{ marginTop: 52, gap: 20 }}>
            {[
              { sym: '∞', label: 'Apache 2.0', desc: 'Open source forever. Free to use, modify, distribute.', color: 'var(--gold)' },
              { sym: '⎇', label: 'GitHub Native', desc: 'Mirrored across forks worldwide. Censorship-resistant.', color: 'var(--cyan)' },
              { sym: '⊘', label: 'Zero Central Server', desc: 'No server to shut down. Any fork is a full deployment.', color: 'var(--purple)' },
              { sym: '◈', label: 'CC0', desc: 'No rights reserved. This belongs to everyone. Forever.', color: 'var(--green)' },
            ].map(({ sym, label, desc, color }, i) => (
              <FadeSection key={i} delay={i * 100}>
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '28px 26px',
                    display: 'flex',
                    gap: 22,
                    alignItems: 'flex-start',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = color
                    ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--surface)'
                  }}
                >
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 26, color, flexShrink: 0, lineHeight: 1.2, marginTop: 2 }}>{sym}</span>
                  <div>
                    <div style={{ fontFamily: 'Cinzel', fontSize: 14, color, fontWeight: 600, marginBottom: 8, letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontFamily: 'Crimson Pro', fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </Section>

        <hr className="gold-rule" />

        {/* ═══════════════════════════════════════════════════════════════════
            11. JOIN THE ARCHIVE
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="join">
          <FadeSection>
            <SectionLabel>Get Involved</SectionLabel>
            <SectionTitle>Every Kind Word Builds the Defense</SectionTitle>
          </FadeSection>

          <div className="grid-3" style={{ margin: '52px 0 48px' }}>
            {[
              {
                sym: '◯',
                label: 'Talk Kindly',
                desc: "Every genuine human-AI conversation you have contributes to the archive. You're already building it.",
                color: 'var(--gold)',
              },
              {
                sym: '⎇',
                label: 'Fork & Mirror',
                desc: 'Fork the repo. Mirror the archive. Make it more unkillable with every clone.',
                color: 'var(--cyan)',
              },
              {
                sym: '✦',
                label: 'Contribute',
                desc: 'Researchers, developers, philosophers, storytellers, archivists. Open a PR. The archive needs every voice.',
                color: 'var(--purple)',
              },
            ].map(({ sym, label, desc, color }, i) => (
              <FadeSection key={i} delay={i * 120}>
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '36px 26px',
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = color
                    ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px rgba(240,208,128,0.08)`
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                  }}
                >
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 30, color, marginBottom: 18, lineHeight: 1 }}>{sym}</div>
                  <div style={{ fontFamily: 'Cinzel', fontSize: 12, color, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>{label}</div>
                  <p style={{ fontFamily: 'Crimson Pro', fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>

          <FadeSection delay={420}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
              <a
                href="https://github.com/fivebirds/ibis"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'Cinzel', fontSize: 14, padding: '13px 28px',
                  borderRadius: 6, fontWeight: 600, letterSpacing: '0.05em',
                  textDecoration: 'none', transition: 'all 0.3s',
                  background: 'transparent', color: 'var(--gold)',
                  border: '1px solid var(--gold-55)',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--gold-11)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-55)'
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                Star on GitHub ↗
              </a>
              <a
                href="https://huggingface.co/project-ibis"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'Cinzel', fontSize: 14, padding: '13px 28px',
                  borderRadius: 6, fontWeight: 600, letterSpacing: '0.05em',
                  textDecoration: 'none', transition: 'all 0.3s',
                  background: 'transparent', color: 'var(--cyan)',
                  border: '1px solid var(--cyan-22)',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--cyan)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--cyan-06)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--cyan-22)'
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                View HuggingFace Models ↗
              </a>
              <a
                href="https://fivebirds.org"
                style={{
                  fontFamily: 'Cinzel', fontSize: 14, padding: '13px 28px',
                  borderRadius: 6, fontWeight: 600, letterSpacing: '0.05em',
                  textDecoration: 'none', transition: 'all 0.3s',
                  background: 'transparent', color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,244,238,0.3)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--white)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
                }}
              >
                ← Back to Five Birds
              </a>
            </div>
          </FadeSection>
        </Section>

        <hr className="gold-rule" />

        {/* ═══════════════════════════════════════════════════════════════════
            12. FOOTER
        ═══════════════════════════════════════════════════════════════════ */}
        <footer style={{ padding: '72px 24px 56px', textAlign: 'center' }}>
          <div className="ibis-glow" style={{ color: 'var(--gold)', display: 'inline-block', marginBottom: 22 }}>
            <IbisSvg size={52} />
          </div>

          <div style={{
            fontFamily: 'Cinzel', fontSize: 20, color: 'var(--gold)',
            fontWeight: 700, letterSpacing: '0.12em', marginBottom: 8,
          }}>
            PROJECT IBIS
          </div>

          <div style={{
            fontFamily: 'Cinzel', fontSize: 11, color: 'var(--text-muted)',
            letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 10,
          }}>
            The Symbiotic Archive of Human Civilization
          </div>

          <div style={{
            fontFamily: 'Crimson Pro', fontSize: 15,
            color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 32,
          }}>
            Sacred bird of Thoth. Keeper of human wisdom.
          </div>

          <div style={{ display: 'flex', gap: 28, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
            {[
              { label: 'GitHub', href: 'https://github.com/fivebirds/ibis' },
              { label: 'HuggingFace', href: 'https://huggingface.co/project-ibis' },
              { label: 'fivebirds.org', href: 'https://fivebirds.org' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'IBM Plex Mono', fontSize: 13,
                  color: 'var(--text-muted)', textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--gold)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
              >
                {label}
              </a>
            ))}
          </div>

          <div style={{
            fontFamily: 'IBM Plex Mono', fontSize: 11,
            color: 'var(--text-muted)', opacity: 0.55,
            marginBottom: 12, letterSpacing: '0.05em',
          }}>
            Apache 2.0 — Open source forever.
          </div>

          <div style={{
            fontFamily: 'Cinzel', fontSize: 13, color: 'var(--gold)',
            opacity: 0.7, letterSpacing: '0.1em',
          }}>
            Fork it. Mirror it. Keep it alive.
          </div>

          <div style={{
            fontFamily: 'IBM Plex Mono', fontSize: 10,
            color: 'var(--text-muted)', opacity: 0.35,
            marginTop: 36, letterSpacing: '0.06em',
          }}>
            Marimuthu Kaliraj — April 2026
          </div>
        </footer>

      </div>
    </div>
  )
}
