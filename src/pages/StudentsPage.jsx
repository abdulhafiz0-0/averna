import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  User,
  Calendar,
  DollarSign,
  BookOpen,
  Eye,
  Clock,
  GraduationCap
} from 'lucide-react';

const StudentsPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [courses, setCourses] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    second_name: '',
    starting_date: '',
    num_lesson: 0,
    total_money: 0,
    courses: []
  });

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  useEffect(() => {
    console.log('Modal state changed:', showModal);
  }, [showModal]);

  const fetchStudents = async () => {
    try {
      const data = await apiService.getStudents();
      setStudents(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load students');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await apiService.updateStudent(editingStudent.id, formData);
      } else {
        await apiService.createStudent(formData);
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormData({
        name: '',
        surname: '',
        second_name: '',
        starting_date: '',
        num_lesson: 0,
        total_money: 0,
        courses: []
      });
      fetchStudents();
    } catch (err) {
      setError('Failed to save student');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      surname: student.surname,
      second_name: student.second_name,
      starting_date: student.starting_date,
      num_lesson: student.num_lesson,
      total_money: student.total_money,
      courses: student.courses
    });
    setShowModal(true);
  };

  const handleViewDetails = (student) => {
    navigate(`/students/${student.id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await apiService.deleteStudent(id);
        fetchStudents();
      } catch (err) {
        setError('Failed to delete student');
      }
    }
  };

  const handleCourseChange = (courseId) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(id => id !== courseId)
        : [...prev.courses, courseId]
    }));
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      surname: '',
      second_name: '',
      starting_date: new Date().toISOString().split('T')[0],
      num_lesson: '',
      total_money: '',
      courses: []
    });
    setEditingStudent(null);
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown Course';
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

  return (
    <div>
      <div className={`mb-8 ${showModal ? 'blur-sm' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage student information and enrollment
            </p>
          </div>
          <button
            onClick={() => {
              console.log('Add Student button clicked');
              resetFormData();
              setShowModal(true);
            }}
            className="mt-4 sm:mt-0 btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Search */}
    <div className={`mb-6 ${showModal ? 'blur-sm' : ''}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Students List */}
      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${showModal ? 'blur-sm' : ''}`} >
        {filteredStudents.map((student) => (
          <div key={student.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {student.name} {student.surname}
                  </h3>
                  <p className="text-sm text-gray-500">{student.second_name}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(student)}
                  className="text-blue-600 hover:text-blue-700"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(student)}
                  className="text-primary-600 hover:text-primary-700"
                  title="Edit Student"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete Student"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                Started: {new Date(student.starting_date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <BookOpen className="h-4 w-4 mr-2" />
                Lessons: {student.num_lesson}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="h-4 w-4 mr-2" />
                Total: ${student.total_money}
              </div>
              <div className="text-sm text-gray-500">
                Courses: {student.courses.length}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new student.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-transparent bg-opacity-10 transition-opacity"
              onClick={() => {
                resetFormData();
                setShowModal(false);
              }} 
            />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingStudent ? 'Edit Student' : 'Add New Student'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.surname}
                          onChange={(e) => setFormData({...formData, surname: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Second Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.second_name}
                        onChange={(e) => setFormData({...formData, second_name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Starting Date</label>
                      <input
                        type="date"
                        className="input-field"
                        value={formData.starting_date}
                        onChange={(e) => setFormData({...formData, starting_date: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Lessons</label>
                        <input
                          type="number"
                          className="input-field"
                          value={formData.num_lesson}
                          onChange={(e) => setFormData({...formData, num_lesson: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Total Money</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input-field"
                          value={formData.total_money}
                          onChange={(e) => setFormData({...formData, total_money: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Courses</label>
                      <div className="space-y-2">
                        {courses.map((course) => (
                          <label key={course.id} className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              checked={formData.courses.includes(course.id)}
                              onChange={() => handleCourseChange(course.id)}
                            />
                            <span className="ml-2 text-sm text-gray-700">{course.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {editingStudent ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                    onClick={() => {
                      resetFormData();
                      setShowModal(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentsPage;
