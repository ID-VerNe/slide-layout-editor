import React from 'react';
import { Type, Image, Square, Star } from 'lucide-react';
import { FreeformItem } from '../../types/freeform.types';

interface FreeformToolbarProps {
  onAdd: (item: FreeformItem) => void;
}

export const FreeformToolbar: React.FC<FreeformToolbarProps> = ({ onAdd }) => {

  const handleAddText = () => {
    const newItem: FreeformItem = {
      id: crypto.randomUUID(),
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      content: { text: 'New Text' },
      typography: {
        fontSize: 24,
        fontFamily: 'Inter',
        color: '#000000',
        textAlign: 'left',
      },
    };
    onAdd(newItem);
  };

  const handleAddImage = () => {
    // In a real app, this would trigger an image picker
    const newItem: FreeformItem = {
      id: crypto.randomUUID(),
      type: 'image',
      x: 150,
      y: 150,
      width: 300,
      height: 200,
      content: { image: '' }, // Placeholder or trigger upload
      backgroundColor: '#f0f0f0',
    };
    onAdd(newItem);
  };

  const handleAddShape = () => {
    const newItem: FreeformItem = {
      id: crypto.randomUUID(),
      type: 'shape',
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      content: { shape: 'rectangle' },
      backgroundColor: '#3b82f6',
    };
    onAdd(newItem);
  };

  const handleAddIcon = () => {
    const newItem: FreeformItem = {
      id: crypto.randomUUID(),
      type: 'icon',
      x: 250,
      y: 250,
      width: 64,
      height: 64,
      content: { icon: '★' },
      typography: { color: '#ef4444' },
    };
    onAdd(newItem);
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-4 py-2 flex gap-4 z-50 border border-slate-200">
      <ToolbarButton icon={Type} label="Text" onClick={handleAddText} />
      <ToolbarButton icon={Image} label="Image" onClick={handleAddImage} />
      {/* <ToolbarButton icon={Square} label="Shape" onClick={handleAddShape} /> */}
      <ToolbarButton icon={Star} label="Icon" onClick={handleAddIcon} />
    </div>
  );
};

const ToolbarButton: React.FC<{ icon: any; label: string; onClick: () => void }> = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-slate-50"
    title={label}
  >
    <Icon size={20} />
    {/* <span className="text-[10px] font-medium uppercase">{label}</span> */}
  </button>
);