import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { 
  Search, 
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Info,
  Loader,
  Save,
  RotateCcw,
  DollarSign,
  UserX,
  Pencil
} from 'lucide-react';

const AttendancePage = () => {
  const [searchParams] = useSearchParams();
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
  const [absentType, setAbsentType] = useState('unexcused'); // 'excused' or 'unexcused'
  const [reason, setReason] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateAttendanceData, setUpdateAttendanceData] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  useEffect(() => {
    const courseParam = searchParams.get('course');
    if (courseParam) {
      setSelectedCourse(courseParam);
    }
  }, [searchParams]);

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

  const getStudentAttendance = (student) => {
    if (!selectedCourse) return null;
    return student.attendance?.find(a => 
      a.date === selectedDate && a.course_id === parseInt(selectedCourse)
    );
  };

  const handleBatchAttendance = (studentId, status) => {
    const student = students.find(s => s.id === studentId);
    const existingAttendance = getStudentAttendance(student);
    
    if (existingAttendance) {
      setError('This student already has attendance recorded for this date. Use the Edit button to modify it.');
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (status === 'absent') {
      // Show modal to choose excused or unexcused
      setSelectedStudent(studentId);
      setShowReasonModal(true);
      setAbsentType('unexcused');
      setReason('');
    } else {
      // Present
      setAttendanceData(prev => ({
        ...prev,
        [studentId]: {
          status: 'present',
          isAbsent: false,
          charge_money: true,
          reason: 'Present'
        }
      }));
    }
  };

  const handleReasonSubmit = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for absence');
      return;
    }

    setAttendanceData(prev => ({
      ...prev,
      [selectedStudent]: {
        status: absentType === 'excused' ? 'absent-excused' : 'absent-unexcused',
        isAbsent: true,
        charge_money: absentType === 'unexcused',
        reason: reason
      }
    }));

    setShowReasonModal(false);
    setReason('');
    setSelectedStudent(null);
    setError('');
  };

  const handleReasonCancel = () => {
    setShowReasonModal(false);
    setReason('');
    setSelectedStudent(null);
    setAbsentType('unexcused');
    setError('');
  };

  const handleBatchReasonChange = (studentId, reason) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason
      }
    }));
  };

  const getBatchAttendanceStatus = (studentId) => {
    return attendanceData[studentId] || null;
  };

  const saveBatchAttendance = async () => {
    if (!selectedCourse) {
      setError('Please select a course first');
      return;
    }

    const attendanceEntries = Object.entries(attendanceData);
    if (attendanceEntries.length === 0) {
      setError('No attendance data to save');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const attendancePromises = attendanceEntries.map(([studentId, data]) => 
        apiService.recordAttendance({
          student_id: parseInt(studentId),
          course_id: parseInt(selectedCourse),
          date: selectedDate,
          isAbsent: data.isAbsent,
          reason: data.reason,
          charge_money: data.charge_money
        })
      );

      await Promise.all(attendancePromises);

      // Refresh data
      await fetchStudents();
      
      setAttendanceData({});
      setSuccessMessage(`Attendance saved successfully for ${attendanceEntries.length} student(s)!`);
      setTimeout(() => setSuccessMessage(''), 4000);

    } catch (err) {
      setError('Failed to save attendance. Please try again.');
      console.error('Save attendance error:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetBatchAttendance = () => {
    setAttendanceData({});
    setError('');
  };

  const handleEditAttendance = (student, currentAttendance) => {
    // Determine current status based on isAbsent and charge_money (we need to infer from reason or other logic)
    let currentStatus = 'present';
    if (currentAttendance.isAbsent) {
      // Check if it was excused or unexcused based on reason or charge_money
      // Since we don't have charge_money in the response, we'll need to infer
      currentStatus = 'absent-unexcused'; // Default assumption
    }

    setUpdateAttendanceData({
      studentId: student.id,
      studentName: `${student.name} ${student.surname}`,
      currentStatus: currentStatus,
      newStatus: 'present',
      currentReason: currentAttendance.reason || '',
      newReason: '',
      date: currentAttendance.date,
      courseId: currentAttendance.course_id,
      newChargeMoney: true,
      newIsAbsent: false
    });
    setShowUpdateModal(true);
  };

  const handleUpdateStatusChange = (newStatus) => {
    setUpdateAttendanceData(prev => ({
      ...prev,
      newStatus: newStatus,
      newIsAbsent: newStatus !== 'present',
      newChargeMoney: newStatus === 'present' || newStatus === 'absent-unexcused',
      newReason: newStatus === 'present' ? 'Present' : prev.newReason
    }));
  };

  const submitUpdateAttendance = async () => {
    if (!updateAttendanceData) return;
    
    if (updateAttendanceData.newStatus !== 'present' && !updateAttendanceData.newReason.trim()) {
      setError('Please provide a reason for absence');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await apiService.updateAttendance(updateAttendanceData.studentId, {
        date: updateAttendanceData.date,
        course_id: updateAttendanceData.courseId,
        isAbsent: updateAttendanceData.newIsAbsent,
        reason: updateAttendanceData.newReason || 'Present',
        charge_money: updateAttendanceData.newChargeMoney
      });

      await fetchStudents();
      
      setShowUpdateModal(false);
      setUpdateAttendanceData(null);
      setSuccessMessage(`Attendance updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to update attendance');
      console.error('Update attendance error:', err);
    } finally {
      setSaving(false);
    }
  };

  const hasAttendanceBeenTaken = () => {
    if (!selectedCourse) return false;
    // Check if ALL students have attendance taken
    return filteredStudents.every(student => getStudentAttendance(student) !== undefined);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = `${student.name} ${student.surname}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse && student.courses.includes(parseInt(selectedCourse));
    return matchesSearch && matchesCourse;
  });

  const presentCount = filteredStudents.filter(s => {
    const attendance = getStudentAttendance(s);
    return attendance && !attendance.isAbsent;
  }).length;

  const absentCount = filteredStudents.filter(s => {
    const attendance = getStudentAttendance(s);
    return attendance && attendance.isAbsent;
  }).length;

  const pendingCount = filteredStudents.filter(s => !getStudentAttendance(s)).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-600">Loading attendance data...</p>
      </div>
    );
  }

  return (
    <>
      <div className={`transition-all duration-300 ${(showReasonModal || showUpdateModal) ? 'blur-sm pointer-events-none' : ''}`}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="mt-2 text-gray-600">
            Record and track student attendance efficiently
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 flex items-start animate-fadeIn">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">{successMessage}</div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex items-start animate-shake">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Info Banner */}
        <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">Attendance Types:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  <strong>Present:</strong> Student attended, money is deducted
                </li>
                <li className="flex items-center">
                  <UserX className="h-4 w-4 mr-2 text-orange-600" />
                  <strong>Absent Excused:</strong> Valid reason, no money deducted
                </li>
                <li className="flex items-center">
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                  <strong>Absent Unexcused:</strong> No valid reason, money is still deducted
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            {/* Course Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-colors ${
                  !selectedCourse 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-green-300 focus:ring-green-500 focus:border-green-500'
                }`}
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setAttendanceData({});
                  setError('');
                }}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              {!selectedCourse && (
                <p className="text-xs mt-1.5 text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Required to view students
                </p>
              )}
            </div>
            
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline h-4 w-4 mr-1" />
                Search Students
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Course Info Badge */}
          {selectedCourse && (
            <div className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
              <Info className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                {courses.find(c => c.id === parseInt(selectedCourse))?.name}
              </span>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {filteredStudents.length > 0 && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{filteredStudents.length}</p>
                </div>
                <User className="h-10 w-10 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Present</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{presentCount}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Absent</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{absentCount}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
                </div>
                <Clock className="h-10 w-10 text-yellow-400" />
              </div>
            </div>
          </div>
        )}

        {/* Students List */}
        <div className="space-y-3">
          {filteredStudents.map((student) => {
            const batchStatus = getBatchAttendanceStatus(student.id);
            const existingAttendance = getStudentAttendance(student);
            
            return (
              <div 
                key={student.id} 
                className={`rounded-lg shadow-sm border transition-all ${
                  existingAttendance 
                    ? existingAttendance.isAbsent
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                    : batchStatus 
                      ? 'bg-blue-50/30 border-blue-300' 
                      : 'bg-white border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    {/* Student Info */}
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-semibold text-white ${
                          existingAttendance 
                            ? existingAttendance.isAbsent 
                              ? 'bg-red-500' 
                              : 'bg-green-500'
                            : batchStatus
                              ? batchStatus.status === 'present'
                                ? 'bg-green-400'
                                : batchStatus.status === 'absent-excused'
                                  ? 'bg-orange-400'
                                  : 'bg-red-400'
                              : 'bg-gray-400'
                        }`}>
                          {student.name.charAt(0)}{student.surname.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {student.name} {student.surname}
                        </h3>
                        <p className="text-sm text-gray-500">{student.second_name}</p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      {existingAttendance ? (
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                            existingAttendance.isAbsent 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {existingAttendance.isAbsent ? (
                              <>
                                <XCircle className="h-5 w-5 mr-2" />
                               
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-5 w-5 mr-2" />
                                
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => handleEditAttendance(student, existingAttendance)}
                            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Pencil className="h-4 w-4 inline mr-1" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleBatchAttendance(student.id, 'present')}
                            className={`flex items-center px-5 py-2.5 rounded-lg font-medium transition-all ${
                              batchStatus?.status === 'present'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                            }`}
                          >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            
                          </button>
                          <button
                            onClick={() => handleBatchAttendance(student.id, 'absent')}
                            className={`flex items-center px-5 py-2.5 rounded-lg font-medium transition-all ${
                              batchStatus?.isAbsent
                                ? 'bg-red-600 text-white shadow-md'
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            }`}
                          >
                            <XCircle className="h-5 w-5 mr-2" />
                            
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Badge for Batch */}
                  {batchStatus && !existingAttendance && (
                    <div className="mt-4">
                      {batchStatus.status === 'absent-excused' && (
                        <div className="flex items-center px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                          <UserX className="h-4 w-4 text-orange-600 mr-2" />
                          <span className="text-sm font-medium text-orange-700">
                            Absent Excused (No charge)
                          </span>
                        </div>
                      )}
                      {batchStatus.status === 'absent-unexcused' && (
                        <div className="flex items-center px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                          <DollarSign className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-sm font-medium text-red-700">
                            Absent Unexcused (Will be charged)
                          </span>
                        </div>
                      )}
                      {batchStatus.status === 'present' && (
                        <div className="flex items-center px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                          <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-700">
                            Present (Will be charged)
                          </span>
                        </div>
                      )}
                      {batchStatus.reason && batchStatus.reason !== 'Present' && (
                        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong className="font-medium">Reason:</strong> {batchStatus.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Existing Attendance Reason */}
                  {existingAttendance && existingAttendance.isAbsent && existingAttendance.reason && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong className="font-medium">Reason:</strong> {existingAttendance.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Batch Save Controls */}
        {filteredStudents.length > 0 && !hasAttendanceBeenTaken() && Object.keys(attendanceData).length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Save className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ready to Save
                  </h3>
                  <p className="text-sm text-gray-600">
                    {Object.keys(attendanceData).length} student(s) marked for attendance
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={resetBatchAttendance}
                  disabled={saving}
                  className="flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </button>
                <button
                  onClick={saveBatchAttendance}
                  disabled={saving}
                  className="flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
                >
                  {saving ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Attendance
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {!selectedCourse ? 'Select a Course to Begin' : 'No Students Found'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {!selectedCourse 
                ? 'Please select a course from the dropdown above to view enrolled students and record attendance.' 
                : searchTerm 
                  ? 'No students match your search criteria. Try different keywords.' 
                  : 'There are no students enrolled in this course yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Absent Type Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
            <div className="fixed inset-0 bg-transparent bg-opacity-10 transition-opacity" onClick={handleReasonCancel}></div>
            
            <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 z-10">
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Mark Student as Absent
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Please select the type of absence and provide a reason
                  </p>
                </div>
              </div>
              
              <div className="space-y-5">
                {/* Absent Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Absence Type <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      absentType === 'excused' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-300 hover:border-orange-300'
                    }`}>
                      <input
                        type="radio"
                        name="absentType"
                        value="excused"
                        checked={absentType === 'excused'}
                        onChange={(e) => setAbsentType(e.target.value)}
                        className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <UserX className="h-5 w-5 text-orange-600 mr-2" />
                          <span className="font-medium text-gray-900">Absent Excused</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Valid reason (sick, emergency, etc.) - No money will be deducted
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      absentType === 'unexcused' 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-red-300'
                    }`}>
                      <input
                        type="radio"
                        name="absentType"
                        value="unexcused"
                        checked={absentType === 'unexcused'}
                        onChange={(e) => setAbsentType(e.target.value)}
                        className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-red-600 mr-2" />
                          <span className="font-medium text-gray-900">Absent Unexcused</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          No valid reason - Money will still be deducted
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Reason Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Absence <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    rows="3"
                    placeholder={absentType === 'excused' 
                      ? "e.g., Sick with flu, Family emergency, Doctor appointment..." 
                      : "e.g., Did not show up, No notification..."}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={handleReasonCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors shadow-md ${
                    absentType === 'excused'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  onClick={handleReasonSubmit}
                >
                  Mark Absent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Attendance Modal */}
      {showUpdateModal && updateAttendanceData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
            <div className="fixed inset-0 bg-transparent bg-opacity-10 transition-opacity" onClick={() => !saving && setShowUpdateModal(false)}></div>
            
            <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 z-10">
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Update Attendance
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {updateAttendanceData.studentName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Date: {new Date(updateAttendanceData.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                  <div className={`px-4 py-3 rounded-lg font-medium ${
                    updateAttendanceData.currentStatus === 'present'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {updateAttendanceData.currentStatus === 'present' ? (
                        <CheckCircle className="h-5 w-5 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 mr-2" />
                      )}
                      <span className="capitalize">
                        {updateAttendanceData.currentStatus === 'present' ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    New Status <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleUpdateStatusChange('present')}
                      disabled={saving}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                        updateAttendanceData.newStatus === 'present'
                          ? 'bg-green-100 text-green-700 border-green-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
                      } disabled:opacity-50`}
                    >
                      <span className="flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Present (Money deducted)
                      </span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatusChange('absent-excused')}
                      disabled={saving}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                        updateAttendanceData.newStatus === 'absent-excused'
                          ? 'bg-orange-100 text-orange-700 border-orange-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                      } disabled:opacity-50`}
                    >
                      <span className="flex items-center justify-center">
                        <UserX className="h-5 w-5 mr-2" />
                        Absent Excused (No charge)
                      </span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatusChange('absent-unexcused')}
                      disabled={saving}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                        updateAttendanceData.newStatus === 'absent-unexcused'
                          ? 'bg-red-100 text-red-700 border-red-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                      } disabled:opacity-50`}
                    >
                      <span className="flex items-center justify-center">
                        <XCircle className="h-5 w-5 mr-2" />
                        Absent Unexcused (Money deducted)
                      </span>
                    </button>
                  </div>
                </div>

                {updateAttendanceData.newStatus !== 'present' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <AlertCircle className="inline h-4 w-4 mr-1 text-red-600" />
                      Reason for Absence <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                      rows="3"
                      placeholder="Enter reason for absence..."
                      value={updateAttendanceData.newReason}
                      onChange={(e) => setUpdateAttendanceData(prev => ({
                        ...prev,
                        newReason: e.target.value
                      }))}
                      disabled={saving}
                    />
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setUpdateAttendanceData(null);
                    setError('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
                  onClick={submitUpdateAttendance}
                >
                  {saving ? (
                    <div className="flex items-center justify-center">
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Updating...
                    </div>
                  ) : (
                    'Update Attendance'
                  )}
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