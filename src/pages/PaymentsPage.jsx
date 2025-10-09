import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { formatMoneyWithSom } from '../utils/formatMoney';
import { 
  Plus, 
  Search, 
  CreditCard,
  Calendar,
  DollarSign,
  User,
  Edit,
  Trash2
} from 'lucide-react';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    student_id: '',
    money: '',
    date: new Date().toISOString().split('T')[0],
    course_id: '',
    description: ''
  });


  useEffect(() => {
    fetchPayments();
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await apiService.getPayments();
      setPayments(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load payments');
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
      const paymentData = {
        ...formData,
        student_id: parseInt(formData.student_id),
        course_id: parseInt(formData.course_id),
        money: parseFloat(formData.money)
      };

      if (editingPayment) {
        await apiService.updatePayment(editingPayment.id, paymentData);
      } else {
        await apiService.createPayment(paymentData);
      }

      setShowModal(false);
      setEditingPayment(null);
      setSelectedCourse('');
      setFormData({
        student_id: '',
        money: '',
        date: new Date().toISOString().split('T')[0],
        course_id: '',
        description: ''
      });
      fetchPayments();
    } catch (err) {
      setError('Failed to save payment');
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.name} ${student.surname}` : 'Unknown Student';
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown Course';
  };

  const getStudentCourses = (studentId) => {
    const student = students.find(s => s.id === parseInt(studentId));
    if (!student || !student.courses) return [];
    
    return courses.filter(course => 
      student.courses.includes(course.id)
    );
  };

  const getStudentsByCourse = (courseId) => {
    if (!courseId) return students;
    
    return students.filter(student => 
      student.courses.includes(parseInt(courseId))
    );
  };


  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setSelectedCourse(payment.course_id.toString());
    setFormData({
      student_id: payment.student_id.toString(),
      money: payment.money.toString(),
      date: payment.date,
      course_id: payment.course_id.toString(),
      description: payment.description
    });
    setShowModal(true);
  };

  const handleDelete = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (paymentToDelete) {
      try {
        await apiService.deletePayment(paymentToDelete.id);
        fetchPayments();
        setShowDeleteModal(false);
        setPaymentToDelete(null);
      } catch (err) {
        setError('Failed to delete payment');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPaymentToDelete(null);
  };

  const filteredPayments = payments.filter(payment => {
    const studentName = getStudentName(payment.student_id);
    const courseName = getCourseName(payment.course_id);
    return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           courseName.toLowerCase().includes(searchTerm.toLowerCase());
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
      <div className={`transition-all duration-300 ${showModal ? 'blur-sm' : ''}`}>
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage payment records and transactions
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 sm:mt-0 btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>


        {/* Payments List */}
        <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <div key={payment.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getStudentName(payment.student_id)}
                  </h3>
                  <p className="text-sm text-gray-500">{getCourseName(payment.course_id)}</p>
                  {payment.description && (
                    <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{formatMoneyWithSom(payment.money)}</p>
                  <p className="text-sm text-gray-500">Payment #{payment.id}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(payment)}
                    className="text-gray-400 hover:text-blue-600"
                    title="Edit Payment"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(payment)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete Payment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(payment.date).toLocaleDateString()}
            </div>
          </div>
        ))}
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by recording a new payment.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-transparent bg-opacity-10 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingPayment ? 'Edit Payment' : 'Record New Payment'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                        Course <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={`input-field ${!formData.course_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-green-300 focus:border-green-500 focus:ring-green-500'}`}
                        value={formData.course_id}
                        onChange={(e) => setFormData({...formData, course_id: e.target.value, student_id: ''})}
                        required
                      >
                        <option value="">Select a course</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                      <p className={`text-xs mt-1 ${!formData.course_id ? 'text-red-500' : 'text-green-600'}`}>
                        {!formData.course_id ? 'Please select a course first' : 'Course selected - students will be shown below'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Student <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={`input-field ${!formData.student_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-green-300 focus:border-green-500 focus:ring-green-500'}`}
                        value={formData.student_id}
                        onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                        required
                        disabled={!formData.course_id}
                      >
                        <option value="">
                          {formData.course_id ? 'Select a student' : 'Select a course first'}
                        </option>
                        {getStudentsByCourse(formData.course_id).map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name} {student.surname}
                          </option>
                        ))}
                      </select>
                      {formData.course_id && getStudentsByCourse(formData.course_id).length === 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          No students are enrolled in this course
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.money}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers, decimal point, and empty string
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setFormData({...formData, money: value});
                          }
                        }}
                        placeholder="Enter payment amount"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                      <input
                        type="date"
                        className="input-field"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        className="input-field"
                        rows="3"
                        placeholder="Enter payment description (optional)"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {editingPayment ? 'Update Payment' : 'Record Payment'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                    onClick={() => setShowModal(false)}
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
      {showDeleteModal && paymentToDelete && (
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
                      Delete Payment
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete payment #{paymentToDelete.id} for <strong>{getStudentName(paymentToDelete.student_id)}</strong>? This action cannot be undone.
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
    </>
  );
};

export default PaymentsPage;
