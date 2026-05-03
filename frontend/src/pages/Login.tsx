import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden" style={{ background: 'linear-gradient(135deg, #fff 50%, #FCD34D 50%)' }}>

      {/* LEFT: Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 z-10 bg-white">
        {/* Logo */}
        <div className="w-full max-w-md">
          <div className="flex items-center space-x-3 mb-16">
            <img src="/logo.png" alt="Tasky" className="w-12 h-12 rounded-xl shadow-md" />
            <span className="text-3xl font-extrabold tracking-tighter text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Tasky
            </span>
          </div>

          <h1 className="text-5xl font-extrabold text-[#D4B541] mb-3" style={{ fontFamily: "'Baloo 2', cursive" }}>
            Welcome Back
          </h1>
          <p className="text-gray-400 text-sm mb-10">Please enter your details to sign in</p>

          <button className="w-full flex items-center justify-center space-x-3 py-3.5 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all mb-6 active:scale-[0.98]">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            <span className="text-sm font-bold text-gray-700">Log in with Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-gray-400 uppercase tracking-widest font-bold">Or login with username</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-300" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username"
                className="w-full pl-12 pr-4 py-4 bg-[#F5F6F8] border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#F2E266] transition-all outline-none text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-300" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 bg-[#F5F6F8] border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#F2E266] transition-all outline-none text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-gray-500 font-medium cursor-pointer">
                <input type="checkbox" className="mr-2 rounded border-gray-300 text-[#F2E266] focus:ring-[#F2E266]" />
                Keep me logged in
              </label>
              <a href="#" className="text-[#D4B541] font-bold hover:underline">Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#F2E266] text-gray-900 rounded-full font-bold text-lg hover:bg-[#E3D251] shadow-lg shadow-yellow-100 transition-all active:scale-[0.98] flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#D4B541] font-bold">Need Help?</p>
            <p className="text-sm text-gray-500 mt-1">
              You are not a member? <Link to="/signup" className="text-[#D4B541] font-bold hover:underline">Register</Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Hero Image */}
      <div className="flex-1 relative hidden md:block overflow-hidden">
        <img
          src="/login_hero.jpg"
          alt="Tasky mascot"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;
