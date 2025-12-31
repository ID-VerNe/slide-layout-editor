
import React, { useCallback } from 'react';
// Added Type to the lucide-react imports to fix "Cannot find name 'Type'" error
import { Upload, X, Type } from 'lucide-react';
import { CustomFont } from '../types';

interface FontManagerProps {
  fonts: CustomFont[];
  onFontsChange: (update: CustomFont[] | ((prev: CustomFont[]) => CustomFont[])) => void;
}

const FontManager: React.FC<FontManagerProps> = ({ fonts, onFontsChange }) => {
  const registerFont = useCallback(async (name: string, dataUrl: string) => {
    const family = `custom-${Date.now()}-${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    
    try {
      const font = new FontFace(family, `url(${dataUrl})`);
      const loadedFont = await font.load();
      document.fonts.add(loadedFont);
    } catch (e) {
      console.error("FontFace failed, using style fallback", e);
      const style = document.createElement('style');
      style.id = `style-${family}`;
      style.innerHTML = `
        @font-face {
          font-family: '${family}';
          src: url('${dataUrl}');
          font-weight: normal;
          font-style: normal;
        }
      `;
      document.head.appendChild(style);
    }
    return family;
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const family = await registerFont(file.name, dataUrl);
        onFontsChange(prev => [...prev, { name: file.name, family, dataUrl }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFont = (family: string) => {
    // Try to remove from document.fonts
    const fonts = Array.from(document.fonts.values());
    const font = fonts.find(f => f.family === family);
    if (font) document.fonts.delete(font);

    const styleEl = document.getElementById(`style-${family}`);
    if (styleEl) styleEl.remove();
    onFontsChange(prev => prev.filter(f => f.family !== family));
  };

  return (
    <div className="w-64 bg-white rounded-xl border border-neutral-200 shadow-2xl p-4 space-y-4 animate-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="font-bold text-sm text-neutral-700 uppercase tracking-wider">Custom Fonts</h3>
        <label className="cursor-pointer p-1.5 bg-[#264376]/10 text-#264376 rounded-lg hover:bg-blue-100 transition-colors">
          <Upload size={16} />
          <input type="file" multiple className="hidden" accept=".ttf,.otf,.woff,.woff2" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 no-scrollbar">
        {fonts.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-neutral-400 gap-2">
             {/* Fix: Type component now imported from lucide-react */}
             <Type size={24} className="opacity-20" />
             <p className="text-[10px] font-bold text-center uppercase tracking-widest">No custom fonts</p>
          </div>
        ) : (
          fonts.map(font => (
            <div key={font.family} className="flex items-center justify-between p-2 bg-neutral-50 rounded border border-neutral-100 hover:border-neutral-200 transition-colors">
              <span className="text-xs truncate font-medium flex-1 mr-2" style={{ fontFamily: font.family }}>
                {font.name}
              </span>
              <button onClick={() => removeFont(font.family)} className="text-neutral-400 hover:text-red-500 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="text-[9px] text-neutral-400 text-center bg-neutral-50 rounded p-1 italic border border-neutral-100">
        Fonts are included in .wdzmaga saves
      </div>
    </div>
  );
};

export default FontManager;
