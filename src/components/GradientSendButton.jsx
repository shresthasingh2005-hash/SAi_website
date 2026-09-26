import React from 'react';
import { Send } from 'lucide-react';
import './GradientSendButton.css';

const GradientSendButton = ({ onClick }) => {
  return (
    <div className="gsb-wrapper" onClick={onClick} style={{ cursor: 'pointer', height: '42px', padding: '0' }}>
      <div className="gsb-light" />
      <div className="gsb-gradient-layer" style={{animationDelay: '0s', animationDuration: '25s'}} />
      <div className="gsb-gradient-layer" style={{animationDelay: '0.15s', animationDuration: '15.9s'}} />
      <div className="gsb-gradient-layer" style={{animationDelay: '0.53s', animationDuration: '26.4s'}} />
      <div className="gsb-gradient-layer" style={{animationDelay: '0.45s', animationDuration: '17.8s'}} />
      <div className="gsb-gradient-layer" style={{animationDelay: '1.6s', animationDuration: '19.2s'}} />
      <div className="gsb-gradient-layer" style={{animationDelay: '1.6s', animationDuration: '29.2s'}} />
      <div className="gsb-gradient-layer" style={{animationDelay: '1.6s', animationDuration: '20.2s'}} />
      <button className="gsb-gradient-btn">
        <span>Send</span>
        <Send size={16} />
      </button>
      <div className="gsb-text-overlay">
        <span>Send</span>
        <Send size={16} />
      </div>
    </div>
  );
}

export default GradientSendButton;
