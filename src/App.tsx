import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SongPlayer from './components/SongPlayer';
import PlaylistPage from './pages/PlaylistPage';
import ProfilePage from './pages/ProfilePage';
import MainPage from './pages/MainPage';

import './App.css';

const App: React.FC = () => (
  <Router>
    <div className="app">
      <Navbar />
      <Sidebar />
      <Routes>
        <Route path="/playlist/:id" element={<PlaylistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<MainPage />} />
      </Routes>
      <SongPlayer audioUrl="" />
    </div>
  </Router>
);

export default App;
