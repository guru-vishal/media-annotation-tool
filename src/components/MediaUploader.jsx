import React, { useRef, useState } from 'react';
import { Upload, FileImage, FileVideo, X } from 'lucide-react';

const MediaUploader = ({ onMediaUpload, theme }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image (JPEG, PNG, GIF) or video (MP4, WebM) file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const mediaData = {
        file,
        url: e.target.result,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        name: file.name
      };
      setPreview(mediaData);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleUpload = () => {
    if (preview) {
      onMediaUpload(preview);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Upload Media</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload an image or video to start annotating
        </p>
      </div>

      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : theme === 'dark'
              ? 'border-gray-600 bg-gray-800 hover:border-gray-500'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Drop your media here</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or click to browse files
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleInputChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Browse Files
          </button>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Supported formats: JPEG, PNG, GIF, MP4, WebM
          </div>
        </div>
      ) : (
        <div className={`border rounded-lg p-6 ${
          theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {preview.type === 'image' ? (
                <FileImage className="h-5 w-5 text-blue-600" />
              ) : (
                <FileVideo className="h-5 w-5 text-blue-600" />
              )}
              <span className="font-medium">{preview.name}</span>
            </div>
            <button
              onClick={clearPreview}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="mb-4">
            {preview.type === 'image' ? (
              <img
                src={preview.url}
                alt="Preview"
                className="max-w-full h-auto max-h-64 mx-auto rounded"
              />
            ) : (
              <video
                src={preview.url}
                controls
                className="max-w-full h-auto max-h-64 mx-auto rounded"
              />
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleUpload}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Start Annotating
            </button>
            <button
              onClick={clearPreview}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Choose Different File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;