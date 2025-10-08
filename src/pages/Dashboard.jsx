import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { formatMoneyWithSom } from '../utils/formatMoney';
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  Calendar,
  TrendingUp,
  DollarSign,
  UserCog,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Only fetch stats for admin and superadmin roles
        if (user?.role === 'admin' || user?.role === 'superadmin') {
          const statsData = await apiService.getStats();
          setStats(statsData);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load statistics');
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const statCards = [
    {
      name: 'Total Students',
      value: stats?.total_students || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Money',
      value: formatMoneyWithSom(stats?.total_money || 0),
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Monthly Money',
      value: formatMoneyWithSom(stats?.monthly_money || 0),
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
    {
      name: 'Unpaid Amount',
      value: formatMoneyWithSom(stats?.unpaid || 0),
      icon: AlertCircle,
      color: 'bg-red-500',
    },
    {
      name: 'Monthly Unpaid',
      value: formatMoneyWithSom(stats?.monthly_unpaid || 0),
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
  ];

  const teacherCards = [
    {
      name: 'My Students',
      description: 'View and manage your students',
      icon: Users,
      href: '/attendance',
      color: 'bg-blue-500',
    },
    {
      name: 'Take Attendance',
      description: 'Record student attendance',
      icon: Calendar,
      href: '/attendance',
      color: 'bg-green-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {teacherCards.map((card) => (
          <div
            key={card.name}
            className="card hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => window.location.href = card.href}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{card.name}</h3>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics section - only for admin and superadmin */}
      {(user?.role === 'admin' || user?.role === 'superadmin') && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.name} className="card">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${card.color}`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{card.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions section - only for admin and superadmin */}
      {(user?.role === 'admin' || user?.role === 'superadmin') && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = '/attendance'}
            >
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Take Attendance</h3>
                  <p className="text-sm text-gray-500">Record student attendance</p>
                </div>
              </div>
            </div>
            
            <div
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = '/students'}
            >
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Manage Students</h3>
                  <p className="text-sm text-gray-500">Add, edit, or view students</p>
                </div>
              </div>
            </div>
            
            <div
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = '/courses'}
            >
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Manage Courses</h3>
                  <p className="text-sm text-gray-500">Add, edit, or view courses</p>
                </div>
              </div>
            </div>
            
            <div
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = '/payments'}
            >
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Manage Payments</h3>
                  <p className="text-sm text-gray-500">Record and view payments</p>
                </div>
              </div>
            </div>
            
            <div
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = '/users'}
            >
              <div className="flex items-center">
                  <UserCog className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Manage Users</h3>
                  <p className="text-sm text-gray-500">Add, edit, or view users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
