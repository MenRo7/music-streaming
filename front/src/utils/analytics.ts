/**
 * Google Analytics 4 Integration
 * Track user behavior, conversions, and performance metrics
 */

import ReactGA from 'react-ga4';
import ENV from '../config/env';

// Configuration
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // À remplacer par votre ID GA4 réel
const DEBUG_MODE = process.env.NODE_ENV === 'development';

/**
 * Initialize Google Analytics
 * Call this once when the app loads
 */
export const initGA = (): void => {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.warn('⚠️ Google Analytics ID not configured. Set GA_MEASUREMENT_ID in analytics.ts');
    return;
  }

  ReactGA.initialize(GA_MEASUREMENT_ID, {
    gaOptions: {
      debug_mode: DEBUG_MODE,
    },
    gtagOptions: {
      send_page_view: false, // We'll handle this manually
    },
  });
};

/**
 * Track page views
 * Call this on route changes
 */
export const logPageView = (path?: string): void => {
  const page = path || window.location.pathname + window.location.search;

  ReactGA.send({
    hitType: 'pageview',
    page,
    title: document.title,
  });
};

/**
 * Track custom events
 */
export const logEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
): void => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

/**
 * Music Player Events
 */
export const Analytics = {
  // Music playback
  playTrack: (trackTitle: string, artistName: string, albumTitle?: string) => {
    logEvent('Music', 'Play', `${artistName} - ${trackTitle}`);

    // Enhanced measurement for music
    ReactGA.event('music_play', {
      track_title: trackTitle,
      artist_name: artistName,
      album_title: albumTitle,
    });
  },

  pauseTrack: (trackTitle: string, duration?: number) => {
    logEvent('Music', 'Pause', trackTitle, duration);
  },

  skipTrack: (trackTitle: string) => {
    logEvent('Music', 'Skip', trackTitle);
  },

  completeTrack: (trackTitle: string, duration: number) => {
    logEvent('Music', 'Complete', trackTitle, duration);

    ReactGA.event('music_complete', {
      track_title: trackTitle,
      duration_seconds: duration,
    });
  },

  addToQueue: (trackTitle: string, artistName: string) => {
    logEvent('Music', 'Add to Queue', `${artistName} - ${trackTitle}`);

    ReactGA.event('add_to_queue', {
      track_title: trackTitle,
      artist_name: artistName,
    });
  },

  // Playlist actions
  createPlaylist: (playlistTitle: string) => {
    logEvent('Playlist', 'Create', playlistTitle);

    ReactGA.event('create_playlist', {
      playlist_title: playlistTitle,
    });
  },

  addToPlaylist: (trackTitle: string, playlistTitle: string) => {
    logEvent('Playlist', 'Add Track', `${trackTitle} → ${playlistTitle}`);
  },

  // Social interactions
  followUser: (username: string) => {
    logEvent('Social', 'Follow', username);

    ReactGA.event('follow_user', {
      username,
    });
  },

  unfollowUser: (username: string) => {
    logEvent('Social', 'Unfollow', username);
  },

  likeAlbum: (albumTitle: string) => {
    logEvent('Social', 'Like Album', albumTitle);
  },

  likePlaylist: (playlistTitle: string) => {
    logEvent('Social', 'Like Playlist', playlistTitle);
  },

  addFavorite: (trackTitle: string) => {
    logEvent('Social', 'Add Favorite', trackTitle);

    ReactGA.event('add_to_favorites', {
      track_title: trackTitle,
    });
  },

  // User actions
  register: (method: string = 'email') => {
    logEvent('User', 'Register', method);

    ReactGA.event('sign_up', {
      method,
    });
  },

  login: (method: string = 'email') => {
    logEvent('User', 'Login', method);

    ReactGA.event('login', {
      method,
    });
  },

  logout: () => {
    logEvent('User', 'Logout');
  },

  updateProfile: () => {
    logEvent('User', 'Update Profile');
  },

  // Upload actions
  uploadTrack: (trackTitle: string, format: string) => {
    logEvent('Upload', 'Track', trackTitle);

    ReactGA.event('upload_track', {
      track_title: trackTitle,
      file_format: format,
    });
  },

  uploadAlbum: (albumTitle: string, trackCount: number) => {
    logEvent('Upload', 'Album', albumTitle, trackCount);

    ReactGA.event('upload_album', {
      album_title: albumTitle,
      track_count: trackCount,
    });
  },

  // Search
  search: (query: string, resultCount: number) => {
    logEvent('Search', 'Query', query, resultCount);

    ReactGA.event('search', {
      search_term: query,
      result_count: resultCount,
    });
  },

  searchClick: (resultType: string, resultTitle: string, position: number) => {
    logEvent('Search', 'Click Result', `${resultType}: ${resultTitle}`, position);
  },

  // Donations (Conversions)
  initiateDonation: (amount: number, recipientUsername: string) => {
    logEvent('Donation', 'Initiate', recipientUsername, amount);

    ReactGA.event('begin_checkout', {
      currency: 'EUR',
      value: amount / 100, // Convert cents to euros
      items: [{
        item_name: `Donation to ${recipientUsername}`,
        item_category: 'Donation',
        price: amount / 100,
        quantity: 1,
      }],
    });
  },

  completeDonation: (amount: number, recipientUsername: string, transactionId?: string) => {
    logEvent('Donation', 'Complete', recipientUsername, amount);

    // Track as conversion
    ReactGA.event('purchase', {
      transaction_id: transactionId || `donation-${Date.now()}`,
      currency: 'EUR',
      value: amount / 100,
      items: [{
        item_name: `Donation to ${recipientUsername}`,
        item_category: 'Donation',
        price: amount / 100,
        quantity: 1,
      }],
    });
  },

  cancelDonation: (amount: number) => {
    logEvent('Donation', 'Cancel', 'User Cancelled', amount);
  },

  // Errors & Performance
  trackError: (errorMessage: string, errorContext?: string) => {
    logEvent('Error', errorMessage, errorContext);

    ReactGA.event('exception', {
      description: errorMessage,
      fatal: false,
    });
  },

  trackPerformance: (metricName: string, value: number) => {
    logEvent('Performance', metricName, undefined, value);
  },
};

/**
 * Set user properties for better segmentation
 */
export const setUserProperties = (userId: string, properties: Record<string, any>): void => {
  ReactGA.set({
    user_id: userId,
    ...properties,
  });
};

/**
 * Track timing events (useful for performance monitoring)
 */
export const trackTiming = (
  category: string,
  variable: string,
  value: number,
  label?: string
): void => {
  ReactGA.event({
    category: 'timing_complete',
    action: variable,
    label,
    value,
  });
};

export default Analytics;
