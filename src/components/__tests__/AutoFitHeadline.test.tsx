import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AutoFitHeadline from '../AutoFitHeadline';
import React from 'react';

describe('AutoFitHeadline (KnuthPlass engine)', () => {
  it('renders successfully without crashing', () => {
    render(
      <AutoFitHeadline 
        text="Hello World" 
        maxSize={100} 
        lineHeight={1.2} 
        fontFamily="Inter" 
        maxLines={1} 
      />
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
