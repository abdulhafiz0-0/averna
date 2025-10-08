import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fadeInUp">
        <div className="animate-fadeInDown">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 animate-pulse">
            <LogIn className="h-6 w-6 text-primary-600 animate-bounce" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 animate-fadeInUp">
            Center Management
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 animate-fadeInUp animation-delay-200">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6 animate-fadeInUp animation-delay-300" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="animate-slideInLeft animation-delay-400">
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-300 hover:shadow-md focus:shadow-lg"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative animate-slideInRight animation-delay-500">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-300 hover:shadow-md focus:shadow-lg"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-200 hover:scale-110"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 transition-all duration-200" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 transition-all duration-200" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 animate-shake">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="animate-fadeInUp animation-delay-600">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <span className="group-hover:animate-pulse">Sign in</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
