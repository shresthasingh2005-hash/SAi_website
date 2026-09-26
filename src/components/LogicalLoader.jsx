import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const LogicalLoader = ({ isThinking, query = "" }) => {
  const [currentWord, setCurrentWord] = useState("");

  useEffect(() => {
    if (!isThinking) return;

    let timers = [];
    const wordCount = query.trim().split(/\s+/).length;
    const isShortQuery = wordCount < 8;

    if (isShortQuery) {
      setCurrentWord("intent");
      timers = [
        setTimeout(() => setCurrentWord("context"), 1200),
        setTimeout(() => setCurrentWord("response"), 2400)
      ];
    } else {
      setCurrentWord("analysis");
      timers = [
        setTimeout(() => setCurrentWord("searching"), 1500),
        setTimeout(() => setCurrentWord("reasoning"), 3500),
        setTimeout(() => setCurrentWord("synthesis"), 5500),
        setTimeout(() => setCurrentWord("response"), 7500)
      ];
    }

    return () => timers.forEach(clearTimeout);
  }, [isThinking, query]);

  if (!isThinking) return null;

  return (
    <StyledWrapper>
      <div className="card">
        <div className="loader">
          <p>loading</p>
          <div className="words">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWord}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="word"
              >
                {currentWord}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    /* color used to softly clip top and bottom of the .words container */
    --bg-color: #111;
    background-color: var(--bg-color);
    padding: 1rem 2rem;
    border-radius: 1.25rem;
    display: inline-block;
  }
  .loader {
    color: rgb(124, 124, 124);
    font-family: "Poppins", sans-serif;
    font-weight: 500;
    font-size: 25px;
    -webkit-box-sizing: content-box;
    box-sizing: content-box;
    height: 40px;
    padding: 10px 10px;
    display: flex;
    border-radius: 8px;
    align-items: center;
  }

  .loader p {
    margin: 0;
  }

  .words {
    overflow: hidden;
    position: relative;
    height: 40px;
    display: flex;
    align-items: center;
  }
  
  .words::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      var(--bg-color) 10%,
      transparent 30%,
      transparent 70%,
      var(--bg-color) 90%
    );
    z-index: 20;
    pointer-events: none;
  }

  .word {
    display: block;
    height: 100%;
    line-height: 40px;
    padding-left: 6px;
    color: #956afa;
  }
`;

export default LogicalLoader;
