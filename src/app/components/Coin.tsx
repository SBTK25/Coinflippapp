import { useEffect } from "react";
import { motion, useAnimation } from "motion/react";

interface CoinProps {
  result: "heads" | "tails" | null;
  isFlipping: boolean;
  theme: "dark" | "light";
}

function HeadsFace({ theme }: { theme: "dark" | "light" }) {
  const cx = 110, cy = 110;
  const C  = "#FF9F0A";
  const bg = theme === "dark" ? "#0A0600" : "#FFF3CC";

  const rays = Array.from({ length: 8 }).map((_, i) => {
    const angle  = (i * 45) * Math.PI / 180;
    const isMain = i % 2 === 0;
    const r0 = isMain ? 26 : 30;
    const r1 = isMain ? 64 : 56;
    return {
      x1: cx + r0 * Math.cos(angle), y1: cy + r0 * Math.sin(angle),
      x2: cx + r1 * Math.cos(angle), y2: cy + r1 * Math.sin(angle),
      sw: isMain ? 2.8 : 1.6,
    };
  });

  return (
    <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}>
      <circle cx={cx} cy={cy} r="109" fill={bg} />
      <circle cx={cx} cy={cy} r="106" fill="none" stroke={C} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="88"  fill="none" stroke={C} strokeWidth="0.7" strokeOpacity="0.25" />
      {rays.map((r, i) => (
        <line key={i}
          x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
          stroke={C} strokeWidth={r.sw} strokeLinecap="round"
        />
      ))}
      <circle cx={cx} cy={cy} r="18"  fill="none" stroke={C} strokeWidth="1.8" />
      <circle cx={cx} cy={cy} r="5.5" fill={C} />
    </svg>
  );
}

function TailsFace({ theme }: { theme: "dark" | "light" }) {
  const cx = 110, cy = 110;
  const C  = "#64D2FF";
  const bg = theme === "dark" ? "#00060C" : "#D6F0FF";

  const diamond = (s: number) =>
    `${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`;

  return (
    <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}>
      <circle cx={cx} cy={cy} r="109" fill={bg} />
      <circle cx={cx} cy={cy} r="106" fill="none" stroke={C} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="88"  fill="none" stroke={C} strokeWidth="0.7" strokeOpacity="0.25" />
      <polygon points={diamond(66)} fill="none" stroke={C} strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points={diamond(42)} fill="none" stroke={C} strokeWidth="1.6" strokeLinejoin="round" />
      <polygon points={diamond(20)} fill="none" stroke={C} strokeWidth="1.1" strokeLinejoin="round" strokeOpacity="0.55" />
      <circle cx={cx} cy={cy} r="5.5" fill={C} />
    </svg>
  );
}

export function Coin({ result, isFlipping, theme }: CoinProps) {
  const controls = useAnimation();
  const isTails  = result === "tails";

  useEffect(() => {
    if (isFlipping) {
      controls.set({ rotateY: 0, y: 0, scale: 1 });
      const finalAngle = isTails ? 1980 : 1800;
      controls.start({
        rotateY: [0, 360, 720, 1080, 1440, finalAngle],
        y:       [0,  -8,  -24,   -8,    0,    0],
        scale:   [1, 0.97, 0.92, 0.97,   1,    1],
        transition: {
          rotateY: {
            duration: 1.45,
            times:    [0, 0.1, 0.32, 0.58, 0.82, 1.0],
            ease:     ["linear","linear","linear","linear","easeOut"],
          },
          y:     { duration: 1.45, times: [0,0.1,0.32,0.58,0.82,1.0], ease: "easeInOut" },
          scale: { duration: 1.45, times: [0,0.1,0.32,0.58,0.82,1.0], ease: "easeInOut" },
        },
      });
    } else {
      controls.set({ rotateY: isTails ? 180 : 0, y: 0, scale: 1 });
    }
  }, [isFlipping, result]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width: "100%", height: "100%", perspective: 900 }}>
      <motion.div
        animate={controls}
        initial={{ rotateY: !isFlipping && isTails ? 180 : 0, y: 0, scale: 1 }}
        style={{ width: "100%", height: "100%", transformStyle: "preserve-3d", position: "relative" }}
      >
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
          <HeadsFace theme={theme} />
        </div>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <TailsFace theme={theme} />
        </div>
      </motion.div>
    </div>
  );
}