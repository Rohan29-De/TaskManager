import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Filter, X, Search, Paperclip, CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
  project: { name: string; _id?: string };
  assignees?: any[];
  comments?: { text: string; createdAt: string; user?: any }[];
  attachments?: { name: string; url: string; size: number; createdAt: string }[];
  tags?: string[];
}

const Projects = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      fetchTasks();
      if (selectedTask?._id === task._id) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTask = async (updates: Partial<Task>) => {
    if (!selectedTask) return;
    try {
      setIsUpdating(true);
      const res = await api.put(`/tasks/${selectedTask._id}`, updates);
      setSelectedTask(res.data);
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTask || !commentText.trim()) return;
    try {
      const newComment = { text: commentText, createdAt: new Date().toISOString() };
      const updatedComments = [...(selectedTask.comments || []), newComment];
      await handleUpdateTask({ comments: updatedComments });
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${selectedTask._id}`);
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;

    try {
      setIsUpdating(true);
      // For now, we mock the upload and store the file info
      const newAttachment = {
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file), // Temporary local URL
        createdAt: new Date().toISOString()
      };
      const updatedAttachments = [...(selectedTask.attachments || []), newAttachment];
      await handleUpdateTask({ attachments: updatedAttachments });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleFilter = (f: string) => {
    setActiveFilters(prev => 
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  };

  const allDisplayTasks = tasks.length > 0 ? tasks : [
    { _id: '1', title: 'Finish monthly reporting', description: 'Monthly report', status: 'Done', priority: 'Medium', project: { name: 'Operations' }, assignees: [] },
    { _id: '2', title: 'Market research', description: 'Find my keynote attached', status: 'To Do', priority: 'High', project: { name: 'Marketing' }, assignees: [{_id: '1'}] },
    { _id: '3', title: 'Brand guidelines update', description: 'Review new colors', status: 'To Do', priority: 'Low', project: { name: 'Design' }, assignees: [] },
  ];

  const filteredTasks = allDisplayTasks.filter((task: any) => {
    if (activeFilters.includes('Deadline') && !task.dueDate) return false;
    if (activeFilters.includes('Type') && task.priority !== 'High') return false; 
    if (activeFilters.includes('Assignee') && (!task.assignees || task.assignees.length === 0)) return false;
    if (activeFilters.includes('Project') && !task.project) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto h-full flex gap-6 relative">
      
      {/* Task List */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={clsx(
                "flex items-center px-4 py-2 rounded-full text-sm font-medium border transition-colors shadow-sm",
                showFilter || activeFilters.length > 0 ? "border-[#F2E266] bg-[#FDF9DE] text-gray-900" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              {activeFilters.length > 0 ? `Filters (${activeFilters.length})` : 'Add filters'}
            </button>
            {showFilter && (
              <div className="absolute top-12 left-0 w-80 bg-white rounded-3xl shadow-xl z-20 border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-900">Add filters</h4>
                  {activeFilters.length > 0 && (
                    <button onClick={() => setActiveFilters([])} className="text-xs text-red-500 font-bold hover:underline">Clear all</button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Project', 'Deadline', 'Type', 'Assignee'].map(f => (
                    <button 
                      key={f} 
                      onClick={() => toggleFilter(f)}
                      className={clsx(
                        "px-4 py-2 border rounded-full text-sm font-medium flex items-center transition-all",
                        activeFilters.includes(f) ? "border-[#F2E266] bg-[#FDF9DE] text-gray-900 shadow-sm" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      <span className={clsx("w-3 h-3 mr-2 rounded-full", activeFilters.includes(f) ? "bg-[#F2E266]" : "bg-gray-200")}></span>
                      {f}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <button onClick={() => setShowFilter(false)} className="w-full py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                    Apply filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {(() => {
            const now = new Date();
            const todayStr = now.toDateString();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toDateString();
            const endOfWeek = new Date(now);
            endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

            const todayTasks = filteredTasks.filter((t: any) => {
              if (!t.dueDate) return true; // tasks with no due date show under Today
              return new Date(t.dueDate).toDateString() === todayStr;
            });
            const tomorrowTasks = filteredTasks.filter((t: any) => {
              if (!t.dueDate) return false;
              return new Date(t.dueDate).toDateString() === tomorrowStr;
            });
            const weekTasks = filteredTasks.filter((t: any) => {
              if (!t.dueDate) return false;
              const d = new Date(t.dueDate);
              return d.toDateString() !== todayStr && d.toDateString() !== tomorrowStr && d <= endOfWeek;
            });
            const laterTasks = filteredTasks.filter((t: any) => {
              if (!t.dueDate) return false;
              const d = new Date(t.dueDate);
              return d > endOfWeek;
            });

            const renderSection = (label: string, sectionTasks: any[]) => {
              if (sectionTasks.length === 0) return null;
              return (
                <div key={label} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                  {/* Section Header */}
                  <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4 border-b border-gray-100">
                    <div className="col-span-4">{label}</div>
                    <div className="col-span-2 text-center">Due Date</div>
                    <div className="col-span-2 text-center">Stage</div>
                    <div className="col-span-1 text-center">Priority</div>
                    <div className="col-span-2 text-center">Team</div>
                    <div className="col-span-1 text-right">Assignee</div>
                  </div>

                  {/* Task Rows */}
                  {sectionTasks.map((task: any, idx: number) => {
                    const dueDateLabel = !task.dueDate ? 'No date' :
                      new Date(task.dueDate).toDateString() === todayStr ? 'Today' :
                      new Date(task.dueDate).toDateString() === tomorrowStr ? 'Tomorrow' :
                      format(new Date(task.dueDate), 'EEEE');

                    const statusColor = task.status === 'In Progress' ? 'bg-green-100 text-green-700' :
                      task.status === 'Done' ? 'bg-[#FDF9DE] text-[#D4B541]' : 'bg-gray-100 text-gray-600';

                    const priorityColor = task.priority === 'High' ? 'bg-[#D4B541] text-white' :
                      task.priority === 'Medium' ? 'bg-[#FDF9DE] text-[#D4B541]' : 'bg-gray-100 text-gray-500';

                    return (
                      <div
                        key={task._id}
                        className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-[#FDFCF5] cursor-pointer transition-colors group"
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="col-span-4 flex items-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task); }}
                            className="flex-shrink-0 mr-3"
                          >
                            {task.status === 'Done' ? (
                              <CheckCircle2 className="w-5 h-5 text-[#D4B541]" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                            )}
                          </button>
                          <span className={clsx("text-sm font-semibold truncate", task.status === 'Done' && "text-gray-400 line-through")}>{task.title}</span>
                        </div>

                        <div className="col-span-2 text-center">
                          <span className="text-sm font-medium text-[#D4B541]">{dueDateLabel}</span>
                        </div>

                        <div className="col-span-2 flex justify-center">
                          <span className={clsx("px-3 py-1 rounded-full text-xs font-bold", statusColor)}>
                            {task.status === 'To Do' ? 'Not started' : task.status}
                          </span>
                        </div>

                        <div className="col-span-1 flex justify-center">
                          <span className={clsx("px-3 py-1 rounded-full text-xs font-bold", priorityColor)}>
                            {task.priority}
                          </span>
                        </div>

                        <div className="col-span-2 text-center text-sm text-gray-600 truncate">
                          {task.project?.name || 'General'}
                        </div>

                        <div className="col-span-1 flex justify-end">
                          <img className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-[#FDF9DE]" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${idx}`} alt="Assignee" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            };

            return (
              <>
                {renderSection('Today', todayTasks)}
                {renderSection('Tomorrow', tomorrowTasks)}
                {renderSection('This week', weekTasks)}
                {renderSection('Later', laterTasks)}
                {filteredTasks.length === 0 && (
                  <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-12 text-center">
                    <p className="text-gray-400 text-sm">No tasks yet. Create one using the <strong>+ New task</strong> button above!</p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Task Details Modal Overaly */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] flex overflow-hidden shadow-2xl relative">
            
            <button onClick={() => setSelectedTask(null)} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-gray-900 z-50 shadow-sm border border-gray-100 transition-all hover:rotate-90">
              <X className="w-5 h-5" />
            </button>

            {/* Left Pane - Meta */}
            <div className="w-1/3 bg-[#F9FAFB] p-8 border-r border-gray-100 flex flex-col">
              <div className="flex space-x-4 mb-8 text-gray-400">
                <button 
                  onClick={() => toggleTaskStatus(selectedTask)}
                  className={clsx("transition-colors", selectedTask.status === 'Done' ? "text-[#D4B541]" : "hover:text-gray-900")}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="hover:text-gray-900 transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{selectedTask.title}</h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                {selectedTask.description || "Fill out the monthly report, so everyone in the company is happy and see your productivity!"}
              </p>
              
              <h3 className="font-bold text-gray-900 mb-4">Info</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center"><span className="w-4 h-4 mr-2 bg-gray-200 rounded-sm"></span> Status</span>
                  <select 
                    value={selectedTask.status}
                    onChange={(e) => handleUpdateTask({ status: e.target.value })}
                    className="bg-gray-100 px-3 py-1 rounded-full font-medium border-none focus:ring-0 cursor-pointer"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center"><span className="w-4 h-4 mr-2 bg-gray-200 rounded-sm"></span> Priority</span>
                  <select 
                    value={selectedTask.priority}
                    onChange={(e) => handleUpdateTask({ priority: e.target.value })}
                    className={clsx("px-3 py-1 rounded-full font-medium border-none focus:ring-0 cursor-pointer", 
                      selectedTask.priority === 'High' ? "bg-[#D4B541] text-white" :
                      selectedTask.priority === 'Medium' ? "bg-[#FDF9DE] text-[#D4B541]" : "bg-gray-100"
                    )}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center"><span className="w-4 h-4 mr-2 bg-gray-200 rounded-sm"></span> Deadline</span>
                  <input 
                    type="date"
                    value={selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleUpdateTask({ dueDate: e.target.value })}
                    className="font-medium text-gray-900 border-none bg-transparent p-0 text-right focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="mt-auto pt-8">
                <button 
                  onClick={handleDeleteTask}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4 mr-2" /> Delete Task
                </button>
              </div>
            </div>

            {/* Right Pane - Content */}
            <div className="w-2/3 p-8 pt-16 bg-white flex flex-col overflow-y-auto">
              <div className="space-y-6 mb-8">
                {selectedTask.comments && selectedTask.comments.length > 0 ? selectedTask.comments.map((comment, i) => (
                  <div key={i} className="flex items-start">
                    <img className="w-10 h-10 rounded-full mr-4 bg-[#FAD9A1] border border-gray-100 shadow-sm" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.name || i}`} alt="Avatar" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-gray-900">{comment.user?.name || 'You'}</h4>
                        <span className="text-xs text-gray-400">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.text}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm italic">No comments yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-900 mb-4">Attachments</h3>
              <div className="space-y-3 mb-8">
                {selectedTask.attachments && selectedTask.attachments.length > 0 ? selectedTask.attachments.map((file, i) => (
                  <div key={i} className="flex items-center p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all group">
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center mr-4 text-white shadow-sm",
                      file.name.endsWith('.xls') || file.name.endsWith('.xlsx') ? "bg-green-500" : 
                      file.name.endsWith('.pdf') ? "bg-red-500" : "bg-blue-500"
                    )}>
                      <span className="text-[10px] font-black">{file.name.split('.').pop()?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} KB • {format(new Date(file.createdAt), 'MMM d')}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = (selectedTask.attachments || []).filter((_, index) => index !== i);
                        handleUpdateTask({ attachments: updated });
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-100 rounded-[24px] p-8 text-center hover:border-[#F2E266] hover:bg-gray-50 cursor-pointer transition-all group"
                  >
                    <Paperclip className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-[#D4B541]" />
                    <p className="text-sm text-gray-400 font-medium">No attachments yet</p>
                    <p className="text-xs text-gray-300">Click to upload documents</p>
                  </div>
                )}
              </div>

              <div className="mt-auto relative">
                <form onSubmit={(e) => { e.preventDefault(); handleAddComment(); }}>
                  <div className="flex items-center w-full bg-[#F5F6F8] rounded-full px-4 py-1 group focus-within:ring-2 focus-within:ring-[#F2E266] transition-all">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input 
                      type="text" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Comment, or type / for comment" 
                      className="flex-1 bg-transparent border-none py-3 text-sm focus:outline-none text-gray-700"
                    />
                    <button 
                      type="submit"
                      disabled={!commentText.trim() || isUpdating}
                      className="w-8 h-8 bg-[#F2E266] rounded-full flex items-center justify-center hover:bg-[#E3D251] transition-all transform active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                      <svg className="w-4 h-4 text-gray-900 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
