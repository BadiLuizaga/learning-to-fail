"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ───────────────────────── Datos de la presentación ───────────────────────── */

const SPRITE = (name: string) => `/images/character/${name}.png`;

const SCENES = [
  {
    label: "SCENE 1 — INTRODUCTION",
    title: "Why Learning to Fail Is as Important as Learning to Pass",
    subtitle: "An introduction to the topic.",
    sprite: SPRITE("idle"),
    emojis: ["🏆", "⭐", "🎓", "🎯", "🚀", "📚"],
  },
  {
    label: "SCENE 2 — AMBITION",
    title: "Dreaming of Success",
    subtitle: "Our goals, dreams, and everything we want to achieve.",
    sprite: SPRITE("present"),
    emojis: ["📚", "✏️", "✅", "💭", "🎯", "🌠"],
  },
  {
    label: "SCENE 3 — EXPECTATIONS",
    title: "The Pressure to Succeed",
    subtitle: "Expectations and the pressure to achieve good results.",
    sprite: SPRITE("failure"),
    emojis: ["📄", "❌", "💔", "⏰", "😰", "📊"],
  },
  {
    label: "SCENE 4 — FAILURE",
    title: "When Things Go Wrong",
    subtitle: "Mistakes, difficult moments, and frustration.",
    sprite: SPRITE("thinking"),
    emojis: ["💡", "🧩", "🔍", "📉", "😞", "🌧️"],
  },
  {
    label: "SCENE 5 — REALIZATION",
    title: "Failure Is a Lesson",
    subtitle: "Understanding that mistakes can teach us valuable lessons.",
    sprite: SPRITE("determined"),
    emojis: ["📖", "⚙️", "📈", "🧠", "🗝️", "✨"],
  },
  {
    label: "SCENE 6 — IMPROVEMENT",
    title: "Learning, Growing, and Trying Again",
    subtitle: "Practicing, improving, and never giving up.",
    sprite: SPRITE("walk-1"),
    emojis: ["🧗", "⛰️", "🔥", "💪", "🔁", "🌱"],
  },
  {
    label: "SCENE 7 — SUCCESS",
    title: "Success Is Built on Failure",
    subtitle: "Success is the result of learning from our mistakes.",
    sprite: SPRITE("victory"),
    emojis: ["🏆", "🌟", "🎉", "🥇", "👑", "🎊"],
  },
] as const;

const LAST_SCENE = SCENES.length - 1;
const WALK_SCENE = 5;
const WALK_SPRITES = [1, 2, 3, 4].map((n) => SPRITE(`walk-${n}`));
const SUMMON_SPRITE = SPRITE("summon");

// Presentación de 5 minutos repartida entre las 7 escenas (~42.9 s cada una)
const TOTAL_DURATION_MS = 5 * 60 * 1000;
const SCENE_DURATION_MS = TOTAL_DURATION_MS / SCENES.length;
const SUMMON_POSE_MS = 1050;
const WALK_FRAME_MS = 170;
const MAX_CARDS = 12;

const CARD_TRANSITION = { type: "spring", stiffness: 160, damping: 13 } as const;

// Distribución de los emojis alrededor del personaje: se calcula según el
// tamaño real del personaje y de la pantalla para que nunca se salgan.
type CardLayout = { card: number; midX: number; outX: number; y: number; copyW: number };

const DEFAULT_LAYOUT: CardLayout = { card: 100, midX: 330, outX: 290, y: 170, copyW: 520 };

// Lado (-1 izquierda / 1 derecha), fila (-1 arriba / 0 medio / 1 abajo) y giro
const CARD_SLOTS = [
  { side: -1, row: -1, rotate: -12 },
  { side: 1, row: -1, rotate: 12 },
  { side: -1, row: 0, rotate: 8 },
  { side: 1, row: 0, rotate: -8 },
  { side: -1, row: 1, rotate: -10 },
  { side: 1, row: 1, rotate: 10 },
];

function cardTarget(index: number, layout: CardLayout) {
  const slot = CARD_SLOTS[index % CARD_SLOTS.length];
  // Si se invocan más de 6, los siguientes quedan un poco más adentro
  const inset = 1 - Math.floor(index / CARD_SLOTS.length) * 0.12;
  const x = slot.row === 0 ? layout.midX : layout.outX;
  return {
    opacity: 1,
    scale: 1,
    x: slot.side * x * inset,
    y: slot.row * layout.y * inset,
    rotate: slot.rotate,
  };
}

function measureLayout(anchor: HTMLElement, avatar: HTMLElement): CardLayout {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { left: ax, top: ay } = anchor.getBoundingClientRect();
  const { width: w, height: h } = avatar.getBoundingClientRect();

  const card = Math.round(Math.max(52, Math.min(vh * 0.15, vw * 0.16, 130)));
  const margin = 10;
  const half = card / 2;

  const roomX = Math.min(ax, vw - ax) - half - margin;
  const roomUp = ay - half - margin;
  // Deja libre la barra de botones
  const controlsTop = document.querySelector(".controls")?.getBoundingClientRect().top ?? vh - 80;
  const roomDown = controlsTop - ay - half - margin;

  const midX = Math.max(0, Math.min(w / 2 + card * 0.65, roomX));
  // Ancho disponible para el texto de la escena sin chocar con los emojis de la izquierda
  const copyW = Math.max(220, ax - midX - half - vw * 0.05 - 16);

  return {
    card,
    copyW,
    midX,
    outX: Math.max(0, Math.min(w * 0.42 + card * 0.65, roomX)),
    y: Math.max(0, Math.min(h * 0.36, roomUp, roomDown)),
  };
}

/* ───────────────────────── Componentes ───────────────────────── */

// Estrella fugaz que cruza el cielo cada cierto rato (entre 4 y 10 s)
const ShootingStars = memo(function ShootingStars() {
  const [star, setStar] = useState<{ id: number; top: number; left: number } | null>(null);

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
});

const Avatar = memo(function Avatar({
  src,
  walking,
  onSummon,
  ref,
}: {
  src: string;
  walking: boolean;
  onSummon: () => void;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <motion.button
      ref={ref}
      className="avatar"
      onClick={onSummon}
      aria-label="Summon images"
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: [0, -5, 0], scale: 1 }}
      transition={{
        opacity: { duration: 0.25 },
        y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <span className="avatar-glow" />
      <motion.img
        key={src}
        src={src}
        alt=""
        draggable={false}
        // Los cuadros de la caminata cambian sin desvanecerse para que no parpadee
        initial={walking ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
});

const Background = memo(function Background() {
  return (
    <>
      <div className="stars" />
      <ShootingStars />
      <div className="moon" />
      <div className="city">
        <i />
        <i />
        <i />
        <i />
      </div>
    </>
  );
});

/* ───────────────────────── Página ───────────────────────── */

export default function Home() {
  const [scene, setScene] = useState(0);
  const [cards, setCards] = useState<number[]>([]);
  const [summoning, setSummoning] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const [layout, setLayout] = useState<CardLayout>(DEFAULT_LAYOUT);
  const anchorRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const summonTimer = useRef<number | undefined>(undefined);
  const cardId = useRef(0);

  // Precarga todos los sprites para que no haya parpadeos al cambiar de escena
  useEffect(() => {
    [...SCENES.map((s) => s.sprite), ...WALK_SPRITES, SUMMON_SPRITE].forEach((src) => {
      new Image().src = src;
    });
  }, []);

  // Recalcula la distribución de los emojis al cambiar el tamaño de pantalla o de escena
  useLayoutEffect(() => {
    const update = () => {
      if (anchorRef.current && avatarRef.current) {
        setLayout(measureLayout(anchorRef.current, avatarRef.current));
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [scene]);

  useEffect(() => () => window.clearTimeout(summonTimer.current), []);

  const summon = useCallback(() => {
    setSummoning(true);
    setCards((items) => [...items, cardId.current++].slice(-MAX_CARDS));
    // Reinicia la pose para que no se corte si se invoca varias veces seguidas
    window.clearTimeout(summonTimer.current);
    summonTimer.current = window.setTimeout(() => setSummoning(false), SUMMON_POSE_MS);
  }, []);

  const showScene = useCallback((index: number) => {
    window.clearTimeout(summonTimer.current);
    setScene(index);
    setCards([]);
    setSummoning(false);
  }, []);

  const goTo = useCallback(
    (index: number) => showScene(Math.max(0, Math.min(LAST_SCENE, index))),
    [showScene]
  );

  // Avance automático: muestra los emojis repartidos en el tiempo de la escena
  // y al terminar pasa a la siguiente; después de la última vuelve al inicio.
  useEffect(() => {
    const emojiCount = SCENES[scene].emojis.length;
    const emojiInterval = SCENE_DURATION_MS / (emojiCount + 1);

    const timers = Array.from({ length: emojiCount }, (_, i) =>
      window.setTimeout(summon, emojiInterval * (i + 1))
    );
    timers.push(
      window.setTimeout(() => showScene((scene + 1) % SCENES.length), SCENE_DURATION_MS)
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [scene, summon, showScene]);

  // Animación de caminata en la escena 6
  useEffect(() => {
    if (scene !== WALK_SCENE) return;
    const timer = window.setInterval(
      () => setWalkFrame((frame) => (frame + 1) % WALK_SPRITES.length),
      WALK_FRAME_MS
    );
    return () => window.clearInterval(timer);
  }, [scene]);

  // Teclado: Espacio/→ siguiente, ← anterior, Enter invoca
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      switch (event.code) {
        case "Space":
        case "ArrowRight":
          event.preventDefault();
          goTo(scene + 1);
          break;
        case "ArrowLeft":
          goTo(scene - 1);
          break;
        case "Enter":
        case "NumpadEnter":
          // Evita que Enter también "haga clic" en el botón enfocado
          event.preventDefault();
          summon();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, scene, summon]);

  const current = SCENES[scene];
  const walking = scene === WALK_SCENE && !summoning;
  const avatarSrc = summoning
    ? SUMMON_SPRITE
    : walking
      ? WALK_SPRITES[walkFrame]
      : current.sprite;

  return (
    <main className="world" style={
        { "--card": `${layout.card}px`, "--copy-w": `${layout.copyW}px` } as CSSProperties
      }>
      <Background />

      <section className={`stage${scene === 0 ? " stage-intro" : ""}`}>
        <motion.div
          key={scene}
          className="scene-copy"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="scene-label">{current.label}</span>
          <h1>{current.title}</h1>
          <p>{current.subtitle}</p>
        </motion.div>

        <div className="cards" ref={anchorRef}>
          <AnimatePresence>
            {cards.map((id, index) => (
              <motion.div
                key={id}
                className="card"
                initial={{ opacity: 0, scale: 0.1, x: 0, y: 0, rotate: -20 }}
                animate={cardTarget(index, layout)}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={CARD_TRANSITION}
              >
                {current.emojis[index % current.emojis.length]}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Avatar ref={avatarRef} src={avatarSrc} walking={walking} onSummon={summon} />

        <span className="ambient a">✦</span>
        <span className="ambient b">✧</span>
      </section>

      <nav className="controls" aria-label="Scene navigation">
        <button onClick={() => goTo(scene - 1)} disabled={scene === 0} aria-label="Previous scene">
          ‹
        </button>

        <div className="dots">
          {SCENES.map((_, index) => (
            <button
              key={index}
              className={scene === index ? "active" : ""}
              onClick={() => goTo(index)}
              aria-label={`Scene ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(scene + 1)}
          disabled={scene === LAST_SCENE}
          aria-label="Next scene"
        >
          ›
        </button>
      </nav>

      <button className="summon" onClick={summon} aria-label="Summon image">
        ✧
      </button>
    </main>
  );
}
