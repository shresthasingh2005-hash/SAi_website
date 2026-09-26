import React from 'react';

const DarkEmberBackground = () => {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', backgroundColor: '#100C0A', zIndex: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 120%, #1A1210 0%, #100C0A 48%, #080605 100%)' }} />
      <div style={{ position: 'absolute', top: '-2rem', right: '-2rem', bottom: '-2rem', left: '-2rem', filter: 'blur(40px)' }}>
        <div style={{ position: 'absolute', bottom: '6%', left: '-8%', height: '64%', width: '64%', borderRadius: '50%', backgroundColor: '#F59E0B', opacity: 0.20, filter: 'blur(64px)' }} />
        <div style={{ position: 'absolute', bottom: '12%', left: '32%', height: '52%', width: '52%', borderRadius: '50%', backgroundColor: '#FB923C', opacity: 0.16, filter: 'blur(64px)' }} />
        <div style={{ position: 'absolute', top: '18%', right: '-6%', height: '58%', width: '58%', borderRadius: '50%', backgroundColor: '#F43F5E', opacity: 0.14, filter: 'blur(64px)' }} />
        <div style={{ position: 'absolute', top: '4%', left: '14%', height: '44%', width: '44%', borderRadius: '50%', backgroundColor: '#FBBF24', opacity: 0.12, filter: 'blur(64px)' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '5px 5px', opacity: 0.035 }} />
    </div>
  );
};

export default DarkEmberBackground;
