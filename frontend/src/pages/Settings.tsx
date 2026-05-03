import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Check, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import api from '../api/axios';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      setSuccessMessage('');
      setErrorMessage('');
      
      const res = await api.put('/users/profile', {
        name,
        email,
        password: password || undefined
      });
      
      updateUser(res.data);
      setSuccessMessage('Profile updated successfully!');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUpdating(true);
      // In a real app, you'd upload this to a server/S3
      // Here we'll simulate it by creating a local URL or mock update
      const mockUrl = URL.createObjectURL(file);
      const res = await api.put('/users/profile', { avatarUrl: mockUrl });
      updateUser(res.data);
      setSuccessMessage('Avatar updated!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to upload avatar');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-[32px] shadow-sm overflow-hidden border border-gray-100">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900">Profile Settings</h2>
        </div>

        <div className="p-8 space-y-12">
          {/* Status Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-100 text-green-700 px-6 py-4 rounded-2xl flex items-center animate-in fade-in slide-in-from-top-4 duration-300">
              <Check className="w-5 h-5 mr-3" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl flex items-center animate-in fade-in slide-in-from-top-4 duration-300">
              <Plus className="w-5 h-5 mr-3 rotate-45" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Profile Photo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <h3 className="font-bold text-gray-900 text-lg">Profile photo</h3>
              <p className="text-sm text-gray-400 mt-1">This will be displayed on your profile and tasks.</p>
            </div>
            <div className="md:col-span-3 flex items-center space-x-8">
              <div className="w-32 h-32 rounded-[32px] overflow-hidden shadow-lg border-4 border-white">
                <img 
                  src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover bg-[#FDF9DE]"
                />
              </div>
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all active:scale-95 mb-3"
                >
                  <Plus className="w-4 h-4 mr-2" /> Upload photo
                </button>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Recommended: Square JPG or PNG, max 500kb.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-10 border-t border-gray-100">
            <div className="md:col-span-1">
              <h3 className="font-bold text-gray-900 text-lg">Basic Details</h3>
            </div>
            <div className="md:col-span-3 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <UserIcon className="w-4 h-4 mr-2 text-gray-400" /> Full name
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full max-w-md bg-[#F5F6F8] border-none rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2E266] transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" /> Email address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full max-w-md bg-[#F5F6F8] border-none rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2E266] transition-all"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-10 border-t border-gray-100">
            <div className="md:col-span-1">
              <h3 className="font-bold text-gray-900 text-lg">Password</h3>
              <p className="text-sm text-gray-400 mt-1">Leave blank to keep current password.</p>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-gray-400" /> New Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full max-w-md bg-[#F5F6F8] border-none rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2E266] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-end space-x-4">
          <button 
            onClick={() => {
              setName(user?.name || '');
              setEmail(user?.email || '');
              setPassword('');
              setSuccessMessage('');
              setErrorMessage('');
            }}
            className="px-8 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isUpdating}
            className="px-10 py-3 bg-[#F2E266] rounded-2xl text-sm font-bold text-gray-900 hover:bg-[#E3D251] shadow-lg shadow-yellow-100 transition-all active:scale-95 flex items-center disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
