/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from "react";
import { Move, Edit3, Type, Square, Circle } from "lucide-react";

const AnnotationCanvas = ({
  media,
  annotations,
  selectedTool,
  toolSettings,
  onAddAnnotation,
  selectedAnnotation,
  onSelectAnnotation,
  theme,
}) => {
  const canvasRef = useRef(null);
  const mediaRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });
  const [textInputValue, setTextInputValue] = useState("");
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateCanvasSize = () => {
      if (mediaRef.current && canvasRef.current) {
        setCanvasSize({
          width: mediaRef.current.offsetWidth,
          height: mediaRef.current.offsetHeight,
        });
        canvasRef.current.width = mediaRef.current.offsetWidth;
        canvasRef.current.height = mediaRef.current.offsetHeight;
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [media]);

  useEffect(() => {
    redrawCanvas();
  }, [annotations, selectedAnnotation, canvasSize]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach((annotation) => {
      // Skip hidden annotations
      const opacity = annotation.opacity !== undefined ? annotation.opacity : 1;
      const isVisible = annotation.visible !== undefined ? annotation.visible : true;
      
      if (opacity === 0 || !isVisible) {
        return; // Skip rendering this annotation
      }

      ctx.globalAlpha = opacity;
      ctx.strokeStyle = annotation.color || "#000000";
      ctx.fillStyle = annotation.color || "#000000";
      ctx.lineWidth = annotation.lineWidth || 2;

      const isSelected = selectedAnnotation?.id === annotation.id;
      if (isSelected) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = (annotation.lineWidth || 2) + 1;
      }

      switch (annotation.type) {
        case "text":
          ctx.font = `${annotation.fontSize || 16}px Arial`;
          ctx.fillText(annotation.text, annotation.x, annotation.y);
          if (isSelected) {
            const metrics = ctx.measureText(annotation.text);
            ctx.strokeRect(
              annotation.x - 2,
              annotation.y - (annotation.fontSize || 16) - 2,
              metrics.width + 4,
              (annotation.fontSize || 16) + 4
            );
          }
          break;
        case "rectangle":
          ctx.strokeRect(
            annotation.x,
            annotation.y,
            annotation.width,
            annotation.height
          );
          break;
        case "circle":
          ctx.beginPath();
          ctx.arc(
            annotation.x,
            annotation.y,
            annotation.radius,
            0,
            2 * Math.PI
          );
          ctx.stroke();
          break;
        case "freehand":
          if (annotation.path && annotation.path.length > 1) {
            ctx.beginPath();
            ctx.moveTo(annotation.path[0].x, annotation.path[0].y);
            for (let i = 1; i < annotation.path.length; i++) {
              ctx.lineTo(annotation.path[i].x, annotation.path[i].y);
            }
            ctx.stroke();
          }
          break;
        case "line":
          ctx.beginPath();
          ctx.moveTo(annotation.startX, annotation.startY);
          ctx.lineTo(annotation.endX, annotation.endY);
          ctx.stroke();
          if (isSelected) {
            ctx.strokeStyle = "#7dd3fc";
            ctx.strokeRect(
              Math.min(annotation.startX, annotation.endX) - 2,
              Math.min(annotation.startY, annotation.endY) - 2,
              Math.abs(annotation.endX - annotation.startX) + 4,
              Math.abs(annotation.endY - annotation.startY) + 4
            );
          }
          break;
      }
    });
    ctx.globalAlpha = 1;
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    const coords = getCanvasCoordinates(e);

    if (selectedTool === "text") {
      setTextInputPos(coords);
      setShowTextInput(true);
      setTextInputValue("");
      return;
    }

    setIsDrawing(true);
    setStartPoint(coords);

    if (selectedTool === "freehand") {
      setCurrentPath([coords]);
    }
  };

  const handleMouseMove = (e) => {
  if (!isDrawing) return;

  const coords = getCanvasCoordinates(e);

  if (selectedTool === "freehand") {
    setCurrentPath((prev) => [...prev, coords]);

    // Draw the current path
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    redrawCanvas();

    ctx.globalAlpha = toolSettings.opacity || 1;
    ctx.strokeStyle = toolSettings.color || "#000000";
    ctx.lineWidth = toolSettings.lineWidth || 2;

    if (currentPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    }
  } else {
    // Preview shape
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    redrawCanvas();

    ctx.globalAlpha = toolSettings.opacity || 1;
    ctx.strokeStyle = toolSettings.color || "#000000";
    ctx.lineWidth = toolSettings.lineWidth || 2;

    if (selectedTool === "rectangle" && startPoint) {
      const width = coords.x - startPoint.x;
      const height = coords.y - startPoint.y;
      ctx.strokeRect(startPoint.x, startPoint.y, width, height);
    } else if (selectedTool === "circle" && startPoint) {
      const radius = Math.sqrt(
        Math.pow(coords.x - startPoint.x, 2) +
          Math.pow(coords.y - startPoint.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (selectedTool === "line" && startPoint) {
      // Add line preview
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  }
};

  const handleMouseUp = (e) => {
  if (!isDrawing) return;

  const coords = getCanvasCoordinates(e);

  if (selectedTool === "freehand") {
    onAddAnnotation({
      type: "freehand",
      path: currentPath,
    });
  } else if (selectedTool === "rectangle" && startPoint) {
    const width = coords.x - startPoint.x;
    const height = coords.y - startPoint.y;
    onAddAnnotation({
      type: "rectangle",
      x: startPoint.x,
      y: startPoint.y,
      width,
      height,
    });
  } else if (selectedTool === "circle" && startPoint) {
    const radius = Math.sqrt(
      Math.pow(coords.x - startPoint.x, 2) +
        Math.pow(coords.y - startPoint.y, 2)
    );
    onAddAnnotation({
      type: "circle",
      x: startPoint.x,
      y: startPoint.y,
      radius,
    });
  } else if (selectedTool === "line" && startPoint) {
    // Add line creation
    onAddAnnotation({
      type: "line",
      startX: startPoint.x,
      startY: startPoint.y,
      endX: coords.x,
      endY: coords.y,
    });
  }

  setIsDrawing(false);
  setCurrentPath([]);
  setStartPoint(null);
};

  const handleTextSubmit = () => {
    if (textInputValue.trim()) {
      onAddAnnotation({
        type: "text",
        text: textInputValue,
        x: textInputPos.x,
        y: textInputPos.y,
      });
    }
    setTextInputValue("");
  };

  const handleCanvasClick = (e) => {
  if (selectedTool === "select") {
    const coords = getCanvasCoordinates(e);
    let clickedAnnotation = null;

    // Check annotations in reverse order (top to bottom)
    // Only check visible annotations
    for (let i = annotations.length - 1; i >= 0; i--) {
      const ann = annotations[i];
      
      // Skip hidden annotations for selection
      const opacity = ann.opacity !== undefined ? ann.opacity : 1;
      const isVisible = ann.visible !== undefined ? ann.visible : true;
      
      if (opacity === 0 || !isVisible) {
        continue; // Skip hidden annotations
      }

      let isClicked = false;
      var canvas, ctx, metrics, distance, A, B, C, D, dot, lenSq, param, xx, yy, dx, dy;

      switch (ann.type) {
        case "text":
          canvas = canvasRef.current;
          ctx = canvas.getContext("2d");
          ctx.font = `${ann.fontSize || 16}px Arial`;
          metrics = ctx.measureText(ann.text);
          isClicked =
            coords.x >= ann.x &&
            coords.x <= ann.x + metrics.width &&
            coords.y >= ann.y - (ann.fontSize || 16) &&
            coords.y <= ann.y;
          break;
        case "rectangle":
          isClicked =
            coords.x >= ann.x &&
            coords.x <= ann.x + ann.width &&
            coords.y >= ann.y &&
            coords.y <= ann.y + ann.height;
          break;
        case "circle":
          distance = Math.sqrt(
            Math.pow(coords.x - ann.x, 2) + Math.pow(coords.y - ann.y, 2)
          );
          isClicked = distance <= ann.radius;
          break;
        case "line":
          // Calculate distance from point to line
          A = coords.x - ann.startX;
          B = coords.y - ann.startY;
          C = ann.endX - ann.startX;
          D = ann.endY - ann.startY;
          
          dot = A * C + B * D;
          lenSq = C * C + D * D;
          param = -1;
          
          if (lenSq !== 0) {
            param = dot / lenSq;
          }
          
          if (param < 0) {
            xx = ann.startX;
            yy = ann.startY;
          } else if (param > 1) {
            xx = ann.endX;
            yy = ann.endY;
          } else {
            xx = ann.startX + param * C;
            yy = ann.startY + param * D;
          }
          
          dx = coords.x - xx;
          dy = coords.y - yy;
          distance = Math.sqrt(dx * dx + dy * dy);
          
          isClicked = distance <= 5; // 5px tolerance
          break;
        case "freehand":
          // For freehand, check if click is near any point in the path
          if (ann.path && ann.path.length > 0) {
            for (let point of ann.path) {
              distance = Math.sqrt(
                Math.pow(coords.x - point.x, 2) + Math.pow(coords.y - point.y, 2)
              );
              if (distance <= 5) { // 5px tolerance
                isClicked = true;
                break;
              }
            }
          }
          break;
      }

      if (isClicked) {
        clickedAnnotation = ann;
        break;
      }
    }

    onSelectAnnotation(clickedAnnotation);
  }
};

  return (
    <div
      className={`relative border rounded-lg overflow-hidden ${
        theme === "dark"
          ? "border-gray-600 bg-gray-800"
          : "border-gray-300 bg-white"
      }`}
    >
      <div className="relative inline-block" style={{}}>
        {media.type === "image" ? (
          <img
            ref={mediaRef}
            src={media.url}
            alt="Annotation target"
            className="h-auto block"
            style={{ maxHeight: "800px", width: "1200px" }}
          />
        ) : (
          <video
            ref={mediaRef}
            src={media.url}
            controls
            className="h-auto block"
            style={{ maxHeight: "800px", width: "1200px" }}
          />
        )}

        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          style={{
            cursor: selectedTool === "select" ? "pointer" : "crosshair",
          }}
        />

        {showTextInput && (
          <div
            className="absolute z-10"
            style={{
              left: textInputPos.x,
              top: textInputPos.y - 30,
            }}
          >
            <input
              type="text"
              value={textInputValue}
              onChange={(e) => setTextInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTextSubmit();
                  setShowTextInput(false);
                }
                if (e.key === "Escape") setShowTextInput(false);
              }}
              onBlur={handleTextSubmit}
              className={`px-2 py-1 rounded border ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              autoFocus
              placeholder="Enter text..."
            />
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Tool:</span>
          <span className="font-medium capitalize">{selectedTool}</span>
          {selectedTool === "select" && (
            <span className="text-blue-600">
              Click on annotations to select them
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnotationCanvas;