import React, { createContext, useState, useEffect, useContext } from 'react';

const PRISMATIC_GRADIENT = [
  '#00007b', '#3399ff', '#66ccaa', '#339900', '#996600',
  '#ffcc66', '#ffeedd', '#cc6699', '#cc0033', '#660000',
];

const ColorContext = createContext();

export const usePrismaticColor = () => useContext(ColorContext);

export const ColorProvider = ({ children }) => {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setColorIndex(prevIndex => (prevIndex + 1) % PRISMATIC_GRADIENT.length);
    }, 300);

    return () => clearInterval(intervalId);
  }, []);

  const value = {
    prismaticColors: PRISMATIC_GRADIENT,
    currentColor: PRISMATIC_GRADIENT[colorIndex],
  };

  return (
    <ColorContext.Provider value={value}>
      {children}
    </ColorContext.Provider>
  );
};