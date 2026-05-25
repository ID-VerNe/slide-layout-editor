import React from 'react';
import { SlideImage } from '../SlideImage';
import { PageData } from '../../../../types';

interface ZineMediaProps {
  page: PageData;
  fieldKey?: string; // 新增
  src?: string;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
}

/**
 * ZineMedia - 媒体原子组件
 * 封装了 SlideImage，增加了对 Zine 模块化网格的样式适配。
 */
export const ZineMedia: React.FC<ZineMediaProps> = (props) => {
  return (
    <SlideImage 
      {...props} 
      fieldKey={props.fieldKey || 'image'} // 默认绑定 image 字段
      className={`zine-media w-full h-full ${props.className || ''}`}
      imgClassName={`zine-media-img ${props.imgClassName || ''}`}
      rounded="0" // Zine 默认采用工业硬边缘
    />
  );
};

export default ZineMedia;
