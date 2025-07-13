import React from "react";
import { usePrismaticColor } from "./ColorContext";

const LabelButton = React.forwardRef(
  (
    {
      label,
      position,
      isSelected,
      onClick,
      rotate = 0,
      isInline = false,
      labelType = "emotion",
      useFlexLayout = false,
      disabled = false,
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const { currentColor } = usePrismaticColor();
    const isActive = (isSelected || isHovered) && !disabled;

    const fontClass = labelType === "reason" ? "font-inter" : "";

    const containerClasses = `relative rounded-full p-[1.5px] transition-all duration-300 ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    }`;
    
    const containerStyle = isActive ? { background: currentColor } : { background: 'transparent' };

    const content = (sizeClasses) => (
      <span
        className={`block rounded-full bg-white border ${
          isActive ? "border-transparent" : "border-black"
        } transition-all duration-300`}
      >
        <span
          className={`block ${sizeClasses} font-medium transition-all duration-300 ${fontClass}`}
          style={{
            color: isActive ? currentColor : 'black',
            whiteSpace: 'pre-line',
            textAlign: 'center',
            transition: 'color 0.3s ease-in-out'
          }}
        >
          {label}
        </span>
      </span>
    );

    const handleClick = () => {
      if (!disabled && onClick) {
        onClick();
      }
    };

    if (isInline) {
      return (
        <button
          ref={ref}
          onClick={handleClick}
          onMouseEnter={() => !disabled && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`${containerClasses} text-lg lg:text-xl xl:text-2xl`}
          style={containerStyle}
          disabled={disabled}
        >
          {content("px-8 py-3 lg:px-10 lg:py-4 xl:px-12 xl:py-5")}
        </button>
      );
    }

    if (useFlexLayout) {
      return (
        <button
          ref={ref}
          onClick={handleClick}
          onMouseEnter={() => !disabled && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`${containerClasses} text-sm lg:text-base xl:text-lg hover:shadow-lg`}
          style={{
            ...containerStyle,
            transform: `rotate(${rotate}deg)`,
          }}
          disabled={disabled}
        >
          {content("px-6 py-4 lg:px-8 lg:py-4 xl:px-10 xl:py-5")}
        </button>
      );
    }

    // Default: absolute positioned layout
    return (
      <button
        ref={ref}
        onClick={handleClick}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`absolute ${containerClasses} text-base`}
        style={{
          ...containerStyle,
          top: position.top,
          left: position.left,
          transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
        }}
        disabled={disabled}
      >
        {content("px-6 py-2")}
      </button>
    );
  }
);

export default LabelButton;