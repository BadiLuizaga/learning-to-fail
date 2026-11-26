"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const scenes = [
  ["🏆", "⭐", "🎓"],
  ["📚", "✏️", "✅"],
  ["📄", "❌", "💔"],
  ["💡", "🧩", "🔍"],
  ["📖", "⚙️", "📈"],
  ["🧗", "⛰️", "🔥"],
  ["🏆", "🌟", "🎉"],
];

const sceneSprites = [
  "/images/character/idle.png",
  "/images/character/present.png",
  "/images/character/failure.png",
  "/images/character/thinking.png",
  "/images/character/determined.png",
  "/images/character/walk-1.png",
  "/images/character/victory.png",
];
const walkSprites = [1, 2, 3, 4].map((n) => `/images/character/walk-${n}.png`);

function Avatar({ src, onSummon }: { src: string; onSummon: () => void }) {
  return (
    <motion.button
      className="avatar"
      onClick={onSummon}
      aria-label="Summon images"
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: [0, -5, 0], scale: 1 }}
      transition={{ opacity: { duration: 0.25 }, y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }}
    >
      <span className="avatar-glow" />
      <motion.img
        key={src}
        src={src}
        alt=""
        draggable={false}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
}

export default function Home() {
  const [scene, setScene] = useState(0);
  const [launched, setLaunched] = useState<number[]>([]);
  const [summoning, setSummoning] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);

  const summon = useCallback(() => {
    setSummoning(true);
    setLaunched((items) => [...items, Date.now() + Math.random()]);
    window.setTimeout(() => setSummoning(false), 1050);
  }, []);
  const goTo = useCallback((index: number) => {
    setScene(Math.max(0, Math.min(6, index)));
    setLaunched([]);
    setSummoning(false);
  }, []);
  const next = useCallback(() => goTo(scene + 1), [goTo, scene]);
  const prev = useCallback(() => goTo(scene - 1), [goTo, scene]);

  useEffect(() => {
    if (scene !== 5) return;
    const timer = window.setInterval(() => setWalkFrame((frame) => (frame + 1) % walkSprites.length), 170);
    return () => window.clearInterval(timer);
  }, [scene]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowRight") { event.preventDefault(); next(); }
      if (event.code === "ArrowLeft") prev();
      if (event.code === "Enter") summon();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [next, prev, summon]);

  const avatarSrc = summoning
    ? "/images/character/summon.png"
    : scene === 5
      ? walkSprites[walkFrame]
      : sceneSprites[scene];

  return (
    <main className="world">
      <div className="stars" />
      <div className="moon" />
      <div className="city"><i /><i /><i /><i /></div>
      <section className={`stage ${scene === 0 ? "stage-intro" : ""}`}>
        {scene === 0 && (
          <motion.div
            className="intro-title"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <span className="intro-eyebrow">A STORY ABOUT GROWTH</span>
            <h1>Why Learning to Fail Is as Important as Learning to Pass</h1>
            <span className="intro-rule" />
          </motion.div>
        )}
        <div className="cards">
          <AnimatePresence>
            {launched.map((id, index) => (
              <motion.div
                key={id}
                className="card"
                initial={{ opacity: 0, scale: 0.1, y: 90, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, x: (index % 2 ? 1 : -1) * (125 + index * 28), y: -120 - (index % 3) * 48, rotate: index % 2 ? 12 : -12 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 160, damping: 13 }}
              >
                {scenes[scene][index % 3]}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <Avatar src={avatarSrc} onSummon={summon} />
        <span className="ambient a">✦</span>
        <span className="ambient b">✧</span>
      </section>
      <nav className="controls" aria-label="Scene navigation">
        <button onClick={prev} disabled={scene === 0} aria-label="Previous scene">‹</button>
        <div className="dots">
          {scenes.map((_, index) => (
            <button key={index} className={scene === index ? "active" : ""} onClick={() => goTo(index)} aria-label={`Scene ${index + 1}`} />
          ))}
        </div>
        <button onClick={next} disabled={scene === 6} aria-label="Next scene">›</button>
      </nav>
      <button className="summon" onClick={summon} aria-label="Summon image">✧</button>
    </main>
  );
}
