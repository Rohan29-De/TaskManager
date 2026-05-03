import React, { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MoreVertical, X, CheckCircle2, Circle, Paperclip, Link as LinkIcon, User, Clock, Briefcase, Flag, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
  project: { _id?: string; name: string };
  assignees?: any[];
  attachments?: { name: string; url: string; size: number; createdAt: string }[];
  links?: { title: string; url: string }[];
}

interface Project {
  _id: string;
  name: string;
}

const Notifications = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [newTask, setNewTask] = useState({ title: '', projectId: '', priority: 'Medium' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
      if (selectedTask) {
        const updated = res.data.find((t: Task) => t._id === selectedTask._id);
        if (updated) setSelectedTask(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      if (res.data.length === 0) {
        // Create a default project if none exist
        const defaultProj = await api.post('/projects', { 
          name: 'General', 
          description: 'Default project for your tasks' 
        });
        setProjects([defaultProj.data]);
        setNewTask(prev => ({ ...prev, projectId: defaultProj.data._id }));
      } else {
        setProjects(res.data);
        if (!newTask.projectId) {
          setNewTask(prev => ({ ...prev, projectId: res.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const res = await api.post('/tasks', newTask);
      setTasks([res.data, ...tasks]);
      setCreateModalOpen(false);
      setNewTask({ title: '', projectId: projects[0]?._id || '', priority: 'Medium' });
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to create task. Make sure you select a valid project.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateTask = async (updates: Partial<Task>) => {
    if (!selectedTask) return;
    try {
      setIsUpdating(true);
      const res = await api.put(`/tasks/${selectedTask._id}`, updates);
      setSelectedTask(res.data);
      setTasks(tasks.map(t => t._id === selectedTask._id ? res.data : t));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
      if (selectedTask?._id === task._id) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;

    try {
      setIsUpdating(true);
      const newAttachment = {
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file), // Mock URL
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

  const handleAddLink = async () => {
    if (newLink.title && newLink.url && selectedTask) {
      const updatedLinks = [...(selectedTask.links || []), newLink];
      await handleUpdateTask({ links: updatedLinks });
      setNewLink({ title: '', url: '' });
      setLinkModalOpen(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      await api.delete(`/tasks/${selectedTask._id}`);
      setTasks(tasks.filter(t => t._id !== selectedTask._id));
      setSelectedTask(null);
      setDeleteModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to delete task');
      setDeleteModalOpen(false);
    }
  };

  const displayTasks = tasks.length > 0 ? tasks : [
    { _id: '1', title: 'Company research', description: 'John Deere added a new task.', status: 'To Do', priority: 'High', project: { name: 'Secret project' } },
    { _id: '2', title: 'Market ideation', description: 'Felixovic marked the task complete.', status: 'Done', priority: 'Medium', project: { name: 'Operations' } },
    { _id: '3', title: 'Illustrations invoicing', description: 'John Deere added a new task.', status: 'To Do', priority: 'Medium', project: { name: 'Marketing' } },
    { _id: '4', title: 'Yearly wrap-up', description: 'John Deere added a new task.', status: 'To Do', priority: 'High', project: { name: 'Marketing' } },
  ];

  return (
    <div className="max-w-7xl mx-auto h-full flex gap-6 pb-8">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      
      {/* Notifications List */}
      <div className="w-1/2 bento-card flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Latest notifications</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCreateModalOpen(true)}
              className="p-1 text-[#D4B541] hover:bg-[#FDF9DE] rounded-full transition-colors"
              title="Add Task"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button 
              onClick={() => fetchTasks()}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-0">
          {displayTasks.map((task: any, idx) => (
            <div 
              key={task._id} 
              onClick={() => setSelectedTask(task)}
              className={clsx(
                "flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer transition-colors",
                selectedTask?._id === task._id ? "bg-[#FDF9DE] border-l-4 border-l-[#F2E266]" : "hover:bg-gray-50 border-l-4 border-l-transparent"
              )}
            >
              <div className="flex items-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task); }}
                  className="flex-shrink-0 mr-4"
                >
                  {task.status === 'Done' ? (
                    <CheckCircle2 className="w-6 h-6 text-[#D4B541]" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                  )}
                </button>
                <div>
                  <h4 className={clsx("font-bold", task.status === 'Done' && "text-gray-400 line-through")}>{task.title}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">John Deere {task.status === 'Done' ? 'marked the task complete' : 'added a new task'}.</p>
                </div>
              </div>
              <img className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${idx}`} alt="Assignee" />
            </div>
          ))}
        </div>
      </div>

      {/* Task Detail Panel (Right) */}
      {selectedTask ? (
        <div className={clsx("w-1/2 bento-card flex flex-col relative transition-opacity", isUpdating && "opacity-60")}>
          <button onClick={() => setSelectedTask(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-8 pr-8">{selectedTask.title}</h2>
          
          <div className="space-y-6 mb-10">
            <div className="flex items-center">
              <span className="w-32 flex items-center text-sm font-medium text-gray-500"><User className="w-4 h-4 mr-2" /> Assignee</span>
              <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                <img className="w-4 h-4 rounded-full mr-2" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Me`} alt="Me" />
                <span className="text-sm font-medium">Me</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="w-32 flex items-center text-sm font-medium text-gray-500"><Clock className="w-4 h-4 mr-2" /> Deadline</span>
              <input 
                type="date"
                value={selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'yyyy-MM-dd') : ''}
                onChange={(e) => handleUpdateTask({ dueDate: e.target.value })}
                className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-medium border-none focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center">
              <span className="w-32 flex items-center text-sm font-medium text-gray-500"><Briefcase className="w-4 h-4 mr-2" /> Projects</span>
              <select 
                value={selectedTask.project?._id || ''}
                onChange={(e) => handleUpdateTask({ project: e.target.value as any })}
                className="bg-gray-200 text-gray-800 px-4 py-1 rounded-full text-sm font-medium border-none focus:ring-0 cursor-pointer"
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
                {!selectedTask.project?._id && <option value="" selected>{selectedTask.project?.name || 'Secret project'}</option>}
              </select>
            </div>

            <div className="flex items-center">
              <span className="w-32 flex items-center text-sm font-medium text-gray-500"><Flag className="w-4 h-4 mr-2" /> Priority</span>
              <select 
                value={selectedTask.priority}
                onChange={(e) => handleUpdateTask({ priority: e.target.value })}
                className="bg-[#E6DBAD] text-gray-800 px-4 py-1 rounded-full text-sm font-medium border-none focus:ring-0 cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <span className="w-32 flex items-center text-sm font-medium text-gray-500"><CheckCircle2 className="w-4 h-4 mr-2" /> Status</span>
              <select 
                value={selectedTask.status}
                onChange={(e) => handleUpdateTask({ status: e.target.value })}
                className="bg-gray-100 text-gray-800 px-4 py-1 rounded-full text-sm font-medium border-none focus:ring-0 cursor-pointer"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Attachments</h3>
            <div className="space-y-2 mb-4">
              {selectedTask.attachments?.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center">
                    <Paperclip className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <button 
                    onClick={() => {
                      const updated = selectedTask.attachments?.filter((_, idx) => idx !== i);
                      handleUpdateTask({ attachments: updated });
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors text-sm font-bold text-gray-900"
            >
              <Paperclip className="w-4 h-4 mr-2" /> Attach File
            </button>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Links</h3>
            <div className="space-y-2 mb-4">
              {selectedTask.links?.map((link, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                    <div className="w-6 h-6 rounded-full bg-[#F2E266] flex items-center justify-center mr-3">
                      <LinkIcon className="w-3 h-3 text-gray-900" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{link.title}</span>
                  </a>
                  <button 
                    onClick={() => {
                      const updated = selectedTask.links?.filter((_, idx) => idx !== i);
                      handleUpdateTask({ links: updated });
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setLinkModalOpen(true)}
              className="w-full flex items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors text-sm font-bold text-gray-900"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Link
            </button>
          </div>

          <div className="mt-auto pt-8 flex justify-end space-x-4">
            <button 
              onClick={() => setDeleteModalOpen(true)}
              className="px-6 py-2 bg-red-100 rounded-full text-sm font-bold text-red-700 hover:bg-red-200 flex items-center transition-colors"
            >
              <span className="mr-2">🗑️</span> Delete task
            </button>
          </div>
        </div>
      ) : (
        <div className="w-1/2 bento-card flex items-center justify-center text-gray-400">
          Select a notification to view details
        </div>
      )}

      {/* Custom Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Link</h3>
              <button onClick={() => setLinkModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                <input 
                  type="text" 
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  placeholder="e.g. Project Specs"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#F2E266] focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL</label>
                <input 
                  type="text" 
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#F2E266] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setLinkModalOpen(false)}
                className="flex-1 py-3 px-6 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddLink}
                disabled={!newLink.title || !newLink.url}
                className="flex-1 py-3 px-6 bg-[#F2E266] text-gray-900 rounded-2xl font-bold hover:bg-[#E3D251] transition-colors disabled:opacity-50"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Task?</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 px-6 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
              >
                No, Keep it
              </button>
              <button 
                onClick={handleDeleteTask}
                className="flex-1 py-3 px-6 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Create Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create New Task</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Task Title</label>
                  <input 
                    type="text" 
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g. Research competitors"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#F2E266] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Project</label>
                  {projects.length > 0 ? (
                    <select 
                      required
                      value={newTask.projectId}
                      onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#F2E266] focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="" disabled>Select a project</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
                      No categories found. Please create a category on the Dashboard first.
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#F2E266] focus:border-transparent outline-none transition-all appearance-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newTask.title || !newTask.projectId || isUpdating}
                  className="flex-1 py-3 px-6 bg-[#F2E266] text-gray-900 rounded-2xl font-bold hover:bg-[#E3D251] transition-colors shadow-lg shadow-yellow-100 disabled:opacity-50 flex items-center justify-center"
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Create Task'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
