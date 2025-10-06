import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { 
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  BookOpen,
  Clock,
  GraduationCap,
  User
} from 'lucide-react';

const StudentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentDetails();
    fetchCourses();
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      const data = await apiService.getStudent(parseInt(id));
      setStudent(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load student details');
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await apiService.getCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown Course';
  };

  const handleEdit = () => {
    navigate(`/students/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || 'Student not found'}</p>
          <button
            onClick={() => navigate('/students')}
            className="mt-4 btn-primary"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/students')}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {student.name} {student.surname}
              </h1>
              <p className="text-lg text-gray-500">{student.second_name}</p>
              <p className="text-sm text-gray-400">Student ID: #{student.id}</p>
            </div>
          </div>
          <button
            onClick={handleEdit}
            className="btn-primary flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Student
          </button>
        </div>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">First Name</label>
                  <p className="text-sm text-gray-900">{student.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Name</label>
                  <p className="text-sm text-gray-900">{student.surname}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Second Name</label>
                <p className="text-sm text-gray-900">{student.second_name || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Starting Date</label>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">
                    {new Date(student.starting_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Progress */}
          <div className="card mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Progress</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Lessons Completed</label>
                <div className="flex items-center mt-1">
                  <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{student.num_lesson}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Enrolled Courses</label>
                <div className="mt-2">
                  {student.courses && student.courses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {student.courses.map((courseId) => (
                        <span
                          key={courseId}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {getCourseName(courseId)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No courses enrolled</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Total Money Paid</label>
                <div className="flex items-center mt-1">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-lg font-semibold text-gray-900">${student.total_money}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="card mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Total Records</label>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">
                    {student.attendance ? student.attendance.length : 0} records
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      {student.attendance && student.attendance.length > 0 && (
        <div className="mt-8">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Attendance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {student.attendance.slice(0, 10).map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.isAbsent 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {record.isAbsent ? 'Absent' : 'Present'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.reason || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetailsPage;
