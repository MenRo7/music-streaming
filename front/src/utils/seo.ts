/**
 * SEO Utilities
 * Helper functions for managing SEO meta tags and structured data
 */

export interface MetaTagsConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const DEFAULT_CONFIG: MetaTagsConfig = {
  title: 'MusicApp - Stream and Share Your Music',
  description: 'Discover, stream, and share music with MusicApp. Create playlists, follow artists, and enjoy unlimited music streaming.',
  keywords: 'music streaming, music app, playlists, artists, albums',
  image: '/og-image.jpg',
  type: 'website',
  author: 'MusicApp Team',
};

/**
 * Update document meta tags for SEO
 */
export const updateMetaTags = (config: MetaTagsConfig = {}) => {
  const meta = { ...DEFAULT_CONFIG, ...config };

  // Update title
  if (meta.title) {
    document.title = meta.title;
  }

  // Update or create meta tags
  updateMetaTag('name', 'description', meta.description);
  updateMetaTag('name', 'keywords', meta.keywords);
  updateMetaTag('name', 'author', meta.author);

  // Open Graph tags
  updateMetaTag('property', 'og:title', meta.title);
  updateMetaTag('property', 'og:description', meta.description);
  updateMetaTag('property', 'og:type', meta.type);
  updateMetaTag('property', 'og:url', meta.url || window.location.href);
  updateMetaTag('property', 'og:image', meta.image);

  // Twitter Card tags
  updateMetaTag('name', 'twitter:card', 'summary_large_image');
  updateMetaTag('name', 'twitter:title', meta.title);
  updateMetaTag('name', 'twitter:description', meta.description);
  updateMetaTag('name', 'twitter:image', meta.image);

  // Article tags
  if (meta.publishedTime) {
    updateMetaTag('property', 'article:published_time', meta.publishedTime);
  }
  if (meta.modifiedTime) {
    updateMetaTag('property', 'article:modified_time', meta.modifiedTime);
  }
};

/**
 * Helper to update or create a meta tag
 */
const updateMetaTag = (attribute: string, key: string, value?: string) => {
  if (!value) return;

  let element = document.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', value);
};

/**
 * Generate JSON-LD structured data
 */
export const generateStructuredData = (type: string, data: any): string => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return JSON.stringify(structuredData);
};

/**
 * Add structured data to the page
 */
export const addStructuredData = (type: string, data: any) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = generateStructuredData(type, data);

  // Remove existing structured data of the same type
  const existing = document.querySelector(`script[type="application/ld+json"]`);
  if (existing) {
    existing.remove();
  }

  document.head.appendChild(script);
};

/**
 * Create structured data for a music track
 */
export const createMusicTrackStructuredData = (track: {
  name: string;
  artist: string;
  album?: string;
  duration?: number;
  url: string;
  image?: string;
}) => {
  return {
    name: track.name,
    byArtist: {
      '@type': 'MusicGroup',
      name: track.artist,
    },
    inAlbum: track.album ? {
      '@type': 'MusicAlbum',
      name: track.album,
    } : undefined,
    duration: track.duration ? `PT${track.duration}S` : undefined,
    url: track.url,
    image: track.image,
  };
};

/**
 * Create structured data for a person/artist
 */
export const createPersonStructuredData = (person: {
  name: string;
  description?: string;
  image?: string;
  url: string;
}) => {
  return {
    name: person.name,
    description: person.description,
    image: person.image,
    url: person.url,
  };
};

/**
 * Create breadcrumb structured data
 */
export const createBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Hook to use in React components
 */
export const useSEO = (config: MetaTagsConfig) => {
  React.useEffect(() => {
    updateMetaTags(config);

    // Cleanup: restore default tags on unmount
    return () => {
      updateMetaTags(DEFAULT_CONFIG);
    };
  }, [config]);
};

// Fix missing React import
import React from 'react';
