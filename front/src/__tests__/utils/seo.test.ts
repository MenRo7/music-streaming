import {
  setPageTitle,
  setMetaDescription,
  setMetaKeywords,
  setCanonicalUrl,
  setOgTags,
  setTwitterCard,
  setStructuredData,
  removeStructuredData,
} from '../../utils/seo';

describe('SEO Utils', () => {
  beforeEach(() => {
    // Clear head
    document.head.innerHTML = '';
  });

  describe('setPageTitle', () => {
    it('sets the page title', () => {
      setPageTitle('Test Page');
      expect(document.title).toBe('Test Page');
    });

    it('sets title with suffix', () => {
      setPageTitle('Home', ' | MyApp');
      expect(document.title).toBe('Home | MyApp');
    });

    it('overwrites existing title', () => {
      document.title = 'Old Title';
      setPageTitle('New Title');
      expect(document.title).toBe('New Title');
    });
  });

  describe('setMetaDescription', () => {
    it('creates meta description tag', () => {
      setMetaDescription('Test description');

      const meta = document.querySelector('meta[name="description"]');
      expect(meta?.getAttribute('content')).toBe('Test description');
    });

    it('updates existing meta description', () => {
      const existing = document.createElement('meta');
      existing.setAttribute('name', 'description');
      existing.setAttribute('content', 'Old description');
      document.head.appendChild(existing);

      setMetaDescription('New description');

      const metas = document.querySelectorAll('meta[name="description"]');
      expect(metas.length).toBe(1);
      expect(metas[0].getAttribute('content')).toBe('New description');
    });
  });

  describe('setMetaKeywords', () => {
    it('creates meta keywords tag', () => {
      setMetaKeywords(['music', 'streaming', 'audio']);

      const meta = document.querySelector('meta[name="keywords"]');
      expect(meta?.getAttribute('content')).toBe('music, streaming, audio');
    });

    it('handles empty array', () => {
      setMetaKeywords([]);

      const meta = document.querySelector('meta[name="keywords"]');
      expect(meta?.getAttribute('content')).toBe('');
    });
  });

  describe('setCanonicalUrl', () => {
    it('creates canonical link tag', () => {
      setCanonicalUrl('https://example.com/page');

      const link = document.querySelector('link[rel="canonical"]');
      expect(link?.getAttribute('href')).toBe('https://example.com/page');
    });

    it('updates existing canonical link', () => {
      const existing = document.createElement('link');
      existing.setAttribute('rel', 'canonical');
      existing.setAttribute('href', 'https://example.com/old');
      document.head.appendChild(existing);

      setCanonicalUrl('https://example.com/new');

      const links = document.querySelectorAll('link[rel="canonical"]');
      expect(links.length).toBe(1);
      expect(links[0].getAttribute('href')).toBe('https://example.com/new');
    });
  });

  describe('setOgTags', () => {
    it('sets Open Graph tags', () => {
      setOgTags({
        title: 'OG Title',
        description: 'OG Description',
        image: 'https://example.com/image.jpg',
        url: 'https://example.com',
      });

      expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('OG Title');
      expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe('OG Description');
      expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://example.com/image.jpg');
      expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe('https://example.com');
    });

    it('sets og:type when provided', () => {
      setOgTags({
        title: 'OG Title',
        type: 'article',
      });

      expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('article');
    });

    it('defaults og:type to website', () => {
      setOgTags({
        title: 'OG Title',
      });

      expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('website');
    });
  });

  describe('setTwitterCard', () => {
    it('sets Twitter Card tags', () => {
      setTwitterCard({
        card: 'summary_large_image',
        title: 'Twitter Title',
        description: 'Twitter Description',
        image: 'https://example.com/twitter-image.jpg',
      });

      expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
      expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe('Twitter Title');
      expect(document.querySelector('meta[name="twitter:description"]')?.getAttribute('content')).toBe('Twitter Description');
      expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe('https://example.com/twitter-image.jpg');
    });

    it('sets twitter:site when provided', () => {
      setTwitterCard({
        card: 'summary',
        title: 'Twitter Title',
        site: '@myapp',
      });

      expect(document.querySelector('meta[name="twitter:site"]')?.getAttribute('content')).toBe('@myapp');
    });
  });

  describe('setStructuredData', () => {
    it('adds JSON-LD structured data script', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Test Page',
      };

      setStructuredData(data);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).toBeTruthy();
      expect(script?.textContent).toBe(JSON.stringify(data));
    });

    it('assigns id when provided', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Test Page',
      };

      setStructuredData(data, 'my-structured-data');

      const script = document.querySelector('script#my-structured-data');
      expect(script).toBeTruthy();
    });

    it('allows multiple structured data scripts', () => {
      const data1 = { '@type': 'WebPage', name: 'Page 1' };
      const data2 = { '@type': 'Article', name: 'Article 1' };

      setStructuredData(data1, 'page-data');
      setStructuredData(data2, 'article-data');

      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts.length).toBe(2);
    });
  });

  describe('removeStructuredData', () => {
    it('removes structured data by id', () => {
      const data = { '@type': 'WebPage', name: 'Test' };
      setStructuredData(data, 'test-data');

      expect(document.querySelector('script#test-data')).toBeTruthy();

      removeStructuredData('test-data');

      expect(document.querySelector('script#test-data')).toBeFalsy();
    });

    it('does nothing if id does not exist', () => {
      expect(() => removeStructuredData('non-existent')).not.toThrow();
    });
  });
});
