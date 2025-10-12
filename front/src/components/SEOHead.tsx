import React from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'music.song' | 'profile';
  author?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'MusicApp - Stream and Share Your Music',
  description = 'Discover, stream, and share music with MusicApp. Create playlists, follow artists, and enjoy unlimited music streaming.',
  keywords = 'music streaming, music app, playlists, artists, albums',
  image = '/og-image.jpg',
  type = 'website',
  author = 'MusicApp Team',
}) => {
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}`;

  React.useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
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

    // Basic meta tags
    updateOrCreateMeta('meta[name="description"]', description);
    updateOrCreateMeta('meta[name="keywords"]', keywords);
    updateOrCreateMeta('meta[name="author"]', author);

    // Open Graph tags
    updateOrCreateMeta('meta[property="og:title"]', title);
    updateOrCreateMeta('meta[property="og:description"]', description);
    updateOrCreateMeta('meta[property="og:type"]', type);
    updateOrCreateMeta('meta[property="og:url"]', currentUrl);
    updateOrCreateMeta('meta[property="og:image"]', image);
    updateOrCreateMeta('meta[property="og:site_name"]', 'MusicApp');

    // Twitter Card tags
    updateOrCreateMeta('meta[name="twitter:card"]', 'summary_large_image');
    updateOrCreateMeta('meta[name="twitter:title"]', title);
    updateOrCreateMeta('meta[name="twitter:description"]', description);
    updateOrCreateMeta('meta[name="twitter:image"]', image);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;
  }, [title, description, keywords, image, type, author, currentUrl]);

  return null; // This component doesn't render anything
};

export default SEOHead;
