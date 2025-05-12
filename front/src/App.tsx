import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SongPlayer from './components/SongPlayer';
import PlaylistPage from './pages/PlaylistPage';
import ProfilePage from './pages/ProfilePage';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';

import { AuthProvider } from './apis/AuthContext';
import { PlaylistProvider } from './apis/PlaylistContext';

import './App.css';

const PrivateRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const token = localStorage.getItem('authToken');
  return token ? element : <Navigate to="/auth" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PlaylistProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />

            <Route path="/" element={<PrivateRoute element={<Navigate to="/main" replace />} />} />

            <Route path="/playlist/:id" element={<PrivateRoute element={
              <>
                <Navbar />
                <Sidebar />
                <PlaylistPage />
                <SongPlayer audioUrl="" />
              </>
            } />} />

            <Route path="/profile" element={<PrivateRoute element={
              <>
                <Navbar />
                <Sidebar />
                <ProfilePage />
                <SongPlayer audioUrl="" />
              </>
            } />} />

            <Route path="/main" element={<PrivateRoute element={
              <>
                <Navbar />
                <Sidebar />
                <MainPage />
                <SongPlayer audioUrl="" />
              </>
            } />} />
          </Routes>
        </div>
      </Router>
      </PlaylistProvider>
    </AuthProvider>
  );
};

export default App;
