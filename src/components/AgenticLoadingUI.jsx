import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Search, Sparkles, CheckCircle2 } from 'lucide-react';

const flirtyTexts = {
  hinglish: [
    "Bas ek second ruko gorgeous, aapka answer utna hi perfect bana raha hu jitni aapki smile hai...",
    "Deep thinking chalu hai... wait, you distracted me for a second. Okay, almost done!",
    "Give me a sec, boring stuff filter kar raha hu taaki aapko sirf best result mile.",
    "Perfection takes time... aur aapke liye toh special effort banta hai!"
  ],
  english: [
    "Hold on gorgeous, making sure this answer is as perfect as your smile...",
    "Thinking deep... wait, you distracted me for a second. Okay, almost done!",
    "Just a moment, filtering out the boring stuff so you only get the best.",
    "Give me a few seconds, perfection takes time..."
  ]
};

export default function AgenticLoadingUI({ isThinking, language = 'hinglish' }) {
  const [loadingText, setLoadingText] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isThinking) {
      const texts = flirtyTexts[language] || flirtyTexts['hinglish'];
      setLoadingText(texts[Math.floor(Math.random() * texts.length)]);
      
      setStep(0);
      const timers = [
        setTimeout(() => setStep(1), 1000), // Task Detection
        setTimeout(() => setStep(2), 2500), // Fetching Skill
        setTimeout(() => setStep(3), 4000), // Persona Routing
        setTimeout(() => setStep(4), 8000), // Deep Refinement
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isThinking, language]);

  return (
    <AnimatePresence>
      {isThinking && (
        <>
          {/* Main Screen Flirty Text Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              top: '40%',
              left: '0',
              right: '300px', // leave space for sidebar
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 40,
              pointerEvents: 'none'
            }}
          >
            <div style={{
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(12px)',
              padding: '20px 40px',
              borderRadius: '30px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <p style={{
                margin: 0,
                fontSize: '1.2rem',
                color: '#fff',
                fontWeight: 500,
                textAlign: 'center',
                background: 'linear-gradient(90deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {loadingText}
              </p>
            </div>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '300px',
              background: 'rgba(10, 10, 10, 0.85)',
              backdropFilter: 'blur(20px)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              zIndex: 50,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
            }}
          >
            <h3 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
              <BrainCircuit size={20} color="#05D9E8" /> AI Pipeline Status
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
              <StepItem 
                icon={<Search size={18} />} 
                title="Task Detection (Layer 0)" 
                status={step >= 0 ? (step > 0 ? 'done' : 'active') : 'waiting'} 
              />
              <StepItem 
                icon={<BrainCircuit size={18} />} 
                title="Fetching Specialized Skill" 
                status={step >= 1 ? (step > 1 ? 'done' : 'active') : 'waiting'} 
              />
              <StepItem 
                icon={<BrainCircuit size={18} />} 
                title="Persona Routing" 
                status={step >= 2 ? (step > 2 ? 'done' : 'active') : 'waiting'} 
              />
              <StepItem 
                icon={<Sparkles size={18} />} 
                title="Deep Refinement (Layers 1-4)" 
                status={step >= 3 ? (step > 3 ? 'done' : 'active') : 'waiting'} 
              />
              <StepItem 
                icon={<CheckCircle2 size={18} />} 
                title="Tone Polishing (Layer 6)" 
                status={step >= 4 ? 'active' : 'waiting'} 
              />
            </div>
            
            <div style={{ marginTop: 'auto', textAlign: 'center' }}>
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                style={{ width: '40px', height: '40px', border: '3px solid rgba(255, 255, 255, 0.1)', borderTopColor: '#FF2A6D', borderRadius: '50%', margin: '0 auto' }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StepItem({ icon, title, status }) {
  const isActive = status === 'active';
  const isDone = status === 'done';
  const color = isDone ? '#10b981' : isActive ? '#fff' : '#6b7280';
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: isDone || isActive ? 1 : 0.5 }}>
      <div style={{ 
        color: isDone ? '#10b981' : isActive ? '#05D9E8' : '#6b7280',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div style={{ color, fontSize: '0.95rem', fontWeight: isActive ? 600 : 400 }}>
        {title}
      </div>
      {isActive && (
        <motion.div 
          animate={{ opacity: [0, 1, 0] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ marginLeft: 'auto', width: '6px', height: '6px', background: '#05D9E8', borderRadius: '50%' }}
        />
      )}
    </div>
  );
}
