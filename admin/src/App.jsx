// App.jsx
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Verify token with backend
          const response = await fetch('http://localhost:5000/api/users/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include' // Include cookies
          });
          
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser({
              ...userData,
              token: token
            });
            setIsLoggedIn(true);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    // Store token and user data in localStorage
    if (userData.token) {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      }));
    }
    setCurrentUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      // Call backend to clear the HTTP-only cookie
      const response = await fetch('http://localhost:5000/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // Important: Include credentials
      });
      
      if (response.ok) {
        console.log('Logged out successfully');
      }
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Reset state
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If logged in, show Dashboard
  if (isLoggedIn) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
  }

  // If not logged in, show Login page
  return <Login onLogin={handleLogin} />;
};

export default App;