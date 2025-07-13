
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X } from "lucide-react";
import { usePrismaticColor } from './ColorContext';

const PieChart = ({ colorData }) => {
  const total = colorData.reduce((sum, item) => sum + item.count, 0);
  
  // Special case: if there's only one color, draw a full circle
  if (colorData.length === 1) {
    return (
      <div className="flex flex-col items-center">
        <svg width="180" height="180" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill={colorData[0].color}
            stroke="white"
            strokeWidth="1"
          />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12"
            fill="white"
            fontWeight="bold"
          >
            100%
          </text>
        </svg>
      </div>
    );
  }

  let currentAngle = 0;
  
  const slices = colorData.map((item, index) => {
    const percentage = (item.count / total) * 100;
    const angle = (item.count / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Calculate path for arc
    const largeArc = angle > 180 ? 1 : 0;
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    
    const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
    
    // Calculate label position
    const midAngle = (startAngle + endAngle) / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const labelX = 50 + 25 * Math.cos(midRad);
    const labelY = 50 + 25 * Math.sin(midRad);
    
    currentAngle += angle;
    
    return {
      pathData,
      color: item.color,
      percentage: Math.round(percentage),
      labelX,
      labelY
    };
  });
  
  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 100 100">
        {slices.map((slice, index) => (
          <g key={index}>
            <path
              d={slice.pathData}
              fill={slice.color}
              stroke="white"
              strokeWidth="1"
            />
            {slice.percentage >= 10 && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="8"
                fill="white"
                fontWeight="bold"
              >
                {slice.percentage}%
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

const ShapeIcon = ({ type, percentage, isHighest, currentColor }) => {
  const textStyle = {
    color: isHighest ? currentColor : '#6B7280',
    fontWeight: isHighest ? 'bold' : 'normal',
    textShadow: isHighest ? `0 0 4px ${currentColor}40` : 'none',
    transition: 'all 0.3s ease'
  };

  const renderIcon = () => {
    const iconStyle = {
      width: '24px',
      height: '24px',
      fill: '#6B7280'
    };

    switch (type) {
      case 'line':
        return <rect x="10" y="8" width="4" height="16" style={iconStyle} />;
      case 'square':
        return <rect x="4" y="4" width="16" height="16" rx="2" style={iconStyle} />;
      case 'circle':
        return <circle cx="12" cy="12" r="8" style={iconStyle} />;
      case 'triangle':
        return <polygon points="12,4 4,20 20,20" style={iconStyle} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="text-sm font-medium" style={textStyle}>
        {percentage}%
      </div>
      <svg width="24" height="24" viewBox="0 0 24 24">
        {renderIcon()}
      </svg>
    </div>
  );
};

export default function ReasonDetailModal({ reason, posters, onClose }) {
  const [isCloseHovered, setIsCloseHovered] = React.useState(false);
  const { currentColor } = usePrismaticColor();

  const analytics = useMemo(() => {
    // Color analysis
    const colorCounts = {};
    posters.forEach(poster => {
      if (poster.color) {
        colorCounts[poster.color] = (colorCounts[poster.color] || 0) + 1;
      }
    });
    
    const colorData = Object.entries(colorCounts)
      .map(([color, count]) => ({ color, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 colors
    
    // Shape analysis
    const shapeCounts = { line: 0, square: 0, circle: 0, triangle: 0 };
    let totalShapes = 0;
    
    posters.forEach(poster => {
      if (poster.shapes && Array.isArray(poster.shapes)) {
        poster.shapes.forEach(shape => {
          if (shape.type in shapeCounts) {
            shapeCounts[shape.type]++;
            totalShapes++;
          }
        });
      }
    });
    
    const shapePercentages = Object.entries(shapeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: totalShapes > 0 ? Math.round((count / totalShapes) * 100) : 0
    }));
    
    const highestShapePercentage = Math.max(...shapePercentages.map(s => s.percentage));
    
    // Slider analysis (most used sliders)
    const sliderTotals = {};
    const sliderCounts = {};
    
    posters.forEach(poster => {
      if (poster.sliderParams) {
        Object.entries(poster.sliderParams).forEach(([key, value]) => {
          if (typeof value === 'number') {
            sliderTotals[key] = (sliderTotals[key] || 0) + value;
            sliderCounts[key] = (sliderCounts[key] || 0) + 1;
          }
        });
      }
    });
    
    const featuredSliders = Object.entries(sliderTotals)
      .map(([key, total]) => ({
        name: key,
        average: Math.round(total / (sliderCounts[key] || 1))
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 4);
    
    return {
      colorData,
      shapePercentages,
      highestShapePercentage,
      featuredSliders
    };
  }, [posters]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
        className="relative max-w-2xl w-full bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          onMouseEnter={() => setIsCloseHovered(true)}
          onMouseLeave={() => setIsCloseHovered(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
        >
          <X 
            className="w-4 h-4 transition-colors"
            style={{ color: isCloseHovered ? currentColor : '#374151' }}
          />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1 text-gray-900">{reason.name}</h2>
          <p className="text-sm text-gray-600">{posters.length} shapes</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Side */}
          <div className="space-y-6">
            {/* Featured Sliders */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Featured sliders</h3>
              <div className="space-y-2">
                {analytics.featuredSliders.map((slider, index) => (
                  <div key={slider.name} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">
                      {slider.name.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {slider.average}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-6">
            {/* Pie Chart */}
            {analytics.colorData.length > 0 && (
              <div className="flex justify-center">
                <PieChart colorData={analytics.colorData} />
              </div>
            )}

            {/* Shape Analysis */}
            <div className="flex justify-center space-x-6">
              {analytics.shapePercentages.map((shape) => (
                <ShapeIcon
                  key={shape.type}
                  type={shape.type}
                  percentage={shape.percentage}
                  isHighest={shape.percentage === analytics.highestShapePercentage && shape.percentage > 0}
                  currentColor={currentColor}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
