import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../services/themeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'hero' | 'compact';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'default', className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const baseStyles = 'relative flex items-center justify-center rounded-lg transition-all duration-300';
  
  const variantStyles = {
    default: 'h-9 w-9 bg-muted hover:bg-muted/80 text-foreground',
    hero: 'h-9 w-9 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20',
    compact: 'h-8 w-8 bg-muted hover:bg-muted/80 text-foreground',
  };

  return (
    <button
      onClick={toggleTheme}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative h-5 w-5">
        <Sun 
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <Moon 
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
    </button>
  );
};
