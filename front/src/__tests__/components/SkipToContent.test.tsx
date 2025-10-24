import React from 'react';
import { render, screen } from '@testing-library/react';
import SkipToContent from '../../components/SkipToContent';

describe('SkipToContent', () => {
  it('should render skip to content link', () => {
    render(<SkipToContent />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
  });

  it('should have correct href attribute', () => {
    render(<SkipToContent />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('should have skip-to-content class', () => {
    render(<SkipToContent />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('skip-to-content');
  });

  it('should render with translated text', () => {
    render(<SkipToContent />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('skipToContent.label');
  });
});
