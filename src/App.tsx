import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import SongList from './components/SongList';
import SongDetail from './components/SongDetails';
import SongPlayer from './components/SongPlayer';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<SongList />} />
          <Route path="/songs/:id" element={<SongDetail />} />
          <Route path="/player" element={<SongPlayer audioUrl={''} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
