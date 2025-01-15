import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PlaylistPage from '../pages/PlaylistPage';
import '../styles/MainContent.css';
import ProfilePage from '../pages/ProfilePage';

const MainContent: React.FC = () => {
    return (
        <div className='main-content'>
            <Routes>
                <Route path="/playlist/:id" element={<PlaylistPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </div>
    );
};

export default MainContent;
