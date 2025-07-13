
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PaintableText from '../components/PaintableText';
import BackgroundShapes from '../components/BackgroundShapes';
import { usePrismaticColor } from '../components/ColorContext';

export default function About() {
  const navigate = useNavigate();
  const { currentColor } = usePrismaticColor();

  const handleCreateClick = () => {
    navigate(createPageUrl("Create"));
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#FCFAFA' }}>
      <BackgroundShapes />
      
      <div className="relative z-10 flex justify-center items-center min-h-screen pt-7 pb-12 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl bg-white/50 backdrop-blur-sm p-10 rounded-lg shadow-2xl"
        >
          <div className="mb-8">
            <PaintableText
              text="About"
              fontSize="70px" // Changed from 60px to 70px
              fontWeight="700"
              fontFamily="PT Serif, serif"
              className="leading-tight"
            />
          </div>
          <div className="font-inter text-lg text-gray-800 space-y-6 leading-relaxed">
            <p>
              INSIDE is a <strong className="font-bold">research project</strong> that began with a simple but powerful thought: we all feel and experience life differently. Each person carries a unique inner world — shaped by their own emotions, memories, and perspective. There is no single truth, and no right way to feel.
            </p>
            <p>
              <strong className="font-bold">This idea led me to a personal question that sparked the project:</strong> What if we could see what emotion looks like? And how would each person choose to express it? INSIDE invites you to explore your emotional world and express it visually, in your own creative and intuitive way.
            </p>
            <p>
              <strong className="font-bold">Here's how it works:</strong>
              <br />
              On the next page, choose a basic emotion and the reason you feel it. A canvas will open where you can express that emotion using colors, up to three shapes, and sliders to adjust their appearance. When you're done, save your creation and print it — it will be instantly added to the research.
            </p>
            <p className="pt-4 font-bold">
              *Use these tools to <strong className="font-bold">express the emotion you chose</strong> — based on your own interpretation. Connect to your intuitive side and let your feeling guide the creation.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Create Button */}
      <div className="fixed bottom-8 right-8 z-20">
        <button
          onClick={handleCreateClick}
          className="group relative overflow-hidden p-[2px] rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
          style={{ background: currentColor }}
        >
          <div className="px-8 py-4 rounded-full bg-white text-gray-800 font-semibold text-lg flex items-center space-x-3">
            <span>Create</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12 pointer-events-none"></div>
        </button>
      </div>
    </div>
  );
}
