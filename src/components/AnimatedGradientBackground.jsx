import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const breathe = keyframes`
  0% { transform: scale(1); filter: hue-rotate(0deg); }
  50% { transform: scale(1.1); filter: hue-rotate(15deg); }
  100% { transform: scale(1); filter: hue-rotate(0deg); }
`;

const wave = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const BackgroundWrapper = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5000; // High z-index for offline screen
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    inset: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at center,
      transparent 0%,
      transparent 20%,
      rgba(5, 217, 232, 0.4) 40%,
      rgba(255, 42, 109, 0.5) 60%,
      rgba(255, 107, 43, 0.4) 80%,
      transparent 100%
    );
    background-size: 400% 400%;
    animation: ${breathe} 8s ease-in-out infinite, ${wave} 15s ease infinite;
    pointer-events: none;
    z-index: -1;
  }
`;

const OfflineContent = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  color: white;
  text-align: center;
  font-family: "Outfit", sans-serif;

  h2 {
    font-size: 2.5rem;
    font-weight: 600;
    margin: 0;
    letter-spacing: -1px;
  }

  p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.7);
    max-width: 400px;
  }

  .wifi-icon {
    position: relative;
    width: 64px;
    height: 64px;
    
    svg {
      width: 100%;
      height: 100%;
      color: #FF2A6D;
      opacity: 0.8;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.95); }
  }
`;

export default function AnimatedGradientBackground() {
  return (
    <BackgroundWrapper>
      <OfflineContent
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="wifi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m2 8.82 2.29-2.29c5.86-5.87 15.38-5.87 21.24 0l2.29 2.29" opacity="0.2"/>
            <path d="m6 12.82 2.3-2.29c3.65-3.66 9.58-3.66 13.23 0l2.3 2.29" opacity="0.5"/>
            <path d="m10 16.82 2.3-2.29c1.45-1.45 3.8-1.45 5.25 0l2.3 2.29"/>
            <line x1="16" y1="21" x2="16.01" y2="21"/>
            <line x1="2" y1="2" x2="22" y2="22" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <div>
          <h2>You're Offline</h2>
          <p>Please check your internet connection to continue using S.ai</p>
        </div>
      </OfflineContent>
    </BackgroundWrapper>
  );
}
