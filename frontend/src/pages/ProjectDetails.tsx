import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, UserPlus } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  assignees: { _id: string; name: string }[];
}

interface Project {
  _id: string;
  name: string;
  admin: { _id: string; name: string };
  members: { _id: string; name: string }[];
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', status: 'To Do', dueDate: '' });
  
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get('/projects'), // We filter client side for simplicity, ideally we'd have a GET /projects/:id
        api.get(`/tasks?projectId=${id}`)
      ]);
      const proj = projRes.data.find((p: Project) => p._id === id);
      setProject(proj);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id, assignees: [user?.id] });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', status: 'To Do', dueDate: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: newMemberEmail });
      setShowMemberModal(false);
      setNewMemberEmail('');
      fetchData();
    } catch (err) {
      alert('Failed to add member. Make sure the email is registered.');
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!project) return <div className="p-8">Loading...</div>;

  const isAdmin = project.admin._id === user?.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Admin: {project.admin.name} • {project.members.length} members</p>
        </div>
        <div className="flex space-x-3">
          {isAdmin && (
            <button
              onClick={() => setShowMemberModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <UserPlus className="h-4 w-4 mr-2" /> Add Member
            </button>
          )}
          <button
            onClick={() => setShowTaskModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" /> New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['To Do', 'In Progress', 'Done'].map((status) => (
          <div key={status} className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-4">{status}</h3>
            <div className="space-y-4">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task._id} className="bg-white p-4 rounded shadow-sm border border-gray-200">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className={clsx(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      task.priority === 'High' ? "bg-red-100 text-red-800" :
                      task.priority === 'Medium' ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    )}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-500">
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                      className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modals omitted for brevity - standard implementation similar to Projects */}
      {showTaskModal && (
         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
         <div className="bg-white rounded-lg p-6 max-w-md w-full">
           <h2 className="text-xl font-bold mb-4">Create New Task</h2>
           <form onSubmit={handleCreateTask}>
             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700">Title</label>
               <input type="text" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
             </div>
             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700">Description</label>
               <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
             </div>
             <div className="mb-4 flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
             </div>
             <div className="flex justify-end space-x-3">
               <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 border rounded-md text-sm text-gray-700">Cancel</button>
               <button type="submit" className="px-4 py-2 border rounded-md text-sm text-white bg-indigo-600">Create</button>
             </div>
           </form>
         </div>
       </div>
      )}

      {showMemberModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Member by Email</h2>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" required value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div className="flex justify-end space-x-3">
               <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 border rounded-md text-sm text-gray-700">Cancel</button>
               <button type="submit" className="px-4 py-2 border rounded-md text-sm text-white bg-indigo-600">Add</button>
             </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
