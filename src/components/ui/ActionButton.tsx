import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  active?: boolean;
  danger?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon: Icon,
  title,
  active = false,
  danger = false,
  size = 'md',
  className = '',
}) => {
  const isSm = size === 'sm';

  return (
    <button
      onClick={onClick}
      aria-label={title}
      className={`flex items-center justify-center transition-all active:scale-90
        ${isSm ? 'w-10 h-10 rounded-xl' : 'w-full h-12 rounded-xl'}
        ${active
          ? 'bg-zine-accent text-white shadow-lg shadow-zine-accent/20'
          : danger
            ? 'text-zine-secondary hover:bg-red-500 hover:text-white'
            : 'text-zine-accent hover:bg-zine-surface'}
        ${className}`}
      title={title}
    >
      <Icon size={isSm ? 18 : 16} strokeWidth={active ? 3 : 2} />
    </button>
  );
};

export default ActionButton;
