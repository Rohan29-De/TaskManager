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
  project: { name: string };
}

const Projects = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
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
    } catch (err) {
      console.error(err);
    }
  };

  // Group tasks by mock "time" categories for the UI
  const displayTasks = tasks.length > 0 ? tasks : [
    { _id: '1', title: 'Finish monthly reporting', description: 'Monthly report', status: 'Done', priority: 'Medium', project: { name: 'Operations' } },
    { _id: '2', title: 'Market research', description: 'Find my keynote attached', status: 'To Do', priority: 'High', project: { name: 'Marketing' } },
    { _id: '3', title: 'Brand guidelines update', description: 'Review new colors', status: 'To Do', priority: 'Low', project: { name: 'Design' } },
  ];

  return (
    <div className="max-w-6xl mx-auto h-full flex gap-6 relative">
      
      {/* Task List */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center px-4 py-2 bg-white rounded-full text-sm font-medium border border-gray-200 shadow-sm hover:bg-gray-50 relative"
            >
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              Add filters
            </button>
            {showFilter && (
              <div className="absolute top-12 left-0 w-80 bg-white rounded-3xl shadow-xl z-20 border border-gray-100 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold">Add filters</h4>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Project', 'Deadline', 'Type', 'Assignee'].map(f => (
                    <button key={f} className="px-3 py-1.5 border border-gray-200 rounded-full text-sm font-medium flex items-center hover:bg-gray-50">
                      <span className="w-4 h-4 mr-2 bg-gray-100 rounded-sm inline-block"></span>
                      {f}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <button className="flex items-center text-sm font-medium hover:text-gray-600">
                    <Filter className="w-4 h-4 mr-2" /> Advanced search
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">
              <div className="col-span-6">This week</div>
              <div className="col-span-2 text-center">Priority</div>
              <div className="col-span-2 text-center">Team</div>
              <div className="col-span-2 text-right">Assignee</div>
            </div>

            <div className="bg-white rounded-[24px] overflow-hidden shadow-sm">
              {displayTasks.map((task: any, idx) => (
                <div 
                  key={task._id} 
                  className={clsx(
                    "grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors",
                    idx === 0 && "bg-[#FDF9DE] border-l-4 border-l-[#F2E266]"
                  )}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="col-span-6 flex items-start">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task); }}
                      className="mt-1 flex-shrink-0"
                    >
                      {task.status === 'Done' ? (
                        <CheckCircle2 className="w-5 h-5 text-[#D4B541]" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                    <div className="ml-3">
                      <h4 className={clsx("text-sm font-bold", task.status === 'Done' && "text-gray-400 line-through")}>{task.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">{task.description || `${task.project?.name || 'Project'} • Task`}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex justify-center">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      task.priority === 'High' ? "bg-[#D4B541] text-white" :
                      task.priority === 'Medium' ? "bg-[#E6DBAD] text-gray-800" :
                      "bg-[#E5E7EB] text-gray-800"
                    )}>
                      {task.priority}
                    </span>
                  </div>
                  
                  <div className="col-span-2 text-center text-sm text-gray-600">
                    {task.project?.name || (idx % 2 === 0 ? 'Marketing O2' : 'Operations')}
                  </div>
                  
                  <div className="col-span-2 flex justify-end">
                    <img className="w-8 h-8 rounded-full border-2 border-white shadow-sm" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${idx}`} alt="Assignee" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Modal Overaly */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] flex overflow-hidden shadow-2xl relative">
            
            <button onClick={() => setSelectedTask(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 z-10">
              <X className="w-6 h-6" />
            </button>

            {/* Left Pane - Meta */}
            <div className="w-1/3 bg-[#F9FAFB] p-8 border-r border-gray-100 flex flex-col">
              <div className="flex space-x-4 mb-8 text-gray-500">
                <button className="hover:text-gray-900"><CheckCircle2 className="w-5 h-5" /></button>
                <button className="hover:text-gray-900"><Paperclip className="w-5 h-5" /></button>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{selectedTask.title}</h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                {selectedTask.description || "Fill out the monthly report, so everyone in the company is happy and see your productivity!"}
              </p>
              
              <h3 className="font-bold text-gray-900 mb-4">Info</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center"><span className="w-4 h-4 mr-2 bg-gray-200 rounded-sm"></span> Type</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">Report</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center"><span className="w-4 h-4 mr-2 bg-gray-200 rounded-sm"></span> Priority</span>
                  <span className={clsx("px-3 py-1 rounded-full font-medium", 
                    selectedTask.priority === 'High' ? "bg-[#D4B541] text-white" :
                    selectedTask.priority === 'Medium' ? "bg-[#FDF9DE] text-[#D4B541]" : "bg-gray-100"
                  )}>{selectedTask.priority}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center"><span className="w-4 h-4 mr-2 bg-gray-200 rounded-sm"></span> Deadline</span>
                  <span className="font-medium text-gray-900">{selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'MMM d') : 'Empty'}</span>
                </div>
              </div>
            </div>

            {/* Right Pane - Content */}
            <div className="w-2/3 p-8 bg-white flex flex-col overflow-y-auto">
              <div className="flex items-start mb-8">
                <img className="w-10 h-10 rounded-full mr-4" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Felix" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-gray-900">Felixovic</h4>
                    <span className="text-xs text-gray-400">Nov 5 2022 at 12.14 PM</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Here are the numbers from the store. Add it to reporting.</p>
                  <button className="flex items-center px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50">
                    <Paperclip className="w-4 h-4 mr-2 text-gray-400" />
                    Attach
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-4">Attachments</h3>
              <div className="space-y-2 mb-8">
                {['E-commerce numbers.xls', 'SAP numbers.pptx', 'New products.doc'].map((file, i) => (
                  <div key={i} className="flex items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className={clsx(
                      "w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-white",
                      i === 0 ? "bg-green-400" : i === 1 ? "bg-red-400" : "bg-blue-400"
                    )}>
                      <span className="text-xs font-bold">{file.split('.')[1].substring(0,2).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{file}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Comment, or type / for comment" 
                  className="w-full bg-[#F5F6F8] border-none rounded-full py-3 pl-10 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2E266]"
                />
                <button className="absolute inset-y-1 right-1 w-8 h-8 bg-[#F2E266] rounded-full flex items-center justify-center hover:bg-[#E3D251] transition-colors">
                  <svg className="w-4 h-4 text-gray-900 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
