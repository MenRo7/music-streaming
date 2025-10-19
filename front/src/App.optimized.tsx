import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

// Import core components directly (needed immediately)
import {
  Navbar,
  Sidebar,
  MusicQueue,
  SongPlayer,
  CookieConsent,
  // Lazy-loaded pages
  PlaylistPage,
  ProfilePage,
  MainPage,
  AuthPage,
  AlbumPage,
  ImportPage,
  MyMusicPage,
  FavoritesPage,
  EditAlbumPage,
  ForgotPasswordPage,
  PreferencesPage,
  PrivacyPolicyPage,
  TermsOfServicePage,
} from './App.lazy';

import { AuthProvider } from './apis/AuthContext';
import { PlaylistProvider } from './apis/PlaylistContext';
import { UserProvider } from './apis/UserContext';
import { PlayerProvider } from './apis/PlayerContext';

import './App.css';

// Loading component for Suspense fallback
const LoadingFallback: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem'
  }}>
    Loading...
  </div>
);

const PrivateRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const token = localStorage.getItem('authToken');
  return token ? element : <Navigate to="/auth" />;
};

const AppShell: React.FC = () => {
  const location = useLocation();
  const isAuthed = Boolean(localStorage.getItem('authToken'));
  const onAuthPage = location.pathname.startsWith('/auth');
  const onAuthFlow = location.pathname.startsWith('/auth') || location.pathname.startsWith('/forgot');

  return (
    <div className="app">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/" element={<PrivateRoute element={<Navigate to="/main" replace />} />} />

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
      </Suspense>

      {isAuthed && !onAuthPage && <SongPlayer />}
      {!onAuthFlow && <CookieConsent />}
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
