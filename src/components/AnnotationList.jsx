import React, { useState } from 'react';
import { Eye, EyeOff, Edit2, Trash2, Type, Square, Circle, Edit3, MousePointer, Minus } from 'lucide-react';

const AnnotationList = ({
  annotations,
  onUpdateAnnotation,
  onDeleteAnnotation,
  selectedAnnotation,
  onSelectAnnotation,
  theme
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const getToolIcon = (type) => {
    switch (type) {
      case 'text': return Type;
      case 'rectangle': return Square;
      case 'circle': return Circle;
      case 'line': return Minus; // Added line icon
      case 'freehand': return Edit3;
      default: return MousePointer;
    }
  };

  var length;

  const getAnnotationLabel = (annotation) => {
    switch (annotation.type) {
      case 'text':
        return annotation.text || 'Text';
      case 'rectangle':
        return `Rectangle (${Math.round(annotation.width)}×${Math.round(annotation.height)})`;
      case 'circle':
        return `Circle (r: ${Math.round(annotation.radius)})`;
      case 'line':
        // Calculate line length for display
        length = Math.sqrt(
          Math.pow(annotation.endX - annotation.startX, 2) + 
          Math.pow(annotation.endY - annotation.startY, 2)
        );
        return `Line (${Math.round(length)}px)`;
      case 'freehand':
        return `Freehand (${annotation.path?.length || 0} points)`;
      default:
        return 'Annotation';
    }
  };

  const handleEdit = (annotation) => {
    if (annotation.type === 'text') {
      setEditingId(annotation.id);
      setEditValue(annotation.text || '');
    }
  };

  const handleSaveEdit = (id) => {
    if (editValue.trim()) {
      onUpdateAnnotation(id, { text: editValue });
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const toggleVisibility = (id) => {
    const annotation = annotations.find(ann => ann.id === id);
    // Ensure we have a proper opacity value, defaulting to 1 if undefined
    const currentOpacity = annotation.opacity !== undefined ? annotation.opacity : 1;
    const newOpacity = currentOpacity === 0 ? 1 : 0;
    
    console.log(`Toggling visibility for annotation ${id}: ${currentOpacity} -> ${newOpacity}`);
    
    onUpdateAnnotation(id, { 
      opacity: newOpacity,
      visible: newOpacity > 0 // Also set a visible flag for extra clarity
    });
  };

  // Helper function to check if annotation is visible
  const isAnnotationVisible = (annotation) => {
    // Check both opacity and visible flag
    const opacity = annotation.opacity !== undefined ? annotation.opacity : 1;
    const visible = annotation.visible !== undefined ? annotation.visible : true;
    return opacity > 0 && visible;
  };

  return (
    <div className={`p-4 rounded-lg border ${
      theme === 'dark'
        ? 'border-gray-600 bg-gray-800'
        : 'border-gray-300 bg-white'
    }`}>
      <h3 className="text-lg font-semibold mb-4">
        Annotations ({annotations.length})
      </h3>
      
      {annotations.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Edit3 className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No annotations yet</p>
          <p className="text-sm">Use the tools to add annotations</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {annotations.map((annotation) => {
            const Icon = getToolIcon(annotation.type);
            const isSelected = selectedAnnotation?.id === annotation.id;
            const isEditing = editingId === annotation.id;
            const isVisible = isAnnotationVisible(annotation);
            
            return (
              <div
                key={annotation.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : theme === 'dark'
                    ? 'border-gray-700 bg-gray-700 hover:bg-gray-600'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                } ${!isVisible ? 'opacity-50' : ''}`}
                onClick={() => onSelectAnnotation(annotation)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <Icon size={16} className="text-gray-500 dark:text-gray-400" />
                    <div
                      className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: annotation.color }}
                    />
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(annotation.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          onBlur={() => handleSaveEdit(annotation.id)}
                          className={`w-full px-2 py-1 text-sm rounded border ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-sm font-medium truncate">
                          {getAnnotationLabel(annotation)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(annotation.id);
                      }}
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                        !isVisible ? 'text-red-500 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                      }`}
                      title={!isVisible ? 'Show annotation' : 'Hide annotation'}
                    >
                      {!isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    
                    {annotation.type === 'text' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(annotation);
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400"
                        title="Edit text"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAnnotation(annotation.id);
                      }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                {/* Annotation Details */}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>Opacity: {Math.round((annotation.opacity !== undefined ? annotation.opacity : 1) * 100)}%</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      isVisible 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {isVisible ? 'Visible' : 'Hidden'}
                    </span>
                    {annotation.fontSize && (
                      <span>Size: {annotation.fontSize}px</span>
                    )}
                    {annotation.lineWidth && (
                      <span>Width: {annotation.lineWidth}px</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {selectedAnnotation && (
        <div className={`mt-4 p-3 rounded-lg border ${
          theme === 'dark'
            ? 'border-blue-700 bg-blue-900/20'
            : 'border-blue-200 bg-blue-50'
        }`}>
          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
            Selected Annotation
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
              <span className="text-sm font-medium capitalize">{selectedAnnotation.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Color:</span>
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: selectedAnnotation.color }}
                />
                <span className="text-sm font-medium">{selectedAnnotation.color}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Visibility:</span>
              <span className={`text-sm font-medium ${
                isAnnotationVisible(selectedAnnotation) 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {isAnnotationVisible(selectedAnnotation) ? 'Visible' : 'Hidden'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotationList;