import React from 'react';

const DarkMidnightMeshBackground = () => {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', backgroundColor: '#050505', zIndex: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #111111 0%, #080808 52%, #000000 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '7px 7px' }} />
      
      {/* Performant alternative to blur() - using radial gradients */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 10% 10%, rgba(255,75,75,0.03) 0%, transparent 40%), radial-gradient(circle at 90% 40%, rgba(255,75,75,0.02) 0%, transparent 40%), radial-gradient(circle at 40% 90%, rgba(255,34,34,0.02) 0%, transparent 50%)' }} />

      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '6px 6px', opacity: 0.04 }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at center, transparent 54%, rgba(0,0,0,0.6) 100%)' }} />
    </div>
  );
};

export default DarkMidnightMeshBackground;
