import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  Clock,
  GraduationCap
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch stats for admin and superadmin roles
        if (user?.role === 'admin' || user?.role === 'superadmin') {
          const statsData = await apiService.getStats();
          setStats(statsData);
        }
        
        // Fetch courses and students for teachers
        if (user?.role === 'teacher') {
          console.log('Fetching courses and students for teacher...');
          const [coursesData, studentsData] = await Promise.all([
            apiService.getCourses(),
            apiService.getStudents()
          ]);
          console.log('Fetched courses:', coursesData);
          console.log('Fetched students:', studentsData);
          setCourses(coursesData);
          setStudents(studentsData);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Get today's day name as string
  const getTodayDayName = () => {
    const today = new Date();
    const dayNumber = today.getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  // Get readable week days for a course (already in string format)
  const getCourseWeekDays = (course) => {
    if (!course.week_days || !Array.isArray(course.week_days)) return 'No schedule';
    return course.week_days.join(', ');
  };

  // Check if today is in the course's week_days list
  const isTodayInCourseWeekDays = (course) => {
    console.log('Course week days:', course.week_days);
    console.log('Today day:', getTodayDayName());
    if (!course.week_days || !Array.isArray(course.week_days)) return false;
    const todayDayName = getTodayDayName();
    return course.week_days.includes(todayDayName);
  };

  // Get teacher's courses that have today in their week_days
  // Note: API already returns only courses assigned to the teacher
  const getTeacherCourses = () => {
   
    
    if (!courses.length) {
     
      return [];
    }
    
    const todayDayName = getTodayDayName();
    
    
    const teacherCourses = courses.filter(course => {
      const isTodayScheduled = isTodayInCourseWeekDays(course);
      
      console.log(`Course "${course.name}":`, {
        courseId: course.id,
        week_days: course.week_days,
        week_days_readable: getCourseWeekDays(course),
        isTodayScheduled: isTodayScheduled
      });
      
      return isTodayScheduled;
    });
    
    
    return teacherCourses;
  };

  // Handle course click - navigate to attendance page with pre-selected course
  const handleCourseClick = (courseId) => {
    navigate(`/attendance?course=${courseId}`);
  };

  // Get teacher statistics
  const getTeacherStats = () => {
   

    const teacherCoursesToday = getTeacherCourses();

    // Calculate total students enrolled in teacher's courses
    const filteredStudents = students.filter(student => {
      const hasMatchingCourse = student.courses && student.courses.some(courseId =>
        courses.some(course => course.id === courseId)
      );
      
      return hasMatchingCourse;
    });

   

    return {
      totalCourses: courses.length, // All courses assigned to this teacher
      totalStudents: filteredStudents.length,
      coursesToday: teacherCoursesToday.length // Only courses scheduled for today
    };
  };

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

      

      

      {/* Teacher Stats section - only for teachers */}
      {user?.role === 'teacher' && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Statistics</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-blue-500">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Courses</p>
                  <p className="text-2xl font-semibold text-gray-900">{getTeacherStats().totalCourses}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-green-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-900">{getTeacherStats().totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-purple-500">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Courses Today</p>
                  <p className="text-2xl font-semibold text-gray-900">{getTeacherStats().coursesToday}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Courses section - only for teachers */}
      {user?.role === 'teacher' && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Courses</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getTeacherCourses().map((course) => (
              <div
                key={course.id}
                className="card hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-blue-500 group-hover:bg-blue-600 transition-colors">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {course.name}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.lesson_per_month} lessons/month
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatMoneyWithSom(course.cost)}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      <strong>Schedule:</strong> {getCourseWeekDays(course)}
                    </div>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
          {getTeacherCourses().length === 0 && (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses today</h3>
              
            </div>
          )}
        </div>
      )}

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
              onClick={() => navigate('/attendance')}
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
              onClick={() => navigate('/students')}
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
              onClick={() => navigate('/courses')}
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
              onClick={() => navigate('/payments')}
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
              onClick={() => navigate('/users')}
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
