import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { formatMoneyWithSom } from '../utils/formatMoney';
import {
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  BookOpen,
  Clock,
  Users,
  User,
  Eye,
  Plus,
  UserPlus,
  Search,
  UserMinus,
  X
} from 'lucide-react';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [selectedStudentsToAdd, setSelectedStudentsToAdd] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

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
    fetchCourseDetails();
    fetchAllStudents();
    fetchAllCourses();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const data = await apiService.getCourse(parseInt(id));
      setCourse(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load course details');
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const data = await apiService.getStudents();
      setAllStudents(data);
      // Filter students enrolled in this course
      const enrolledStudents = data.filter(student =>
        student.courses.includes(parseInt(id))
      );
      setStudents(enrolledStudents);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const data = await apiService.getCourses();
      setAllCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      surname: student.surname,
      second_name: student.second_name,
      starting_date: student.starting_date,
      num_lesson: student.num_lesson,
      total_money: Math.abs(student.total_money),
      courses: student.courses
    });
    setShowEditModal(true);
  };

  const handleViewStudent = (student) => {
    navigate(`/students/${student.id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const studentData = {
        ...formData,
        total_money: -Math.abs(formData.total_money)
      };

      await apiService.updateStudent(editingStudent.id, studentData);
      setShowEditModal(false);
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
      fetchAllStudents();
    } catch (err) {
      setError('Failed to update student');
    } finally {
      setSubmitting(false);
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

  const getAvailableStudents = () => {
    return allStudents.filter(student =>
      !student.courses.includes(parseInt(id))
    );
  };

  const getFilteredAvailableStudents = () => {
    const available = getAvailableStudents();
    if (!studentSearchTerm.trim()) {
      return available;
    }
    return available.filter(student =>
      `${student.name} ${student.surname} ${student.second_name}`.toLowerCase().includes(studentSearchTerm.toLowerCase())
    );
  };

  const handleToggleStudentSelection = (studentId) => {
    setSelectedStudentsToAdd(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAddStudents = async () => {
    if (selectedStudentsToAdd.length === 0) {
      setError('Please select at least one student');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Update each selected student to add this course
      const updatePromises = selectedStudentsToAdd.map(async (studentId) => {
        const student = allStudents.find(s => s.id === studentId);
        if (!student) return;

        const updatedCourses = [...student.courses, parseInt(id)];
        await apiService.updateStudent(studentId, {
          name: student.name,
          surname: student.surname,
          second_name: student.second_name,
          starting_date: student.starting_date,
          num_lesson: student.num_lesson,
          total_money: student.total_money,
          courses: updatedCourses
        });
      });

      await Promise.all(updatePromises);

      setShowAddStudentsModal(false);
      setSelectedStudentsToAdd([]);
      setStudentSearchTerm('');
      fetchAllStudents();
    } catch (err) {
      setError('Failed to add students to course');
      console.error('Error adding students:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = (student) => {
    setStudentToRemove(student);
    setShowRemoveModal(true);
  };

  const confirmRemoveStudent = async () => {
    if (!studentToRemove) return;

    setSubmitting(true);
    setError('');

    try {
      // Remove this course from the student's courses array
      const updatedCourses = studentToRemove.courses.filter(courseId => courseId !== parseInt(id));

      await apiService.updateStudent(studentToRemove.id, {
        name: studentToRemove.name,
        surname: studentToRemove.surname,
        second_name: studentToRemove.second_name,
        starting_date: studentToRemove.starting_date,
        num_lesson: studentToRemove.num_lesson,
        total_money: studentToRemove.total_money,
        courses: updatedCourses
      });

      setShowRemoveModal(false);
      setStudentToRemove(null);
      fetchAllStudents();
    } catch (err) {
      setError('Failed to remove student from course');
      console.error('Error removing student:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRemoveStudent = () => {
    setShowRemoveModal(false);
    setStudentToRemove(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 btn-primary"
          >
            Back to Courses
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
            onClick={() => navigate('/courses')}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
              <p className="mt-1 text-lg text-gray-600">{formatMoneyWithSom(course.cost)} per month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details Card */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Lessons per Month</p>
              <p className="text-lg font-medium text-gray-900">{course.lesson_per_month}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Monthly Cost</p>
              <p className="text-lg font-medium text-gray-900">{formatMoneyWithSom(course.cost)}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Schedule</p>
              <p className="text-lg font-medium text-gray-900">{course.week_days.join(', ')}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Enrolled Students</p>
              <p className="text-lg font-medium text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Enrolled Students</h2>
          {getAvailableStudents().length > 0 && (
            <button
              onClick={() => {
                setSelectedStudentsToAdd([]);
                setStudentSearchTerm('');
                setShowAddStudentsModal(true);
              }}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Students
            </button>
          )}
        </div>

        {students.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled</h3>
            <p className="text-gray-500">There are no students enrolled in this course yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {student.name} {student.surname}
                      </h3>
                      <p className="text-sm text-gray-500">{student.second_name}</p>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          Started: {new Date(student.starting_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Lessons: {student.num_lesson}
                        </div>
                        <div className={`flex items-center text-sm font-medium ${
                          -student.total_money > 0
                            ? 'text-red-600'
                            : -student.total_money < 0
                              ? 'text-green-600'
                              : 'text-gray-600'
                        }`}>
                          <DollarSign className="h-4 w-4 mr-1" />
                          Balance: {formatMoneyWithSom(-student.total_money)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleViewStudent(student)}
                      className="text-blue-600 hover:text-blue-700"
                      title="View Student Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="text-primary-600 hover:text-primary-700"
                      title="Edit Student"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleRemoveStudent(student)}
                      className="text-red-600 hover:text-red-700"
                      title="Remove from Course"
                    >
                      <UserMinus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Students Modal */}
      {showAddStudentsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-transparent bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => {
              setShowAddStudentsModal(false);
              setSelectedStudentsToAdd([]);
              setStudentSearchTerm('');
            }} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-gray-900">
                      Add Students to {course?.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Select students to enroll in this course
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="mt-4">
                  {getAvailableStudents().length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">All students are already enrolled in this course.</p>
                    </div>
                  ) : (
                    <>
                      {/* Search Input */}
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search students..."
                            className="input-field pl-10"
                            value={studentSearchTerm}
                            onChange={(e) => setStudentSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {selectedStudentsToAdd.length} of {getFilteredAvailableStudents().length} students selected
                          {studentSearchTerm && ` (${getAvailableStudents().length} total)`}
                        </p>
                        <button
                          onClick={() => {
                            if (selectedStudentsToAdd.length === getFilteredAvailableStudents().length) {
                              setSelectedStudentsToAdd([]);
                            } else {
                              setSelectedStudentsToAdd(getFilteredAvailableStudents().map(s => s.id));
                            }
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {selectedStudentsToAdd.length === getFilteredAvailableStudents().length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                        {getFilteredAvailableStudents().length === 0 ? (
                          <div className="text-center py-8">
                            <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No students found matching "{studentSearchTerm}"</p>
                          </div>
                        ) : (
                          getFilteredAvailableStudents().map((student) => (
                          <label
                            key={student.id}
                            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              checked={selectedStudentsToAdd.includes(student.id)}
                              onChange={() => handleToggleStudentSelection(student.id)}
                            />
                            <div className="ml-4 flex-1">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary-600" />
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {student.name} {student.surname}
                                  </p>
                                  <p className="text-xs text-gray-500">{student.second_name}</p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  {student.num_lesson} lessons
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(student.starting_date).toLocaleDateString()}
                                </span>
                                {student.courses.length > 0 && (
                                  <span className="flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    {student.courses.length} course{student.courses.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={submitting || selectedStudentsToAdd.length === 0}
                  onClick={handleAddStudents}
                  className="btn-primary w-full sm:w-auto sm:ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Students...
                    </span>
                  ) : (
                    `Add ${selectedStudentsToAdd.length} Student${selectedStudentsToAdd.length !== 1 ? 's' : ''}`
                  )}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowAddStudentsModal(false);
                    setSelectedStudentsToAdd([]);
                    setStudentSearchTerm('');
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

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-transparent bg-opacity-10 transition-opacity" onClick={() => setShowEditModal(false)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Edit Student: {editingStudent.name} {editingStudent.surname}
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
                        Courses
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                        {allCourses.map((course) => (
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
                        <label className="block text-sm font-medium text-gray-700">Total Money (Debt)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input-field"
                          value={formData.total_money}
                          onChange={(e) => setFormData({...formData, total_money: parseFloat(e.target.value) || 0})}
                        />
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
                        Updating...
                      </span>
                    ) : (
                      'Update'
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveModal && studentToRemove && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-transparent bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={cancelRemoveStudent} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <UserMinus className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Remove Student from Course
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to remove <strong>{studentToRemove.name} {studentToRemove.surname}</strong> from <strong>{course?.name}</strong>?
                        This will remove the course from the student's enrollment but will not delete the student.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={submitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={confirmRemoveStudent}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Removing...
                    </span>
                  ) : (
                    'Remove Student'
                  )}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={cancelRemoveStudent}
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

export default CourseDetailsPage;
