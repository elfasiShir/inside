
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrismaticColor } from "./ColorContext";

export default function Poster({ poster, onClick, index = 0 }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { currentColor } = usePrismaticColor();

  return (
    <motion.div
      key={poster ? poster.id : `empty-${index}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: 0.1 * index,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        aspect-square w-full bg-white rounded-lg shadow-lg hover:shadow-xl 
        transition-all duration-300 overflow-hidden border border-gray-200
        relative flex items-center justify-center
        ${poster?.imageUrl ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      {poster?.imageUrl ? (
        <>
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
          )}
          <img
            src={poster.imageUrl}
            alt={poster.title}
            className={`max-w-full max-h-full object-contain transition-opacity duration-500 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsImageLoaded(true)}
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-full p-4">
          <div className="text-center">
            {poster ? (
              <>
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  {poster.title}
                </p>
              </>
            ) : (
              // Empty slot - no content
              null
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {isHovered && poster?.imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center p-4 pointer-events-none"
          >
            <motion.h3
              style={{
                color: currentColor,
                textShadow: '0 2px 5px rgba(0,0,0,0.8)',
                transition: 'color 0.3s ease-in-out',
              }}
              className="text-2xl font-bold text-center capitalize"
            >
              {poster.emotion}
            </motion.h3>
            <motion.p
              style={{
                color: currentColor,
                textShadow: '0 2px 5px rgba(0,0,0,0.8)',
                transition: 'color 0.3s ease-in-out',
              }}
              className="text-lg text-center capitalize mt-1"
            >
              {poster.reason}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
