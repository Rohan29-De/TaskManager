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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #F0EDE6 0%, #E8E5DD 100%)' }}>
      <div className="w-full max-w-6xl min-h-[700px] flex flex-col md:flex-row overflow-hidden bg-[#FAFAF7] rounded-[48px] shadow-2xl relative">

        {/* LEFT: Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 z-10 relative">
        
        {/* CSS Background Designs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#F2E266] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[#F5D4A1] rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        
        <div className="w-full max-w-md relative z-10">
          {/* New Stylish Text Logo */}
          <div className="flex items-center space-x-4 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F2E266] to-[#D4B541] flex items-center justify-center shadow-lg animate-[bounce_3s_infinite]">
               <span className="text-gray-900 text-3xl font-black animate-[spin_8s_linear_infinite]" style={{ fontFamily: "'Outfit', sans-serif" }}>T</span>
            </div>
            <span className="text-6xl font-extrabold text-[#E89E27] tracking-wide" style={{ fontFamily: "'Baloo 2', cursive" }}>
              Tasky<span className="text-[#F2E266]">.</span>
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
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#FAFAF7] px-4 text-gray-400 uppercase tracking-widest font-bold">Or login with username</span>
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
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm focus:border-[#D4B541] focus:ring-2 focus:ring-[#F2E266]/30 transition-all outline-none text-gray-900 placeholder-gray-400 shadow-sm"
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
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm focus:border-[#D4B541] focus:ring-2 focus:ring-[#F2E266]/30 transition-all outline-none text-gray-900 placeholder-gray-400 shadow-sm"
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
      <div className="flex-1 relative hidden md:block bg-white p-6 md:p-12 flex items-center justify-center">
        <img
          src="/login_hero.jpg"
          alt="Tasky mascot"
          className="max-w-full max-h-full rounded-[48px] shadow-xl"
        />
      </div>
    </div>
  </div>
  );
};

export default Login;
