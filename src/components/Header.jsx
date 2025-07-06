import React from 'react';
import { Sun, Moon } from 'lucide-react';

const Header = ({ theme, onToggleTheme }) => {
  return (
    <header className={`border-b transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-blue-600">
              Media Annotation Tool
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;