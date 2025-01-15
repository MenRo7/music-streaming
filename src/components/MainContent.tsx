import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PlaylistPage from '../pages/PlaylistPage';
import '../styles/MainContent.css';

const MainContent: React.FC = () => {
    return (
        <div className='main-content'>
            <Routes>
                <Route path="/playlist/:id" element={<PlaylistPage />} />
            </Routes>
        </div>
    );
};

export default MainContent;
