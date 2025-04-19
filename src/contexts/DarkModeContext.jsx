import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  // Check local storage and use light mode as the default
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    // Default to light mode instead of system preference
    return false;
  });

  useEffect(() => {
    // Update local storage when mode changes
    localStorage.setItem('darkMode', isDarkMode);
    
    // Apply/remove dark class to html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext); 