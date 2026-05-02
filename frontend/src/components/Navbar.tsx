import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, CheckSquare } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <CheckSquare className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 font-bold text-xl text-gray-900">TaskFlow</span>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
                </Link>
                <Link to="/projects" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <FolderKanban className="h-4 w-4 mr-1" /> Projects
                </Link>
              </div>
            )}
          </div>
          {user && (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-sm text-gray-500 mr-4">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
