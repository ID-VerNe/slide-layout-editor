// 设计令牌：排版刻度与设计系统

export interface TypographyToken {
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
  fontWeight?: string | number;
  textTransform?: string;
  fontStyle?: string;
}

export interface DesignTokens {
  colors: Record<string, string>;
  spacing: {
    none: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    gutter: string;
  };
  typography: {
    scales: Record<string, string>;
    body: TypographyToken;
    caption: TypographyToken;
    display: TypographyToken;
  };
}

export interface DesignSystem {
  tokens: DesignTokens;
  presets: {
    layout: Record<string, { p?: string; px?: string; py?: string }>;
    effects: Record<string, React.CSSProperties>;
  };
}
