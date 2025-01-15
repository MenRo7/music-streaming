import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SongPlayer from './components/SongPlayer';
import MainContent from './components/MainContent';
import './App.css';

const App: React.FC = () => (
  <Router>
    <div className="app">
      <Navbar />
      <Sidebar />
      <MainContent />
      <SongPlayer audioUrl="" />
    </div>
  </Router>
);

export default App;
