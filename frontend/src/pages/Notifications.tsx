import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MoreVertical, X, CheckCircle2, Circle, Paperclip, Link as LinkIcon, User, Clock, Briefcase, Flag } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
  project: { name: string };
}

const Notifications = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, []);

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
      if (selectedTask?._id === task._id) {
        setSelectedTask({ ...task, status: newStatus });
      }
    } catch (err) {
      console.error(err);
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
      {/* Notifications List */}
      <div className="w-1/2 bento-card flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Latest notifications</h3>
          <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5" /></button>
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
        <div className="w-1/2 bento-card flex flex-col relative">
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
              <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-medium">Today</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 flex items-center text-sm font-medium text-gray-500"><Briefcase className="w-4 h-4 mr-2" /> Projects</span>
              <span className="bg-gray-200 text-gray-800 px-4 py-1 rounded-full text-sm font-medium">Secret project</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 flex items-center text-sm font-medium text-gray-500"><Flag className="w-4 h-4 mr-2" /> Priority</span>
              <span className="bg-[#E6DBAD] text-gray-800 px-4 py-1 rounded-full text-sm font-medium">{selectedTask.priority}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Attachments</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center text-gray-500">
                <Paperclip className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">No attachments</span>
              </div>
              <button className="flex items-center text-sm font-bold text-gray-900">
                <Paperclip className="w-4 h-4 mr-2" /> Attach
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Links</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center text-gray-500">
                <div className="w-6 h-6 rounded-full bg-[#F2E266] flex items-center justify-center mr-3">
                  <LinkIcon className="w-3 h-3 text-gray-900" />
                </div>
                <span className="text-sm font-medium">No links</span>
              </div>
              <button className="flex items-center text-sm font-bold text-gray-900">
                <MoreVertical className="w-4 h-4 mr-1" /> Add
              </button>
            </div>
          </div>

          <div className="mt-auto pt-8 flex justify-end space-x-4">
            <button 
              onClick={async () => {
                try {
                  await api.delete(`/tasks/${selectedTask._id}`);
                  setTasks(tasks.filter(t => t._id !== selectedTask._id));
                  setSelectedTask(null);
                } catch (err) {
                  console.error(err);
                }
              }}
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
    </div>
  );
};

export default Notifications;
