import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MusicQueue from './components/MusicQueue';
import SongPlayer from './components/SongPlayer';
import CookieConsent from './components/CookieConsent';
import SkipToContent from './components/SkipToContent';
import PlaylistPage from './pages/PlaylistPage';
import ProfilePage from './pages/ProfilePage';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';
import AlbumPage from './pages/AlbumPage';
import ImportPage from './pages/ImportPage';
import MyMusicPage from './pages/MyMusicPage';
import FavoritesPage from './pages/FavoritesPage';
import EditAlbumPage from './pages/EditAlbumPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PreferencesPage from './pages/PreferencesPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import LandingPage from './pages/LandingPage';

import { AuthProvider } from './apis/AuthContext';
import { PlaylistProvider } from './apis/PlaylistContext';
import { UserProvider } from './apis/UserContext';
import { PlayerProvider } from './apis/PlayerContext';

import './App.css';

const PrivateRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const token = localStorage.getItem('authToken');
  return token ? element : <Navigate to="/auth" />;
};

const AppShell: React.FC = () => {
  const location = useLocation();
  const isAuthed = Boolean(localStorage.getItem('authToken'));
  const onAuthPage = location.pathname.startsWith('/auth');
  const onAuthFlow = location.pathname.startsWith('/auth') || location.pathname.startsWith('/forgot');
  const onLandingPage = location.pathname === '/';

  return (
    <div className="app">
      <SkipToContent />
      <Routes>
        <Route path="/" element={isAuthed ? <Navigate to="/main" replace /> : <LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />

        <Route
          path="/import"
          element={
            <PrivateRoute
              element={
                <>
                  <Navbar />
                  <Sidebar />
                  <MusicQueue />
                  <ImportPage />
                </>
              }
            />
          }
        />

        <Route
          path="/playlist/:id"
          element={
            <PrivateRoute
              element={
                <>
                  <Navbar />
                  <Sidebar />
                  <MusicQueue />
                  <PlaylistPage />
                </>
              }
            />
          }
        />

        <Route
          path="/album/:id"
          element={
            <PrivateRoute
              element={
                <>
                  <Navbar />
                  <Sidebar />
                  <MusicQueue />
                  <AlbumPage />
                </>
              }
            />
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute
              element={
                <>
                  <Navbar />
                  <Sidebar />
                  <MusicQueue />
                  <ProfilePage />
                </>
              }
            />
          }
        />

        <Route
          path="/my-music"
          element={
            <PrivateRoute
              element={
                <>
                  <Navbar />
                  <Sidebar />
                  <MusicQueue />
                  <MyMusicPage />
                </>
              }
            />
          }
        />

        <Route
          path="/favorites"
          element={
            <PrivateRoute
              element={
                <>
                  <Navbar />
                  <Sidebar />
                  <MusicQueue />
                  <FavoritesPage />
                </>
              }
            />
          }
        />
   
        <Route
          path="/album/:id/edit"
          element={
            <PrivateRoute
              element={
                <>
                  <Navbar />
                  <Sidebar />
                  <MusicQueue />
                  <EditAlbumPage />
                </>
              }
            />
          }
        />

        <Route
          path="/profile/:id"
          element={
            <PrivateRoute
              element={
                <>
                  <Navbar />
                  <Sidebar />
                  <MusicQueue />
                  <ProfilePage />
                  </>
              } 
            />
          }
        />

        <Route
          path="/preferences"
          element={
            <PrivateRoute
              element={
                <>
                  <Navbar />
                  <Sidebar />
                  <MusicQueue />
                  <PreferencesPage />
                </>
              }
            />
          }
        />

        <Route
          path="/main"
          element={
            <PrivateRoute
              element={
                <>
                  <Navbar />
                  <Sidebar />
                  <MusicQueue />
                  <MainPage />
                </>
              }
            />
          }
        />
      </Routes>

      {isAuthed && !onAuthPage && <SongPlayer />}
      {!onAuthFlow && !onLandingPage && <CookieConsent />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <PlayerProvider>
      <AuthProvider>
        <PlaylistProvider>
          <UserProvider>
            <Router>
              <AppShell />
            </Router>
          </UserProvider>
        </PlaylistProvider>
      </AuthProvider>
    </PlayerProvider>
  );
};

export default App;
