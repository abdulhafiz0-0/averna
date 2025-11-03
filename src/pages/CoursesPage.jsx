import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { formatMoneyWithSom } from '../utils/formatMoney';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  BookOpen,
  Calendar,
  DollarSign,
  Clock,
  Users,
  Eye,
  UserPlus,
  AlertCircle,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [selectedCourseForAssign, setSelectedCourseForAssign] = useState('');
  const [showUnassignedStudents, setShowUnassignedStudents] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    week_days: [],
    lesson_per_month: '',
    cost: ''
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await apiService.getCourses();
      setCourses(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load courses');
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await apiService.getStudents();
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const getStudentCount = (courseId) => {
    return students.filter(student => student.courses.includes(courseId)).length;
  };

  const getUnassignedStudents = () => {
    return students.filter(student => !student.courses || student.courses.length === 0);
  };

  const handleAssignToCourse = (student) => {
    setAssigningStudent(student);
    setSelectedCourseForAssign('');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedCourseForAssign || !assigningStudent) {
      setError('Please select a course');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const studentData = {
        name: assigningStudent.name,
        surname: assigningStudent.surname,
        second_name: assigningStudent.second_name,
        starting_date: assigningStudent.starting_date,
        num_lesson: assigningStudent.num_lesson,
        total_money: assigningStudent.total_money,
        courses: [parseInt(selectedCourseForAssign)]
      };

      await apiService.updateStudent(assigningStudent.id, studentData);
      setShowAssignModal(false);
      setAssigningStudent(null);
      setSelectedCourseForAssign('');
      fetchStudents();
    } catch (err) {
      setError('Failed to assign student to course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Convert string values to numbers for API
      const courseData = {
        ...formData,
        lesson_per_month: parseInt(formData.lesson_per_month) || 0,
        cost: parseFloat(formData.cost) || 0
      };

      if (editingCourse) {
        await apiService.updateCourse(editingCourse.id, courseData);
      } else {
        await apiService.createCourse(courseData);
      }
      setShowModal(false);
      setEditingCourse(null);
      setFormData({
        name: '',
        week_days: [],
        lesson_per_month: '',
        cost: ''
      });
      fetchCourses();
    } catch (err) {
      setError('Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      week_days: course.week_days,
      lesson_per_month: course.lesson_per_month.toString(),
      cost: course.cost.toString()
    });
    setShowModal(true);
  };

  const handleViewDetails = (course) => {
    navigate(`/courses/${course.id}`);
  };

  const handleDelete = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (courseToDelete) {
      setDeleting(true);
      try {
        await apiService.deleteCourse(courseToDelete.id);
        fetchCourses();
        setShowDeleteModal(false);
        setCourseToDelete(null);
      } catch (err) {
        setError('Failed to delete course');
      } finally {
        setDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
  };

  const handleDayChange = (day) => {
    setFormData(prev => ({
      ...prev,
      week_days: prev.week_days.includes(day)
        ? prev.week_days.filter(d => d !== day)
        : [...prev.week_days, day]
    }));
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      week_days: [],
      lesson_per_month: '',
      cost: ''
    });
    setEditingCourse(null);
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className={`transition-all duration-300 ${showModal ? 'blur-sm' : ''}`}>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage course information and pricing
            </p>
          </div>
          <button
            onClick={() => {
              resetFormData();
              setShowModal(true);
            }}
            className="mt-4 sm:mt-0 btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Unassigned Students Card */}
      {getUnassignedStudents().length > 0 && (
        <div className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-orange-900">
                  Unassigned Students
                </h3>
                <p className="text-sm text-orange-700">
                  {getUnassignedStudents().length} student{getUnassignedStudents().length !== 1 ? 's' : ''} not assigned to any course
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUnassignedStudents(!showUnassignedStudents)}
              className="ml-4 p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
              title={showUnassignedStudents ? "Collapse" : "Expand"}
            >
              {showUnassignedStudents ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>

          {showUnassignedStudents && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getUnassignedStudents().map((student) => (
              <div key={student.id} className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {student.name} {student.surname}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">{student.second_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssignToCourse(student)}
                    className="ml-2 flex-shrink-0 p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                    title="Assign to Course"
                  >
                    <UserPlus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* Courses List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <div key={course.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-500">{formatMoneyWithSom(course.cost)} per month</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(course)}
                  className="text-blue-600 hover:text-blue-700"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(course)}
                  className="text-primary-600 hover:text-primary-700"
                  title="Edit Course"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(course)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete Course"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2 text-primary-600" />
                <span className="font-semibold text-primary-700">{getStudentCount(course.id)} students</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                {course.lesson_per_month} lessons per month
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                Days: {course.week_days.join(', ')}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="h-4 w-4 mr-2" />
                Cost: {formatMoneyWithSom(course.cost)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new course.'}
          </p>
        </div>
      )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-transparent bg-opacity-10 transition-opacity" onClick={() => {
              resetFormData();
              setShowModal(false);
            }} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Course Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Lessons per Month</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.lesson_per_month}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers and empty string
                          if (value === '' || /^\d+$/.test(value)) {
                            setFormData({...formData, lesson_per_month: value});
                          }
                        }}
                        placeholder="Enter number of lessons per month"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cost</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.cost}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers, decimal point, and empty string
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setFormData({...formData, cost: value});
                          }
                        }}
                        placeholder="Enter course cost"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Week Days</label>
                      <div className="grid grid-cols-2 gap-2">
                        {weekDays.map((day) => (
                          <label key={day} className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              checked={formData.week_days.includes(day)}
                              onChange={() => handleDayChange(day)}
                            />
                            <span className="ml-2 text-sm text-gray-700">{day}</span>
                          </label>
                        ))}
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
                        {editingCourse ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : (
                      editingCourse ? 'Update' : 'Create'
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
      {showDeleteModal && courseToDelete && (
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
                      Delete Course
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete <strong>{courseToDelete.name}</strong>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={deleting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={confirmDelete}
                >
                  {deleting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    'Delete'
                  )}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign to Course Modal */}
      {showAssignModal && assigningStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-transparent bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => {
              setShowAssignModal(false);
              setAssigningStudent(null);
              setSelectedCourseForAssign('');
            }} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-gray-900">
                      Assign {assigningStudent.name} {assigningStudent.surname} to Course
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Select a course to enroll this student
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="mt-4">
                  {courses.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No courses available.</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                      {courses.map((course) => (
                        <label
                          key={course.id}
                          className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                            selectedCourseForAssign === course.id.toString() ? 'bg-primary-50 border-primary-200' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="course"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            checked={selectedCourseForAssign === course.id.toString()}
                            onChange={() => setSelectedCourseForAssign(course.id.toString())}
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-primary-600" />
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {course.name}
                                  </p>
                                  <p className="text-xs text-gray-500">{formatMoneyWithSom(course.cost)} per month</p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {course.lesson_per_month} lessons/month
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {course.week_days.join(', ')}
                              </span>
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {getStudentCount(course.id)} students
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={submitting || !selectedCourseForAssign}
                  onClick={handleAssignSubmit}
                  className="btn-primary w-full sm:w-auto sm:ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Assigning...
                    </span>
                  ) : (
                    'Assign to Course'
                  )}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowAssignModal(false);
                    setAssigningStudent(null);
                    setSelectedCourseForAssign('');
                  }}
                  className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoursesPage;
