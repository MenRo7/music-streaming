/**
 * Lazy-loaded components for code splitting
 * This improves initial load time by splitting the bundle into smaller chunks
 */

import { lazy } from 'react';

// Core components (not lazy-loaded as they're needed immediately)
export { default as Navbar } from './components/Navbar';
export { default as Sidebar } from './components/Sidebar';
export { default as MusicQueue } from './components/MusicQueue';
export { default as SongPlayer } from './components/SongPlayer';
export { default as CookieConsent } from './components/CookieConsent';

// Pages - Lazy loaded for better initial performance
export const PlaylistPage = lazy(() => import('./pages/PlaylistPage'));
export const ProfilePage = lazy(() => import('./pages/ProfilePage'));
export const MainPage = lazy(() => import('./pages/MainPage'));
export const AuthPage = lazy(() => import('./pages/AuthPage'));
export const AlbumPage = lazy(() => import('./pages/AlbumPage'));
export const ImportPage = lazy(() => import('./pages/ImportPage'));
export const MyMusicPage = lazy(() => import('./pages/MyMusicPage'));
export const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
export const EditAlbumPage = lazy(() => import('./pages/EditAlbumPage'));
export const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
export const PreferencesPage = lazy(() => import('./pages/PreferencesPage'));
export const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
export const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
