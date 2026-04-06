import React, { useState } from 'react';
import { Globe, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Shield } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      // Send request to backend auth route
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important: Include cookies for session management
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage for future API calls
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify({
            name: data.name,
            email: data.email,
            role: data.role,
            _id: data._id
          }));
        }
        
        // Pass user data to App.js
        onLogin({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          token: data.token
        });
      } else {
        // Backend returned an error (e.g., Invalid credentials)
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-white flex items-center justify-center px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full">
        {/* Logo & Brand */}
     <div className="text-center mb-6 pt-1">
  
  {/* Logo (no background box) */}
  <div className="flex justify-center mb-2">
    <img 
      src="/logo.png" 
      alt="VisaFlow CRM"
      className="w-60 h-auto object-contain"
    />
  </div>



  {/* Subtitle */}
  <p className="text-gray-500 mt-1 text-sm">
    Sign in to manage your visa operations
  </p>

</div>

        {/* Login Card with Glassmorphism */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-2xl border border-white/50 p-8">
          <div className="inline-flex items-center gap-2 bg-red-50/80 backdrop-blur-sm px-3 py-1 rounded-full mb-6">
            <Sparkles className="w-3 h-3 text-red-500" />
            <span className="text-xs font-medium text-red-600">Admin / Agent / User</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                  placeholder="admin@visaflow.com"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition shadow-md hover:scale-[1.02] transform disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Secure login • 256-bit encryption • Live Database
        </p>
      </div>
    </div>
  );
};

export default Login;