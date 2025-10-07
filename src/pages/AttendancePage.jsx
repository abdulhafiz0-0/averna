import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { 
  Search, 
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  X,
  AlertCircle
} from 'lucide-react';

const AttendancePage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    console.log('Modal state changed:', showReasonModal, 'Selected student:', selectedStudent);
  }, [showReasonModal, selectedStudent]);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

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

  const handleAttendance = async (studentId, isPresent) => {
    if (!isPresent) {
      // For absent students, show reason modal
      console.log('Opening reason modal for student:', studentId);
      setSelectedStudent(studentId);
      setShowReasonModal(true);
      return;
    }
    
    // For present students, record directly
    await recordAttendance(studentId, isPresent, 'Present');
  };

  const recordAttendance = async (studentId, isPresent, reasonText) => {
    try {
      await apiService.recordAttendance({
        student_id: studentId,
        date: selectedDate,
        isAbsent: !isPresent,
        reason: reasonText
      });
      
      // Refresh the students list to show updated attendance
      fetchStudents();
    } catch (err) {
      setError('Failed to record attendance');
    }
  };

  const handleReasonSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for absence');
      return;
    }
    
    await recordAttendance(selectedStudent, false, reason);
    setShowReasonModal(false);
    setReason('');
    setSelectedStudent(null);
  };

  const handleReasonCancel = () => {
    setShowReasonModal(false);
    setReason('');
    setSelectedStudent(null);
  };

  const getStudentAttendance = (student) => {
    const attendance = student.attendance?.find(a => a.date === selectedDate);
    return attendance;
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = `${student.name} ${student.surname}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !selectedCourse || student.courses.includes(parseInt(selectedCourse));
    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className={`transition-all duration-300 ${showReasonModal ? 'blur-sm' : ''}`}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="mt-1 text-sm text-gray-500">
          Record and manage student attendance
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              className="input-field"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              className="input-field"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
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
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.map((student) => {
          const attendance = getStudentAttendance(student);
          return (
            <div key={student.id} className="card">
              <div className="flex items-center justify-between">
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
                
                <div className="flex items-center space-x-2">
                  {attendance ? (
                    <div className="flex items-center">
                      {attendance.isAbsent ? (
                        <div className="flex items-center text-red-600">
                          <XCircle className="h-5 w-5 mr-1" />
                         
                        </div>
                      ) : (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-5 w-5 mr-1" />
                          
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAttendance(student.id, true)}
                        className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        
                      </button>
                      <button
                        onClick={() => handleAttendance(student.id, false)}
                        className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                       
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {attendance && attendance.reason && (
                <div className="mt-3 p-2 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Reason:</strong> {attendance.reason}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCourse ? 'Try adjusting your filters.' : 'No students are enrolled in any courses.'}
          </p>
        </div>
      )}

      {/* Summary */}
      {filteredStudents.length > 0 && (
        <div className="mt-8 card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredStudents.length}</div>
              <div className="text-sm text-gray-500">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredStudents.filter(s => {
                  const attendance = getStudentAttendance(s);
                  return attendance && !attendance.isAbsent;
                }).length}
              </div>
              <div className="text-sm text-gray-500">Present</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredStudents.filter(s => {
                  const attendance = getStudentAttendance(s);
                  return attendance && attendance.isAbsent;
                }).length}
              </div>
              <div className="text-sm text-gray-500">Absent</div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-transparent bg-opacity-10 transition-opacity" onClick={handleReasonCancel}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Mark Student as Absent
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Please provide a reason for the student's absence.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Absence
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows="3"
                    placeholder="Enter reason for absence..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleReasonSubmit}
                >
                  Mark Absent
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleReasonCancel}
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

export default AttendancePage;
