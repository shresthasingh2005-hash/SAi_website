import React, { useEffect, useRef } from "react";
import '../index.css';

const colorSchemes = {
  default: {
    midBg: "#7c0911",
    shadows: [
      "0 1px 1px 0 #fff inset, 0 3px 5px 0 #ff5f9f inset, 0 4px 4px 0 #0693ff inset",
      "0 1px 1px 0 #fff inset, 0 3px 5px 0 #d60a47 inset, 0 4px 4px 0 #fbef19 inset",
      "0 1px 1px 0 #fff inset, 0 3px 5px 0 #ff5f9f inset, 0 4px 4px 0 #28a9ff inset",
    ],
  },
  sunset: {
    midBg: "#7c2d12",
    shadows: [
      "0 1px 1px 0 #fff inset, 0 3px 5px 0 #fb923c inset, 0 4px 4px 0 #f97316 inset",
      "0 1px 1px 0 #fff inset, 0 3px 5px 0 #ea580c inset, 0 4px 4px 0 #fbbf24 inset",
      "0 1px 1px 0 #fff inset, 0 3px 5px 0 #fb923c inset, 0 4px 4px 0 #fdba74 inset",
    ],
  },
  ocean: {
    midBg: "#0c4a6e",
    shadows: [
      "0 1px 1px 0 #fff inset, 0 3px 5px 0 #22d3ee inset, 0 4px 4px 0 #0284c7 inset",
      "0 1px 1px 0 #fff inset, 0 3px 5px 0 #06b6d4 inset, 0 4px 4px 0 #38bdf8 inset",
      "0 1px 1px 0 #fff inset, 0 3px 5px 0 #22d3ee inset, 0 4px 4px 0 #7dd3fc inset",
    ],
  },
  neon: {
    midBg: "#14532d",
    shadows: [
      "0 1px 1px 0 #fff inset, 0 3px 5px 0 #4ade80 inset, 0 4px 4px 0 #22d3ee inset",
      "0 1px 1px 0 #fff inset, 0 3px 5px 0 #22c55e inset, 0 4px 4px 0 #2dd4bf inset",
      "0 1px 1px 0 #fff inset, 0 3px 5px 0 #4ade80 inset, 0 4px 4px 0 #38bdf8 inset",
    ],
  },
};

function TextLoaderOrb({ scheme }) {
  const orbRef = useRef(null);

  useEffect(() => {
    const node = orbRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.style.transform = "rotate(270deg)";
      node.style.backgroundColor = scheme.midBg;
      node.style.boxShadow = scheme.shadows[1];
      return;
    }

    const animation = node.animate(
      [
        {
          transform: "rotate(90deg)",
          backgroundColor: "transparent",
          boxShadow: scheme.shadows[0],
        },
        {
          transform: "rotate(270deg)",
          backgroundColor: scheme.midBg,
          boxShadow: scheme.shadows[1],
          offset: 0.5,
        },
        {
          transform: "rotate(450deg)",
          backgroundColor: "transparent",
          boxShadow: scheme.shadows[2],
        },
      ],
      {
        duration: 1500,
        iterations: Number.POSITIVE_INFINITY,
        easing: "linear",
      }
    );

    return () => animation.cancel();
  }, [scheme]);

  return (
    <div
      ref={orbRef}
      style={{
        zIndex: 0,
        width: "1.25rem",
        height: "1.25rem",
        flexShrink: 0,
        borderRadius: "9999px",
        backgroundColor: "transparent",
        transform: "rotate(90deg)",
        willChange: "transform",
      }}
    />
  );
}

export function TextLoader({
  text = "Thinking...",
  variant = "ocean",
  textColor = "#ffffff",
}) {
  const letters = text.split("");
  const scheme = colorSchemes[variant] || colorSchemes.default;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        userSelect: 'none',
        color: textColor,
        fontWeight: '500',
        fontSize: '1.05rem',
        letterSpacing: '0.05em'
      }}
    >
      <TextLoaderOrb scheme={scheme} />
      <div style={{ display: "flex", gap: "1px" }}>
        {letters.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="osui-text-loader-pulse"
            style={{
              display: "inline-block",
              borderRadius: "50ch",
              border: "none",
              opacity: 0.4,
              animationDuration: "1.8s",
              animationDelay: `${index * 0.09}s`,
              willChange: "opacity"
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </div>
    </div>
  );
}
