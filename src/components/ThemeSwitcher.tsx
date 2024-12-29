"use client";

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme as 'light' | 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    console.log('Theme toggled to:', theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div onClick={toggleTheme} className="cursor-pointer px-3 py-1.5">
      {theme === 'light' ? <Moon /> : <Sun />}
    </div>
  );
};

export default ThemeSwitcher;