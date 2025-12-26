import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Channel from './pages/Channel';
import Watch from './pages/Watch';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import LikedVideos from './pages/LikedVideos';
import Subscriptions from './pages/Subscriptions';
import Search from './pages/Search';
import Playlist from './pages/Playlist';

// Placeholder for Settings (not implemented yet)
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-[50vh] text-gray-500">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p>Coming soon...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1c1c1e',
            color: '#fff',
            border: '1px solid #27272a',
          },
        }}
      />
      <Routes>
        {/* Auth Routes (No Layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main App Routes (With Layout) */}
        <Route path="/" element={
          <AppLayout>
            <Home />
          </AppLayout>
        } />
        
        <Route path="/channel/:username" element={
          <AppLayout>
            <Channel />
          </AppLayout>
        } />

        <Route path="/watch/:videoId" element={
          <AppLayout>
            <Watch />
          </AppLayout>
        } />

        <Route path="/dashboard" element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        } />

        <Route path="/search" element={
          <AppLayout>
            <Search />
          </AppLayout>
        } />

        <Route path="/history" element={
          <AppLayout>
            <History />
          </AppLayout>
        } />

        <Route path="/subscriptions" element={
          <AppLayout>
            <Subscriptions />
          </AppLayout>
        } />

        <Route path="/liked" element={
          <AppLayout>
            <LikedVideos />
          </AppLayout>
        } />

        <Route path="/playlists" element={
          <AppLayout>
            <Playlist />
          </AppLayout>
        } />

        <Route path="/settings" element={
          <AppLayout>
            <PlaceholderPage title="Settings" />
          </AppLayout>
        } />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
