import React from 'react';
import { FreeformItem } from '../../../types/freeform.types';
import { useAssetUrl } from '../../../hooks/useAssetUrl';

export const ImageBlock: React.FC<{ item: FreeformItem }> = ({ item }) => {
  const { content } = item;
  const { url } = useAssetUrl(content?.image);
  
  const config = content?.imageConfig || { scale: 1, x: 0, y: 0 };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50">
      {url ? (
        <img
          src={url}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${config.scale}) translate(${config.x}px, ${config.y}px)`,
            transition: 'transform 0.2s ease-out',
          }}
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
          <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
        </div>
      )}
    </div>
  );
};