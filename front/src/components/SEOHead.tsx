import React from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'music.song' | 'music.album' | 'music.playlist' | 'profile';
  author?: string;
  structuredData?: Record<string, any>;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'MusicApp - Stream and Share Your Music',
  description = 'Discover, stream, and share music with MusicApp. Create playlists, follow artists, and enjoy unlimited music streaming.',
  keywords = 'music streaming, music app, playlists, artists, albums',
  image = '/og-image.jpg',
  type = 'website',
  author = 'MusicApp Team',
  structuredData,
}) => {
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}`;

  React.useEffect(() => {
    document.title = title;

    const updateOrCreateMeta = (selector: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const attribute = selector.includes('property=') ? 'property' : 'name';
        const value = selector.match(/"([^"]+)"/)?.[1];
        if (value) {
          element.setAttribute(attribute, value);
          document.head.appendChild(element);
        }
      }
      element?.setAttribute('content', content);
    };

    updateOrCreateMeta('meta[name="description"]', description);
    updateOrCreateMeta('meta[name="keywords"]', keywords);
    updateOrCreateMeta('meta[name="author"]', author);
    updateOrCreateMeta('meta[property="og:title"]', title);
    updateOrCreateMeta('meta[property="og:description"]', description);
    updateOrCreateMeta('meta[property="og:type"]', type);
    updateOrCreateMeta('meta[property="og:url"]', currentUrl);
    updateOrCreateMeta('meta[property="og:image"]', image);
    updateOrCreateMeta('meta[property="og:site_name"]', 'MusicApp');
    updateOrCreateMeta('meta[name="twitter:card"]', 'summary_large_image');
    updateOrCreateMeta('meta[name="twitter:title"]', title);
    updateOrCreateMeta('meta[name="twitter:description"]', description);
    updateOrCreateMeta('meta[name="twitter:image"]', image);
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;

    // Structured Data (JSON-LD)
    if (structuredData) {
      let scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      const jsonLd = {
        '@context': 'https://schema.org',
        ...structuredData,
      };
      scriptTag.textContent = JSON.stringify(jsonLd);
    }
  }, [title, description, keywords, image, type, author, currentUrl, structuredData]);

  return null;
};

export default SEOHead;
