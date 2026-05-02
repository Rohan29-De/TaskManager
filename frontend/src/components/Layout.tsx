import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Bell, 
  Settings, 
  LogOut, 
  Plus, 
  Mail,
  Search,
  X,
  Calendar,
  Clock,
  Flag,
  Tag,
  UserPlus
} from 'lucide-react';
import clsx from 'clsx';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNewTask, setShowNewTask] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      // In a real scenario we'd pick a project ID. We'll fetch the first project for this demo.
      const projRes = await api.get('/projects');
      if (projRes.data.length > 0) {
         await api.post('/tasks', {
           title: newTaskTitle,
           description: newTaskDesc,
           priority: 'Medium',
           projectId: projRes.data[0]._id
         });
      }
      setShowNewTask(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      window.location.reload(); // Quick refresh for demo
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My tasks', path: '/projects', icon: CheckCircle2 },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  return (
    <div className="flex h-screen bg-[#F5F6F8] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col justify-between py-6 shadow-sm z-10">
        <div>
          <div className="px-8 flex items-center mb-10">
            <div className="w-8 h-8 rounded-full bg-[#F2E266] flex items-center justify-center font-bold text-sm mr-3">
              AZ
            </div>
            <span className="text-xl font-bold tracking-tight">Organizo</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/projects' && location.pathname.startsWith('/projects'));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={clsx(
                    'flex items-center px-8 py-3 text-sm font-medium transition-colors border-l-4',
                    isActive 
                      ? 'border-[#F2E266] bg-[#F9FAFB] text-gray-900' 
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className={clsx("mr-3 h-5 w-5", isActive ? "text-gray-900" : "text-gray-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-1">
          <Link to="/settings" className={clsx("w-full flex items-center px-8 py-3 text-sm font-medium transition-colors border-l-4", location.pathname === '/settings' ? 'border-[#F2E266] bg-[#F9FAFB] text-gray-900' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900')}>
            <Settings className={clsx("mr-3 h-5 w-5", location.pathname === '/settings' ? "text-gray-900" : "text-gray-400")} />
            Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-8 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="subtle-input pl-10 w-full"
                onClick={() => setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              />

              {showSearchDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-[24px] shadow-xl z-50 border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4">Add filters</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Project', 'Deadline', 'Type', 'Assignee'].map((filter, i) => (
                        <button key={i} className="flex items-center px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50">
                          <span className="w-4 h-4 rounded-sm bg-gray-100 mr-2 flex items-center justify-center">
                            {filter === 'Project' ? '📋' : filter === 'Deadline' ? '⏱️' : filter === 'Type' ? '📊' : '👤'}
                          </span>
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Tasks</h4>
                    <div className="space-y-4">
                      {/* Hardcoded items for design matching, can be linked to dynamic search results later */}
                      <div className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-[#D4B541] mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">Report - 01/23</p>
                          <p className="text-xs text-gray-500">E-commerce stuff - Important</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-[#D4B541] mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">Report - 02/23</p>
                          <p className="text-xs text-gray-500">E-commerce stuff - Important</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Circle className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">Report Q4</p>
                          <p className="text-xs text-gray-500">Company reports - Monthly</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-gray-700 flex items-center justify-center">
                      <span className="mr-2">≡</span> Advanced search
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-6 ml-4">
            <button onClick={() => setShowNewTask(true)} className="pill-btn pill-btn-primary px-5 py-2 text-sm font-medium shadow-sm hover:shadow-md">
              <Plus className="h-4 w-4 mr-1" />
              New task
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <Mail className="h-6 w-6" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                alt="Profile" 
                className="w-full h-full object-cover bg-[#FAD9A1]"
              />
            </div>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 pt-0">
          {children}
        </div>
      </main>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl relative p-8">
            <button onClick={() => setShowNewTask(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>

            <form onSubmit={handleCreateTask}>
              <div className="flex items-center border-b border-gray-100 pb-4 mb-6">
                <div className="w-10 h-10 bg-[#F5F6F8] rounded-xl flex items-center justify-center mr-4">
                  <CheckCircle2 className="w-5 h-5 text-gray-500" />
                </div>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Name of task" 
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="flex-1 text-2xl font-bold border-none focus:outline-none placeholder-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <span className="w-32 flex items-center text-sm font-medium text-gray-500"><Calendar className="w-4 h-4 mr-2" /> Day</span>
                  <div className="flex space-x-2">
                    <button type="button" className="px-4 py-1.5 border border-gray-900 rounded-full text-sm font-medium text-gray-900">Today</button>
                    <button type="button" className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-300">Tomorrow</button>
                    <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-32 flex items-center text-sm font-medium text-gray-500"><Bell className="w-4 h-4 mr-2" /> Notification</span>
                  <div className="flex space-x-2">
                    <button type="button" className="px-4 py-1.5 border border-gray-900 rounded-full text-sm font-medium text-gray-900">In 1 hour</button>
                    <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-32 flex items-center text-sm font-medium text-gray-500"><Flag className="w-4 h-4 mr-2" /> Priority</span>
                  <button type="button" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"><Plus className="w-4 h-4 mr-1" /> Add priority</button>
                </div>

                <div className="flex items-center">
                  <span className="w-32 flex items-center text-sm font-medium text-gray-500"><Tag className="w-4 h-4 mr-2" /> Tags</span>
                  <button type="button" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"><Plus className="w-4 h-4 mr-1" /> Add tags</button>
                </div>

                <div className="flex items-center">
                  <span className="w-32 flex items-center text-sm font-medium text-gray-500"><UserPlus className="w-4 h-4 mr-2" /> Assign</span>
                  <button type="button" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"><Plus className="w-4 h-4 mr-1" /> Add assignee</button>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-3">Description</h4>
                <textarea 
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  className="w-full h-32 bg-[#F9FAFB] rounded-2xl p-4 border-none focus:outline-none focus:ring-2 focus:ring-[#F2E266] resize-none"
                  placeholder="Add some details..."
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="pill-btn pill-btn-primary px-6 py-3 font-bold shadow-sm">
                  Create task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
