import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';

describe('SEOHead', () => {
  beforeEach(() => {
    // Clear head
    document.head.innerHTML = '';
    document.title = '';
  });

  const renderSEOHead = (props: any = {}) => {
    return render(
      <BrowserRouter>
        <SEOHead {...props} />
      </BrowserRouter>
    );
  };

  it('sets default page title', () => {
    renderSEOHead();
    expect(document.title).toBe('MusicApp - Stream and Share Your Music');
  });

  it('sets custom page title', () => {
    renderSEOHead({ title: 'Custom Page Title' });
    expect(document.title).toBe('Custom Page Title');
  });

  it('creates meta description tag', () => {
    renderSEOHead({ description: 'Custom description' });

    const meta = document.querySelector('meta[name="description"]');
    expect(meta).toBeTruthy();
    expect(meta?.getAttribute('content')).toBe('Custom description');
  });

  it('creates meta keywords tag', () => {
    renderSEOHead({ keywords: 'music, streaming, app' });

    const meta = document.querySelector('meta[name="keywords"]');
    expect(meta).toBeTruthy();
    expect(meta?.getAttribute('content')).toBe('music, streaming, app');
  });

  it('creates meta author tag', () => {
    renderSEOHead({ author: 'Custom Author' });

    const meta = document.querySelector('meta[name="author"]');
    expect(meta).toBeTruthy();
    expect(meta?.getAttribute('content')).toBe('Custom Author');
  });

  it('creates Open Graph title tag', () => {
    renderSEOHead({ title: 'OG Title' });

    const meta = document.querySelector('meta[property="og:title"]');
    expect(meta).toBeTruthy();
    expect(meta?.getAttribute('content')).toBe('OG Title');
  });

  it('creates Open Graph description tag', () => {
    renderSEOHead({ description: 'OG Description' });

    const meta = document.querySelector('meta[property="og:description"]');
    expect(meta).toBeTruthy();
    expect(meta?.getAttribute('content')).toBe('OG Description');
  });

  it('creates Open Graph type tag', () => {
    renderSEOHead({ type: 'article' });

    const meta = document.querySelector('meta[property="og:type"]');
    expect(meta).toBeTruthy();
    expect(meta?.getAttribute('content')).toBe('article');
  });

  it('creates Open Graph image tag', () => {
    renderSEOHead({ image: '/custom-image.jpg' });

    const meta = document.querySelector('meta[property="og:image"]');
    expect(meta).toBeTruthy();
    expect(meta?.getAttribute('content')).toBe('/custom-image.jpg');
  });

  it('creates Open Graph URL tag', () => {
    renderSEOHead();

    const meta = document.querySelector('meta[property="og:url"]');
    expect(meta).toBeTruthy();
    expect(meta?.getAttribute('content')).toContain('http');
  });

  it('creates Open Graph site name tag', () => {
    renderSEOHead();

    const meta = document.querySelector('meta[property="og:site_name"]');
    expect(meta).toBeTruthy();
    expect(meta?.getAttribute('content')).toBe('MusicApp');
  });

  it('creates Twitter Card tags', () => {
    renderSEOHead({
      title: 'Twitter Title',
      description: 'Twitter Description',
      image: '/twitter-image.jpg',
    });

    const cardMeta = document.querySelector('meta[name="twitter:card"]');
    expect(cardMeta).toBeTruthy();
    expect(cardMeta?.getAttribute('content')).toBe('summary_large_image');

    const titleMeta = document.querySelector('meta[name="twitter:title"]');
    expect(titleMeta).toBeTruthy();
    expect(titleMeta?.getAttribute('content')).toBe('Twitter Title');

    const descMeta = document.querySelector('meta[name="twitter:description"]');
    expect(descMeta).toBeTruthy();
    expect(descMeta?.getAttribute('content')).toBe('Twitter Description');

    const imageMeta = document.querySelector('meta[name="twitter:image"]');
    expect(imageMeta).toBeTruthy();
    expect(imageMeta?.getAttribute('content')).toBe('/twitter-image.jpg');
  });

  it('creates canonical link', () => {
    renderSEOHead();

    const link = document.querySelector('link[rel="canonical"]');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toContain('http');
  });

  it('updates existing meta tags', () => {
    // Create initial meta tag
    const initialMeta = document.createElement('meta');
    initialMeta.setAttribute('name', 'description');
    initialMeta.setAttribute('content', 'Initial description');
    document.head.appendChild(initialMeta);

    renderSEOHead({ description: 'Updated description' });

    const metas = document.querySelectorAll('meta[name="description"]');
    expect(metas.length).toBe(1);
    expect(metas[0].getAttribute('content')).toBe('Updated description');
  });

  it('renders without visible output', () => {
    const { container } = renderSEOHead();
    expect(container.innerHTML).toBe('');
  });

  it('uses default values when no props provided', () => {
    renderSEOHead();

    expect(document.title).toContain('MusicApp');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('music');
    expect(document.querySelector('meta[name="keywords"]')?.getAttribute('content')).toContain('streaming');
  });

  it('handles music.song type', () => {
    renderSEOHead({ type: 'music.song' });

    const meta = document.querySelector('meta[property="og:type"]');
    expect(meta?.getAttribute('content')).toBe('music.song');
  });

  it('handles profile type', () => {
    renderSEOHead({ type: 'profile' });

    const meta = document.querySelector('meta[property="og:type"]');
    expect(meta?.getAttribute('content')).toBe('profile');
  });

  it('updates meta tags when props change', () => {
    const { rerender } = render(
      <BrowserRouter>
        <SEOHead title="Initial Title" />
      </BrowserRouter>
    );

    expect(document.title).toBe('Initial Title');

    rerender(
      <BrowserRouter>
        <SEOHead title="Updated Title" />
      </BrowserRouter>
    );

    expect(document.title).toBe('Updated Title');
  });

  it('creates all required SEO tags', () => {
    renderSEOHead({
      title: 'Test Page',
      description: 'Test description',
      keywords: 'test, keywords',
      image: '/test-image.jpg',
      type: 'article',
      author: 'Test Author',
    });

    expect(document.querySelector('meta[name="description"]')).toBeTruthy();
    expect(document.querySelector('meta[name="keywords"]')).toBeTruthy();
    expect(document.querySelector('meta[name="author"]')).toBeTruthy();
    expect(document.querySelector('meta[property="og:title"]')).toBeTruthy();
    expect(document.querySelector('meta[property="og:description"]')).toBeTruthy();
    expect(document.querySelector('meta[property="og:type"]')).toBeTruthy();
    expect(document.querySelector('meta[property="og:url"]')).toBeTruthy();
    expect(document.querySelector('meta[property="og:image"]')).toBeTruthy();
    expect(document.querySelector('meta[name="twitter:card"]')).toBeTruthy();
    expect(document.querySelector('link[rel="canonical"]')).toBeTruthy();
  });

  it('handles empty strings gracefully', () => {
    renderSEOHead({
      title: '',
      description: '',
      keywords: '',
    });

    expect(document.title).toBe('');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('');
    expect(document.querySelector('meta[name="keywords"]')?.getAttribute('content')).toBe('');
  });
});
