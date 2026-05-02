import React, { useState, useEffect } from 'react';
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
  UserPlus,
  Circle
} from 'lucide-react';
import clsx from 'clsx';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNewTask, setShowNewTask] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [activeSearchFilter, setActiveSearchFilter] = useState<string | null>(null);
  
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newTaskNotification, setNewTaskNotification] = useState<string>('');
  const [newTaskTagsInput, setNewTaskTagsInput] = useState<string>('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('');
  
  const [users, setUsers] = useState<any[]>([]);

  const handleSearch = async (query: string, filter: string | null) => {
    if (!query && !filter) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get('/tasks');
      setSearchResults(res.data.filter((t: any) => {
        let matchesQuery = true;
        if (query) {
           matchesQuery = t.title.toLowerCase().includes(query.toLowerCase());
        }
        
        let matchesFilter = true;
        if (filter === 'Deadline') matchesFilter = !!t.dueDate;
        else if (filter === 'Assignee') matchesFilter = t.assignees && t.assignees.length > 0;
        else if (filter === 'Type') matchesFilter = t.priority === 'High'; // Just an example mapping 'Type' to 'High Priority'
        else if (filter === 'Project') matchesFilter = !!t.project;

        return matchesQuery && matchesFilter;
      }));
    } catch(err) { console.error(err); }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    const fetchProjectsAndUsers = async () => {
      try {
        const [projRes, usersRes] = await Promise.all([
          api.get('/projects'),
          api.get('/auth/users')
        ]);
        setProjects(projRes.data);
        if (projRes.data.length > 0) setSelectedProjectId(projRes.data[0]._id);
        setUsers(usersRes.data);
      } catch (e) { console.error(e); }
    };
    fetchProjectsAndUsers();
  }, [showNewTask]); // Refresh when modal opens

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      let projId = selectedProjectId;
      // If user has NO projects and creates task, auto-create a default one
      if (!projId) {
        if (projects.length > 0) {
           projId = projects[0]._id;
        } else {
           const newProj = await api.post('/projects', { name: 'Default Project', description: 'Auto-generated project for tasks' });
           projId = newProj.data._id;
        }
      }
      
      const reqBody: any = {
        title: newTaskTitle,
        description: newTaskDesc,
        priority: newTaskPriority,
        projectId: projId
      };
      if (newTaskDueDate) reqBody.dueDate = newTaskDueDate;
      if (newTaskNotification) reqBody.notification = newTaskNotification;
      if (newTaskTagsInput) reqBody.tags = newTaskTagsInput.split(',').map(t => t.trim()).filter(Boolean);
      if (newTaskAssignee) reqBody.assignees = [newTaskAssignee];

      await api.post('/tasks', reqBody);
      setShowNewTask(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDueDate('');
      setNewTaskPriority('Medium');
      setNewTaskNotification('');
      setNewTaskTagsInput('');
      setNewTaskAssignee('');
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
          <div className="px-6 flex flex-col items-center mb-12">
            <div className="relative mb-4">
              <div className="absolute -inset-2 bg-[#F2E266] rounded-full blur opacity-10 transition duration-1000"></div>
              <img src="/image.png" alt="Tasky Logo" className="relative w-20 h-20 object-contain rounded-2xl shadow-lg" />
            </div>
            <span className="text-3xl font-extrabold tracking-tighter bg-gradient-to-b from-[#FCD34D] to-[#D97706] bg-clip-text text-transparent" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Tasky
            </span>
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
                placeholder={searchQuery ? '' : 'Search'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value, activeSearchFilter);
                }}
                className="subtle-input pl-10 w-full"
                onClick={() => setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 250)}
              />

              {showSearchDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-[24px] shadow-xl z-50 border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4">Add filters</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Project', 'Deadline', 'Type', 'Assignee'].map((filter, i) => (
                        <button 
                          key={i} 
                          onMouseDown={(e) => {
                            e.preventDefault(); // prevent input blur
                            const newFilter = activeSearchFilter === filter ? null : filter;
                            setActiveSearchFilter(newFilter);
                            handleSearch(searchQuery, newFilter);
                          }}
                          className={clsx("flex items-center px-4 py-2 border rounded-full text-sm font-medium transition-colors cursor-pointer",
                            activeSearchFilter === filter ? "border-[#F2E266] bg-[#FDF9DE] text-gray-900" : "border-gray-200 hover:bg-gray-50 text-gray-700"
                          )}
                        >
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
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {searchResults.length > 0 ? searchResults.map((task: any) => (
                        <div key={task._id} className="flex items-start cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg" onClick={() => navigate(`/projects`)}>
                          {task.status === 'Done' ? (
                            <CheckCircle2 className="w-5 h-5 text-[#D4B541] mr-3 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className={clsx("text-sm font-bold", task.status === 'Done' ? "text-gray-400 line-through" : "text-gray-900")}>{task.title}</p>
                            <p className="text-xs text-gray-500 truncate">{task.description || 'No description'}</p>
                          </div>
                        </div>
                      )) : searchQuery ? (
                        <p className="text-sm text-gray-500">No tasks found.</p>
                      ) : (
                        <p className="text-sm text-gray-500">Type to search for tasks...</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => navigate('/projects')}>
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
            <button onClick={() => navigate('/notifications')} className="text-gray-500 hover:text-gray-700 relative transition-colors">
              <Mail className="h-6 w-6" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm hover:ring-2 hover:ring-[#F2E266] transition-all focus:outline-none"
              >
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover bg-[#FAD9A1]"
                />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="p-4 border-b border-gray-50 flex items-center">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                      className="w-10 h-10 rounded-full bg-[#FAD9A1] mr-3 border border-gray-100"
                    />
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Guest User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || 'guest@tasky.com'}</p>
                    </div>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { setShowProfileDropdown(false); navigate('/settings'); }} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FDF9DE] hover:text-gray-900 rounded-xl font-medium transition-colors">
                      <Settings className="w-4 h-4 mr-3 text-gray-400" /> Account Settings
                    </button>
                  </div>
                  <div className="p-2 border-t border-gray-50">
                    <button onClick={() => { setShowProfileDropdown(false); handleLogout(); }} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
                      <LogOut className="w-4 h-4 mr-3 text-red-400" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
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
                    <button 
                      type="button" 
                      onClick={() => setNewTaskDueDate(new Date().toISOString())}
                      className={clsx("px-4 py-1.5 border rounded-full text-sm font-medium transition-colors", 
                        newTaskDueDate && new Date(newTaskDueDate).toDateString() === new Date().toDateString() ? "border-[#F2E266] bg-[#FDF9DE] text-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-300")}
                    >Today</button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
                        setNewTaskDueDate(tmrw.toISOString());
                      }}
                      className={clsx("px-4 py-1.5 border rounded-full text-sm font-medium transition-colors", 
                        newTaskDueDate && new Date(newTaskDueDate).toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() ? "border-[#F2E266] bg-[#FDF9DE] text-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-300")}
                    >Tomorrow</button>
                    <input 
                      type="date"
                      value={newTaskDueDate ? newTaskDueDate.split('T')[0] : ''}
                      onChange={(e) => {
                        if(e.target.value) {
                          setNewTaskDueDate(new Date(e.target.value).toISOString());
                        } else {
                          setNewTaskDueDate('');
                        }
                      }}
                      className="border border-gray-200 rounded-full text-sm px-3 py-1.5 text-gray-700 hover:border-gray-300 focus:border-[#F2E266] focus:ring-1 focus:ring-[#F2E266] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-32 flex items-center text-sm font-medium text-gray-500"><Bell className="w-4 h-4 mr-2" /> Notification</span>
                  <div className="flex space-x-2">
                    {['In 1 hour', 'Tomorrow', 'None'].map(n => (
                      <button 
                        key={n}
                        type="button" 
                        onClick={() => setNewTaskNotification(n)}
                        className={clsx("px-4 py-1.5 border rounded-full text-sm font-medium transition-colors", 
                          newTaskNotification === n ? "border-[#F2E266] bg-[#FDF9DE] text-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-300")}
                      >{n}</button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-32 flex items-center text-sm font-medium text-gray-500"><Flag className="w-4 h-4 mr-2" /> Priority</span>
                  <div className="flex space-x-2">
                    {['Low', 'Medium', 'High'].map(p => (
                      <button 
                        key={p}
                        type="button" 
                        onClick={() => setNewTaskPriority(p as any)}
                        className={clsx("px-4 py-1.5 border rounded-full text-sm font-medium transition-colors", 
                          newTaskPriority === p ? "border-[#F2E266] bg-[#FDF9DE] text-gray-900" : "border-gray-200 text-gray-700 hover:bg-gray-50")}
                      >{p}</button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-32 flex items-center text-sm font-medium text-gray-500"><Tag className="w-4 h-4 mr-2" /> Tags</span>
                  <input 
                    type="text"
                    value={newTaskTagsInput}
                    onChange={(e) => setNewTaskTagsInput(e.target.value)}
                    placeholder="e.g. urgent, backend, design"
                    className="flex-1 border border-gray-200 rounded-full text-sm px-4 py-1.5 text-gray-700 focus:border-[#F2E266] focus:ring-1 focus:ring-[#F2E266] outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center">
                  <span className="w-32 flex items-center text-sm font-medium text-gray-500"><UserPlus className="w-4 h-4 mr-2" /> Assign</span>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-full text-sm px-4 py-1.5 text-gray-700 focus:border-[#F2E266] focus:ring-1 focus:ring-[#F2E266] outline-none cursor-pointer appearance-none bg-white"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u: any) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea 
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Add details about this task..."
                    rows={3}
                    className="w-full bg-[#F5F6F8] border-none rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2E266]"
                  ></textarea>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category (Project)</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-[#F5F6F8] border-none rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2E266] appearance-none cursor-pointer"
                  >
                    {projects.length === 0 && <option value="">No categories (will create default)</option>}
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
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
