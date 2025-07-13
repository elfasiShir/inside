import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function ReasonCloud({ reason, onSelect }) {
  const mostUsedColor = useMemo(() => {
    const colorCounts = {};
    reason.posters.forEach(poster => {
      if (poster.color) {
        colorCounts[poster.color] = (colorCounts[poster.color] || 0) + 1;
      }
    });

    let maxCount = 0;
    let mostUsed = '#000000';
    for (const [color, count] of Object.entries(colorCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = color;
      }
    }
    return mostUsed;
  }, [reason.posters]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
      className="relative pt-2" // Added padding top for pin
      onClick={() => onSelect(reason)}
    >
      {/* The Pin */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-10 shadow-inner"
        style={{ backgroundColor: mostUsedColor }}
      />
      
      {/* The Swaying Card */}
      <motion.div
        className="bg-white rounded-xl shadow-xl w-60 h-60 flex flex-col items-center justify-center p-6 cursor-pointer"
        style={{ transformOrigin: 'top center' }}
        animate={{
          rotate: [0, -1.5, 1.5, -1.5, 0],
        }}
        transition={{
          duration: 10,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: 'mirror',
          delay: Math.random() * 2
        }}
        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.95 }}
      >
        <span
          className="text-3xl font-semibold text-center leading-tight mb-2 font-inter"
          style={{ color: mostUsedColor }}
        >
          {reason.name}
        </span>
        <span className="text-lg font-medium text-center font-inter text-gray-500">
          {reason.posters.length} shapes
        </span>
      </motion.div>
    </motion.div>
  );
}