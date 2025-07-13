import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Poster from "../components/Poster";
import PaintableText from "../components/PaintableText";
import LabelButton from "../components/LabelButton";
import ReasonFilterPills from "../components/ReasonFilterPills";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Define the list of emotions for the filter
const emotions = ["Happy", "Sad", "Angry", "Afraid", "Surprised", "Disgusted"];

// New component for animating individual poster grid items
const GalleryGridPosterItem = ({ poster, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: 0.1 * index,
        type: "spring",
        stiffness: 100
      }}
    >
      <Poster
        poster={poster}
        onClick={onClick}
      />
    </motion.div>
  );
};

export default function Gallery() {
  const [posters, setPosters] = useState([]);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [gridSize, setGridSize] = useState({ cols: 4, rows: 3 });
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Load posters from localStorage
    const storedPosters = JSON.parse(localStorage.getItem('emotionPosters') || '[]');
    setPosters(storedPosters);

    // Determine grid size based on total number of posters (before filtering)
    // This logic ensures the grid adjusts based on the overall collection size, not the filtered view.
    if (storedPosters.length > 12) {
      setGridSize({ cols: 8, rows: 6 });
    } else {
      setGridSize({ cols: 4, rows: 3 });
    }
  }, []);

  const availableReasons = useMemo(() => {
    const relevantPosters = selectedEmotion
      ? posters.filter(p => p.emotion?.toLowerCase() === selectedEmotion.toLowerCase())
      : posters;

    const reasons = new Set(relevantPosters.map(p => p.reason).filter(Boolean));
    return ['All', ...Array.from(reasons).sort()];
  }, [posters, selectedEmotion]);

  useEffect(() => {
    if (selectedReason && !availableReasons.map(r => r.toLowerCase()).includes(selectedReason.toLowerCase())) {
        setSelectedReason("");
    }
  }, [availableReasons, selectedReason]);

  const handlePosterClick = (poster) => {
    if (poster.imageUrl) {
      setSelectedPoster(poster);
    }
  };

  const handleClosePopup = () => {
    setSelectedPoster(null);
  };

  const handleResearchProcessClick = () => {
    navigate(createPageUrl("ResearchProcess"));
  };

  // Filter posters based on selected emotion and reason
  const filteredPosters = posters.filter(poster => {
    const emotionMatch = !selectedEmotion || poster.emotion?.toLowerCase() === selectedEmotion.toLowerCase();
    const reasonMatch = !selectedReason || poster.reason?.toLowerCase() === selectedReason.toLowerCase();
    return emotionMatch && reasonMatch;
  });

  // Create grid array with empty slots, showing filtered posters
  // The grid always tries to fill `totalSlots` with filtered posters, then nulls.
  const totalSlots = gridSize.cols * gridSize.rows;
  const gridItems = Array.from({ length: totalSlots }, (_, index) => {
    return filteredPosters[index] || null;
  });

  return (
    <div className="min-h-screen pt-7 pb-12 px-6" style={{ backgroundColor: '#FCFAFA' }}>
      <div className="max-w-[90vw] mx-auto relative">
        <div className="absolute top-0 right-0 z-50 -translate-y-[15px]">
          <LabelButton
            label={"The\nresearch\nprocess"}
            onClick={handleResearchProcessClick}
            labelType="reason"
            useFlexLayout={true}
          />
        </div>
        
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
           <div style={{ marginBottom: '-25px' }}>
              <PaintableText
                text={"Emotion\nshapes"}
                fontSize="70px"
                fontWeight="700"
                fontFamily="PT Serif, serif"
                lineSpacing={-25} // Changed from -15 to -25
              />
            </div>
        </motion.div>

        {/* Emotion Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center flex-wrap gap-4 mb-8"
        >
          <LabelButton
            label="All"
            isSelected={selectedEmotion === ""}
            onClick={() => setSelectedEmotion("")}
            index={0}
            isInline={true}
            labelType="emotion"
          />
          {emotions.map((emotion, index) => (
            <LabelButton
              key={emotion}
              label={emotion}
              isSelected={selectedEmotion === emotion}
              onClick={() => setSelectedEmotion(emotion)}
              index={index + 1}
              isInline={true}
              labelType="emotion"
            />
          ))}
        </motion.div>

        {/* Reason Filter */}
        <div className="flex justify-center mb-12 min-h-[2rem]">
          <ReasonFilterPills
            reasons={availableReasons}
            selectedReason={selectedReason}
            onReasonChange={setSelectedReason}
          />
        </div>

        {/* Poster Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`grid gap-6 ${
            gridSize.cols === 8 ? 'grid-cols-8' : 'grid-cols-4'
          }`}
          style={{
            gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`
          }}
        >
          {gridItems.map((poster, index) => (
            <GalleryGridPosterItem
              key={poster ? poster.id : `empty-${index}`}
              poster={poster}
              index={index}
              onClick={() => poster && handlePosterClick(poster)}
            />
          ))}
        </motion.div>

        {/* Image Popup */}
        <AnimatePresence>
          {selectedPoster && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={handleClosePopup}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-4 max-w-[95vw] max-h-[95vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={handleClosePopup}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>

                {/* Image */}
                {selectedPoster.imageUrl ? (
                  <img
                    src={selectedPoster.imageUrl}
                    alt={selectedPoster.title}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p className="text-xl">{selectedPoster.title}</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}