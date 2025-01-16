import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SongPlayer from '../components/SongPlayer';
import LoginPage from './LoginPage';
import PlaylistPage from '../pages/PlaylistPage';
import ProfilePage from '../pages/ProfilePage';
import '../styles/MainPage.css';

const MainPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (email: string, password: string) => {
    if (email === 'user@example.com' && password === 'password') {
      setIsLogin(true);
      navigate('/profile');
    } else {
      alert('Email ou mot de passe incorrect');
    }
  };

  return (
    <Routes>
      {!isLogin ? (
        <>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          <Route
            path="/*"
            element={
              <div className="app">
                <Navbar />
                <Sidebar />
                <div className="main-content">
                  <Routes>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/playlist/:id" element={<PlaylistPage />} />
                  </Routes>
                </div>
                <SongPlayer audioUrl="" />
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/profile" />} />
        </>
      )}
    </Routes>
  );
};

export default MainPage;
