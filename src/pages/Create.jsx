
import React, { useState, useRef, useEffect, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import LabelButton from "../components/LabelButton";
import { usePrismaticColor } from "../components/ColorContext";
import PaintableText from "../components/PaintableText";

const emotions = ["Happy", "Sad", "Angry", "Afraid", "Surprised", "Disgusted"];

const reasonLabels = [
  "Calm", "Lonely", "Upset", "Nervous", "Confused", "Uncomfortable", "Warm", "Trapped", "Proud", "Disappointed", "Annoyed", "Worried",
  "Excited", "Embarrassed", "Safe", "Stuck", "Hopeful", "Lost", "Jealous", "Amazed", "Open", "Empty",
  "Energized", "Tired", "Stressed", "Insecure", "Unsure", "Attached",
  "Playful", "Sensitive", "Frustrated", "Curious", "Judgmental", "Numb",
  "Loving", "Frozen"
];

// Helper component for the sentence blanks
const FilledBlank = ({ value, color }) => {
    if (value) {
        return <span className="font-bold" style={{ color: color, transition: 'color 0.3s ease-in-out' }}>{value}</span>;
    }
    // Renders a line for the blank
    return <span className="inline-block w-28 md:w-36 h-1 bg-gray-300 rounded-full mx-1 align-middle"></span>;
};

export default function Create() {
  const navigate = useNavigate();
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [lineCoords, setLineCoords] = useState(null);
  const { currentColor } = usePrismaticColor();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const emotionRefs = useRef({});
  const reasonRefs = useRef({});

  const reasonProps = useMemo(() => {
    return reasonLabels.map(label => ({
      label,
    }));
  }, []);

  const reasonsByRow = useMemo(() => {
    const totalLabels = reasonProps.length;
    const labelsPerRow = 9; // Changed from Math.ceil(totalLabels / 3) to fixed 9 per row
    return [
      reasonProps.slice(0, labelsPerRow),           // Row 1: items 0-8
      reasonProps.slice(labelsPerRow, labelsPerRow * 2),     // Row 2: items 9-17
      reasonProps.slice(labelsPerRow * 2, labelsPerRow * 3), // Row 3: items 18-26
      reasonProps.slice(labelsPerRow * 3),          // Row 4: items 27-35
    ];
  }, [reasonProps]);

  const isComplete = selectedEmotion && selectedReason;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selectedEmotion && selectedReason) {
      const emotionNode = emotionRefs.current[selectedEmotion];
      const reasonNode = reasonRefs.current[selectedReason];
      const containerNode = containerRef.current;

      if (emotionNode && reasonNode && containerNode) {
        const containerRect = containerNode.getBoundingClientRect();
        const emotionRect = emotionNode.getBoundingClientRect();
        const reasonRect = reasonNode.getBoundingClientRect();

        const x1 = emotionRect.left + emotionRect.width / 2 - containerRect.left;
        const y1 = emotionRect.top + emotionRect.height / 2 - containerRect.top;
        const x2 = reasonRect.left + reasonRect.width / 2 - containerRect.left;
        const y2 = reasonRect.top + reasonRect.height / 2 - containerRect.top;

        setLineCoords({ x1, y1, x2, y2 });
      }
    } else {
      setLineCoords(null);
    }
  }, [selectedEmotion, selectedReason, windowSize]);

  const handleBeginClick = () => {
    if (isComplete) {
      const selectionData = {
        emotion: selectedEmotion,
        reason: selectedReason,
        shape: 'collective',
        color: '#170606' 
      };
      localStorage.setItem('currentSelection', JSON.stringify(selectionData));
      navigate(createPageUrl("Canvas"));
    }
  };

  const handleReasonClick = (reason) => {
    setSelectedReason(prev => prev === reason ? "" : reason);
  };

  const handleResearchProcessClick = () => {
    navigate(createPageUrl("ResearchProcess"));
  };

  return (
    <div className="h-screen overflow-hidden pt-7 pb-12 px-6" style={{ backgroundColor: '#FCFAFA' }}>
      <div ref={containerRef} className="max-w-[95vw] mx-auto h-full flex flex-col relative">

        <div className="absolute top-0 right-0 z-50 -translate-y-[15px]">
          <LabelButton
            label={"The\nresearch\nprocess"}
            onClick={handleResearchProcessClick}
            labelType="reason"
            useFlexLayout={true}
          />
        </div>

        {lineCoords && (
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            <line
              x1={lineCoords.x1}
              y1={lineCoords.y1}
              x2={lineCoords.x2}
              y2={lineCoords.y2}
              stroke={currentColor}
              strokeWidth="2"
              style={{ transition: 'stroke 0.3s ease-in-out' }}
            />
          </svg>
        )}

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div style={{ marginBottom: '-25px' }}>
            <PaintableText
              text={"Create your\nemotion shape"}
              fontSize="70px"
              fontWeight="700"
              fontFamily="PT Serif, serif"
              lineSpacing={-25} // Changed from -15 to -25
            />
          </div>
        </motion.div>

        <div className="flex-grow flex flex-col justify-center items-center pb-24">
          {/* Subtitle - Centered above emotion labels */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-10 lg:mb-12 flex-shrink-0"
          >
            <p className="text-[24px] lg:text-[30px] xl:text-[36px] text-gray-800 font-light max-w-5xl leading-relaxed">
              When I am <FilledBlank value={selectedEmotion} color={currentColor} />, I feel <FilledBlank value={selectedReason} color={currentColor} />.
            </p>
          </motion.div>

          {/* Emotion Labels */}
          <div className="flex justify-center flex-wrap gap-4 lg:gap-6 xl:gap-8 mb-8 lg:mb-12 relative z-10">
            {emotions.map((emotion, index) => (
              <LabelButton
                ref={el => (emotionRefs.current[emotion] = el)}
                key={emotion}
                label={emotion}
                isSelected={selectedEmotion === emotion}
                onClick={() => setSelectedEmotion(prev => prev === emotion ? "" : emotion)}
                index={index}
                isInline={true}
                labelType="emotion"
              />
            ))}
          </div>

          {/* Reason Labels */}
          <div className="w-full space-y-7 lg:space-y-8 z-10">
            {reasonsByRow.map((row, rowIndex) => (
              <motion.div
                key={rowIndex}
                className="flex justify-center items-center flex-wrap gap-x-4 gap-y-4 lg:gap-x-5 lg:gap-y-5"
                style={{ transform: rowIndex === 1 ? 'translateX(2.5rem)' : 'none' }}
              >
                {row.map((reason, index) => (
                  <motion.div
                    key={reason.label}
                    animate={{ rotate: [0, -4, 4, -4, 0] }}
                    transition={{
                      duration: 6 + Math.random() * 4, // Random duration between 6-10 seconds
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: 'mirror',
                      delay: Math.random() * 3 // Random delay up to 3 seconds
                    }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LabelButton
                      ref={el => (reasonRefs.current[reason.label] = el)}
                      label={reason.label}
                      isSelected={selectedReason === reason.label}
                      onClick={() => handleReasonClick(reason.label)}
                      index={index}
                      labelType="reason"
                      useFlexLayout={true}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>

        {isComplete && (
          <div className="fixed bottom-8 right-8 z-20">
            <button
              onClick={handleBeginClick}
              className="group relative overflow-hidden p-[2px] rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
              style={{ background: currentColor }}
            >
              <div className="px-4 py-2 rounded-full bg-white text-gray-800 font-semibold text-lg flex items-center space-x-3">
                <span>Continue</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12 pointer-events-none"></div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
