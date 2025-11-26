import { X, ZoomIn, ZoomOut, Download, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";

function ImagePreview({ imageUrl, onClose }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Close on ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Zoom in/out with mouse wheel
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        // Scroll up - zoom in
        setScale((prev) => Math.min(prev + 0.1, 3));
      } else {
        // Scroll down - zoom out
        setScale((prev) => Math.max(prev - 0.1, 0.5));
      }
    };

    const imageContainer = document.getElementById("image-preview-container");
    if (imageContainer) {
      imageContainer.addEventListener("wheel", handleWheel, { passive: false });
      return () => imageContainer.removeEventListener("wheel", handleWheel);
    }
  }, []);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Top Control Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 shadow-2xl">
        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={scale <= 0.5}
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>

        {/* Scale Indicator */}
        <span className="text-white/90 text-sm font-medium min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={scale >= 3}
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>

        <div className="w-px h-6 bg-white/20"></div>

        {/* Rotate */}
        <button
          onClick={handleRotate}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
          title="Rotate"
        >
          <RotateCw size={20} />
        </button>

        <div className="w-px h-6 bg-white/20"></div>

        {/* Download */}
        <button
          onClick={handleDownload}
          className="p-2 rounded-full bg-white/10 hover:bg-green-500/80 text-white transition-all duration-200 hover:scale-110"
          title="Download Image"
        >
          <Download size={20} />
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-all duration-200 hover:scale-105"
          title="Reset View"
        >
          Reset
        </button>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[10000] p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-500/80 text-white transition-all duration-300 hover:scale-110 hover:rotate-90 shadow-2xl border border-white/30"
        aria-label="Close preview"
      >
        <X size={28} strokeWidth={2.5} />
      </button>

      {/* Image container with enhanced shadow */}
      <div
        id="image-preview-container"
        className="relative max-w-[95vw] max-h-[95vh] overflow-hidden cursor-move"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 border-2 border-white/10 transition-transform duration-300"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
          }}
        />
      </div>

      {/* Instruction text with better styling */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
        <span className="flex items-center gap-2">
          <span>Scroll to zoom • Click anywhere or press</span>
          <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">
            ESC
          </kbd>
          <span>to close</span>
        </span>
      </div>
    </div>
  );
}

export default ImagePreview;
