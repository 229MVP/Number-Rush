import { useState, useEffect, useRef } from "react";
import {
  Home, Target, Trophy, User, Settings, ArrowLeft, Pause,
  Heart, Zap, ShoppingBag, Star, Shield, Snowflake,
  HelpCircle, RotateCcw, ChevronRight, Plus,
  Volume2, Bell, Globe, LogOut, Vibrate, Music,
  Play, Shuffle, X, Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | "splash" | "menu" | "gameplay" | "powerups" | "tournament"
  | "ranked" | "victory" | "gameover" | "profile" | "shop"
  | "missions" | "leaderboard" | "settings";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      "#050617",
  bg2:     "#0A0D24",
  card:    "#10132E",
  pink:    "#FF2DBB",
  magenta: "#FF0F8F",
  blue:    "#16C8FF",
  cyan:    "#4DEBFF",
  purple:  "#8D3DFF",
  orange:  "#FF9D1C",
  yellow:  "#FFD339",
  green:   "#57F287",
  white:   "#F7F8FF",
  muted:   "#9298BA",
  red:     "#FF365E",
};

// ─── Style helpers ────────────────────────────────────────────────────────────
const glow = (color: string, r = 12) => ({
  boxShadow: `0 0 ${r}px ${color}99, 0 0 ${r * 2}px ${color}33`,
});
const tglow = (color: string, r = 8) => ({
  textShadow: `0 0 ${r}px ${color}, 0 0 ${r * 2}px ${color}55`,
});
const cardStyle = (color = C.blue): React.CSSProperties => ({
  background: `linear-gradient(135deg, ${C.card}, ${C.bg2})`,
  border: `1px solid ${color}44`,
  boxShadow: `0 0 12px ${color}18, inset 0 0 10px ${color}06`,
  borderRadius: 14,
});

// ─── Shared primitives ────────────────────────────────────────────────────────

function GridBg({ op = 0.07 }: { op?: number }) {
  const hex = Math.round(op * 255).toString(16).padStart(2, "0");
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      backgroundImage: `linear-gradient(${C.blue}${hex} 1px,transparent 1px),linear-gradient(90deg,${C.blue}${hex} 1px,transparent 1px)`,
      backgroundSize: "32px 32px",
    }} />
  );
}

function PGrid() {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 180, pointerEvents: "none", overflow: "hidden" }}>
      <svg width="100%" height="100%" viewBox="0 0 390 180" preserveAspectRatio="none">
        {[...Array(10)].map((_, i) => {
          const t = i / 9;
          return (
            <line key={i} x1={195 - 195 * t * 1.9} y1={t * 180}
              x2={195 + 195 * t * 1.9} y2={t * 180}
              stroke={C.blue} strokeOpacity={0.08 + t * 0.12} strokeWidth="0.6" />
          );
        })}
        {[...Array(9)].map((_, i) => (
          <line key={i} x1={195} y1={0} x2={((i + 1) / 10) * 390} y2={180}
            stroke={C.blue} strokeOpacity={0.08} strokeWidth="0.6" />
        ))}
      </svg>
    </div>
  );
}

function Dot({ x, y, color, sz = 3 }: { x: number; y: number; color: string; sz?: number }) {
  return (
    <div style={{
      position: "absolute", left: `${x}%`, top: `${y}%`,
      width: sz, height: sz, borderRadius: "50%",
      background: color, boxShadow: `0 0 6px ${color},0 0 12px ${color}`,
      pointerEvents: "none",
    }} />
  );
}

// NeonButton
function Btn({
  children, color, onClick, lg, sm, full = true, style: sx = {},
}: {
  children: React.ReactNode; color: string; onClick?: () => void;
  lg?: boolean; sm?: boolean; full?: boolean; style?: React.CSSProperties;
}) {
  const [p, setP] = useState(false);
  const pad = lg ? "14px 24px" : sm ? "8px 14px" : "11px 20px";
  const fs  = lg ? 17 : sm ? 12 : 14;
  return (
    <button
      onPointerDown={() => setP(true)} onPointerUp={() => setP(false)}
      onPointerLeave={() => setP(false)} onClick={onClick}
      style={{
        background: `linear-gradient(140deg,${color}cc,${color}88)`,
        border: `1px solid ${color}`,
        boxShadow: p ? `0 0 6px ${color}55` : `0 0 18px ${color}77,0 0 36px ${color}33,inset 0 1px 0 ${color}44`,
        borderRadius: 10, padding: pad, color: C.white,
        fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
        fontSize: fs, letterSpacing: "1.5px", textTransform: "uppercase",
        cursor: "pointer", width: full ? "100%" : "auto",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transform: p ? "scale(0.95)" : "scale(1)",
        transition: "all 0.12s ease", ...sx,
      }}
    >
      {children}
    </button>
  );
}

function SecBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: `linear-gradient(135deg,${C.bg2},${C.card})`,
      border: `1px solid ${C.blue}44`, boxShadow: `0 0 8px ${C.blue}18`,
      borderRadius: 10, padding: "11px 20px", color: C.muted,
      fontFamily: "'Orbitron',sans-serif", fontWeight: 600,
      fontSize: 13, letterSpacing: "1px", textTransform: "uppercase",
      cursor: "pointer", width: "100%",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      transition: "all 0.12s ease",
    }}>
      {children}
    </button>
  );
}

function IconBtn({ children, onClick, color = C.blue }: { children: React.ReactNode; onClick?: () => void; color?: string }) {
  return (
    <button onClick={onClick} style={{
      background: C.card, border: `1px solid ${color}44`,
      borderRadius: 10, width: 36, height: 36,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color, flexShrink: 0,
    }}>
      {children}
    </button>
  );
}

function TopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", padding: "14px 16px",
      borderBottom: `1px solid ${C.blue}18`,
    }}>
      {onBack && <IconBtn onClick={onBack}><ArrowLeft size={17} /></IconBtn>}
      <div style={{
        flex: 1, textAlign: "center",
        fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: 14,
        letterSpacing: "2px", color: C.white, ...tglow(C.blue, 5),
      }}>{title}</div>
      {right ? right : onBack ? <div style={{ width: 36 }} /> : null}
    </div>
  );
}

function CurrChip() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "5px 10px", background: C.card,
      border: `1px solid ${C.blue}22`, borderRadius: 20,
      fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 12, color: C.white,
    }}>
      <span style={{ color: C.yellow }}>⬡</span><span>12,450</span>
      <span style={{ color: C.pink, marginLeft: 4 }}>◆</span><span>350</span>
    </div>
  );
}

function ProgBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: C.bg2, borderRadius: 4, height: 5, overflow: "hidden", width: "100%" }}>
      <div style={{
        width: `${Math.min(pct, 100)}%`, height: "100%",
        background: `linear-gradient(90deg,${color}aa,${color})`,
        borderRadius: 4, boxShadow: `0 0 5px ${color}`,
      }} />
    </div>
  );
}

function BottomNav({ active, nav }: { active: Screen; nav: (s: Screen) => void }) {
  const items = [
    { id: "menu" as Screen, Icon: Home, label: "HOME" },
    { id: "missions" as Screen, Icon: Target, label: "MISSIONS" },
    { id: "leaderboard" as Screen, Icon: Trophy, label: "RANKS" },
    { id: "profile" as Screen, Icon: User, label: "PROFILE" },
  ];
  return (
    <div style={{
      display: "flex", borderTop: `1px solid ${C.blue}18`,
      background: `${C.bg2}ee`, backdropFilter: "blur(12px)", padding: "6px 0 2px",
    }}>
      {items.map(({ id, Icon, label }) => {
        const on = active === id;
        return (
          <button key={id} onClick={() => nav(id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, background: "none", border: "none", cursor: "pointer", padding: "3px 0",
          }}>
            <div style={{ color: on ? C.pink : C.muted, ...(on ? tglow(C.pink, 5) : {}) }}>
              <Icon size={20} />
            </div>
            <span style={{
              fontFamily: "'Rajdhani',sans-serif", fontSize: 9, fontWeight: 700,
              letterSpacing: "0.5px", color: on ? C.pink : C.muted,
            }}>{label}</span>
            {on && <div style={{ width: 18, height: 2, background: C.pink, borderRadius: 1, ...glow(C.pink, 3) }} />}
          </button>
        );
      })}
    </div>
  );
}

function Logo({ scale = 1 }: { scale?: number }) {
  return (
    <div style={{ textAlign: "center", lineHeight: 1, transform: `scale(${scale})` }}>
      <div style={{
        fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 38,
        letterSpacing: 4, color: C.pink, ...tglow(C.pink, 14), transform: "skewX(-4deg)",
      }}>NUMBER</div>
      <div style={{
        fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 46,
        letterSpacing: 6, color: C.blue, ...tglow(C.blue, 16),
        transform: "skewX(-4deg)", marginTop: -6,
      }}>RUSH</div>
    </div>
  );
}

// ─── Screen: Splash ───────────────────────────────────────────────────────────
function SplashScreen({ nav }: { nav: (s: Screen) => void }) {
  const [blink, setBlink] = useState(true);
  useEffect(() => { const t = setInterval(() => setBlink(b => !b), 750); return () => clearInterval(t); }, []);
  const dots = [
    { x: 12, y: 18, c: C.pink }, { x: 84, y: 16, c: C.blue },
    { x: 6,  y: 50, c: C.purple }, { x: 92, y: 46, c: C.cyan },
    { x: 22, y: 75, c: C.orange }, { x: 78, y: 72, c: C.pink },
    { x: 50, y: 10, c: C.yellow }, { x: 38, y: 82, c: C.blue },
    { x: 65, y: 30, c: C.green },
  ];
  return (
    <div onClick={() => nav("menu")} style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse at 50% 38%,${C.purple}28 0%,${C.bg} 62%)`,
      position: "relative", overflow: "hidden", cursor: "pointer",
    }}>
      <GridBg op={0.05} />
      <PGrid />
      {dots.map((d, i) => <Dot key={i} x={d.x} y={d.y} color={d.c} sz={i % 3 === 0 ? 4 : 2} />)}

      {/* Lightning sparks */}
      {[...Array(7)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${8 + i * 13}%`, top: `${28 + (i % 4) * 8}%`,
          width: 1.5, height: `${10 + (i % 3) * 7}px`,
          background: `linear-gradient(${i % 2 === 0 ? C.pink : C.cyan},transparent)`,
          transform: `rotate(${-25 + i * 8}deg)`, opacity: 0.65, pointerEvents: "none",
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        <div style={{ marginBottom: 14, color: C.yellow, ...tglow(C.yellow, 8) }}>
          <Zap size={30} style={{ display: "inline" }} />
        </div>
        <Logo />
        <div style={{
          marginTop: 18, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
          fontSize: 14, color: C.muted, letterSpacing: "3px", textTransform: "uppercase",
        }}>Place. Stack. Hit the Target.</div>
      </div>

      {/* Holographic platform */}
      <div style={{
        position: "absolute", bottom: 128, left: "50%", transform: "translateX(-50%)",
        width: 200, height: 8,
        background: `linear-gradient(90deg,transparent,${C.pink}88,${C.blue}88,transparent)`,
        borderRadius: "50%", filter: "blur(2px)", ...glow(C.pink, 8),
      }} />

      <div style={{
        position: "absolute", bottom: 62,
        fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
        fontSize: 12, letterSpacing: "4px", color: C.pink,
        opacity: blink ? 1 : 0.25, transition: "opacity 0.35s ease",
        ...tglow(C.pink, 5),
      }}>TAP TO START</div>
    </div>
  );
}

// ─── Screen: Main Menu ────────────────────────────────────────────────────────
function MenuScreen({ nav }: { nav: (s: Screen) => void }) {
  const btns: { label: string; color: string; icon: React.ReactNode; to: Screen }[] = [
    { label: "PLAY", color: C.pink,   icon: <Play size={17} />,        to: "gameplay"   },
    { label: "DAILY TOURNAMENT", color: C.orange, icon: <Star size={17} />,  to: "tournament" },
    { label: "RANKED", color: C.blue, icon: <Trophy size={17} />,      to: "ranked"     },
    { label: "SHOP",   color: C.purple, icon: <ShoppingBag size={17} />, to: "shop"      },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 16px 0" }}>
        <CurrChip />
        <IconBtn onClick={() => nav("settings")} color={C.muted}><Settings size={17} /></IconBtn>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px 10px", position: "relative", overflow: "hidden" }}>
        <GridBg op={0.05} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 22%,${C.purple}1a 0%,transparent 60%)`, pointerEvents: "none" }} />

        <div style={{ marginTop: 10, marginBottom: 26, position: "relative", zIndex: 1 }}>
          <Logo scale={0.84} />
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 }}>
          {btns.map(b => (
            <Btn key={b.label} color={b.color} lg onClick={() => nav(b.to)}>
              {b.icon}{b.label}
            </Btn>
          ))}
        </div>

        <PGrid />
      </div>

      <BottomNav active="menu" nav={nav} />
    </div>
  );
}

// ─── Screen: Gameplay ─────────────────────────────────────────────────────────

type LaneState = "default" | "selected" | "perfect" | "bust" | "frozen";

interface ScorePopup { id: number; text: string; x: number; }

function GameplayScreen({ nav }: { nav: (s: Screen) => void }) {
  const TARGET = 21;

  // Lane data — totals are interactive
  const [laneTotals, setLaneTotals] = useState([14, 8, 21, 5]);
  const [laneStates, setLaneStates] = useState<LaneState[]>(["default", "default", "perfect", "default"]);
  const [laneShake, setLaneShake]   = useState([false, false, false, false]);
  const [sel, setSel]               = useState<number | null>(null);

  // Game state
  const [score, setScore]           = useState(12450);
  const [combo, setCombo]           = useState(3);
  const [strikes, setStrikes]       = useState(2); // out of 3
  const [currentTile, setCurrentTile] = useState(7);
  const [nextTile, setNextTile]     = useState(4);
  const [scoreAnim, setScoreAnim]   = useState(false);
  const [comboAnim, setComboAnim]   = useState(false);

  // UI state
  const [paused, setPaused]         = useState(false);
  const [tutStep, setTutStep]       = useState<number | null>(1); // 1-3 or null
  const [multiSel, setMultiSel]     = useState(false);
  const [popups, setPopups]         = useState<ScorePopup[]>([]);
  const popupId                     = useRef(0);

  // Keyframe style injection
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes floatUp {
        0%   { opacity: 1; transform: translateY(0) scale(1); }
        80%  { opacity: 0.8; transform: translateY(-48px) scale(1.1); }
        100% { opacity: 0; transform: translateY(-64px) scale(0.9); }
      }
      @keyframes laneShakeAnim {
        0%,100% { transform: translateX(0); }
        20%     { transform: translateX(-6px); }
        40%     { transform: translateX(6px); }
        60%     { transform: translateX(-4px); }
        80%     { transform: translateX(4px); }
      }
      @keyframes perfectPulse {
        0%,100% { box-shadow: 0 0 22px #FF9D1C88,0 0 44px #FF9D1C33; }
        50%     { box-shadow: 0 0 38px #FF9D1Ccc,0 0 70px #FF9D1C66; }
      }
      @keyframes comboFlash {
        0%,100% { transform: scale(1); }
        50%     { transform: scale(1.3); }
      }
      @keyframes scorePop {
        0%,100% { transform: scale(1); }
        50%     { transform: scale(1.15); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  function addPopup(text: string, laneIdx: number) {
    const id = ++popupId.current;
    const x = 12 + laneIdx * 24; // rough x% per lane
    setPopups(ps => [...ps, { id, text, x }]);
    setTimeout(() => setPopups(ps => ps.filter(p => p.id !== id)), 1100);
  }

  function tapLane(idx: number) {
    if (laneStates[idx] === "frozen" || paused) return;
    const newTotal = laneTotals[idx] + currentTile;
    const newTotals  = [...laneTotals];
    const newStates  = [...laneStates];
    const newShake   = [...laneShake];

    if (newTotal === TARGET) {
      // Perfect!
      newStates[idx]  = "perfect";
      newTotals[idx]  = TARGET;
      const pts = 200 * (combo + 1);
      setScore(s => s + pts);
      setCombo(c => c + 1);
      setScoreAnim(true); setTimeout(() => setScoreAnim(false), 300);
      setComboAnim(true); setTimeout(() => setComboAnim(false), 350);
      addPopup(`PERFECT +${pts}`, idx);
      // Reset lane after delay
      setTimeout(() => {
        setLaneTotals(ts => { const n = [...ts]; n[idx] = 0; return n; });
        setLaneStates(ss => { const n = [...ss]; n[idx] = "default"; return n; });
      }, 900);
    } else if (newTotal > TARGET) {
      // Bust
      newStates[idx]  = "bust";
      newTotals[idx]  = newTotal;
      newShake[idx]   = true;
      const newStrikes = strikes - 1;
      setStrikes(newStrikes);
      setCombo(0);
      addPopup("BUST!", idx);
      setTimeout(() => {
        setLaneTotals(ts => { const n = [...ts]; n[idx] = 0; return n; });
        setLaneStates(ss => { const n = [...ss]; n[idx] = "default"; return n; });
        setLaneShake(sk  => { const n = [...sk]; n[idx] = false; return n; });
      }, 900);
      if (newStrikes <= 0) setTimeout(() => nav("gameover"), 1200);
    } else {
      // Normal placement
      newStates[idx]  = "selected";
      newTotals[idx]  = newTotal;
      const pts = 100;
      setScore(s => s + pts);
      setScoreAnim(true); setTimeout(() => setScoreAnim(false), 300);
      addPopup(`+${pts}`, idx);
      setTimeout(() => {
        setLaneStates(ss => { const n = [...ss]; n[idx] = "default"; return n; });
      }, 400);
    }

    setLaneTotals(newTotals);
    setLaneStates(newStates);
    setLaneShake(newShake);
    setSel(null);

    // Advance tiles
    setCurrentTile(nextTile);
    setNextTile(Math.floor(Math.random() * 9) + 1);
  }

  function laneBorderColor(state: LaneState, isSelected: boolean) {
    if (state === "perfect") return C.orange;
    if (state === "bust")    return C.red;
    if (state === "frozen")  return C.cyan;
    if (isSelected)          return C.pink;
    return C.purple + "66";
  }
  function laneBg(state: LaneState, isSelected: boolean) {
    if (state === "perfect") return `linear-gradient(160deg,${C.orange}28,${C.card})`;
    if (state === "bust")    return `linear-gradient(160deg,${C.red}28,${C.card})`;
    if (state === "frozen")  return `linear-gradient(160deg,${C.cyan}22,${C.card})`;
    if (isSelected)          return `linear-gradient(160deg,${C.pink}22,${C.card})`;
    return `linear-gradient(170deg,${C.card},${C.bg2})`;
  }
  function laneGlow(state: LaneState, isSelected: boolean) {
    if (state === "perfect") return { animation: "perfectPulse 1.2s ease infinite" };
    if (state === "bust")    return { boxShadow: `0 0 20px ${C.red}88,0 0 40px ${C.red}33` };
    if (state === "frozen")  return { boxShadow: `0 0 14px ${C.cyan}77` };
    if (isSelected)          return { boxShadow: `0 0 18px ${C.pink}77,0 0 36px ${C.pink}33` };
    return { boxShadow: `0 0 8px ${C.purple}22` };
  }
  function laneTextColor(state: LaneState) {
    if (state === "perfect") return C.orange;
    if (state === "bust")    return C.red;
    if (state === "frozen")  return C.cyan;
    return C.white;
  }

  const laneData = [
    { id: 1, remaining: TARGET - laneTotals[0] },
    { id: 2, remaining: TARGET - laneTotals[1] },
    { id: 3, remaining: 0 },
    { id: 4, remaining: TARGET - laneTotals[3] },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", background: C.bg }}>
      <GridBg op={0.05} />

      {/* Floating score popups */}
      {popups.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: "38%",
          fontFamily: "'Orbitron',sans-serif", fontWeight: 800,
          fontSize: 13, color: C.yellow, letterSpacing: "0.5px",
          ...tglow(C.yellow, 6), zIndex: 50, pointerEvents: "none",
          animation: "floatUp 1.1s ease forwards",
          whiteSpace: "nowrap",
        }}>{p.text}</div>
      ))}

      {/* ── HUD ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 12px 6px", position: "relative", zIndex: 10,
        background: `${C.bg2}cc`, borderBottom: `1px solid ${C.blue}18`,
      }}>
        {/* Pause */}
        <button
          onClick={() => setPaused(true)}
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: C.card, border: `2px solid ${C.pink}88`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: C.pink, flexShrink: 0,
            boxShadow: `0 0 10px ${C.pink}44`,
          }}
        >
          <Pause size={18} />
        </button>

        {/* Score */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, letterSpacing: "1.5px", fontWeight: 700 }}>SCORE</div>
          <div style={{
            fontFamily: "'Orbitron',sans-serif", fontWeight: 800, fontSize: 19,
            color: C.white, ...tglow(C.blue, 5),
            animation: scoreAnim ? "scorePop 0.3s ease" : "none",
          }}>{score.toLocaleString()}</div>
        </div>

        {/* Combo */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, letterSpacing: "1.5px", fontWeight: 700 }}>COMBO</div>
          <div style={{
            fontFamily: "'Orbitron',sans-serif", fontWeight: 800,
            fontSize: combo >= 5 ? 20 : 17,
            color: combo >= 5 ? C.yellow : C.orange,
            ...(combo >= 5 ? tglow(C.yellow, 8) : tglow(C.orange, 5)),
            display: "flex", alignItems: "center", gap: 2,
            animation: comboAnim ? "comboFlash 0.35s ease" : "none",
          }}>
            {combo >= 3 && <Zap size={13} />}x{combo}
          </div>
        </div>

        {/* Strikes */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, letterSpacing: "1.5px", fontWeight: 700, marginBottom: 2 }}>STRIKES</div>
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2].map(i => {
              const filled = i < strikes;
              const isLast = strikes === 1 && i === 0;
              return (
                <Heart key={i} size={17}
                  fill={filled ? C.pink : "none"}
                  stroke={filled ? C.pink : C.muted + "66"}
                  strokeWidth={2}
                  style={filled ? {
                    filter: `drop-shadow(0 0 ${isLast ? 8 : 4}px ${C.pink})`,
                    animation: isLast ? "comboFlash 1s ease infinite" : "none",
                  } : { opacity: 0.3 }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Target panel ── */}
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 6px", position: "relative", zIndex: 1 }}>
        <div style={{
          background: `linear-gradient(135deg,${C.card},${C.bg2})`,
          border: `1.5px solid ${C.blue}88`,
          boxShadow: `0 0 14px ${C.blue}44, inset 0 0 12px ${C.pink}14`,
          borderRadius: 12, padding: "5px 24px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 11, color: C.muted, letterSpacing: "2px" }}>TARGET</div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 26, color: C.blue, ...tglow(C.blue, 8), lineHeight: 1 }}>21</div>
        </div>
      </div>

      {/* ── Lanes ── */}
      <div style={{ display: "flex", gap: 7, padding: "0 10px", height: 248, position: "relative", zIndex: 1 }}>
        {laneData.map((lane, idx) => {
          const state    = laneStates[idx];
          const total    = laneTotals[idx];
          const isSelected = sel === idx;
          const pct      = Math.min((total / TARGET) * 100, 100);
          const bc       = laneBorderColor(state, isSelected);
          const progressColor = state === "bust" ? C.red : state === "frozen" ? C.cyan : state === "perfect" ? C.orange : C.pink;

          return (
            <div
              key={lane.id}
              onClick={() => {
                setSel(isSelected ? null : idx);
                if (tutStep === 2) setTutStep(3);
              }}
              style={{
                flex: 1,
                background: laneBg(state, isSelected),
                border: `2px solid ${bc}`,
                borderRadius: 14,
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "8px 3px 7px", cursor: "pointer",
                transform: isSelected ? "scale(1.04)" : "scale(1)",
                animation: laneShake[idx] ? "laneShakeAnim 0.5s ease" : "none",
                transition: "transform 0.15s ease, border-color 0.15s ease",
                ...laneGlow(state, isSelected),
                gap: 4,
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Frozen overlay */}
              {state === "frozen" && (
                <div style={{
                  position: "absolute", inset: 0, background: `${C.cyan}12`,
                  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
                  backdropFilter: "blur(1px)",
                }}>
                  <Snowflake size={28} color={C.cyan} style={{ filter: `drop-shadow(0 0 6px ${C.cyan})`, opacity: 0.7 }} />
                </div>
              )}

              {/* Lane number badge */}
              <div style={{
                background: `${bc}33`, border: `1px solid ${bc}55`,
                borderRadius: 6, padding: "1px 6px",
                fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: bc, fontWeight: 800,
              }}>LANE {lane.id}</div>

              {/* Total */}
              <div style={{
                fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 30,
                color: laneTextColor(state), lineHeight: 1,
                ...(state !== "default" && state !== "selected" ? tglow(bc, 8) : {}),
              }}>{total}</div>

              {/* Remaining label */}
              {state !== "perfect" && state !== "bust" && (
                <div style={{
                  fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, fontWeight: 600,
                }}>need {Math.max(0, TARGET - total)}</div>
              )}

              {/* Progress bar */}
              <div style={{ width: "100%", padding: "0 2px", marginTop: "auto" }}>
                <ProgBar pct={pct} color={progressColor} />
              </div>

              {/* State labels */}
              {state === "perfect" && (
                <div style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: 8, fontWeight: 800,
                  color: C.orange, letterSpacing: "0.5px", ...tglow(C.orange, 4),
                }}>PERFECT!</div>
              )}
              {state === "bust" && (
                <div style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: 8, fontWeight: 800,
                  color: C.red, letterSpacing: "0.5px", ...tglow(C.red, 4),
                }}>BUST!</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Current tile + Next preview ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 16, padding: "10px 16px 4px", position: "relative", zIndex: 1,
      }}>
        {/* Current tile */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: "1.5px" }}>CURRENT TILE</div>
          <div
            onClick={() => { if (tutStep === 1) setTutStep(2); }}
            style={{
              width: 72, height: 72,
              background: `linear-gradient(135deg,${C.purple}55,${C.card})`,
              border: `2px solid ${C.purple}`,
              borderRadius: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 24px ${C.purple}99,0 0 48px ${C.purple}33,inset 0 0 18px ${C.pink}22`,
              cursor: "pointer",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Corner accents */}
            <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: `2px solid ${C.pink}`, borderLeft: `2px solid ${C.pink}`, borderRadius: "2px 0 0 0" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderBottom: `2px solid ${C.pink}`, borderRight: `2px solid ${C.pink}`, borderRadius: "0 0 2px 0" }} />
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 38, color: C.white, ...tglow(C.purple, 10) }}>{currentTile}</span>
          </div>
        </div>

        {/* Next tile */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: "1px" }}>NEXT</div>
          <div style={{
            width: 46, height: 46,
            background: `linear-gradient(135deg,${C.blue}28,${C.card})`,
            border: `1.5px solid ${C.blue}55`,
            borderRadius: 12, opacity: 0.75,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 10px ${C.blue}33`,
          }}>
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 800, fontSize: 22, color: C.blue, ...tglow(C.blue, 5) }}>{nextTile}</span>
          </div>
        </div>
      </div>

      {/* ── Power-up buttons ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "4px 16px 4px", position: "relative", zIndex: 1,
      }}>
        {/* Multiplier */}
        <button
          onClick={() => setMultiSel(m => !m)}
          style={{
            background: multiSel ? `${C.orange}33` : `${C.orange}18`,
            border: `1.5px solid ${multiSel ? C.orange : C.orange + "55"}`,
            borderRadius: 12, padding: "7px 12px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7,
            ...(multiSel ? glow(C.orange, 8) : {}),
            transition: "all 0.15s ease",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 14, color: multiSel ? C.yellow : C.orange, ...tglow(C.orange, 3) }}>x2</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.orange, fontWeight: 700 }}>MULTI</div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, fontWeight: 600 }}>×2 left</div>
          </div>
          <Zap size={13} color={multiSel ? C.yellow : C.orange} />
        </button>

        {/* Instructions */}
        <div style={{ textAlign: "center", flex: 1, padding: "0 8px" }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, color: C.white, fontWeight: 700, letterSpacing: "0.3px" }}>TAP A LANE TO PLACE THE TILE</div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, marginTop: 2 }}>Hit exactly 21. Don't go over.</div>
        </div>

        {/* Swap */}
        <button
          style={{
            background: `${C.blue}18`,
            border: `1.5px solid ${C.blue}55`,
            borderRadius: 12, padding: "7px 12px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7,
            transition: "all 0.15s ease",
          }}
        >
          <Shuffle size={15} color={C.blue} />
          <div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.blue, fontWeight: 700 }}>SWAP</div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, fontWeight: 600 }}>×3 left</div>
          </div>
        </button>
      </div>

      {/* Perspective grid */}
      <PGrid />

      {/* Quick nav row */}
      <div style={{ display: "flex", gap: 8, padding: "4px 12px 10px", position: "relative", zIndex: 1 }}>
        <Btn color={C.green} sm onClick={() => nav("victory")} style={{ flex: 1 }}><Check size={12} /> WIN</Btn>
        <Btn color={C.red}   sm onClick={() => nav("gameover")} style={{ flex: 1 }}><X size={12} /> LOSE</Btn>
      </div>

      {/* ── Pause modal ── */}
      {paused && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 80,
          background: "rgba(5,6,23,0.88)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 300,
            background: `linear-gradient(135deg,${C.card},${C.bg2})`,
            border: `1.5px solid ${C.pink}66`,
            borderRadius: 20, padding: "28px 24px",
            boxShadow: `0 0 40px ${C.pink}44,0 0 80px ${C.purple}22`,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{ textAlign: "center", fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 28, color: C.pink, letterSpacing: "3px", ...tglow(C.pink, 10), marginBottom: 4 }}>PAUSED</div>
            <Btn color={C.pink} lg onClick={() => setPaused(false)}><Play size={17} /> RESUME</Btn>
            <Btn color={C.orange} onClick={() => { setPaused(false); setLaneTotals([14, 8, 21, 5]); setScore(0); setCombo(0); setStrikes(3); }}>
              <RotateCcw size={15} /> RESTART RUN
            </Btn>
            <Btn color={C.blue} onClick={() => { setPaused(false); nav("settings"); }}>
              <Settings size={15} /> SETTINGS
            </Btn>
            <SecBtn onClick={() => { setPaused(false); nav("menu"); }}>
              <Home size={15} /> QUIT TO MENU
            </SecBtn>
          </div>
        </div>
      )}

      {/* ── Tutorial overlay ── */}
      {tutStep !== null && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 90,
          background: "rgba(5,6,23,0.82)", backdropFilter: "blur(4px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
          paddingBottom: 60,
        }}>
          {/* Spotlight hint */}
          <div style={{
            position: "absolute",
            ...(tutStep === 1 ? { top: "48%", left: "50%", transform: "translate(-50%,-50%)", width: 100, height: 100, borderRadius: 20 } :
                tutStep === 2 ? { top: "26%", left: "50%", transform: "translate(-50%,-50%)", width: 330, height: 200, borderRadius: 18 } :
                                { top: "22%", left: "50%", transform: "translate(-50%,-50%)", width: 200, height: 52, borderRadius: 14 }),
            boxShadow: `0 0 0 9999px rgba(5,6,23,0.82), 0 0 30px ${C.cyan}66`,
            border: `2px solid ${C.cyan}88`,
            pointerEvents: "none",
          }} />

          {/* Card */}
          <div style={{
            width: 300, background: `linear-gradient(135deg,${C.card},${C.bg2})`,
            border: `1.5px solid ${C.cyan}66`, borderRadius: 18, padding: "20px 22px",
            boxShadow: `0 0 30px ${C.cyan}33`, textAlign: "center",
          }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, color: C.cyan, fontWeight: 700, letterSpacing: "1px", marginBottom: 8 }}>
              STEP {tutStep} OF 3
            </div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 16, color: C.white, fontWeight: 600, lineHeight: 1.5, marginBottom: 16 }}>
              {tutStep === 1 && "This is your current number."}
              {tutStep === 2 && "Tap a lane to add the number."}
              {tutStep === 3 && "Reach exactly 21 to clear the lane!"}
            </div>

            {/* Progress dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{
                  width: s === tutStep ? 18 : 7, height: 7, borderRadius: 4,
                  background: s === tutStep ? C.cyan : `${C.muted}55`,
                  transition: "width 0.2s ease",
                  ...(s === tutStep ? glow(C.cyan, 4) : {}),
                }} />
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setTutStep(null)} style={{
                flex: 1, background: "none", border: `1px solid ${C.muted}44`,
                borderRadius: 8, padding: "8px", cursor: "pointer",
                fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 12,
                color: C.muted, letterSpacing: "1px",
              }}>SKIP</button>
              <Btn color={C.cyan} style={{ flex: 2 }} onClick={() => setTutStep(s => s !== null && s < 3 ? s + 1 : null)}>
                {tutStep === 3 ? "GOT IT!" : "NEXT →"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screen: Power-ups ────────────────────────────────────────────────────────
function PowerupsScreen({ nav }: { nav: (s: Screen) => void }) {
  const items = [
    { name: "MULTIPLIER",  desc: "Multiply your next tile value.",  qty: 12, icon: <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 20 }}>x2</span>, color: C.orange },
    { name: "BOMB TILE",   desc: "Clear a lane of your choice.",    qty: 8,  icon: <Zap size={22} />,       color: C.red    },
    { name: "FREEZE CARD", desc: "Freeze the target for 1 turn.",   qty: 6,  icon: <Snowflake size={22} />, color: C.cyan   },
    { name: "SHIELD",      desc: "Protect from a strike.",          qty: 7,  icon: <Shield size={22} />,    color: C.blue   },
    { name: "WILD TILE",   desc: "Acts as any value you need.",     qty: 9,  icon: <HelpCircle size={22} />,color: C.purple },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar title="POWER-UPS" onBack={() => nav("gameplay")}
        right={
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <CurrChip />
            <IconBtn color={C.pink}><Plus size={14} /></IconBtn>
          </div>
        }
      />
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
        <GridBg op={0.04} />
        {items.map(item => (
          <div key={item.name} style={{ ...cardStyle(item.color), padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 52, height: 52, background: `${item.color}1e`,
              border: `1px solid ${item.color}66`, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: item.color, flexShrink: 0, ...glow(item.color, 7),
            }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: 12, color: item.color, letterSpacing: "0.5px", ...tglow(item.color, 3) }}>{item.name}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>{item.desc}</div>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 800, fontSize: 22, color: C.white }}>{item.qty}</div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, fontWeight: 700 }}>OWNED</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Screen: Daily Tournament ─────────────────────────────────────────────────
function TournamentScreen({ nav }: { nav: (s: Screen) => void }) {
  const players = [
    { rank: 1, name: "NeonMaster", score: "98,750", you: false },
    { rank: 2, name: "PixelPanda",  score: "87,430", you: false },
    { rank: 3, name: "NumBuster",   score: "75,210", you: false },
    { rank: 4, name: "You",         score: "32,780", you: true  },
  ];
  const trophyC = (r: number) => r === 1 ? C.yellow : r === 2 ? "#C0C0C0" : r === 3 ? C.orange : C.muted;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar title="DAILY TOURNAMENT" onBack={() => nav("menu")} />
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
        <GridBg op={0.04} />

        {/* Challenge card */}
        <div style={{ ...cardStyle(C.orange), padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.orange, fontWeight: 700, letterSpacing: "2px", marginBottom: 4 }}>TODAY'S CHALLENGE</div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: 16, color: C.white, ...tglow(C.orange, 4) }}>BEAT THE TARGET</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: C.muted, marginTop: 5, lineHeight: 1.4 }}>Score as high as you can with 3 strikes.</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, ...glow(C.green, 4) }} />
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, color: C.yellow, fontWeight: 700 }}>17h 42m</span>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.muted }}>REMAINING</span>
              </div>
            </div>
            <div style={{ color: C.orange, opacity: 0.5, ...tglow(C.orange, 8) }}><Target size={52} /></div>
          </div>
        </div>

        {/* Leaderboard */}
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "2px" }}>LEADERBOARD</div>
        {players.map(p => (
          <div key={p.rank} style={{
            display: "flex", alignItems: "center", gap: 10, padding: 12,
            background: p.you ? `${C.blue}1e` : C.card,
            border: `1px solid ${p.you ? C.blue : C.blue + "22"}`,
            borderRadius: 12, ...(p.you ? glow(C.blue, 8) : {}),
          }}>
            <div style={{ color: trophyC(p.rank), width: 22, textAlign: "center" }}>
              {p.rank <= 3
                ? <Trophy size={15} style={{ filter: `drop-shadow(0 0 4px ${trophyC(p.rank)})` }} />
                : <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700, color: C.muted }}>{p.rank}</span>
              }
            </div>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${p.you ? C.blue : C.purple},${C.pink})`, border: `2px solid ${p.you ? C.blue : C.purple}55`, flexShrink: 0 }} />
            <div style={{ flex: 1, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14, color: p.you ? C.blue : C.white }}>{p.name}</div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: 13, color: p.you ? C.cyan : C.yellow }}>{p.score}</div>
          </div>
        ))}

        {/* Rewards */}
        <div style={{ ...cardStyle(C.yellow), padding: 14 }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.yellow, fontWeight: 700, letterSpacing: "2px", marginBottom: 10, textAlign: "center" }}>REWARDS</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "15K COINS", icon: "⬡", color: C.yellow },
              { label: "200 GEMS",  icon: "◆", color: C.pink   },
              { label: "MYSTERY",   icon: "?", color: C.purple  },
            ].map(r => (
              <div key={r.label} style={{
                flex: 1, background: `${r.color}18`, border: `1px solid ${r.color}44`,
                borderRadius: 10, padding: "9px 4px", textAlign: "center",
                display: "flex", flexDirection: "column", gap: 3,
              }}>
                <span style={{ fontSize: 18, color: r.color }}>{r.icon}</span>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, fontWeight: 700 }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Btn color={C.pink} lg onClick={() => nav("gameplay")}><Zap size={17} /> ENTER CHALLENGE</Btn>
      </div>
    </div>
  );
}

// ─── Screen: Ranked ───────────────────────────────────────────────────────────
function RankedScreen({ nav }: { nav: (s: Screen) => void }) {
  const divs = [
    { name: "BRONZE",   range: "0 – 299",       color: "#CD7F32", emoji: "🥉", current: false },
    { name: "SILVER",   range: "300 – 699",     color: "#C0C0C0", emoji: "🥈", current: false },
    { name: "GOLD",     range: "700 – 1,299",   color: C.yellow,  emoji: "🥇", current: true  },
    { name: "PLATINUM", range: "1,300 – 1,999", color: C.cyan,    emoji: "💎", current: false },
    { name: "DIAMOND",  range: "2,000 – 2,999", color: C.blue,    emoji: "🔷", current: false },
    { name: "BLAZE",    range: "3,000+",         color: C.orange,  emoji: "🔥", current: false },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar title="RANKED" onBack={() => nav("menu")} />
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
        <GridBg op={0.04} />

        {/* Rank card */}
        <div style={{ ...cardStyle(C.yellow), padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 50, marginBottom: 8, ...tglow(C.yellow, 14) }}>🏆</div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 28, color: C.yellow, letterSpacing: 3, ...tglow(C.yellow, 10) }}>GOLD II</div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 12, color: C.muted, margin: "6px 0 12px" }}>SEASON POINTS: 1,250 / 1,600</div>
          <ProgBar pct={(1250 / 1600) * 100} color={C.orange} />
        </div>

        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "2px" }}>DIVISIONS</div>
        {divs.map(d => (
          <div key={d.name} style={{
            display: "flex", alignItems: "center", gap: 12, padding: 14,
            background: d.current ? `${d.color}18` : C.card,
            border: `1px solid ${d.current ? d.color : d.color + "33"}`,
            borderRadius: 12, ...(d.current ? glow(d.color, 10) : {}),
          }}>
            <div style={{ fontSize: 26, width: 36, textAlign: "center" }}>{d.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: 13, color: d.color, letterSpacing: "0.5px", ...tglow(d.color, 3) }}>{d.name}</div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, color: C.muted, marginTop: 2 }}>{d.range} pts</div>
            </div>
            {d.current && (
              <div style={{ background: `${d.color}33`, border: `1px solid ${d.color}`, borderRadius: 6, padding: "3px 8px" }}>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, fontWeight: 700, color: d.color, letterSpacing: "1px" }}>CURRENT</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Screen: Victory ──────────────────────────────────────────────────────────
function VictoryScreen({ nav }: { nav: (s: Screen) => void }) {
  const confColors = [C.pink, C.blue, C.yellow, C.orange, C.purple, C.cyan, C.green];
  const confetti = [...Array(22)].map((_, i) => ({
    x: 4 + (i * 4.3) % 92, y: 3 + (i * 7.1) % 55,
    color: confColors[i % confColors.length], sz: 2 + (i % 3),
  }));
  const stats = [
    { label: "MAX COMBO",    value: "x6", color: C.cyan   },
    { label: "PERFECT TILES",value: "18", color: C.green  },
    { label: "BEST STREAK",  value: "7",  color: C.orange },
  ];
  const rewards = [
    { icon: "⬡", label: "4,500 COINS", color: C.yellow },
    { icon: "◆", label: "50 GEMS",     color: C.pink   },
    { icon: "★", label: "120 XP",      color: C.purple },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <GridBg op={0.05} />
      {confetti.map((c, i) => <Dot key={i} x={c.x} y={c.y} color={c.color} sz={c.sz} />)}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 28%,${C.green}18 0%,transparent 55%)`, pointerEvents: "none" }} />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 46, color: C.green, letterSpacing: 4, ...tglow(C.green, 18) }}>VICTORY!</div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 12, color: C.yellow, letterSpacing: "2px", marginTop: 5, ...tglow(C.yellow, 4) }}>★ NEW BEST SCORE! ★</div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 38, color: C.white, marginTop: 10, ...tglow(C.white, 5) }}>32,780</div>
        </div>

        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          {stats.map(s => (
            <div key={s.label} style={{ ...cardStyle(s.color), flex: 1, padding: "12px 6px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 800, fontSize: 22, color: s.color, ...tglow(s.color, 6) }}>{s.value}</div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, fontWeight: 700, marginTop: 4, letterSpacing: "0.3px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle(C.yellow), width: "100%", padding: 14 }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.yellow, fontWeight: 700, letterSpacing: "2px", marginBottom: 10, textAlign: "center" }}>REWARDS EARNED</div>
          <div style={{ display: "flex", gap: 8 }}>
            {rewards.map(r => (
              <div key={r.label} style={{ flex: 1, background: `${r.color}18`, border: `1px solid ${r.color}44`, borderRadius: 10, padding: "10px 4px", textAlign: "center" }}>
                <div style={{ fontSize: 20, color: r.color }}>{r.icon}</div>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, fontWeight: 700, marginTop: 3 }}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn color={C.pink} lg onClick={() => nav("gameplay")}><RotateCcw size={17} /> PLAY AGAIN</Btn>
          <SecBtn onClick={() => nav("menu")}><Home size={15} /> MAIN MENU</SecBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Game Over ────────────────────────────────────────────────────────
function GameOverScreen({ nav }: { nav: (s: Screen) => void }) {
  const stats = [
    { label: "MAX COMBO",    value: "x2", color: C.cyan  },
    { label: "PERFECT TILES",value: "6",  color: C.green },
    { label: "STRIKES",      value: "3",  color: C.red   },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <GridBg op={0.05} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 28%,${C.red}18 0%,transparent 55%)`, pointerEvents: "none" }} />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 40, color: C.red, letterSpacing: 3, ...tglow(C.red, 16) }}>RUN OVER</div>
          <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 12 }}>
            {[0, 1, 2].map(i => <Heart key={i} size={20} fill="none" stroke={C.red} strokeWidth={2} style={{ opacity: 0.4 }} />)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <div style={{ ...cardStyle(C.muted), flex: 1, padding: 14, textAlign: "center" }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 4 }}>FINAL SCORE</div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 800, fontSize: 20, color: C.white }}>12,450</div>
          </div>
          <div style={{ ...cardStyle(C.yellow), flex: 1, padding: 14, textAlign: "center" }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 4 }}>BEST SCORE</div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 800, fontSize: 20, color: C.yellow, ...tglow(C.yellow, 4) }}>32,780</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          {stats.map(s => (
            <div key={s.label} style={{ ...cardStyle(s.color), flex: 1, padding: "12px 6px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 800, fontSize: 22, color: s.color, ...tglow(s.color, 5) }}>{s.value}</div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: C.muted, fontWeight: 700, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn color={C.pink} lg onClick={() => nav("gameplay")}><RotateCcw size={17} /> PLAY AGAIN</Btn>
          <SecBtn onClick={() => nav("menu")}><Home size={15} /> MAIN MENU</SecBtn>
        </div>
        <PGrid />
      </div>
    </div>
  );
}

// ─── Screen: Profile ──────────────────────────────────────────────────────────
function ProfileScreen({ nav }: { nav: (s: Screen) => void }) {
  const stats = [
    { label: "Highest Score", value: "98,750", color: C.yellow },
    { label: "Games Played",  value: "274",    color: C.blue   },
    { label: "Best Streak",   value: "12",     color: C.orange },
    { label: "Total Wins",    value: "184",    color: C.green  },
  ];
  const themes = [C.pink, C.blue, C.purple, C.orange, C.cyan, C.green];
  const themeActive = [true, false, false, true, false, false];
  const missions = [
    { text: "Play 3 Ranked Matches",      prog: 2,     total: 3,     reward: "100 coins", color: C.blue   },
    { text: "Score 50,000 in a single run", prog: 32780, total: 50000, reward: "150 gems", color: C.purple },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 0" }}>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: 14, color: C.white, letterSpacing: "2px", ...tglow(C.blue, 4) }}>PROFILE</div>
        <CurrChip />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
        <GridBg op={0.04} />

        {/* Avatar */}
        <div style={{ ...cardStyle(C.pink), padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 68, height: 68, borderRadius: "50%",
              background: `linear-gradient(135deg,${C.purple},${C.pink})`,
              border: `3px solid ${C.pink}`, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, ...glow(C.pink, 12),
            }}>🎮</div>
            <div style={{ position: "absolute", bottom: -2, right: -2, background: C.yellow, borderRadius: 6, padding: "2px 5px", fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 800, color: "#000" }}>23</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: 16, color: C.pink, letterSpacing: "0.5px", ...tglow(C.pink, 4) }}>NeonMaster</div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 12, color: C.muted, marginBottom: 8 }}>Arcade Legend</div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.muted, marginBottom: 4 }}>3,450 / 5,000 XP</div>
            <ProgBar pct={(3450 / 5000) * 100} color={C.pink} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {stats.map(s => (
            <div key={s.label} style={{ ...cardStyle(s.color), padding: 12 }}>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 800, fontSize: 18, color: s.color, ...tglow(s.color, 4) }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Themes */}
        <div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "2px", marginBottom: 8 }}>UNLOCKED THEMES</div>
          <div style={{ display: "flex", gap: 8 }}>
            {themes.map((color, i) => (
              <div key={i} style={{
                flex: 1, height: 38,
                background: `linear-gradient(135deg,${color}44,${C.card})`,
                border: `1px solid ${color}55`, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                ...(themeActive[i] ? glow(color, 6) : {}),
              }}>
                {themeActive[i] && <Check size={11} color={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Missions */}
        <div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "2px", marginBottom: 8 }}>ACTIVE MISSIONS</div>
          {missions.map(m => (
            <div key={m.text} style={{ ...cardStyle(m.color), padding: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 12, color: C.white, fontWeight: 600, flex: 1, paddingRight: 8 }}>{m.text}</div>
                <div style={{ background: `${m.color}22`, border: `1px solid ${m.color}55`, borderRadius: 6, padding: "2px 7px" }}>
                  <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: m.color, fontWeight: 700 }}>{m.reward}</span>
                </div>
              </div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.muted, marginBottom: 4 }}>
                {m.prog > 100 ? `${m.prog.toLocaleString()} / ${m.total.toLocaleString()}` : `${m.prog} / ${m.total}`}
              </div>
              <ProgBar pct={(m.prog / m.total) * 100} color={m.color} />
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="profile" nav={nav} />
    </div>
  );
}

// ─── Screen: Shop ─────────────────────────────────────────────────────────────
function ShopScreen({ nav }: { nav: (s: Screen) => void }) {
  const [tab, setTab] = useState(0);
  const tabs = ["POWER-UPS", "THEMES", "COINS", "GEMS"];

  const puItems = [
    { name: "MULTIPLIER x5", price: "500",   icon: "x2", color: C.orange },
    { name: "BOMB TILE x3",  price: "800 ◆", icon: "💣", color: C.red    },
    { name: "FREEZE x5",     price: "300",   icon: "❄",  color: C.cyan   },
    { name: "SHIELD x3",     price: "1,200", icon: "🛡",  color: C.blue   },
  ];
  const themeItems = [
    { name: "CYBER VOID",  price: "2,500", color: C.purple },
    { name: "SOLAR FLARE", price: "3,000", color: C.orange },
    { name: "OCEAN PULSE", price: "2,800", color: C.cyan   },
  ];
  const coinItems = [
    { label: "5,000 COINS",  price: "$0.99",  bonus: ""             },
    { label: "15,000 COINS", price: "$2.99",  bonus: "+10%"         },
    { label: "50,000 COINS", price: "$9.99",  bonus: "+25% BEST VALUE" },
  ];
  const gemItems = [
    { label: "100 GEMS",   price: "$0.99",  bonus: ""          },
    { label: "500 GEMS",   price: "$3.99",  bonus: ""          },
    { label: "2,000 GEMS", price: "$14.99", bonus: "BEST VALUE" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar title="SHOP" onBack={() => nav("menu")} right={<CurrChip />} />
      <div style={{ display: "flex", padding: "10px 16px 0", gap: 6 }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            flex: 1, padding: "7px 2px",
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: "0.5px",
            cursor: "pointer", background: tab === i ? `${C.pink}22` : C.card,
            border: `1px solid ${tab === i ? C.pink : C.blue + "22"}`,
            borderRadius: 8, color: tab === i ? C.pink : C.muted, transition: "all 0.15s",
            ...(tab === i ? glow(C.pink, 4) : {}),
          }}>{t}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
        <GridBg op={0.04} />

        {tab === 0 && puItems.map(item => (
          <div key={item.name} style={{ ...cardStyle(item.color), padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, background: `${item.color}22`, border: `1px solid ${item.color}55`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, color: item.color }}>{item.icon}</div>
            <div style={{ flex: 1, fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700, color: item.color, letterSpacing: "0.5px" }}>{item.name}</div>
            <Btn color={item.color} sm full={false}>⬡ {item.price}</Btn>
          </div>
        ))}

        {tab === 1 && themeItems.map(item => (
          <div key={item.name} style={{ ...cardStyle(item.color), padding: 14 }}>
            <div style={{ height: 56, background: `linear-gradient(135deg,${item.color}44,${C.bg})`, borderRadius: 8, marginBottom: 10, ...glow(item.color, 7) }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700, color: item.color }}>{item.name}</div>
              <Btn color={item.color} sm full={false}>⬡ {item.price}</Btn>
            </div>
          </div>
        ))}

        {tab === 2 && coinItems.map(item => (
          <div key={item.label} style={{ ...cardStyle(C.yellow), padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 16, fontWeight: 800, color: C.yellow, ...tglow(C.yellow, 4) }}>⬡ {item.label}</div>
              {item.bonus && <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.green, fontWeight: 700 }}>{item.bonus}</div>}
            </div>
            <Btn color={C.yellow} sm full={false}>{item.price}</Btn>
          </div>
        ))}

        {tab === 3 && gemItems.map(item => (
          <div key={item.label} style={{ ...cardStyle(C.pink), padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 16, fontWeight: 800, color: C.pink, ...tglow(C.pink, 4) }}>◆ {item.label}</div>
              {item.bonus && <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.green, fontWeight: 700 }}>{item.bonus}</div>}
            </div>
            <Btn color={C.pink} sm full={false}>{item.price}</Btn>
          </div>
        ))}
      </div>
      <BottomNav active="menu" nav={nav} />
    </div>
  );
}

// ─── Screen: Missions ─────────────────────────────────────────────────────────
function MissionsScreen({ nav }: { nav: (s: Screen) => void }) {
  const [tab, setTab] = useState(0);
  const daily = [
    { text: "Play 5 games",           prog: 3,    total: 5,     reward: "200 coins", done: false, color: C.blue   },
    { text: "Hit 3 perfect lanes",    prog: 3,    total: 3,     reward: "50 gems",   done: true,  color: C.green  },
    { text: "Score 10,000 points",    prog: 8500, total: 10000, reward: "150 coins", done: false, color: C.orange },
  ];
  const weekly = [
    { text: "Win 10 ranked matches",  prog: 6,  total: 10, reward: "1,000 coins", done: false, color: C.purple },
    { text: "Reach a 5x combo",       prog: 1,  total: 5,  reward: "300 gems",    done: false, color: C.cyan   },
    { text: "Play 30 games",          prog: 22, total: 30, reward: "500 coins",   done: false, color: C.pink   },
  ];
  const items = tab === 0 ? daily : weekly;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar title="MISSIONS" />
      <div style={{ display: "flex", padding: "10px 16px 0", gap: 8 }}>
        {["DAILY", "WEEKLY"].map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            flex: 1, padding: "9px",
            fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "1px",
            cursor: "pointer", background: tab === i ? `${C.pink}22` : C.card,
            border: `1px solid ${tab === i ? C.pink : C.blue + "22"}`,
            borderRadius: 10, color: tab === i ? C.pink : C.muted, transition: "all 0.15s",
            ...(tab === i ? glow(C.pink, 5) : {}),
          }}>{t}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
        <GridBg op={0.04} />
        {items.map(m => (
          <div key={m.text} style={{ ...cardStyle(m.done ? C.green : m.color), padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ flex: 1, paddingRight: 8, fontFamily: "'Rajdhani',sans-serif", fontSize: 13, color: m.done ? C.green : C.white, fontWeight: 700 }}>{m.text}</div>
              {m.done
                ? <button style={{ background: `${C.green}28`, border: `1px solid ${C.green}`, borderRadius: 8, padding: "3px 10px", cursor: "pointer", color: C.green, fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 700 }}>CLAIM</button>
                : <div style={{ background: `${m.color}22`, border: `1px solid ${m.color}55`, borderRadius: 6, padding: "2px 7px" }}>
                    <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: m.color, fontWeight: 700 }}>{m.reward}</span>
                  </div>
              }
            </div>
            {m.done
              ? <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.green, fontWeight: 700 }}>✓ COMPLETED</div>
              : <>
                  <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.muted, marginBottom: 4 }}>
                    {m.prog > 100 ? `${m.prog.toLocaleString()} / ${m.total.toLocaleString()}` : `${m.prog} / ${m.total}`}
                  </div>
                  <ProgBar pct={(m.prog / m.total) * 100} color={m.color} />
                </>
            }
          </div>
        ))}
      </div>
      <BottomNav active="missions" nav={nav} />
    </div>
  );
}

// ─── Screen: Leaderboard ──────────────────────────────────────────────────────
function LeaderboardScreen({ nav }: { nav: (s: Screen) => void }) {
  const [tab, setTab] = useState(0);
  const tabs = ["DAILY", "WEEKLY", "GLOBAL", "FRIENDS"];
  const players = [
    { rank: 1, name: "NeonMaster", div: "BLAZE",    score: "98,750", color: C.yellow,   you: false },
    { rank: 2, name: "PixelPanda", div: "DIAMOND",  score: "87,430", color: "#C0C0C0",  you: false },
    { rank: 3, name: "NumBuster",  div: "PLATINUM", score: "75,210", color: C.orange,   you: false },
    { rank: 4, name: "ArcadeKing", div: "GOLD",     score: "61,100", color: C.yellow,   you: false },
    { rank: 5, name: "You",        div: "GOLD",     score: "32,780", color: C.blue,     you: true  },
    { rank: 6, name: "StarRider",  div: "SILVER",   score: "28,400", color: "#C0C0C0",  you: false },
    { rank: 7, name: "TilePusher", div: "SILVER",   score: "19,880", color: "#C0C0C0",  you: false },
  ];
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar title="LEADERBOARD" />
      <div style={{ display: "flex", padding: "10px 16px 0", gap: 6 }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            flex: 1, padding: "7px 2px",
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: "0.5px",
            cursor: "pointer", background: tab === i ? `${C.pink}22` : C.card,
            border: `1px solid ${tab === i ? C.pink : C.blue + "22"}`,
            borderRadius: 8, color: tab === i ? C.pink : C.muted, transition: "all 0.15s",
          }}>{t}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
        <GridBg op={0.04} />
        {players.map(p => (
          <div key={p.rank} style={{
            display: "flex", alignItems: "center", gap: 10, padding: 12,
            background: p.you ? `${C.blue}1e` : p.rank <= 3 ? `${p.color}0e` : C.card,
            border: `1px solid ${p.you ? C.blue : p.rank <= 3 ? p.color + "44" : C.blue + "1a"}`,
            borderRadius: 12,
            ...(p.you ? glow(C.blue, 8) : p.rank <= 3 ? glow(p.color, 4) : {}),
          }}>
            <div style={{ width: 24, textAlign: "center", fontFamily: "'Orbitron',sans-serif", fontWeight: 800, fontSize: 14, color: p.rank <= 3 ? p.color : C.muted }}>
              {p.rank <= 3 ? medals[p.rank - 1] : p.rank}
            </div>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${p.you ? C.blue : C.purple},${C.pink})`, border: `2px solid ${p.you ? C.blue : p.color}55`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              {p.you ? "🎮" : ""}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, color: p.you ? C.blue : C.white }}>{p.name}</div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 9, color: p.color, fontWeight: 700 }}>{p.div}</div>
            </div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: 12, color: p.you ? C.cyan : C.yellow }}>{p.score}</div>
          </div>
        ))}
      </div>
      <BottomNav active="leaderboard" nav={nav} />
    </div>
  );
}

// ─── Screen: Settings ─────────────────────────────────────────────────────────
function SettingsScreen({ nav }: { nav: (s: Screen) => void }) {
  const [music, setMusic]     = useState(true);
  const [sfx, setSfx]         = useState(true);
  const [haptics, setHaptics] = useState(false);
  const [notifs, setNotifs]   = useState(true);

  function Toggle({ on, toggle }: { on: boolean; toggle: () => void }) {
    return (
      <div onClick={toggle} style={{
        width: 40, height: 22, borderRadius: 11,
        background: on ? C.pink : `${C.muted}33`,
        border: `1px solid ${on ? C.pink : C.muted + "33"}`,
        cursor: "pointer", position: "relative",
        transition: "all 0.2s ease",
        boxShadow: on ? `0 0 8px ${C.pink}77` : "none",
      }}>
        <div style={{
          position: "absolute", top: 2, left: on ? 19 : 2,
          width: 16, height: 16, borderRadius: "50%",
          background: C.white, transition: "left 0.2s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }} />
      </div>
    );
  }

  const sections = [
    {
      title: "AUDIO",
      items: [
        { icon: <Music size={16} />,   label: "Music",         toggle: true,  on: music,    fn: () => setMusic(!music)     },
        { icon: <Volume2 size={16} />, label: "Sound Effects", toggle: true,  on: sfx,      fn: () => setSfx(!sfx)         },
        { icon: <Vibrate size={16} />, label: "Haptics",       toggle: true,  on: haptics,  fn: () => setHaptics(!haptics) },
      ],
    },
    {
      title: "PREFERENCES",
      items: [
        { icon: <Bell size={16} />,    label: "Notifications", toggle: true,  on: notifs,   fn: () => setNotifs(!notifs)   },
        { icon: <Globe size={16} />,   label: "Language",      toggle: false, right: "English" },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { icon: <Shield size={16} />,    label: "Privacy",            toggle: false },
        { icon: <HelpCircle size={16} />,label: "Support",            toggle: false },
        { icon: <RotateCcw size={16} />, label: "Restore Purchases",  toggle: false },
        { icon: <LogOut size={16} />,    label: "Sign Out",           toggle: false, danger: true },
      ],
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar title="SETTINGS" onBack={() => nav("menu")} />
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
        <GridBg op={0.04} />
        {sections.map(sec => (
          <div key={sec.title}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "2px", marginBottom: 8 }}>{sec.title}</div>
            <div style={{ ...cardStyle(C.blue), overflow: "hidden" }}>
              {sec.items.map((item, idx) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "13px 14px",
                  borderBottom: idx < sec.items.length - 1 ? `1px solid ${C.blue}11` : "none",
                  cursor: "pointer",
                }}>
                  <div style={{ color: (item as any).danger ? C.red : C.muted }}>{item.icon}</div>
                  <div style={{ flex: 1, fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 600, color: (item as any).danger ? C.red : C.white }}>{item.label}</div>
                  {item.toggle
                    ? <Toggle on={item.on!} toggle={item.fn!} />
                    : (item as any).right
                    ? <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 12, color: C.muted }}>{(item as any).right}</span>
                    : <ChevronRight size={14} color={C.muted} />
                  }
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
const ALL_SCREENS: Screen[] = [
  "splash", "menu", "gameplay", "powerups", "tournament",
  "ranked", "victory", "gameover", "profile", "shop",
  "missions", "leaderboard", "settings",
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [fade, setFade]     = useState(false);

  const nav = (s: Screen) => {
    if (s === screen) return;
    setFade(true);
    setTimeout(() => { setScreen(s); setFade(false); }, 110);
  };

  const screenMap: Record<Screen, React.ReactNode> = {
    splash:      <SplashScreen     nav={nav} />,
    menu:        <MenuScreen       nav={nav} />,
    gameplay:    <GameplayScreen   nav={nav} />,
    powerups:    <PowerupsScreen   nav={nav} />,
    tournament:  <TournamentScreen nav={nav} />,
    ranked:      <RankedScreen     nav={nav} />,
    victory:     <VictoryScreen    nav={nav} />,
    gameover:    <GameOverScreen   nav={nav} />,
    profile:     <ProfileScreen    nav={nav} />,
    shop:        <ShopScreen       nav={nav} />,
    missions:    <MissionsScreen   nav={nav} />,
    leaderboard: <LeaderboardScreen nav={nav} />,
    settings:    <SettingsScreen   nav={nav} />,
  };

  return (
    <div style={{
      minHeight: "100dvh", background: "#020410",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',sans-serif",
    }}>
      {/* Phone frame */}
      <div style={{
        width: 390, height: 844,
        background: C.bg, borderRadius: 44,
        border: `2px solid ${C.blue}28`,
        boxShadow: `0 0 40px ${C.purple}44,0 0 80px ${C.blue}1a,0 30px 60px rgba(0,0,0,0.8)`,
        display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
      }}>
        {/* Notch */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 120, height: 30, background: "#000",
          borderRadius: "0 0 18px 18px", zIndex: 100,
        }} />

        {/* Screen */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          marginTop: 30, overflow: "hidden",
          opacity: fade ? 0 : 1, transition: "opacity 0.11s ease",
        }}>
          {screenMap[screen]}
        </div>
      </div>

      {/* Nav dots */}
      <div style={{
        position: "fixed", bottom: 14, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 5,
        background: `${C.bg2}cc`, border: `1px solid ${C.blue}22`,
        borderRadius: 20, padding: "5px 10px", backdropFilter: "blur(8px)",
      }}>
        {ALL_SCREENS.map(s => (
          <button key={s} onClick={() => nav(s)} title={s} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: screen === s ? C.pink : `${C.muted}44`,
            border: "none", cursor: "pointer", padding: 0,
            boxShadow: screen === s ? `0 0 6px ${C.pink}` : "none",
            transition: "all 0.15s",
          }} />
        ))}
      </div>
    </div>
  );
}
