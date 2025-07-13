import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { usePrismaticColor } from "./ColorContext";
import { ChevronDown } from "lucide-react";

export default function HeadsUpMenu() {
  const [navVisible, setNavVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { currentColor } = usePrismaticColor();
  const location = useLocation();

  useEffect(() => {
    const handleNavMouseMove = (e) => {
      if (e.clientY <= 100) {
        setNavVisible(true);
      } else if (e.clientY > 150) {
        setNavVisible(false);
      }
    };

    window.addEventListener('mousemove', handleNavMouseMove);
    return () => window.removeEventListener('mousemove', handleNavMouseMove);
  }, []);

  const getNavItemClass = (pageName) => {
    const isActive = location.pathname === createPageUrl(pageName);
    const isHovered = hoveredItem === pageName;
    const shouldShowColor = isActive || isHovered;
    
    return `px-8 py-3 rounded-full transition-all duration-300 font-medium relative ${
      shouldShowColor ? '' : 'text-gray-700 hover:text-gray-900'
    }`;
  };

  const getItemStyle = (pageName) => {
    const isActive = location.pathname === createPageUrl(pageName);
    const isHovered = hoveredItem === pageName;
    const shouldShowColor = isActive || isHovered;
    
    if (shouldShowColor) {
      return {
        color: currentColor,
        transition: 'color 0.3s ease-in-out'
      };
    }
    return {};
  };

  return (
    <>
      {/* Menu Indicator Arrow - Shows when menu is hidden */}
      {!navVisible && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <ChevronDown className="w-6 h-6 text-black animate-bounce" />
        </div>
      )}

      {/* Navigation Menu */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          navVisible ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-full opacity-0'
        }`}
      >
        <div className="flex justify-center pt-6 pb-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-xl border border-white/20 p-2">
            <div className="flex items-center space-x-2">
              <Link 
                to={createPageUrl("About")} 
                className={getNavItemClass("About")}
                style={getItemStyle("About")}
                onMouseEnter={() => setHoveredItem("About")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                About
              </Link>
              <Link 
                to={createPageUrl("Create")} 
                className={getNavItemClass("Create")}
                style={getItemStyle("Create")}
                onMouseEnter={() => setHoveredItem("Create")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                Create
              </Link>
              <Link 
                to={createPageUrl("Gallery")} 
                className={getNavItemClass("Gallery")}
                style={getItemStyle("Gallery")}
                onMouseEnter={() => setHoveredItem("Gallery")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                Posters
              </Link>
              <Link 
                to={createPageUrl("Results")} 
                className={getNavItemClass("Results")}
                style={getItemStyle("Results")}
                onMouseEnter={() => setHoveredItem("Results")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                The result %
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}