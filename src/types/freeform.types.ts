
export type FreeformItemType = 'text' | 'image' | 'shape' | 'icon' | 'container';
export type ShapeType = 'rectangle' | 'circle' | 'line';

export interface FreeformItem {
  id: string;
  type: FreeformItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  rotation?: number;
  zIndex?: number;
  content?: {
    text?: string;
    image?: string;
    imageConfig?: { scale: number; x: number; y: number };
    icon?: string;
    shape?: ShapeType;
  };
  typography?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: 'normal' | 'italic';
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: number;
    letterSpacing?: number;
    textTransform?: 'none' | 'uppercase' | 'lowercase';
  };
}

export interface FreeformConfig {
  gridSize: number;
  snapToGrid: boolean;
  showAlignmentGuides: boolean;
  showGridOverlay: boolean;
}

export interface FreeformState {
  items: FreeformItem[];
  selectedItemId: string | null;
  config: FreeformConfig;
}
