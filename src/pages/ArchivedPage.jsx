import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { formatMoneyWithSom } from '../utils/formatMoney';
import { 
  Users, 
  Search, 
  Archive,
  User,
  Calendar,
  DollarSign,
  BookOpen,
  Eye,
  Clock,
  GraduationCap,
  RotateCcw
} from 'lucide-react';

const ArchivedPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArchivedStudents();
  }, []);

  const fetchArchivedStudents = async () => {
    try {
      const data = await apiService.getArchivedStudents();
      setStudents(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load archived students');
      setLoading(false);
    }
  };

  const handleRestore = async (studentId) => {
    try {
      await apiService.updateStudent(studentId, { is_archived: false });
      setStudents(prev => prev.filter(student => student.id !== studentId));
    } catch (err) {
      setError('Failed to restore student');
    }
  };

  const getCourseName = (courseId) => {
    // This would need to be fetched from courses API
    return `Course ${courseId}`;
  };

  const filteredStudents = students.filter(student =>
    `${student.name} ${student.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchArchivedStudents}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Archive className="h-8 w-8 mr-3 text-orange-500" />
          Archived Students
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage archived student records
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search archived students..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.map((student) => (
          <div key={student.id} className="card border-l-4 border-orange-500 bg-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Archive className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {student.name} {student.surname}
                  </h3>
                  <p className="text-sm text-gray-500">{student.second_name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRestore(student.id)}
                  className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restore
                </button>
                <button
                  onClick={() => navigate(`/students/${student.id}`)}
                  className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                Started: {new Date(student.starting_date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                Lessons: {student.num_lesson}
              </div>
              <div className={`flex items-center text-sm ${student.total_money < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                <DollarSign className="h-4 w-4 mr-2" />
                {student.total_money < 0 ? 'Debt' : 'Total'}: {formatMoneyWithSom(student.total_money)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <BookOpen className="h-4 w-4 mr-2" />
                Courses: {student.courses.length}
              </div>
            </div>

            {student.courses.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {student.courses.map((courseId) => (
                    <span
                      key={courseId}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                    >
                      {getCourseName(courseId)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No archived students found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'No students have been archived yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ArchivedPage;
