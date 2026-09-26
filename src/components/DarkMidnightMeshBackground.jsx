import React from 'react';

const DarkMidnightMeshBackground = () => {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', backgroundColor: '#0A0D10', zIndex: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #101418 0%, #0A0D10 52%, #06080A 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(148,163,184,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.10) 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.14 }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)', backgroundSize: '7px 7px', opacity: 0.06 }} />
      
      <div style={{ position: 'absolute', top: '-2rem', right: '-2rem', bottom: '-2rem', left: '-2rem', filter: 'blur(64px)' }}>
        <div style={{ position: 'absolute', top: '-16%', left: '-10%', height: '54%', width: '54%', borderRadius: '50%', backgroundColor: '#2DD4BF', opacity: 0.16 }} />
        <div style={{ position: 'absolute', top: '8%', right: '-12%', height: '48%', width: '48%', borderRadius: '50%', backgroundColor: '#38BDF8', opacity: 0.14 }} />
        <div style={{ position: 'absolute', bottom: '-18%', left: '20%', height: '50%', width: '50%', borderRadius: '50%', backgroundColor: '#34D399', opacity: 0.12 }} />
      </div>

      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.75) 1px, transparent 1px)', backgroundSize: '6px 6px', opacity: 0.04 }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at center, transparent 54%, rgba(0,0,0,0.42) 100%)' }} />
    </div>
  );
};

export default DarkMidnightMeshBackground;
