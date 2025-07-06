import React from 'react';
import { MousePointer, Type, Square, Circle, Edit3, Palette, Minus } from 'lucide-react';

const Toolbar = ({
  selectedTool,
  onToolChange,
  toolSettings,
  onSettingsChange,
  theme
}) => {
  const tools = [
    { id: 'select', name: 'Select', icon: MousePointer },
    { id: 'text', name: 'Text', icon: Type },
    { id: 'rectangle', name: 'Rectangle', icon: Square },
    { id: 'circle', name: 'Circle', icon: Circle },
    { id: 'line', name: 'Line', icon: Minus }, // Added line tool
    { id: 'freehand', name: 'Freehand', icon: Edit3 }
  ];

  const handleSettingChange = (key, value) => {
    onSettingsChange({
      ...toolSettings,
      [key]: value
    });
  };

  return (
    <div className={`p-4 rounded-lg border ${
      theme === 'dark'
        ? 'border-gray-600 bg-gray-800'
        : 'border-gray-300 bg-white'
    }`}>
      <h3 className="text-lg font-semibold mb-4">Tools</h3>
      
      {/* Tool Selection */}
      <div className="space-y-2 mb-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                selectedTool === tool.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                  : theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{tool.name}</span>
            </button>
          );
        })}
      </div>
      
      {/* Tool Settings */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 dark:text-gray-300">Settings</h4>
        
        {/* Color */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={toolSettings.color}
              onChange={(e) => handleSettingChange('color', e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {toolSettings.color}
            </span>
          </div>
        </div>
        
        {/* Font Size (for text tool) */}
        {selectedTool === 'text' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              Font Size
            </label>
            <input
              type="range"
              min="10"
              max="48"
              value={toolSettings.fontSize}
              onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>10px</span>
              <span>{toolSettings.fontSize}px</span>
              <span>48px</span>
            </div>
          </div>
        )}
        
        {/* Line Width (for drawing tools) */}
        {(selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'line' || selectedTool === 'freehand') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              Line Width
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={toolSettings.lineWidth}
              onChange={(e) => handleSettingChange('lineWidth', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>1px</span>
              <span>{toolSettings.lineWidth}px</span>
              <span>10px</span>
            </div>
          </div>
        )}
        
        {/* Opacity */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Opacity
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={toolSettings.opacity}
            onChange={(e) => handleSettingChange('opacity', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>10%</span>
            <span>{Math.round(toolSettings.opacity * 100)}%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Quick Color Presets */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Quick Colors
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'].map(color => (
              <button
                key={color}
                onClick={() => handleSettingChange('color', color)}
                className={`w-8 h-8 rounded border-2 ${
                  toolSettings.color === color ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;