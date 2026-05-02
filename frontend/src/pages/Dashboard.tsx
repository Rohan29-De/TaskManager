import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { ChevronLeft, ChevronRight, MoreVertical, Play, Pause, Plus } from 'lucide-react';
import clsx from 'clsx';

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
}

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Fetch some real tasks
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        setTasks(res.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto h-full pb-8">
      
      {/* Column 1 */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {/* Calendar Widget */}
        <div className="bento-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">March 2022</h3>
            <div className="flex space-x-2">
              <button className="text-gray-400 hover:text-gray-600"><ChevronLeft className="w-5 h-5" /></button>
              <button className="text-gray-400 hover:text-gray-600"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2 font-medium text-gray-500">
            <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
          </div>
          <div className="grid grid-cols-7 gap-y-3 text-center text-sm">
            {/* Hardcoded for visual match */}
            <div className="text-gray-300">28</div><div className="text-gray-600">1</div><div className="text-gray-600">2</div>
            <div className="w-7 h-7 mx-auto flex items-center justify-center bg-[#F2E266] rounded-full font-bold">3</div>
            <div className="text-gray-600">4</div><div className="text-gray-600">5</div><div className="text-gray-600">6</div>
            
            <div className="text-gray-600">7</div><div className="text-gray-600">8</div><div className="text-gray-600">9</div>
            <div className="text-gray-600">10</div><div className="text-gray-600">11</div><div className="text-gray-600">12</div><div className="text-gray-600">13</div>
            
            <div className="text-gray-600">14</div><div className="text-gray-600">15</div><div className="text-gray-600">16</div>
            <div className="text-gray-600">17</div><div className="text-gray-600">18</div><div className="text-gray-600">19</div><div className="text-gray-600">20</div>
            
            <div className="text-gray-600">21</div><div className="text-gray-600">22</div><div className="text-gray-600">23</div>
            <div className="text-gray-600">24</div><div className="text-gray-600">25</div><div className="text-gray-600">26</div><div className="text-gray-600">27</div>
            
            <div className="text-gray-600">28</div><div className="text-gray-600">29</div><div className="text-gray-600">30</div>
            <div className="text-gray-600">31</div><div className="text-gray-300">1</div><div className="text-gray-300">2</div><div className="text-gray-300">3</div>
          </div>
        </div>

        {/* My categories */}
        <div className="bento-card flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">My categories</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5" /></button>
          </div>
          <div className="space-y-5">
            {[
              { icon: '💼', name: 'Work', users: [1,2] },
              { icon: '👥', name: 'Family', users: [3,4,5] },
              { icon: '🎨', name: 'Freelance work 01', users: [1,6] },
              { icon: '📅', name: 'Conference planning', users: [7] },
            ].map((cat, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center text-sm font-medium">
                  <span className="w-8 flex justify-center text-gray-500">{cat.icon}</span>
                  <span className="text-gray-700">{cat.name}</span>
                </div>
                <div className="flex -space-x-2">
                  {cat.users.map((u, j) => (
                    <img key={j} className="w-6 h-6 rounded-full border-2 border-white" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u}`} alt="" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 flex items-center text-sm font-bold text-gray-900">
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
            {/* Mix of static and dynamic for visual appeal */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full border-2 border-[#F2E266] bg-[#F2E266] flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-400 line-through text-sm font-medium">Finish monthly reporting</span>
              </div>
              <span className="text-sm font-bold text-[#D4B541]">Today</span>
            </div>

            {tasks.map((task, i) => (
              <div key={task._id || i} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-center">
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 mr-3",
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
                <span className={clsx("text-sm font-medium", i < 2 ? "text-[#D4B541]" : "text-gray-500")}>
                  {i < 2 ? 'Today' : 'Tomorrow'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* My Tracking */}
        <div className="bento-card flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">My tracking</h3>
          </div>
          
          <div className="space-y-2">
            {[
              { name: 'Create wireframe', time: '1h 25m 30s', active: true },
              { name: 'Slack logo design', time: '30m 18s', active: false },
              { name: 'Dashboard design', time: '1h 48m 22s', active: false },
              { name: 'Create wireframe', time: '17m 1s', active: false },
              { name: 'Mood tracker', time: '15h 5m 58s', active: false },
            ].map((track, i) => (
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
                  <span className={clsx("text-sm", track.active ? "font-bold text-gray-900" : "font-medium text-gray-500")}>{track.time}</span>
                  {track.active ? (
                    <button className="w-8 h-8 rounded-full bg-[#F2E266] flex items-center justify-center shadow-sm">
                      <Pause className="w-4 h-4 text-gray-900" fill="currentColor" />
                    </button>
                  ) : (
                    <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400">
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
      
    </div>
  );
};

export default Dashboard;
