import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'John Deere');
  const [email, setEmail] = useState(user?.email || 'john.deere@email.com');

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-[24px] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900">Profile</h2>
        </div>

        <div className="p-8 space-y-12">
          {/* Profile Photo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <h3 className="font-bold text-gray-900 text-lg">Profile photo</h3>
            </div>
            <div className="md:col-span-3 flex items-center space-x-8">
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-sm">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover bg-gray-100"
                />
              </div>
              <div>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 mb-3">
                  <Plus className="w-4 h-4 mr-2" /> Upload photo
                </button>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Supported formats: jpg, gif or png.<br/>
                  Max file size: 500k.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-10 border-t border-gray-100">
            <div className="md:col-span-1">
              <h3 className="font-bold text-gray-900 text-lg">Contact</h3>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-500 mb-2">Full name*</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full max-w-md bg-[#F5F6F8] border-none rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2E266]"
                placeholder="Type your name here"
              />
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-10 border-t border-gray-100 items-center">
            <div className="md:col-span-1">
              <h3 className="font-bold text-gray-900 text-lg">Email address</h3>
            </div>
            <div className="md:col-span-3 flex items-center justify-between">
              <span className="text-gray-700 font-medium">{email}</span>
              <button className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
                Change email address
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-gray-100 flex justify-center space-x-4">
          <button className="px-8 py-3 border border-gray-300 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button className="px-8 py-3 bg-[#F2E266] rounded-full text-sm font-bold text-gray-900 hover:bg-[#E3D251] shadow-sm">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
