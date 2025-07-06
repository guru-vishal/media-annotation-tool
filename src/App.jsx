import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MediaUploader from './components/MediaUploader';
import AnnotationCanvas from './components/AnnotationCanvas';
import Toolbar from './components/Toolbar';
import AnnotationList from './components/AnnotationList';
import ExportComponent from './components/ExportComponent';

function App() {
  const [theme, setTheme] = useState('light');
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [selectedTool, setSelectedTool] = useState('text');
  const [toolSettings, setToolSettings] = useState({
    color: '#000000',
    fontSize: 16,
    lineWidth: 2,
    opacity: 1
  });
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const handleMediaUpload = (media) => {
    setUploadedMedia(media);
    setAnnotations([]);
  };

  const handleAddAnnotation = (annotation) => {
    const newAnnotation = {
      id: Date.now(),
      ...annotation,
      ...toolSettings
    };
    setAnnotations([...annotations, newAnnotation]);
  };

  const handleUpdateAnnotation = (id, updates) => {
    setAnnotations(annotations.map(ann => 
      ann.id === id ? { ...ann, ...updates } : ann
    ));
  };

  const handleDeleteAnnotation = (id) => {
    setAnnotations(annotations.filter(ann => ann.id !== id));
    if (selectedAnnotation?.id === id) {
      setSelectedAnnotation(null);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-6">
        {!uploadedMedia ? (
          <div className="max-w-2xl mx-auto">
            <MediaUploader onMediaUpload={handleMediaUpload} theme={theme} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <AnnotationCanvas
                media={uploadedMedia}
                annotations={annotations}
                selectedTool={selectedTool}
                toolSettings={toolSettings}
                onAddAnnotation={handleAddAnnotation}
                onUpdateAnnotation={handleUpdateAnnotation}
                selectedAnnotation={selectedAnnotation}
                onSelectAnnotation={setSelectedAnnotation}
                theme={theme}
              />
            </div>
            
            <div className="lg:col-span-1 space-y-4">
              <Toolbar
                selectedTool={selectedTool}
                onToolChange={setSelectedTool}
                toolSettings={toolSettings}
                onSettingsChange={setToolSettings}
                theme={theme}
              />
              
              <AnnotationList
                annotations={annotations}
                onUpdateAnnotation={handleUpdateAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation}
                selectedAnnotation={selectedAnnotation}
                onSelectAnnotation={setSelectedAnnotation}
                theme={theme}
              />
              
              <ExportComponent
                media={uploadedMedia}
                annotations={annotations}
                theme={theme}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;