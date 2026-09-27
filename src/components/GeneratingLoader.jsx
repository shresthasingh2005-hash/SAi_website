import React from 'react';
import styled from 'styled-components';

const GeneratingLoader = () => {
  return (
    <StyledWrapper>
      <div className="flex-container">
        {/* Circle Generating Loader */}
        <div className="loader-wrapper">
          <span className="loader-letter">G</span>
          <span className="loader-letter">e</span>
          <span className="loader-letter">n</span>
          <span className="loader-letter">e</span>
          <span className="loader-letter">r</span>
          <span className="loader-letter">a</span>
          <span className="loader-letter">t</span>
          <span className="loader-letter">i</span>
          <span className="loader-letter">n</span>
          <span className="loader-letter">g</span>
          <div className="loader-circle" />
        </div>

        {/* Bouncing Dots Loader */}
        <div className="wrapper-dots">
          <div className="circle-dot" />
          <div className="circle-dot" />
          <div className="circle-dot" />
          <div className="shadow-dot" />
          <div className="shadow-dot" />
          <div className="shadow-dot" />
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .flex-container {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 0;
  }

  /* --- CIRCLE LOADER CSS --- */
  .loader-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    font-family: "Inter", sans-serif;
    font-size: 0.8em;
    font-weight: 400;
    color: white;
    border-radius: 50%;
    background-color: transparent;
    user-select: none;
    transform: scale(0.65);
    margin: -20px;
  }

  .loader-circle {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    background-color: transparent;
    animation: loader-rotate 2s linear infinite;
    z-index: 0;
  }

  @keyframes loader-rotate {
    0% {
      transform: rotate(90deg);
      box-shadow:
        0 10px 20px 0 #fff inset,
        0 20px 30px 0 #ad5fff inset,
        0 60px 60px 0 #471eec inset;
    }
    50% {
      transform: rotate(270deg);
      box-shadow:
        0 10px 20px 0 #fff inset,
        0 20px 10px 0 #d60a47 inset,
        0 40px 60px 0 #311e80 inset;
    }
    100% {
      transform: rotate(450deg);
      box-shadow:
        0 10px 20px 0 #fff inset,
        0 20px 30px 0 #ad5fff inset,
        0 60px 60px 0 #471eec inset;
    }
  }

  .loader-letter {
    display: inline-block;
    opacity: 0.4;
    transform: translateY(0);
    animation: loader-letter-anim 2s infinite;
    z-index: 1;
    border-radius: 50ch;
    border: none;
  }

  .loader-letter:nth-child(1) { animation-delay: 0s; }
  .loader-letter:nth-child(2) { animation-delay: 0.1s; }
  .loader-letter:nth-child(3) { animation-delay: 0.2s; }
  .loader-letter:nth-child(4) { animation-delay: 0.3s; }
  .loader-letter:nth-child(5) { animation-delay: 0.4s; }
  .loader-letter:nth-child(6) { animation-delay: 0.5s; }
  .loader-letter:nth-child(7) { animation-delay: 0.6s; }
  .loader-letter:nth-child(8) { animation-delay: 0.7s; }
  .loader-letter:nth-child(9) { animation-delay: 0.8s; }
  .loader-letter:nth-child(10) { animation-delay: 0.9s; }

  @keyframes loader-letter-anim {
    0%,
    100% {
      opacity: 0.4;
      transform: translateY(0);
    }
    20% {
      opacity: 1;
      transform: scale(1.15);
    }
    40% {
      opacity: 0.7;
      transform: translateY(0);
    }
  }

  /* --- BOUNCING DOTS LOADER CSS --- */
  .wrapper-dots {
    width: 100px;
    height: 40px;
    position: relative;
    z-index: 1;
    transform: scale(0.5);
    transform-origin: left center;
    margin-left: -10px;
  }

  .circle-dot {
    width: 20px;
    height: 20px;
    position: absolute;
    border-radius: 50%;
    background-color: #fff;
    left: 15%;
    transform-origin: 50%;
    animation: circle7124 .5s alternate infinite ease;
  }

  @keyframes circle7124 {
    0% {
      top: 40px;
      height: 5px;
      border-radius: 50px 50px 25px 25px;
      transform: scaleX(1.7);
    }
    40% {
      height: 20px;
      border-radius: 50%;
      transform: scaleX(1);
    }
    100% {
      top: 0%;
    }
  }

  .circle-dot:nth-child(2) {
    left: 45%;
    animation-delay: .2s;
  }

  .circle-dot:nth-child(3) {
    left: auto;
    right: 15%;
    animation-delay: .3s;
  }

  .shadow-dot {
    width: 20px;
    height: 4px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    position: absolute;
    top: 42px;
    transform-origin: 50%;
    z-index: -1;
    left: 15%;
    filter: blur(1px);
    animation: shadow046 .5s alternate infinite ease;
  }

  @keyframes shadow046 {
    0% {
      transform: scaleX(1.5);
    }
    40% {
      transform: scaleX(1);
      opacity: .7;
    }
    100% {
      transform: scaleX(.2);
      opacity: .4;
    }
  }

  .shadow-dot:nth-child(4) {
    left: 45%;
    animation-delay: .2s
  }

  .shadow-dot:nth-child(5) {
    left: auto;
    right: 15%;
    animation-delay: .3s;
  }
`;

export default GeneratingLoader;
