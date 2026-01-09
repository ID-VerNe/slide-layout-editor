import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

interface ImageEditPreviewProps {
  imageUrl: string;
  onDownload?: () => void;
}

export const ImageEditPreview: React.FC<ImageEditPreviewProps> = ({ imageUrl, onDownload }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  return (
    <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={16} className="text-white" />
        </button>
        <div className="px-3 py-2 bg-white/10 rounded-lg text-white text-xs font-bold min-w-[60px] text-center flex items-center justify-center">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoom(z => Math.min(3, z + 0.1))}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={16} className="text-white" />
        </button>
        <button
          onClick={() => setRotation(r => (r + 90) % 360)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          title="Rotate"
        >
          <RotateCw size={16} className="text-white" />
        </button>
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Download Original"
          >
            <Download size={16} className="text-white" />
          </button>
        )}
      </div>
      
      <div className="flex items-center justify-center min-h-[400px] p-8 overflow-auto">
        <div className="relative transition-transform duration-300 ease-out" style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`
        }}>
            <img
            src={imageUrl}
            alt="Preview"
            className="max-w-full max-h-[60vh] object-contain shadow-2xl"
            />
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Preview Mode</p>
      </div>
    </div>
  );
};
