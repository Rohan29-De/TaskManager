import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface Stats {
  totalTasks: number;
  tasksByStatus: {
    'To Do': number;
    'In Progress': number;
    'Done': number;
  };
  tasksPerUser: Record<string, number>;
  overdueTasks: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardList className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overdue Tasks</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.overdueTasks}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Done */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.tasksByStatus['Done'] || 0}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.tasksByStatus['In Progress'] || 0}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* You can add more detailed charts or lists here */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
         <h2 className="text-lg font-medium text-gray-900 mb-4">Your Task Load</h2>
         <p className="text-3xl font-bold text-indigo-600">{stats.tasksPerUser[user?.id || ''] || 0}</p>
         <p className="text-gray-500 text-sm mt-1">Tasks assigned to you</p>
      </div>
    </div>
  );
};

export default Dashboard;
