import React from 'react';

const InputCursorLoader = () => {
  return (
    <>
      <style>{`
        .loading-wave {
          width: auto;
          height: 18px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loading-bar {
          width: 4px;
          height: 4px;
          margin: 0 2px;
          background-color: #3498db;
          border-radius: 2px;
          animation: loading-wave-animation 1s ease-in-out infinite;
        }

        .loading-bar:nth-child(2) {
          animation-delay: 0.1s;
        }

        .loading-bar:nth-child(3) {
          animation-delay: 0.2s;
        }

        .loading-bar:nth-child(4) {
          animation-delay: 0.3s;
        }

        @keyframes loading-wave-animation {
          0% {
            height: 4px;
          }

          50% {
            height: 18px;
          }

          100% {
            height: 4px;
          }
        }
      `}</style>
      <div className="loading-wave">
        <div className="loading-bar" />
        <div className="loading-bar" />
        <div className="loading-bar" />
        <div className="loading-bar" />
      </div>
    </>
  );
}

export default InputCursorLoader;
