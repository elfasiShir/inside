import React from "react";
import { motion } from "framer-motion";

export default function SelectionSummary({ 
  selectedEmotion, 
  selectedReason, 
  selectedShape, 
  className = "" 
}) {
  if (!selectedEmotion && !selectedReason && !selectedShape) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed bottom-8 left-8 bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 ${className}`}
    >
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Your Selection</h3>
      {selectedEmotion && (
        <div className="mb-2">
          <span className="text-sm text-gray-500">Emotion: </span>
          <span className="font-medium text-black">{selectedEmotion}</span>
        </div>
      )}
      {selectedReason && (
        <div className="mb-2">
          <span className="text-sm text-gray-500">Reason: </span>
          <span className="font-medium text-black">{selectedReason}</span>
        </div>
      )}
      {selectedShape && (
        <div>
          <span className="text-sm text-gray-500">Shape: </span>
          <span className="font-medium text-black capitalize">{selectedShape}</span>
        </div>
      )}
    </motion.div>
  );
}