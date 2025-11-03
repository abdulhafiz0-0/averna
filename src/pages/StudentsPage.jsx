import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { formatMoneyWithSom } from '../utils/formatMoney';
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
  GraduationCap,
  AlertCircle,
  UserPlus
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
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

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
    setSubmitting(true);
    setError('');

    try {
      // Send total_money as negative (debt)
      const studentData = {
        ...formData,
        total_money: -Math.abs(formData.total_money)
      };

      if (editingStudent) {
        await apiService.updateStudent(editingStudent.id, studentData);
      } else {
        await apiService.createStudent(studentData);
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
    } finally {
      setSubmitting(false);
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
      // Show as positive for editing
      total_money: Math.abs(student.total_money),
      courses: student.courses
    });
    setShowModal(true);
  };

  const handleViewDetails = (student) => {
    navigate(`/students/${student.id}`);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        await apiService.deleteStudent(studentToDelete.id);
        fetchStudents();
        setShowDeleteModal(false);
        setStudentToDelete(null);
      } catch (err) {
        setError('Failed to delete student');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const handleCourseChange = (courseId) => {
    // When creating new student, allow only one course
    if (!editingStudent) {
      setFormData(prev => ({
        ...prev,
        courses: [courseId]
      }));
    } else {
      // When editing, allow multiple courses
      setFormData(prev => ({
        ...prev,
        courses: prev.courses.includes(courseId)
          ? prev.courses.filter(id => id !== courseId)
          : [...prev.courses, courseId]
      }));
    }
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

  const getUnassignedStudents = () => {
    return students.filter(student => !student.courses || student.courses.length === 0);
  };

  // Calculate number of lessons based on course week days from starting date to today
  const calculateLessons = (startingDate, courseIds) => {
    if (!startingDate || courseIds.length === 0) return 0;

    const start = new Date(startingDate);
    const today = new Date();

    // Reset time to beginning of day for accurate comparison
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (start > today) return 0;

    let totalLessons = 0;

    // Calculate lessons for each course
    courseIds.forEach(courseId => {
      const course = courses.find(c => c.id === courseId);
      if (!course || !course.week_days || course.week_days.length === 0) return;

      // Map day names to numbers (0 = Sunday, 1 = Monday, etc.)
      const dayMap = {
        'Sunday': 0,
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6
      };

      const courseDays = course.week_days.map(day => dayMap[day]);

      // Count how many times each course day occurs between start and today
      let currentDate = new Date(start);
      while (currentDate <= today) {
        const dayOfWeek = currentDate.getDay();
        if (courseDays.includes(dayOfWeek)) {
          totalLessons++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return totalLessons;
  };

  // Calculate total money based on lessons and course cost
  const calculateMoney = (numLessons, courseIds) => {
    if (!numLessons || courseIds.length === 0) return 0;

    let totalCost = 0;

    courseIds.forEach(courseId => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      // Calculate cost per lesson for this course
      const costPerLesson = course.lesson_per_month > 0
        ? course.cost / course.lesson_per_month
        : 0;

      // Calculate how many lessons are for this specific course
      const courseLessons = calculateLessons(formData.starting_date, [courseId]);
      totalCost += courseLessons * costPerLesson;
    });

    return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
  };

  // Auto-calculate when starting date or courses change
  useEffect(() => {
    if (formData.starting_date && formData.courses.length > 0 && !editingStudent) {
      const calculatedLessons = calculateLessons(formData.starting_date, formData.courses);
      const calculatedMoney = calculateMoney(calculatedLessons, formData.courses);

      setFormData(prev => ({
        ...prev,
        num_lesson: calculatedLessons,
        total_money: calculatedMoney
      }));
    }
  }, [formData.starting_date, formData.courses, courses]);

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
                  onClick={() => handleDelete(student)}
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
              <div className={`flex items-center text-sm font-medium ${
                -student.total_money > 0
                  ? 'text-red-600'
                  : -student.total_money < 0
                    ? 'text-green-600'
                    : 'text-gray-500'
              }`}>
                <DollarSign className="h-4 w-4 mr-2" />
                Balance: {formatMoneyWithSom(-student.total_money)}
                {-student.total_money > 0 && <span className="ml-1 text-xs">(Debt)</span>}
                {-student.total_money < 0 && <span className="ml-1 text-xs">(Credit)</span>}
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
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {editingStudent ? 'Courses' : 'Course'} <span className="text-red-500">*</span>
                      </label>
                      {!editingStudent ? (
                        // For new students: single course selection with radio buttons
                        <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                          {courses.map((course) => (
                            <label key={course.id} className="flex items-center hover:bg-white p-3 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-primary-200">
                              <input
                                type="radio"
                                name="course"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                checked={formData.courses.includes(course.id)}
                                onChange={() => handleCourseChange(course.id)}
                                required
                              />
                              <span className="ml-3 text-sm font-medium text-gray-700">{course.name}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        // For editing students: multiple course selection with checkboxes
                        <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                          {courses.map((course) => (
                            <label key={course.id} className="flex items-center hover:bg-gray-50 p-2 rounded">
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
                      )}
                    </div>

                    {formData.starting_date && formData.courses.length > 0 && !editingStudent && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                          <span className="inline-flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Automatic Calculation Reference
                          </span>
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-blue-700 mb-1">Calculated Lessons</label>
                            <div className="text-2xl font-bold text-blue-900">{formData.num_lesson}</div>
                            <p className="text-xs text-blue-600 mt-1">From start date to today</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-blue-700 mb-1">Total Debt</label>
                            <div className="text-2xl font-bold text-blue-900">{formatMoneyWithSom(formData.total_money)}</div>
                            <p className="text-xs text-blue-600 mt-1">Based on course rates</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Lessons</label>
                        <input
                          type="number"
                          className="input-field"
                          value={formData.num_lesson}
                          onChange={(e) => setFormData({...formData, num_lesson: parseInt(e.target.value) || 0})}
                          placeholder="Enter number of lessons"
                        />
                        <p className="text-xs text-gray-500 mt-1">You can adjust the calculated value</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Total Money (Debt)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input-field"
                          value={formData.total_money}
                          onChange={(e) => setFormData({...formData, total_money: parseFloat(e.target.value) || 0})}
                          placeholder="Enter total debt"
                        />
                        <p className="text-xs text-gray-500 mt-1">Will be saved as negative (debt)</p>
                      </div>
                    </div>
                    
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full sm:w-auto sm:ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingStudent ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : (
                      editingStudent ? 'Update' : 'Create'
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-transparent bg-opacity-10 transition-opacity" onClick={cancelDelete} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Student
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete <strong>{studentToDelete.name} {studentToDelete.surname}</strong>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentsPage;
