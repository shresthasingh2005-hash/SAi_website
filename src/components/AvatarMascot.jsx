import React, { useEffect, useState, useRef } from 'react';
import { cn } from '../lib/utils';

// Helper function to get caret coordinates inside a textarea
function getCaretCoordinates(element, position) {
  const div = document.createElement('div');
  const style = div.style;
  const computed = window.getComputedStyle(element);

  style.whiteSpace = 'pre-wrap';
  style.wordWrap = 'break-word';
  style.position = 'absolute';
  style.visibility = 'hidden';

  const properties = [
    'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily',
    'textAlign', 'textTransform', 'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing', 'tabSize', 'MozTabSize'
  ];

  properties.forEach(prop => {
    style[prop] = computed[prop];
  });

  div.textContent = element.value.substring(0, position);
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);

  document.body.appendChild(div);
  const coordinates = {
    top: span.offsetTop + parseInt(computed['borderTopWidth']),
    left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
    height: parseInt(computed['lineHeight'])
  };
  document.body.removeChild(div);

  return coordinates;
}

export default function AvatarMascot({ isTyping, textareaRef, isFocused, value, isThinking }) {
  const [caretPos, setCaretPos] = useState({ left: 0, top: 0 });
  const [showAvatar, setShowAvatar] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);

  useEffect(() => {
    if (isFocused || value.length > 0 || isThinking) {
      setShowAvatar(true);
    } else {
      setShowAvatar(false);
      setShowSpeechBubble(false);
    }
  }, [isFocused, value, isThinking]);

  useEffect(() => {
    if (!textareaRef || !textareaRef.current) return;
    
    const updatePosition = () => {
      const el = textareaRef.current;
      const coords = getCaretCoordinates(el, el.selectionEnd);
      // We limit the left position to not overflow the container
      const maxLeft = el.clientWidth - 40; 
      setCaretPos({
        left: Math.min(Math.max(coords.left, 0), maxLeft),
        top: coords.top
      });
    };

    updatePosition();
    // Update on value change or selection change
    const el = textareaRef.current;
    el.addEventListener('input', updatePosition);
    el.addEventListener('keyup', updatePosition);
    el.addEventListener('click', updatePosition);
    
    return () => {
      el.removeEventListener('input', updatePosition);
      el.removeEventListener('keyup', updatePosition);
      el.removeEventListener('click', updatePosition);
    };
  }, [textareaRef, value]);

  return (
    <div
      className={cn(
        "absolute pointer-events-none transition-all duration-300 z-50",
        showAvatar ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-90"
      )}
      style={{
        left: `${isThinking ? 20 : Math.max(20, caretPos.left + 20)}px`,
        bottom: '100%', 
        marginBottom: '-8px', // Sit exactly on the chatbox edge
        transform: `translateX(-50%)`
      }}
    >
      <style>
        {`
          @keyframes hopWalk {
            0% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-5px) rotate(4deg); }
            50% { transform: translateY(0) rotate(0deg); }
            75% { transform: translateY(-5px) rotate(-4deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }
          @keyframes idleBreathing {
            0% { transform: scaleY(1) translateY(0); }
            50% { transform: scaleY(1.015) translateY(-1px); }
            100% { transform: scaleY(1) translateY(0); }
          }
          @keyframes thinkingHover {
            0% { transform: translateY(0) rotate(-1deg); }
            50% { transform: translateY(-3px) rotate(1deg); }
            100% { transform: translateY(0) rotate(-1deg); }
          }
          .animate-smooth-walk {
            animation: hopWalk 0.4s ease-in-out infinite;
          }
          .animate-idle-breathe {
            animation: idleBreathing 2.5s ease-in-out infinite;
            transform-origin: bottom center;
          }
          .animate-thinking {
            animation: thinkingHover 2.5s ease-in-out infinite;
          }
          @keyframes thoughtDot1 {
            0%, 10% { opacity: 0; }
            15%, 85% { opacity: 1; }
            90%, 100% { opacity: 0; }
          }
          @keyframes thoughtDot2 {
            0%, 25% { opacity: 0; }
            30%, 85% { opacity: 1; }
            90%, 100% { opacity: 0; }
          }
          @keyframes thoughtDot3 {
            0%, 40% { opacity: 0; }
            45%, 85% { opacity: 1; }
            90%, 100% { opacity: 0; }
          }
          @keyframes thoughtCloud {
            0%, 55% { opacity: 0; transform: scale(0.8); }
            60%, 85% { opacity: 1; transform: scale(1); }
            90%, 100% { opacity: 0; transform: scale(0.8); }
          }
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.8) translateY(10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}
      </style>
      
      {/* Speech Bubble */}
      {showSpeechBubble && (
        <div 
          className="absolute z-50 pointer-events-none"
          style={{
            bottom: '100%',
            left: '50%',
            marginLeft: '-24px', // Shift bubble to the right to avoid left screen edge
            marginBottom: '16px',
            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            width: 'max-content',
            maxWidth: '220px'
          }}
        >
          <div className="bg-[rgba(20,20,20,0.95)] backdrop-blur-md border border-[rgba(255,255,255,0.15)] text-[var(--text-primary)] text-sm rounded-2xl px-4 py-3 shadow-xl relative" style={{ lineHeight: '1.4' }}>
            Hello, I am S.Ai, your personal health assistant, how may I help you?
            <div className="absolute bottom-[-7px] w-3 h-3 bg-[rgba(20,20,20,0.95)] border-b border-r border-[rgba(255,255,255,0.15)] transform rotate-45" style={{ left: '18px' }} />
          </div>
        </div>
      )}

      <div 
        className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-end justify-center pointer-events-auto cursor-pointer"
        onMouseEnter={() => setShowSpeechBubble(true)}
        onMouseLeave={() => setShowSpeechBubble(false)}
        onClick={() => setShowSpeechBubble(!showSpeechBubble)}
      >
        {isThinking && (
          <>
            <div className="absolute rounded-full bg-white opacity-90 shadow-sm" style={{ width: '5px', height: '5px', top: '0px', right: '12px', animation: 'thoughtDot1 2.5s infinite' }} />
            <div className="absolute rounded-full bg-white opacity-90 shadow-sm" style={{ width: '7px', height: '7px', top: '-12px', right: '2px', animation: 'thoughtDot2 2.5s infinite' }} />
            <div className="absolute rounded-full bg-white opacity-90 shadow-sm" style={{ width: '10px', height: '10px', top: '-26px', right: '-10px', animation: 'thoughtDot3 2.5s infinite' }} />
            <div className="absolute" style={{ top: '-65px', right: '-40px', fontSize: '32px', animation: 'thoughtCloud 2.5s infinite', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
              💭
            </div>
          </>
        )}
        {isThinking ? (
          <img 
            src="/avatar_thinking.png" 
            alt="Thinking Avatar" 
            className="w-full h-full object-contain animate-thinking"
          />
        ) : isTyping ? (
          <img 
            src="/avatar_walking.png" 
            alt="Walking Avatar" 
            className="w-full h-full object-contain animate-smooth-walk"
          />
        ) : (
          <img 
            src="/avatar_sitting.png" 
            alt="Sitting Avatar" 
            className="w-full h-full object-contain animate-idle-breathe"
          />
        )}
      </div>
    </div>
  );
}
