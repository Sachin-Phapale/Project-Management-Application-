import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Axios setup with interceptors
import './setupAxios';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import ProjectDetails from './pages/ProjectDetails';
import TaskList from './pages/TaskList';
import Profile from './pages/Profile';

// Components
import NavBar from './components/NavBar';
import PrivateRoute from './components/PrivateRoute';

// Services
import AuthService from './services/auth.service';

function App() {
  const [currentUser, setCurrentUser] = useState(undefined);
  
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  return (
    <Router>
      <div className="app-container">
        <NavBar currentUser={currentUser} setCurrentUser={setCurrentUser} />
        <div className="container mt-3">
          <Routes>
            <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/projects" element={
              <PrivateRoute>
                <ProjectList />
              </PrivateRoute>
            } />
            <Route path="/projects/:id" element={
              <PrivateRoute>
                <ProjectDetails />
              </PrivateRoute>
            } />
            <Route path="/tasks" element={
              <PrivateRoute>
                <TaskList />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
