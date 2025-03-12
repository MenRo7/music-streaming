import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SongPlayer from './components/SongPlayer';
import PlaylistPage from './pages/PlaylistPage';
import ProfilePage from './pages/ProfilePage';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';
import { AuthContext, AuthProvider } from './apis/AuthContext';

import './App.css';

const PrivateRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const authContext = useContext(AuthContext);
  if (!authContext) return <p>Error: AuthContext is null</p>;
  const { user } = authContext;
  return user ? element : <Navigate to="/auth" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />

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
    </AuthProvider>
  );
};

export default App;
