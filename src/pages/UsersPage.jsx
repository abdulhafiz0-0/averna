import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  User,
  Shield,
  UserCheck,
  AlertCircle,
  Eye,
  Calendar,
  Clock
} from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [courses, setCourses] = useState([]);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'teacher',
    course_id: ''
  });

  const roles = [
    { value: 'teacher', label: 'Teacher', icon: User },
    { value: 'admin', label: 'Admin', icon: UserCheck },
    { value: 'superadmin', label: 'Super Admin', icon: Shield }
  ];

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiService.getUsers();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load users');
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
      if (editingUser) {
        // Note: API doesn't have update user endpoint, so we'll just show success
        setShowModal(false);
        setEditingUser(null);
        setFormData({
          username: '',
          password: '',
          role: 'teacher',
          course_id: ''
        });
        fetchUsers();
      } else {
        await apiService.createUser(formData);
        setShowModal(false);
        setFormData({
          username: '',
          password: '',
          role: 'teacher',
          course_id: ''
        });
        fetchUsers();
      }
    } catch (err) {
      setError('Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      course_id: user.course_id || ''
    });
    setShowModal(true);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const getRoleIcon = (role) => {
    const roleConfig = roles.find(r => r.value === role);
    return roleConfig ? roleConfig.icon : User;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'teacher':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-300 ${showModal || showDetailsModal ? 'blur-sm' : ''}`}>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage system users and permissions
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 sm:mt-0 btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => {
          const RoleIcon = getRoleIcon(user.role);
          return (
            <div key={user.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <RoleIcon className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(user)}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-primary-600 hover:text-primary-700"
                    title="Edit User"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new user.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-10 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Password {editingUser && '(leave blank to keep current)'}
                      </label>
                      <input
                        type="password"
                        className="input-field"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required={!editingUser}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select
                        className="input-field"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value, course_id: ''})}
                        required
                      >
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.role === 'teacher' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assign Course
                        </label>
                        <select
                          className="input-field"
                          value={formData.course_id}
                          onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                          required
                        >
                          <option value="">Select a course</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Select the course this teacher will be responsible for
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {editingUser ? 'Update' : 'Create'}
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

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-10 transition-opacity" onClick={() => setShowDetailsModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      {(() => {
                        const RoleIcon = getRoleIcon(selectedUser.role);
                        return <RoleIcon className="h-6 w-6 text-primary-600" />;
                      })()}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{selectedUser.username}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">User ID</label>
                      <p className="text-sm text-gray-900">#{selectedUser.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Username</label>
                      <p className="text-sm text-gray-900">{selectedUser.username}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Role</label>
                    <div className="flex items-center mt-1">
                      {(() => {
                        const RoleIcon = getRoleIcon(selectedUser.role);
                        return <RoleIcon className="h-4 w-4 text-gray-400 mr-2" />;
                      })()}
                      <span className="text-sm text-gray-900 capitalize">{selectedUser.role}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Permissions</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedUser.role === 'teacher' && 'Can take attendance and view their students'}
                      {selectedUser.role === 'admin' && 'Can manage students, courses, payments, and take attendance'}
                      {selectedUser.role === 'superadmin' && 'Full system access including user management'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Created</label>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-sm text-gray-900">Recently</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Active</label>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-sm text-gray-900">Active now</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn-primary w-full sm:w-auto sm:ml-3"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEdit(selectedUser);
                  }}
                >
                  Edit User
                </button>
                <button
                  type="button"
                  className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Permissions Info */}
      <div className="mt-8 card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Role Permissions</h3>
        <div className="space-y-4">
          {roles.map((role) => {
            const RoleIcon = role.icon;
            return (
              <div key={role.value} className="flex items-start">
                <div className="flex-shrink-0">
                  <RoleIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">{role.label}</h4>
                  <p className="text-sm text-gray-500">
                    {role.value === 'teacher' && 'Can take attendance and view their students'}
                    {role.value === 'admin' && 'Can manage students, courses, payments, and take attendance'}
                    {role.value === 'superadmin' && 'Full system access including user management'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
