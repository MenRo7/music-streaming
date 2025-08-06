import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SongPlayer from './components/SongPlayer';
import PlaylistPage from './pages/PlaylistPage';
import ProfilePage from './pages/ProfilePage';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';
// import AlbumPage from './pages/AlbumPage';
import ImportPage from './pages/ImportPage';
import MyMusicPage from './pages/MyMusicPage';

import { AuthProvider } from './apis/AuthContext';
import { PlaylistProvider } from './apis/PlaylistContext';
import { UserProvider } from './apis/UserContext';
import { PlayerProvider } from './apis/PlayerContext';

import './App.css';

const PrivateRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const token = localStorage.getItem('authToken');
  return token ? element : <Navigate to="/auth" />;
};

const App: React.FC = () => {
  return (
    <PlayerProvider>
      <AuthProvider>
        <PlaylistProvider>
          <UserProvider>
            <Router>
              <div className="app">
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />

                  <Route path="/" element={<PrivateRoute element={<Navigate to="/main" replace />} />} />

                  <Route path="/import" element={<PrivateRoute element={
                    <>
                      <Navbar />
                      <Sidebar />
                      <ImportPage />
                    </>
                  } />} />

                  <Route path="/playlist/:id" element={<PrivateRoute element={
                    <>
                      <Navbar />
                      <Sidebar />
                      <PlaylistPage />
                    </>
                  } />} />

{/*                   <Route path="/albums/:id" element={<PrivateRoute element={
                    <>
                      <Navbar />
                      <Sidebar />
                      <AlbumPage />
                    </>
                  } />} /> */}

                  <Route path="/profile" element={<PrivateRoute element={
                    <>
                      <Navbar />
                      <Sidebar />
                      <ProfilePage />
                    </>
                  } />} />

                  <Route path="/my-music" element={<PrivateRoute element={
                    <>
                      <Navbar />
                      <Sidebar />
                      <MyMusicPage />
                    </>
                  } />} />

                  <Route path="/main" element={<PrivateRoute element={
                    <>
                      <Navbar />
                      <Sidebar />
                      <MainPage />
                    </>
                  } />} />
                </Routes>
                <SongPlayer />
              </div>
            </Router>
          </UserProvider>
        </PlaylistProvider>
      </AuthProvider>
    </PlayerProvider>
  );
};

export default App;
