
import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ShapeButton from "../components/ShapeButton";
import SelectionSummary from "../components/SelectionSummary"; // New import

const collectiveUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c616daa90_image.png";

const shapes = [
  { id: "collective", name: "Collective", src: collectiveUrl, position: { top: "50%", left: "50%" } },
];

export default function PickShapeColor() {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState("#170606"); // Set default to black
  const [selectedShape, setSelectedShape] = useState("");
  const [emotionData, setEmotionData] = useState({ emotion: "", reason: "" });

  useEffect(() => {
    const stored = localStorage.getItem('emotionSelection');
    if (stored) {
      setEmotionData(JSON.parse(stored));
    } else {
      navigate(createPageUrl("PickEmotionReason"));
    }
  }, [navigate]);

  const isComplete = selectedShape;

  const handleContinueClick = () => {
    if (isComplete) {
      // Store the current selection data
      const selectionData = {
        ...emotionData,
        color: selectedColor,
        shape: selectedShape
      };
      localStorage.setItem('currentSelection', JSON.stringify(selectionData));
      
      // Navigate to the specific shape page
      if (selectedShape === 'collective') {
        navigate(createPageUrl("CollectiveShape"));
      }
      // Add other shape navigation here when more shapes are created
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[90vw] mx-auto">
        {/* Header */}
        <div 
          className="text-left mb-16 relative"
        >
          <h1 className="text-[55px] font-bold leading-tight mb-6 text-black">
            {emotionData.emotion} - {emotionData.reason}
          </h1>
          <p className="text-[30px] text-gray-600 font-light max-w-4xl leading-relaxed">
            Choose an interactive shape<br />that best represents this emotion.
          </p>
        </div>

        {/* Shapes Layout */}
        <div 
          className="relative h-[500px] flex items-center justify-center"
        >
          {shapes.map((shape) => (
            <ShapeButton
              key={shape.id}
              id={shape.id}
              name={shape.name}
              imagePath={shape.src}
              position={shape.position}
              onClick={setSelectedShape}
              isSelected={selectedShape === shape.id}
              selectedColor={selectedColor}
            />
          ))}
        </div>

        {/* Continue Button */}
        {isComplete && (
            <div
              className="fixed bottom-8 right-8"
            >
              <button 
                onClick={handleContinueClick}
                className="group relative overflow-hidden p-[2px] rounded-full gradient-border shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                <div className="px-8 py-4 rounded-full bg-white text-gray-800 font-semibold text-lg flex items-center space-x-3">
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12 pointer-events-none"></div>
              </button>
            </div>
          )}

        {/* Selection Summary */}
        <SelectionSummary 
          selectedEmotion={emotionData.emotion}
          selectedReason={emotionData.reason}
          selectedShape={selectedShape}
        />
      </div>
    </div>
  );
}
