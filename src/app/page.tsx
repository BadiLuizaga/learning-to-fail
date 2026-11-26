"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const scenes = [
  ["🏆","⭐","🎓"], ["📚","✏️","✅"], ["📄","❌","💔"],
  ["💡","🧩","🔍"], ["📖","⚙️","📈"], ["🧗","⛰️","🔥"], ["🏆","🌟","🎉"]
];

function Avatar({ onSummon }: { onSummon: () => void }) {
  return <motion.button className="avatar" onClick={onSummon} aria-label="Summon images"
    animate={{y:[0,-5,0]}} transition={{duration:2,repeat:Infinity}}>
    <span className="glow"/><span className="hair"/><span className="face"><i/><b/></span>
    <span className="neck"/><span className="shirt"/><span className="arm left"/><span className="arm right"/>
    <span className="tattoo">▧</span><span className="pants"/><span className="leg l"/><span className="leg r"/>
    <span className="spark s1">✦</span><span className="spark s2">✧</span>
  </motion.button>;
}

export default function Home() {
  const [scene,setScene] = useState(0);
  const [launched,setLaunched] = useState<number[]>([]);
  const summon = useCallback(() => setLaunched(v => [...v, Date.now()+Math.random()]),[]);
  const next = useCallback(() => {setScene(v=>Math.min(6,v+1));setLaunched([])},[]);
  const prev = useCallback(() => {setScene(v=>Math.max(0,v-1));setLaunched([])},[]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if(e.code==="Space" || e.code==="ArrowRight"){e.preventDefault();next();}
      if(e.code==="ArrowLeft") prev();
      if(e.code==="Enter") summon();
    };
    window.addEventListener("keydown",key); return ()=>window.removeEventListener("keydown",key);
  },[next,prev,summon]);
  return <main className="world">
    <div className="stars"/><div className="moon"/><div className="city"><i/><i/><i/><i/></div>
    <section className="stage">
      <div className="cards"><AnimatePresence>{launched.map((id,i)=><motion.div key={id} className="card"
        initial={{opacity:0,scale:.1,y:90,rotate:-20}}
        animate={{opacity:1,scale:1,x:(i%2?1:-1)*(125+i*28),y:-120-(i%3)*48,rotate:i%2?12:-12}}
        exit={{opacity:0,scale:.5}} transition={{type:"spring",stiffness:160,damping:13}}>
        {scenes[scene][i%3]}</motion.div>)}</AnimatePresence></div>
      <Avatar onSummon={summon}/>
      <span className="ambient a">✦</span><span className="ambient b">✧</span>
    </section>
    <nav className="controls">
      <button onClick={prev} disabled={scene===0} aria-label="Previous">‹</button>
      <div className="dots">{scenes.map((_,i)=><button key={i} className={scene===i?"active":""} onClick={()=>{setScene(i);setLaunched([])}} aria-label={"Scene "+(i+1)}/>)}</div>
      <button onClick={next} disabled={scene===6} aria-label="Next">›</button>
    </nav>
    <button className="summon" onClick={summon} aria-label="Summon image">✧</button>
  </main>;
}
