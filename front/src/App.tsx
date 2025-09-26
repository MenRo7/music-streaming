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
import PlaylistPage from './pages/PlaylistPage';
import ProfilePage from './pages/ProfilePage';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';
import AlbumPage from './pages/AlbumPage';
import ImportPage from './pages/ImportPage';
import MyMusicPage from './pages/MyMusicPage';
import FavoritesPage from './pages/FavoritesPage';

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

  return (
    <div className="app">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

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
