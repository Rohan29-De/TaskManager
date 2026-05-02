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
  timeSpent?: number;
  comments?: { _id?: string, text: string, createdAt: string }[];
  project?: any;
  dueDate?: string;
}

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [activeTrackers, setActiveTrackers] = useState<string[]>([]);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [showNewCommentModal, setShowNewCommentModal] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentTaskId, setNewCommentTaskId] = useState('');

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
        const taskProjectId = typeof t.project === 'object' && t.project !== null ? (t.project as any)._id : t.project;
        matchesCategory = taskProjectId === selectedCategory;
      }

      return matchesDate && matchesCategory;
    });
    setTasks(filtered);
  }, [allTasks, selectedDate, selectedCategory]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTrackers.length > 0) {
        setAllTasks(prev => prev.map(t => 
          activeTrackers.includes(t._id) ? { ...t, timeSpent: (t.timeSpent || 0) + 1 } : t
        ));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTrackers]);

  const toggleTracker = async (taskId: string) => {
    if (activeTrackers.includes(taskId)) {
      // Pause
      setActiveTrackers(prev => prev.filter(id => id !== taskId));
      const task = allTasks.find(t => t._id === taskId);
      if (task) {
        try {
          // Send the current incremented time (since allTasks is updated every second)
          await api.put(`/tasks/${taskId}`, { timeSpent: task.timeSpent });
        } catch (e) { console.error(e); }
      }
    } else {
      // Play - don't stop others!
      setActiveTrackers(prev => [...prev, taskId]);
    }
  };

  const recentComments = allTasks
    .flatMap(t => (t.comments || []).map(c => ({ ...c, taskId: t._id, taskTitle: t.title })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter(t => t.status === 'Done').length;
  const productivityPercentage = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const upcomingDeadlines = allTasks
    .filter(t => t.status !== 'Done' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);

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
                    setAllTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
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
            {allTasks.length > 0 ? allTasks.slice(0, 5).map((task) => {
              const isActive = activeTrackers.includes(task._id);
              const seconds = task.timeSpent || 0;
              return (
              <div key={task._id} className={clsx(
                "flex items-center justify-between p-3 rounded-xl transition-colors",
                isActive ? "bg-[#FDF9DE] border-l-4 border-[#F2E266]" : "hover:bg-gray-50 border-l-4 border-transparent"
              )}>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-800">{task.title}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={clsx("text-sm", isActive ? "font-bold text-gray-900" : "font-medium text-gray-500")}>
                    {Math.floor(seconds / 3600) > 0 ? `${Math.floor(seconds / 3600)}h ` : ''}
                    {Math.floor((seconds % 3600) / 60)}m {seconds % 60}s
                  </span>
                  {isActive ? (
                    <button onClick={() => toggleTracker(task._id)} className="w-8 h-8 rounded-full bg-[#F2E266] flex items-center justify-center shadow-sm">
                      <Pause className="w-4 h-4 text-gray-900" fill="currentColor" />
                    </button>
                  ) : (
                    <button onClick={() => toggleTracker(task._id)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400">
                      <Play className="w-4 h-4" fill="currentColor" />
                    </button>
                  )}
                  <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </div>
            )}) : (
              <div className="text-sm text-gray-400 p-3">No tasks to track.</div>
            )}
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
            {recentComments.length > 0 ? recentComments.map((comment, i) => (
              <div key={comment._id || i} className="pb-4 border-b border-gray-100 group cursor-pointer last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-gray-900 truncate pr-2">{comment.taskTitle}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                </div>
                <p className="text-xs text-gray-500 leading-snug break-words">{comment.text}</p>
              </div>
            )) : (
              <div className="text-sm text-gray-400 pb-2">No new comments.</div>
            )}

            <button 
              onClick={() => setShowNewCommentModal(true)}
              className="flex items-center text-sm font-bold text-gray-900 mt-2 hover:text-gray-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" /> Add
            </button>
          </div>
        </div>

        {/* Productivity Stats Widget */}
        <div className="bento-card flex-shrink-0 w-full">
          <h3 className="font-bold text-lg mb-6">Productivity</h3>
          <div className="flex flex-col items-center justify-center pt-2 pb-4">
            <div className="text-5xl font-bold text-gray-900 mb-2">{productivityPercentage}%</div>
            <div className="text-sm font-medium text-gray-500 mb-6">Tasks Completed ({doneTasks}/{totalTasks})</div>
            <div className="w-full bg-[#F5F6F8] rounded-full h-3 overflow-hidden">
              <div className="bg-[#F2E266] h-3 rounded-full transition-all duration-1000" style={{ width: `${productivityPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines Widget */}
        <div className="bento-card flex-shrink-0 w-full">
          <h3 className="font-bold text-lg mb-6">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(t => (
              <div key={t._id} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-bold text-gray-800 truncate pr-2">{t.title}</span>
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">{format(new Date(t.dueDate!), 'MMM d')}</span>
              </div>
            )) : <div className="text-sm text-gray-400">No upcoming deadlines.</div>}
          </div>
        </div>
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

      {/* New Comment Modal */}
      {showNewCommentModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl relative p-8">
            <button onClick={() => setShowNewCommentModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add a comment</h2>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (newCommentText.trim() && newCommentTaskId) {
                try {
                  const task = allTasks.find(t => t._id === newCommentTaskId);
                  if (!task) return;
                  const newComment = { text: newCommentText, createdAt: new Date().toISOString() };
                  const updatedComments = [...(task.comments || []), newComment];
                  await api.put(`/tasks/${newCommentTaskId}`, { comments: updatedComments });
                  
                  // Update locally
                  setAllTasks(prev => prev.map(t => 
                    t._id === newCommentTaskId ? { ...t, comments: updatedComments } : t
                  ));
                  setShowNewCommentModal(false);
                  setNewCommentText('');
                  setNewCommentTaskId('');
                } catch (err) { console.error(err); }
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Task</label>
                <select
                  required
                  value={newCommentTaskId}
                  onChange={(e) => setNewCommentTaskId(e.target.value)}
                  className="w-full bg-[#F5F6F8] border-none rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2E266] appearance-none cursor-pointer"
                >
                  <option value="" disabled>Choose a task...</option>
                  {allTasks.map(t => (
                    <option key={t._id} value={t._id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Comment</label>
                <textarea 
                  required
                  rows={3}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Write your comment..."
                  className="w-full bg-[#F5F6F8] border-none rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2E266] text-gray-900 placeholder-gray-400 resize-none"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => setShowNewCommentModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-[#F2E266] rounded-full text-sm font-bold text-gray-900 hover:bg-[#E3D251] shadow-sm transition-colors"
                >
                  Post Comment
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
