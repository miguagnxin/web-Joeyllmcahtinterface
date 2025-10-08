"use client";

import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="group relative overflow-hidden rounded-lg border border-gray-300/30 dark:border-cyan-400/30 bg-gray-100/10 dark:bg-cyan-500/10 px-3 py-2 text-sm font-medium text-gray-700 dark:text-cyan-300 transition-all duration-300 hover:bg-gray-200/20 dark:hover:bg-cyan-500/20 hover:border-gray-400/50 dark:hover:border-cyan-400/50 hover-lift"
      type="button"
    >
      <span className="relative z-10 flex items-center space-x-2">
        {theme === "dark" ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="hidden sm:inline">Light</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span className="hidden sm:inline">Dark</span>
          </>
        )}
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-600/20 dark:from-cyan-500/20 dark:to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
}
