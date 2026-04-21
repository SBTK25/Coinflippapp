import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Coin } from "./components/Coin";

type Result = "heads" | "tails";
type Theme  = "dark" | "light";
interface FlipRecord { id: number; result: Result; }

const MAX_HISTORY = 50;
const COLS        = 50;

const HEADS_COLOR = "#FF9F0A";
const HEADS_RGB   = "255,159,10";
const TAILS_COLOR = "#64D2FF";
const TAILS_RGB   = "100,210,255";

// ── Theme tokens ──────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg:            "#080808",
    label:         "rgba(255,255,255,0.22)",
    primary:       "rgba(255,255,255,0.88)",
    secondary:     "rgba(255,255,255,0.28)",
    faint:         "rgba(255,255,255,0.16)",
    border:        "rgba(255,255,255,0.12)",
    btnBg:         "rgba(255,255,255,0.05)",
    divider:       "rgba(255,255,255,0.05)",
    dotEmpty:      "rgba(255,255,255,0.05)",
    dotEmptyOp:    0.07,
    muted:         "rgba(255,255,255,0.35)",
    mutedDot:      "rgba(255,255,255,0.45)",
    reset:         "rgba(255,255,255,0.18)",
    toggleBg:      "rgba(255,255,255,0.08)",
    toggleIcon:    "rgba(255,255,255,0.55)",
    topWashMul:    0.13,
  },
  light: {
    bg:            "#FFFFFF",
    label:         "rgba(0,0,0,0.62)",
    primary:       "#000000",
    secondary:     "rgba(0,0,0,0.55)",
    faint:         "rgba(0,0,0,0.42)",
    border:        "rgba(0,0,0,0.22)",
    btnBg:         "rgba(0,0,0,0.07)",
    divider:       "rgba(0,0,0,0.12)",
    dotEmpty:      "rgba(0,0,0,0.13)",
    dotEmptyOp:    0.18,
    muted:         "rgba(0,0,0,0.55)",
    mutedDot:      "rgba(0,0,0,0.62)",
    reset:         "rgba(0,0,0,0.48)",
    toggleBg:      "rgba(0,0,0,0.09)",
    toggleIcon:    "rgba(0,0,0,0.72)",
    topWashMul:    0.18,
  },
} as const;

function useIsCompact() {
  const [compact, setCompact] = useState(() =>
    typeof window !== "undefined" && window.innerHeight <= 500
  );
  useEffect(() => {
    const handler = () => setCompact(window.innerHeight <= 500);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return compact;
}

function useIsWide() {
  const [wide, setWide] = useState(() =>
    typeof window !== "undefined" && window.innerWidth > 1080
  );
  useEffect(() => {
    const handler = () => setWide(window.innerWidth > 1080);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return wide;
}

// ── Sun icon ─────────────────────────────────────────────────────────────────
function SunIcon({ color }: { color: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2"  x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2"  y1="12" x2="4"  y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93"  y1="4.93"  x2="6.34"  y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="4.93"  y1="19.07" x2="6.34"  y2="17.66" />
      <line x1="17.66" y1="6.34"  x2="19.07" y2="4.93" />
    </svg>
  );
}

// ── Moon icon ─────────────────────────────────────────────────────────────────
function MoonIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [result, setResult]         = useState<Result | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory]       = useState<FlipRecord[]>([]);
  const [nextId, setNextId]         = useState(0);
  const [theme, setTheme]           = useState<Theme>("dark");
  const isCompact                   = useIsCompact();
  const isWide                      = useIsWide();

  const T = THEMES[theme];

  const headsCount = history.filter(r => r.result === "heads").length;
  const tailsCount = history.filter(r => r.result === "tails").length;

  const accentColor = result === "tails" ? TAILS_COLOR : HEADS_COLOR;
  const accentRgb   = result === "tails" ? TAILS_RGB   : HEADS_RGB;
  const hasResult   = result !== null && !isFlipping;
  const hasHistory  = history.length > 0;

  const flip = useCallback(() => {
    if (isFlipping) return;
    const flipResult: Result = Math.random() < 0.5 ? "heads" : "tails";
    setResult(flipResult);
    setIsFlipping(true);
    setTimeout(() => {
      setIsFlipping(false);
      setHistory(prev => [{ id: nextId, result: flipResult }, ...prev].slice(0, MAX_HISTORY));
      setNextId(n => n + 1);
    }, 1500);
  }, [isFlipping, nextId]);

  const reset = useCallback(() => {
    if (isFlipping) return;
    setResult(null);
    setHistory([]);
  }, [isFlipping]);

  const slots: (FlipRecord | null)[] = [
    ...[...history].reverse(),
    ...Array(MAX_HISTORY - history.length).fill(null),
  ];

  // ── Theme toggle ─────────────────────────────────────────────────────────
  const ThemeToggle = (
    <motion.button
      onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
      whileTap={{ scale: 0.88 }}
      title="Toggle theme"
      style={{
        width: 34, height: 34, borderRadius: "50%",
        background: T.toggleBg,
        border: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0,
        transition: "background 0.35s, border 0.35s",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
          transition={{ duration: 0.2 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {theme === "dark"
            ? <SunIcon color={T.toggleIcon} />
            : <MoonIcon color={T.toggleIcon} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );

  // ── Header ───────────────────────────────────────────────────────────────
  const Header = (
    <div style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      flexShrink: 0,
    }}>
      {ThemeToggle}
    </div>
  );

  // ── Result area ───────────────────────────────────────────────────────────
  const ResultArea = (compact: boolean) => (
    <div style={{
      flexShrink: 0,
      height: compact ? "auto" : "clamp(48px,8svh,88px)",
      display: "flex",
      alignItems: compact ? "flex-start" : "center",
      justifyContent: compact ? "flex-start" : "center",
    }}>
      <AnimatePresence mode="wait">
        {!isFlipping && !result && (
          <motion.p
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ fontSize: "0.58rem", letterSpacing: "0.26em", textTransform: "uppercase", color: T.faint }}
          >
            tap flip to begin
          </motion.p>
        )}

        {isFlipping && (
          <motion.div
            key="flipping"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", flexDirection: "column", alignItems: compact ? "flex-start" : "center", gap: 8 }}
          >
            <motion.p
              animate={{ opacity: [0.2, 0.55, 0.2] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: "0.56rem", letterSpacing: "0.28em", textTransform: "uppercase", color: T.muted }}
            >
              flipping
            </motion.p>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ scale: [0.4, 1, 0.4], opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
                  style={{ width: 5, height: 5, borderRadius: "50%", background: T.mutedDot }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {!isFlipping && result && (
          <motion.div
            key={`result-${result}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)", transition: { duration: 0.2 } }}
            transition={{ duration: 0.15 }}
            style={{ display: "flex", flexDirection: "column", alignItems: compact ? "flex-start" : "center", gap: 4 }}
          >
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ delay: 0.05, duration: 0.35, ease: "easeOut" }}
              style={{
                fontSize: "0.52rem", letterSpacing: "0.28em", textTransform: "uppercase",
                color: accentColor, margin: 0,
              }}
            >
              Result
            </motion.p>
            {/* Per-character stagger */}
            <div style={{ display: "flex", overflow: "hidden",
              fontSize: compact ? "clamp(1.6rem,5svh,2.4rem)" : "clamp(2rem,5.5svh,3.8rem)",
              fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1,
              color: T.primary,
            }}>
              {(result === "heads" ? "Heads" : "Tails").split("").map((char, i) => (
                <motion.span
                  key={`${result}-${i}`}
                  initial={{ opacity: 0, y: "60%", filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
                  transition={{ delay: 0.08 + i * 0.045, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
            {/* Glow pulse under the word */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.4 }}
              animate={{ opacity: [0, 0.35, 0], scaleX: [0.4, 1.1, 1.4] }}
              transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
              style={{
                position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
                width: "70%", height: 10, borderRadius: "50%",
                background: `radial-gradient(ellipse at center, rgba(${accentRgb},0.55) 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ── Flip button ───────────────────────────────────────────────────────────
  const FlipButton = (compact: boolean) => {
    const btnAccentRgb   = result === "tails" ? TAILS_RGB   : HEADS_RGB;
    const btnBorder = hasResult
      ? `1.5px solid rgba(${btnAccentRgb},0.35)`
      : theme === "dark"
        ? `1.5px solid rgba(255,255,255,0.25)`
        : `1.5px solid rgba(0,0,0,0.18)`;
    const iconColor  = theme === "dark" ? "#000000" : "#ffffff";
    const labelColor = theme === "dark" ? "#000000" : "#ffffff";
    const btnBg      = theme === "dark" ? "rgba(255,255,255,0.93)" : "#000000";
    const btnShadow = hasResult
      ? `0 0 18px rgba(${btnAccentRgb},0.22), 0 2px 12px rgba(0,0,0,0.10)`
      : "0 2px 12px rgba(0,0,0,0.10)";

    return (
      <motion.div layout style={{ flexShrink: 0 }}>
        <motion.button
          onClick={flip}
          disabled={isFlipping}
          whileHover={!isFlipping ? { scale: 1.025 } : {}}
          whileTap={!isFlipping ? { scale: 0.96 } : {}}
          animate={{ boxShadow: btnShadow }}
          transition={{ duration: 0.55 }}
          style={{
            width: "100%",
            height: compact ? "clamp(36px,5svh,44px)" : "clamp(40px,6svh,62px)",
            borderRadius: 999,
            border: btnBorder,
            background: btnBg,
            cursor: isFlipping ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            opacity: isFlipping ? 0.35 : 1,
            transition: "border 0.45s, opacity 0.2s, background 0.45s",
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Accent tint overlay */}
          <motion.div
            animate={{ opacity: hasResult ? 1 : 0 }}
            transition={{ duration: 0.55 }}
            style={{
              position: "absolute", inset: 0, borderRadius: 999, pointerEvents: "none",
              background: `linear-gradient(135deg, transparent 0%, rgba(${btnAccentRgb},0.22) 100%)`,
            }}
          />
          {/* Rotating refresh icon */}
          <motion.svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={iconColor}
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            animate={isFlipping ? { rotate: 360 } : { rotate: 0 }}
            transition={isFlipping
              ? { duration: 0.7, repeat: Infinity, ease: "linear" }
              : { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
            }
            style={{ flexShrink: 0, position: "relative", zIndex: 1 }}
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </motion.svg>
          {/* Sliding label */}
          <div style={{ position: "relative", overflow: "hidden", height: "1em", zIndex: 1 }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={hasResult ? "again" : "flip"}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.32, 0, 0.16, 1] }}
                style={{
                  display: "block",
                  fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600,
                  color: labelColor,
                }}
              >
                {hasResult ? "Flip Again" : "Flip"}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.button>
      </motion.div>
    );
  };

  // ── Dot strip ─────────────────────────────────────────────────────────────
  const DotStrip = (compact: boolean) => (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${COLS}, 1fr)`,
      gap: compact ? 1.5 : 2,
      width: "100%",
    }}>
      {slots.map((item, idx) => {
        const isFilled = item !== null;
        const isNewest = isFilled && item!.id === history[0]?.id;
        const ageRatio = isFilled ? (history.length - 1 - idx) / Math.max(history.length - 1, 1) : 0;
        const op       = isFilled ? Math.max(0.14, 1 - ageRatio * 0.78) : 1;
        const dotColor = item?.result === "tails" ? TAILS_COLOR : HEADS_COLOR;
        const dotRgb   = item?.result === "tails" ? TAILS_RGB : HEADS_RGB;
        return (
          <motion.div
            key={isFilled ? `d${item!.id}` : `e${idx}`}
            initial={isNewest ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: isFilled ? op : T.dotEmptyOp }}
            transition={isNewest
              ? { type: "spring", stiffness: 560, damping: 24, delay: 0.04 }
              : { duration: 0.2 }
            }
            style={{
              aspectRatio: "1",
              borderRadius: "50%",
              boxSizing: "border-box",
              background: isNewest ? "transparent" : isFilled ? dotColor : T.dotEmpty,
              border:    isNewest ? `1px solid ${dotColor}` : "none",
              boxShadow: isNewest ? `0 0 4px rgba(${dotRgb},0.6)` : undefined,
            }}
          />
        );
      })}
    </div>
  );

  // ── History panel ───────────────────────────────────────────────────────
  const HistoryPanel = (compact: boolean) => (
    <AnimatePresence>
      {hasHistory && (
        <motion.div
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.22 } }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 24 }}
        >
          {/* Stats row — above the dot matrix */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", width: "100%" }}>
            {/* Total flips */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <div style={{ overflow: "hidden", lineHeight: 1 }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`total-${history.length}`}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.32, 0, 0.16, 1] }}
                    style={{ display: "block", fontSize: "1.1rem", fontWeight: 600, letterSpacing: "-0.02em", color: T.primary }}
                  >
                    {history.length}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span style={{ fontSize: "1.1rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: T.secondary }}>
                flips
              </span>
            </div>
            <span style={{ fontSize: "0.65rem", color: T.divider, lineHeight: 1, userSelect: "none" }}>·</span>
            {/* Heads */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <div style={{ overflow: "hidden", lineHeight: 1 }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`heads-${headsCount}`}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.32, 0, 0.16, 1] }}
                    style={{ display: "block", fontSize: "1.1rem", fontWeight: 600, letterSpacing: "-0.02em", color: HEADS_COLOR }}
                  >
                    {headsCount}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span style={{ fontSize: "1.1rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: HEADS_COLOR, opacity: 0.5 }}>
                heads
              </span>
            </div>
            <span style={{ fontSize: "0.65rem", color: T.divider, lineHeight: 1, userSelect: "none" }}>·</span>
            {/* Tails */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <div style={{ overflow: "hidden", lineHeight: 1 }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`tails-${tailsCount}`}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.32, 0, 0.16, 1] }}
                    style={{ display: "block", fontSize: "1.1rem", fontWeight: 600, letterSpacing: "-0.02em", color: TAILS_COLOR }}
                  >
                    {tailsCount}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span style={{ fontSize: "1.1rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: TAILS_COLOR, opacity: 0.5 }}>
                tails
              </span>
            </div>
          </div>

          {DotStrip(compact)}

          {/* Reset — below the dot matrix */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <motion.button
              onClick={reset}
              disabled={isFlipping}
              whileTap={{ scale: 0.93 }}
              style={{
                background: "none", border: "none", padding: "4px 0",
                cursor: isFlipping ? "default" : "pointer",
                fontSize: "0.56rem", letterSpacing: "0.24em", textTransform: "uppercase",
                color: T.reset,
                opacity: isFlipping ? 0.25 : 1, transition: "opacity 0.2s",
              }}
            >
              Reset
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      animate={{ background: T.bg }}
      transition={{ duration: 0.4 }}
      style={{
        height: "100svh", width: "100%",
        display: "flex", justifyContent: "center",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      }}
    >
      {/* Ambient colour wash — top edge */}
      <motion.div
        animate={{
          opacity: hasResult ? 1 : 0,
          background: result === "tails"
            ? `linear-gradient(180deg, rgba(${TAILS_RGB},${T.topWashMul}) 0%, transparent 55%)`
            : `linear-gradient(180deg, rgba(${HEADS_RGB},${T.topWashMul}) 0%, transparent 55%)`,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
      />

      {/* Dark-theme radial coin aura */}
      {theme === "dark" && (
        <motion.div
          animate={{
            opacity: hasResult ? 1 : 0,
            background: result === "tails"
              ? `radial-gradient(ellipse 72% 55% at 50% 42%, rgba(${TAILS_RGB},0.18) 0%, rgba(${TAILS_RGB},0.06) 40%, transparent 70%)`
              : `radial-gradient(ellipse 72% 55% at 50% 42%, rgba(${HEADS_RGB},0.18) 0%, rgba(${HEADS_RGB},0.06) 40%, transparent 70%)`,
          }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
        />
      )}

      {/* Dark-theme bottom counter-glow */}
      {theme === "dark" && (
        <motion.div
          animate={{
            opacity: hasResult ? 0.65 : 0,
            background: result === "tails"
              ? `radial-gradient(ellipse 60% 30% at 50% 100%, rgba(${TAILS_RGB},0.12) 0%, transparent 70%)`
              : `radial-gradient(ellipse 60% 30% at 50% 100%, rgba(${HEADS_RGB},0.12) 0%, transparent 70%)`,
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>

        {/* ── LANDSCAPE (compact) ── */}
        {isCompact && (
          <motion.div
            key="landscape"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.32, ease: [0.32, 0, 0.16, 1] }}
            style={{
              width: "100%", height: "100%",
              display: "flex", flexDirection: "row",
              padding: "clamp(6px,1.2svh,16px) clamp(10px,2svw,24px)", boxSizing: "border-box", gap: "clamp(8px,1.8svw,24px)",
              position: "relative", zIndex: 1,
            }}
          >
            {/* Left: Coin */}
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                width: "min(calc(100svh - 16px), 36svw, 148px)",
                height: "min(calc(100svh - 16px), 36svw, 148px)",
              }}>
                <Coin result={result} isFlipping={isFlipping} theme={theme} />
              </div>
            </div>

            <div style={{ width: 1, alignSelf: "stretch", background: T.divider, flexShrink: 0 }} />

            {/* Right: 3 stacked sections, vertically centered, gap 32 */}
            <div style={{
              flex: 1, minWidth: 0,
              display: "flex", flexDirection: "column",
              justifyContent: "center", gap: "clamp(14px,3.5svh,40px)", overflow: "hidden",
            }}>
              {/* Row 1: Result text (left) + Theme toggle (right) */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {ResultArea(true)}
                </div>
                {ThemeToggle}
              </div>

              {/* Row 2: Flip button */}
              {FlipButton(true)}

              {/* Row 3: History */}
              {HistoryPanel(true)}
            </div>
          </motion.div>
        )}

        {/* ── WIDE (>1080px) ── */}
        {!isCompact && isWide && (
          <motion.div
            key="wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0, 0.16, 1] }}
            style={{
              width: "100%", height: "100%",
              display: "flex", flexDirection: "row",
              position: "relative", zIndex: 1,
            }}
          >
            {/* Theme toggle — fixed top-right */}
            <div style={{ position: "absolute", top: 36, right: 40, zIndex: 10 }}>
              {ThemeToggle}
            </div>

            {/* Left panel — coin + result */}
            <div style={{
              flex: "0 0 50%", height: "100%",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "clamp(28px,4svh,56px)",
              padding: "60px clamp(40px,5vw,100px)",
              boxSizing: "border-box",
            }}>
              <div style={{
                width: "min(34svh, 300px, 80%)",
                height: "min(34svh, 300px)",
                flexShrink: 0,
              }}>
                <Coin result={result} isFlipping={isFlipping} theme={theme} />
              </div>
              {ResultArea(false)}
            </div>

            {/* Vertical divider */}
            <div style={{
              width: 1,
              alignSelf: "stretch",
              background: T.divider,
              flexShrink: 0,
              margin: "60px 0",
            }} />

            {/* Right panel — flip button + history */}
            <div style={{
              flex: "0 0 50%", height: "100%",
              display: "flex", flexDirection: "column",
              justifyContent: "center",
              padding: "60px clamp(40px,5vw,100px)",
              boxSizing: "border-box",
              gap: "clamp(24px,3.5svh,48px)",
            }}>
              {/* App label */}
              <div>
                <p style={{
                  fontSize: "0.52rem", letterSpacing: "0.3em", textTransform: "uppercase",
                  color: T.faint, margin: 0,
                }}>
                  Coin Flipper
                </p>
              </div>

              {FlipButton(false)}

              {HistoryPanel(false)}
            </div>
          </motion.div>
        )}

        {/* ── PORTRAIT ── */}
        {!isCompact && !isWide && (
          <motion.div
            key="portrait"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.32, ease: [0.32, 0, 0.16, 1] }}
            style={{
              width: "100%", maxWidth: 390, height: "100%",
              display: "flex", flexDirection: "column",
              padding: "clamp(12px,4svh,52px) 28px clamp(12px,3svh,40px)",
              boxSizing: "border-box", position: "relative", zIndex: 1,
            }}
          >
            <div style={{ marginBottom: "clamp(4px,1.5svh,20px)", flexShrink: 0 }}>
              {Header}
            </div>

            <motion.div
              layout
              transition={{ layout: { type: "spring", stiffness: 320, damping: 32, mass: 0.8 } }}
              style={{
                flex: 1, minHeight: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "clamp(28px,5.5svh,80px)",
              }}
            >
              <motion.div layout transition={{ layout: { type: "spring", stiffness: 320, damping: 32, mass: 0.8 } }} style={{ width: "min(28svh, 220px, 100%)", height: "min(28svh, 220px)", flexShrink: 0 }}>
                <Coin result={result} isFlipping={isFlipping} theme={theme} />
              </motion.div>

              <motion.div layout transition={{ layout: { type: "spring", stiffness: 320, damping: 32, mass: 0.8 } }} style={{ flexShrink: 0 }}>
                {ResultArea(false)}
              </motion.div>

              <motion.div layout transition={{ layout: { type: "spring", stiffness: 320, damping: 32, mass: 0.8 } }} style={{ width: "100%", flexShrink: 0 }}>
                {FlipButton(false)}
              </motion.div>

              <motion.div layout transition={{ layout: { type: "spring", stiffness: 320, damping: 32, mass: 0.8 } }} style={{ width: "100%", flexShrink: 0 }}>
                {HistoryPanel(false)}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}