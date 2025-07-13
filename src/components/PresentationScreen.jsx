
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import PaintableText from "./PaintableText";

export default function PresentationScreen({ onComplete }) {
  const containerRef = useRef(null);

  const handleClick = useCallback(() => {
    setTimeout(() => {
      onComplete();
    }, 500);
  }, [onComplete]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: '#FCFAFA'
      }}
    >
      <style>
        {`
          .particles {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: -1;
          }
          
          .particle {
            position: absolute;
            width: 2px;
            height: 2px;
            background: #000000;
            opacity: 0.3;
            animation: particleFade 3s linear infinite;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
          }
          
          @keyframes particleFade {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: translateY(-100px) scale(0); opacity: 0; }
          }

          @keyframes fadeInPresentation {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      {/* Particles */}
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="text-center transform -translate-y-5 relative">
        <PaintableText
          text="INSIDE"
          fontSize="8rem"
          fontWeight="700"
          fontFamily="PT Serif, serif"
          onTextClick={handleClick}
          textAlign="center" // Explicitly set to center to override the new default
          className="opacity-0 transform translate-y-5 animate-[fadeInPresentation_1s_ease-out_0.8s_forwards] cursor-pointer"
          style={{
            animation: 'fadeInPresentation 1s ease-out 0.8s forwards'
          }}
        />
      </div>
    </motion.div>
  );
}
