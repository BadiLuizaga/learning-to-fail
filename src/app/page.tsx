"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const sceneData = [
  {
    label: "SCENE 1 — INTRODUCTION",
    title: "Why Learning to Fail Is as Important as Learning to Pass",
    subtitle: "An introduction to the topic.",
  },
  {
    label: "SCENE 2 — AMBITION",
    title: "Dreaming of Success",
    subtitle: "Our goals, dreams, and everything we want to achieve.",
  },
  {
    label: "SCENE 3 — EXPECTATIONS",
    title: "The Pressure to Succeed",
    subtitle: "Expectations and the pressure to achieve good results.",
  },
  {
    label: "SCENE 4 — FAILURE",
    title: "When Things Go Wrong",
    subtitle: "Mistakes, difficult moments, and frustration.",
  },
  {
    label: "SCENE 5 — REALIZATION",
    title: "Failure Is a Lesson",
    subtitle: "Understanding that mistakes can teach us valuable lessons.",
  },
  {
    label: "SCENE 6 — IMPROVEMENT",
    title: "Learning, Growing, and Trying Again",
    subtitle: "Practicing, improving, and never giving up.",
  },
  {
    label: "SCENE 7 — SUCCESS",
    title: "Success Is Built on Failure",
    subtitle: "Success is the result of learning from our mistakes.",
  },
];

const scenes = [
  ["🏆", "⭐", "🎓", "🎯", "🚀", "📚"],
  ["📚", "✏️", "✅", "💭", "🎯", "🌠"],
  ["📄", "❌", "💔", "⏰", "😰", "📊"],
  ["💡", "🧩", "🔍", "📉", "😞", "🌧️"],
  ["📖", "⚙️", "📈", "🧠", "🗝️", "✨"],
  ["🧗", "⛰️", "🔥", "💪", "🔁", "🌱"],
  ["🏆", "🌟", "🎉", "🥇", "👑", "🎊"],
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

// Presentación de 5 minutos repartida entre las 7 escenas (~42.9 s cada una)
const TOTAL_DURATION_MS = 5 * 60 * 1000;
const SCENE_DURATION_MS = TOTAL_DURATION_MS / sceneData.length;

// Posiciones de los emojis alrededor del personaje (izquierda/derecha, arriba/medio/abajo)
const cardSlots = [
  { x: -290, y: -170, rotate: -12 },
  { x: 290, y: -170, rotate: 12 },
  { x: -330, y: 0, rotate: 8 },
  { x: 330, y: 0, rotate: -8 },
  { x: -290, y: 170, rotate: -10 },
  { x: 290, y: 170, rotate: 10 },
];

const walkSprites = [1, 2, 3, 4].map(
  (n) => `/images/character/walk-${n}.png`
);

// Estrella fugaz que cruza el cielo cada cierto rato (entre 4 y 10 s)
function ShootingStars() {
  const [star, setStar] = useState<{
    id: number;
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    let timer: number;
    const launch = () => {
      setStar({
        id: Date.now(),
        top: 4 + Math.random() * 30,
        left: 35 + Math.random() * 60,
      });
      timer = window.setTimeout(launch, 4000 + Math.random() * 6000);
    };
    timer = window.setTimeout(launch, 2500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!star) return null;

  return (
    <span
      key={star.id}
      className="shooting-star"
      style={{ top: `${star.top}%`, left: `${star.left}%` }}
    />
  );
}

function Avatar({
  src,
  onSummon,
}: {
  src: string;
  onSummon: () => void;
}) {
  return (
    <motion.button
      className="avatar"
      onClick={onSummon}
      aria-label="Summon images"
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: [0, -5, 0], scale: 1 }}
      transition={{
        opacity: { duration: 0.25 },
        y: {
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
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
  const [spread, setSpread] = useState(1);

  // Ajusta la separación de los emojis al ancho de la pantalla
  useEffect(() => {
    const update = () =>
      setSpread(Math.max(0.55, Math.min(1, window.innerWidth / 1360)));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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

  const next = useCallback(
    () => goTo(scene + 1),
    [goTo, scene]
  );

  const prev = useCallback(
    () => goTo(scene - 1),
    [goTo, scene]
  );

  // Avance automático: muestra los emojis repartidos en el tiempo de la escena
  // y al terminar pasa a la siguiente; después de la última vuelve al inicio.
  useEffect(() => {
    const emojiCount = scenes[scene].length;
    const emojiInterval = SCENE_DURATION_MS / (emojiCount + 1);

    const emojiTimers = Array.from({ length: emojiCount }, (_, i) =>
      window.setTimeout(summon, emojiInterval * (i + 1))
    );

    const sceneTimer = window.setTimeout(() => {
      setScene((current) => (current + 1) % sceneData.length);
      setLaunched([]);
      setSummoning(false);
    }, SCENE_DURATION_MS);

    return () => {
      emojiTimers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(sceneTimer);
    };
  }, [scene, summon]);

  useEffect(() => {
    if (scene !== 5) return;

    const timer = window.setInterval(
      () =>
        setWalkFrame(
          (frame) => (frame + 1) % walkSprites.length
        ),
      170
    );

    return () => window.clearInterval(timer);
  }, [scene]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (
        event.code === "Space" ||
        event.code === "ArrowRight"
      ) {
        event.preventDefault();
        next();
      }

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

  const currentScene = sceneData[scene];

  return (
    <main className="world">
      <div className="stars" />
      <ShootingStars />
      <div className="moon" />

      <div className="city">
        <i />
        <i />
        <i />
        <i />
      </div>

      <section className={`stage ${scene === 0 ? "stage-intro" : ""}`}>
        <motion.div
          key={scene}
          className="scene-copy"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            left: "5%",
            bottom: "8%",
            zIndex: 5,
            maxWidth: "min(520px, 75%)",
            color: "#ffffff",
            textAlign: "left",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              display: "block",
              color: "#d5aaff",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "2px",
              marginBottom: "8px",
            }}
          >
            {currentScene.label}
          </span>

          <h1
            style={{
              fontSize: "clamp(18px, 2.5vw, 28px)",
              lineHeight: 1.2,
              fontWeight: 800,
              margin: "0 0 8px",
              textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            }}
          >
            {currentScene.title}
          </h1>

          <p
            style={{
              fontSize: "clamp(12px, 1.3vw, 15px)",
              lineHeight: 1.5,
              color: "#e0d2f4",
              margin: 0,
            }}
          >
            {currentScene.subtitle}
          </p>
        </motion.div>

        <div className="cards">
          <AnimatePresence>
            {launched.map((id, index) => (
              <motion.div
                key={id}
                className="card"
                initial={{
                  opacity: 0,
                  scale: 0.1,
                  x: 0,
                  y: 0,
                  rotate: -20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x:
                    cardSlots[index % cardSlots.length].x * spread +
                    Math.floor(index / cardSlots.length) * 30 *
                      Math.sign(cardSlots[index % cardSlots.length].x),
                  y:
                    cardSlots[index % cardSlots.length].y * spread -
                    Math.floor(index / cardSlots.length) * 30,
                  rotate: cardSlots[index % cardSlots.length].rotate,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                }}
                transition={{
                  type: "spring",
                  stiffness: 160,
                  damping: 13,
                }}
              >
                {scenes[scene][index % scenes[scene].length]}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Avatar src={avatarSrc} onSummon={summon} />

        <span className="ambient a">✦</span>
        <span className="ambient b">✧</span>
      </section>

      <nav className="controls" aria-label="Scene navigation">
        <button
          onClick={prev}
          disabled={scene === 0}
          aria-label="Previous scene"
        >
          ‹
        </button>

        <div className="dots">
          {scenes.map((_, index) => (
            <button
              key={index}
              className={scene === index ? "active" : ""}
              onClick={() => goTo(index)}
              aria-label={`Scene ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={scene === 6}
          aria-label="Next scene"
        >
          ›
        </button>
      </nav>

      <button
        className="summon"
        onClick={summon}
        aria-label="Summon image"
      >
        ✧
      </button>
    </main>
  );
}