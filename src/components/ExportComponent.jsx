import React, { useRef, useState } from "react";
import { Download, Image, FileText, Loader2 } from "lucide-react";

const ExportComponent = ({ media, annotations, theme }) => {
  const canvasRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState("png");

  const drawAnnotationsOnCanvas = (canvas, mediaElement) => {
    const ctx = canvas.getContext("2d");

    // Set canvas size to match media
    canvas.width = mediaElement.naturalWidth || mediaElement.videoWidth;
    canvas.height = mediaElement.naturalHeight || mediaElement.videoHeight;

    // Draw the media first
    ctx.drawImage(mediaElement, 0, 0, canvas.width, canvas.height);

    // Scale annotations to match the actual media dimensions
    const scaleX = canvas.width / mediaElement.offsetWidth;
    const scaleY = canvas.height / mediaElement.offsetHeight;

    // Draw annotations
    annotations.forEach((annotation) => {
      if (annotation.opacity === 0) return; // Skip hidden annotations

      ctx.globalAlpha = annotation.opacity || 1;
      ctx.strokeStyle = annotation.color || "#000000";
      ctx.fillStyle = annotation.color || "#000000";
      ctx.lineWidth = (annotation.lineWidth || 2) * scaleX;

      var fontSize;

      switch (annotation.type) {
        case "text":
          fontSize = (annotation.fontSize || 16) * scaleX;
          ctx.font = `${fontSize}px Arial`;
          ctx.fillText(
            annotation.text,
            annotation.x * scaleX,
            annotation.y * scaleY
          );
          break;

        case "rectangle":
          ctx.strokeRect(
            annotation.x * scaleX,
            annotation.y * scaleY,
            annotation.width * scaleX,
            annotation.height * scaleY
          );
          break;

        case "circle":
          ctx.beginPath();
          ctx.arc(
            annotation.x * scaleX,
            annotation.y * scaleY,
            annotation.radius * scaleX,
            0,
            2 * Math.PI
          );
          ctx.stroke();
          break;

        case "line":
          // Add line drawing for export
          ctx.beginPath();
          ctx.moveTo(annotation.startX * scaleX, annotation.startY * scaleY);
          ctx.lineTo(annotation.endX * scaleX, annotation.endY * scaleY);
          ctx.stroke();
          break;

        case "freehand":
          if (annotation.path && annotation.path.length > 1) {
            ctx.beginPath();
            ctx.moveTo(
              annotation.path[0].x * scaleX,
              annotation.path[0].y * scaleY
            );
            for (let i = 1; i < annotation.path.length; i++) {
              ctx.lineTo(
                annotation.path[i].x * scaleX,
                annotation.path[i].y * scaleY
              );
            }
            ctx.stroke();
          }
          break;
      }
    });

    ctx.globalAlpha = 1;
  };

  const exportImage = async () => {
    if (!media || annotations.length === 0) {
      alert("No annotations to export");
      return;
    }

    setIsExporting(true);

    try {
      const mediaElement = document.querySelector("img, video");
      if (!mediaElement) {
        throw new Error("Media element not found");
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error("Canvas not found");
      }

      // Wait for media to load if it's an image
      if (media.type === "image" && !mediaElement.complete) {
        await new Promise((resolve) => {
          mediaElement.onload = resolve;
        });
      }

      drawAnnotationsOnCanvas(canvas, mediaElement);

      // Convert canvas to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, `image/${exportFormat}`, 0.9);
      });

      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `annotated-${media.name.split(".")[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportAnnotationData = () => {
    const annotationData = {
      media: {
        name: media.name,
        type: media.type,
      },
      annotations: annotations.map((ann) => ({
        id: ann.id,
        type: ann.type,
        ...ann,
      })),
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(annotationData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${media.name.split(".")[0]}-annotations.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`p-4 rounded-lg border ${
        theme === "dark"
          ? "border-gray-600 bg-gray-800"
          : "border-gray-300 bg-white"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">Export</h3>

      {annotations.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <Download className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No annotations to export</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className={`w-full px-3 py-2 rounded border ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="png">PNG (Recommended)</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </div>

          {/* Export Buttons */}
          <div className="space-y-2">
            <button
              onClick={exportImage}
              disabled={isExporting}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                isExporting
                  ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isExporting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Image size={18} />
              )}
              <span>
                {isExporting
                  ? "Exporting..."
                  : `Export as ${exportFormat.toUpperCase()}`}
              </span>
            </button>

            <button
              onClick={exportAnnotationData}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              <FileText size={18} />
              <span>Export Annotation Data</span>
            </button>
          </div>

          {/* Export Info */}
          <div
            className={`p-3 rounded-lg text-sm ${
              theme === "dark"
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <p className="font-medium mb-1">Export Details:</p>
            <ul className="text-xs space-y-1">
              <li>• {annotations.length} annotation(s) will be exported</li>
              <li>• Hidden annotations will be excluded</li>
              <li>• Original media resolution will be preserved</li>
              <li>• Annotation data can be used for backup/restore</li>
            </ul>
          </div>
        </div>
      )}

      {/* Hidden canvas for export */}
      <canvas ref={canvasRef} className="hidden" style={{ display: "none" }} />
    </div>
  );
};

export default ExportComponent;
