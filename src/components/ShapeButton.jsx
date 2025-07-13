import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

export default function ShapeButton({ id, name, imagePath, position, onClick, isSelected, selectedColor }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Much more responsive spring physics
  const springConfig = { stiffness: 600, damping: 20, mass: 0.3 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Increased tilt range for more dramatic effect
  const rotateX = useTransform(springY, [-100, 100], [25, -25]);
  const rotateY = useTransform(springX, [-100, 100], [-25, 25]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -50%)',
        perspective: 1200,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.button
        onClick={() => onClick(id)}
        whileHover={{ 
          y: -5, // Reduced from -15 to -5
          scale: 1.02, // Reduced from 1.05 to 1.02
          boxShadow: '0 15px 30px -8px rgba(0, 0, 0, 0.25)', // Reduced shadow
          transition: { type: "spring", stiffness: 500, damping: 10 }
        }}
        whileTap={{ y: -2, scale: 0.99 }} // Reduced tap effect too
        className="group relative rounded-2xl transition-all duration-150 overflow-hidden bg-white/70 backdrop-blur-md shadow-lg p-0"
        style={{
          rotateX,
          rotateY,
          borderWidth: '6px',
          borderStyle: 'solid',
          borderColor: isSelected ? '#D1D5DB' : 'rgba(255, 255, 255, 0.2)',
          width: 'fit-content',
          height: 'fit-content',
        }}
      >
        <img
          src={imagePath}
          alt={name}
          className="block"
          style={{
            mixBlendMode: 'multiply',
            width: 'auto',
            height: 'auto',
            maxWidth: '200px',
            maxHeight: '200px',
          }}
        />
        
        {/* Sheen for Hover State */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none skew-x-12"
        ></div>

        {/* Sheen for Selected State */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-opacity duration-400 pointer-events-none skew-x-12 ${
            isSelected ? 'opacity-100' : 'opacity-0'
          }`}
        ></div>
        
        <div 
          className="absolute top-0 left-0 w-full h-full rounded-xl pointer-events-none"
          style={{
            boxShadow: 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.1)'
          }}
        >
        </div>
      </motion.button>
    </motion.div>
  );
}