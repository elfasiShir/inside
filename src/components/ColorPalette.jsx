import React from 'react';
import { motion } from 'framer-motion';

export default function ColorPalette({ colors, selectedColor, onColorSelect }) {
  const rows = [
    colors.slice(0, 7),
    colors.slice(7, 14),
    colors.slice(14, 21),
  ];

  return (
    <div className="grid grid-cols-7 gap-2">
      {rows.map((row, rowIndex) =>
        row.map((color, colIndex) => (
          <motion.button
            key={`${rowIndex}-${color}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 * colIndex + rowIndex * 0.7 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onColorSelect(color)}
            className={`w-6 h-6 rounded-full transition-all duration-300 ${
              selectedColor === color
                ? 'ring-4 ring-gray-800 ring-offset-2'
                : 'hover:ring-2 hover:ring-gray-400 hover:ring-offset-1'
            }`}
            style={{ backgroundColor: color }}
          />
        ))
      )}
    </div>
  );
}