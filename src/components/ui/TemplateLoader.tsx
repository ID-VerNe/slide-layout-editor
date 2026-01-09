import React from 'react';
import { motion } from 'framer-motion';

interface TemplateLoaderProps {
  size?: 'small' | 'medium' | 'large';
}

const TemplateLoader: React.FC<TemplateLoaderProps> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div className="flex items-center justify-center w-full h-full" role="status">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-slate-200 border-t-blue-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default TemplateLoader;
