import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { ChevronLeft, ChevronRight, MoreVertical, Play, Pause, Plus, X } from 'lucide-react';
import clsx from 'clsx';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, getDay } from 'date-fns';

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
}

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [trackers, setTrackers] = useState([
    { name: 'Create wireframe', seconds: 5130, active: true },
    { name: 'Slack logo design', seconds: 1818, active: false },
    { name: 'Dashboard design', seconds: 6502, active: false },
    { name: 'Create wireframe', seconds: 1021, active: false },
    { name: 'Mood tracker', seconds: 54358, active: false },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/projects')
        ]);
        setAllTasks(tasksRes.data);
        setProjects(projsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Filter tasks by selected date and category
    const filtered = allTasks.filter(t => {
      // Date filter
      let matchesDate = false;
      if (!t.dueDate) matchesDate = isSameDay(selectedDate, new Date());
      else matchesDate = isSameDay(new Date(t.dueDate), selectedDate);

      // Category filter
      let matchesCategory = true;
      if (selectedCategory) {
        // Handle case where project is populated object or string ID
        const taskProjectId = typeof t.project === 'object' && t.project !== null ? (t.project as any)._id : t.project;
        matchesCategory = taskProjectId === selectedCategory;
      }

      return matchesDate && matchesCategory;
    });
    setTasks(filtered);
  }, [allTasks, selectedDate, selectedCategory]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrackers(prev => prev.map(t => t.active ? { ...t, seconds: t.seconds + 1 } : t));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTracker = (index: number) => {
    setTrackers(prev => prev.map((t, i) => ({
      ...t,
      active: i === index ? !t.active : false // Stop others when starting one
    })));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto h-full pb-8">
      
      {/* Column 1 */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="bento-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">{format(currentDate, 'MMMM yyyy')}</h3>
            <div className="flex space-x-2">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-gray-400 hover:text-gray-600"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-gray-400 hover:text-gray-600"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2 font-medium text-gray-500">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>
          <div className="grid grid-cols-7 gap-y-3 text-center text-sm">
            {Array.from({ length: getDay(startOfMonth(currentDate)) }).map((_, i) => (
              <div key={`empty-${i}`} className="text-gray-300"></div>
            ))}
            {eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }).map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              return (
                <div 
                  key={date.toISOString()} 
                  onClick={() => setSelectedDate(date)}
                  className={clsx(
                  isSelected ? "w-7 h-7 mx-auto flex items-center justify-center bg-[#F2E266] rounded-full font-bold text-gray-900 shadow-sm" : 
                  isToday ? "w-7 h-7 mx-auto flex items-center justify-center border-2 border-[#F2E266] rounded-full font-bold text-gray-900" : "text-gray-600",
                  "cursor-pointer hover:font-bold transition-all"
                )}>
                  {format(date, 'd')}
                </div>
              );
            })}
          </div>
        </div>

        {/* My categories */}
        <div className="bento-card flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">My categories</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5" /></button>
          </div>
          <div className="space-y-5">
            {projects.length > 0 ? projects.map((cat, i) => (
              <div 
                key={cat._id || i} 
                onClick={() => setSelectedCategory(selectedCategory === cat._id ? null : cat._id)}
                className={clsx(
                  "flex justify-between items-center cursor-pointer p-3 -mx-3 rounded-xl transition-colors",
                  selectedCategory === cat._id ? "bg-[#FDF9DE] border-l-4 border-l-[#F2E266]" : "hover:bg-gray-50 border-l-4 border-l-transparent"
                )}
              >
                <div className="flex items-center text-sm font-medium">
                  <span className="w-8 flex justify-center text-gray-500 text-lg">{(cat.name || 'P').charAt(0).toUpperCase()}</span>
                  <span className="text-gray-700">{cat.name}</span>
                </div>
                <div className="flex -space-x-2">
                  <img className="w-6 h-6 rounded-full border-2 border-white bg-gray-100" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cat._id || i}`} alt="" />
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-400">No categories yet.</div>
            )}
          </div>
          <button 
            onClick={() => setShowNewCategoryModal(true)}
            className="mt-6 flex items-center text-sm font-bold text-gray-900 hover:text-gray-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> Add more
          </button>
        </div>
      </div>

      {/* Column 2 */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        {/* My Tasks */}
        <div className="bento-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">My tasks ({tasks.length || '05'})</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5" /></button>
          </div>
          
          <div className="space-y-4">
            {tasks.length > 0 ? tasks.map((task, i) => (
              <div key={task._id || i} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-center cursor-pointer" onClick={async () => {
                  try {
                    const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
                    await api.put(`/tasks/${task._id}`, { status: newStatus });
                    setTasks(tasks.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
                  } catch (e) { console.error(e); }
                }}>
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0",
                    task.status === 'Done' ? "bg-[#F2E266] border-[#F2E266]" : "border-gray-300"
                  )}>
                    {task.status === 'Done' && (
                       <svg className="w-3 h-3 text-gray-900 mx-auto mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                    )}
                  </div>
                  <span className={clsx("text-sm font-medium", task.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-700')}>{task.title}</span>
                </div>
                <span className={clsx("text-sm font-medium", isSameDay(selectedDate, new Date()) ? "text-[#D4B541]" : "text-gray-500")}>
                  {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'MMM d')}
                </span>
              </div>
            )) : (
              <div className="text-center py-6 text-gray-500 font-medium">
                No tasks for this date.
              </div>
            )}
          </div>
        </div>

        {/* My Tracking */}
        <div className="bento-card flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">My tracking</h3>
          </div>
          
          <div className="space-y-2">
            {trackers.map((track, i) => (
              <div key={i} className={clsx(
                "flex items-center justify-between p-3 rounded-xl transition-colors",
                track.active ? "bg-[#FDF9DE] border-l-4 border-[#F2E266]" : "hover:bg-gray-50 border-l-4 border-transparent"
              )}>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-800">{track.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={clsx("text-sm", track.active ? "font-bold text-gray-900" : "font-medium text-gray-500")}>
                    {Math.floor(track.seconds / 3600) > 0 ? `${Math.floor(track.seconds / 3600)}h ` : ''}
                    {Math.floor((track.seconds % 3600) / 60)}m {track.seconds % 60}s
                  </span>
                  {track.active ? (
                    <button onClick={() => toggleTracker(i)} className="w-8 h-8 rounded-full bg-[#F2E266] flex items-center justify-center shadow-sm">
                      <Pause className="w-4 h-4 text-gray-900" fill="currentColor" />
                    </button>
                  ) : (
                    <button onClick={() => toggleTracker(i)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400">
                      <Play className="w-4 h-4" fill="currentColor" />
                    </button>
                  )}
                  <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Column 3 */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {/* New Comments */}
        <div className="bento-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">New comments</h3>
          </div>
          
          <div className="space-y-4">
            <div className="pb-4 border-b border-gray-100 group cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-bold text-gray-900">Market research</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </div>
              <p className="text-xs text-gray-500 leading-snug">Find my keynote attached...</p>
            </div>
            
            <div className="pb-4 border-b border-gray-100 group cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-bold text-gray-900">Market research</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </div>
              <p className="text-xs text-gray-500 leading-snug">I've added the data. Let's check it out toge...</p>
            </div>

            <button className="flex items-center text-sm font-bold text-gray-900 mt-2">
              <Plus className="w-4 h-4 mr-2" /> Add
            </button>
          </div>
        </div>

        {/* Add Widget Button */}
        <button className="flex-1 rounded-3xl border-2 border-dashed border-gray-200 bg-transparent flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all min-h-[200px]">
          <Plus className="w-6 h-6 mb-2" />
          <span className="font-bold">Add widget</span>
        </button>
      </div>
      
      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl relative p-8">
            <button onClick={() => setShowNewCategoryModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create new category</h2>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (newCategoryName.trim()) {
                try {
                  const res = await api.post('/projects', { name: newCategoryName, description: 'User created category' });
                  setProjects([...projects, res.data]);
                  setShowNewCategoryModal(false);
                  setNewCategoryName('');
                } catch (err) { console.error(err); }
              }
            }}>
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Design, Development, Marketing..."
                  className="w-full bg-[#F5F6F8] border-none rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2E266] text-gray-900 placeholder-gray-400"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => setShowNewCategoryModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-[#F2E266] rounded-full text-sm font-bold text-gray-900 hover:bg-[#E3D251] shadow-sm transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
