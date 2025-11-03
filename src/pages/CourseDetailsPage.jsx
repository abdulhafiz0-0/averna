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
  Eye
} from 'lucide-react';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Enrolled Students</h2>

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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
};

export default CourseDetailsPage;
