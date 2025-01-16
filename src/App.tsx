import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SongPlayer from './components/SongPlayer';
import PlaylistPage from './pages/PlaylistPage';
import ProfilePage from './pages/ProfilePage';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';  // Importer AuthPage

import './App.css';

const App: React.FC = () => (
  <Router>
    <div className="app">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        
        <Route path="/playlist/:id" element={
          <>
            <Navbar />
            <Sidebar />
            <PlaylistPage />
            <SongPlayer audioUrl="" />
          </>
        } />

        <Route path="/profile" element={
          <>
            <Navbar />
            <Sidebar />
            <ProfilePage />
            <SongPlayer audioUrl="" />
          </>
        } />

        <Route path="/" element={
          <>
            <Navbar />
            <Sidebar />
            <MainPage />
            <SongPlayer audioUrl="" />
          </>
        } />
      </Routes>
    </div>
  </Router>
);

export default App;
