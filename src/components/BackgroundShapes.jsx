import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/api/entities';

const Shape = ({ type, x, y, size, rotate, color }) => {
  const commonStyles = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
  };

  const variants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: {
      opacity: [0, 0.4, 0.4, 0],
      scale: [0.5, 1, 1, 0.5],
      x: `${Math.random() * 200 - 100}px`,
      y: `${Math.random() * 200 - 100}px`,
      rotate: Math.random() * 360,
      transition: {
        duration: Math.random() * 15 + 15,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  };

  switch (type) {
    case 'line':
      return (
        <motion.div
          style={{ ...commonStyles, height: `${size * 2}px`, width: `${size / 5}px` }}
          variants={variants}
          initial="initial"
          animate="animate"
        />
      );
    case 'square':
      return (
        <motion.div
          style={commonStyles}
          variants={variants}
          initial="initial"
          animate="animate"
        />
      );
    case 'circle':
      return (
        <motion.div
          style={{ ...commonStyles, borderRadius: '50%' }}
          variants={variants}
          initial="initial"
          animate="animate"
        />
      );
    case 'triangle':
      return (
        <motion.div
          style={{
            ...commonStyles,
            width: 0,
            height: 0,
            borderLeft: `${size / 2}px solid transparent`,
            borderRight: `${size / 2}px solid transparent`,
            borderBottom: `${size}px solid ${color}`,
            backgroundColor: 'transparent',
          }}
          variants={variants}
          initial="initial"
          animate="animate"
        />
      );
    default:
      return null;
  }
};

export default function BackgroundShapes() {
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    const fetchShapeData = async () => {
      try {
        const user = await User.me();
        const userPosters = Array.isArray(user.posters) ? user.posters : [];
        
        const shapeCounts = { line: 0, square: 0, circle: 0, triangle: 0 };
        const colorPalette = new Set();

        userPosters.forEach(poster => {
          if (poster.shapes && Array.isArray(poster.shapes)) {
            poster.shapes.forEach(shape => {
              if (shape.type in shapeCounts) {
                shapeCounts[shape.type]++;
              }
            });
          }
          if (poster.color) {
            colorPalette.add(poster.color);
          }
        });
        
        const colors = Array.from(colorPalette).length > 0 ? Array.from(colorPalette) : ['#cccccc'];
        let generatedShapes = [];
        
        Object.entries(shapeCounts).forEach(([type, count]) => {
          // Ensure at least 3 of each shape type for visual effect, plus user-generated shapes
          const total = Math.min(3 + count, 10); // Cap at 10 to avoid clutter
          for (let i = 0; i < total; i++) {
            generatedShapes.push({
              id: `${type}-${i}`,
              type,
              x: Math.random() * 100,
              y: Math.random() * 100,
              size: Math.random() * 80 + 40,
              rotate: Math.random() * 360,
              color: colors[Math.floor(Math.random() * colors.length)],
            });
          }
        });

        // If no user data, generate some default shapes
        if(generatedShapes.length === 0) {
            ['line', 'square', 'circle', 'triangle'].forEach(type => {
                for(let i=0; i<4; i++){
                    generatedShapes.push({
                        id: `default-${type}-${i}`, type,
                        x: Math.random() * 100, y: Math.random() * 100,
                        size: Math.random() * 80 + 40, rotate: Math.random() * 360,
                        color: colors[0]
                    })
                }
            })
        }
        
        setShapes(generatedShapes);
      } catch (error) {
        console.error("Could not fetch user data for background shapes:", error);
      }
    };

    fetchShapeData();
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden backdrop-blur-3xl z-0">
      {shapes.map(shape => (
        <Shape key={shape.id} {...shape} />
      ))}
    </div>
  );
}