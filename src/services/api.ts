import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface User {
  id: number;
  username: string;
  role: 'teacher' | 'admin' | 'superadmin';
}

export interface Student {
  id: number;
  name: string;
  surname: string;
  second_name: string;
  starting_date: string;
  num_lesson: number;
  total_money: number;
  courses: number[];
  attendance: AttendanceRecord[];
}

export interface Course {
  id: number;
  name: string;
  week_days: string[];
  lesson_per_month: number;
  cost: number;
}

export interface AttendanceRecord {
  date: string;
  course_id: number;
  isAbsent: boolean;
  reason: string;
  charge_money?: boolean;
}

export interface Payment {
  id: number;
  student_id: number;
  course_id: number;
  money: number;
  date: string;
  description: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  username: string;
  role: string;
}

export interface StatsOverview {
  total_money: number;
  monthly_money: number;
  unpaid: number;
  monthly_unpaid: number;
  total_students: number;
}

// Event emitter for auth errors
export const authEventEmitter = {
  listeners: new Set<() => void>(),
  
  on(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  
  emit() {
    this.listeners.forEach(callback => callback());
  }
};

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'https://avernalc-production.up.railway.app/';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          // Emit event instead of direct navigation
          authEventEmitter.emit();
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(username: string, password: string): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', {
      username,
      password,
    });
    
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
  }

  // Users Management (Superadmin only)
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get('/users/');
    return response.data;
  }

  async createUser(userData: { username: string; password: string; role: string; course_ids?: number[] }): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/users/', userData);
    return response.data;
  }

  async updateUser(id: number, userData: { username: string; password?: string; role: string; course_ids?: number[] }): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // Students Management
  async getStudents(): Promise<Student[]> {
    const response: AxiosResponse<Student[]> = await this.api.get('/students/');
    return response.data;
  }

  async getArchivedStudents(skip: number = 0, limit: number = 1000): Promise<Student[]> {
    const response: AxiosResponse<Student[]> = await this.api.get('/students/archived/', {
      params: { skip, limit }
    });
    return response.data;
  }

  async getStudent(id: number): Promise<Student> {
    const response: AxiosResponse<Student> = await this.api.get(`/students/${id}`);
    return response.data;
  }

  async createStudent(studentData: Omit<Student, 'id' | 'attendance'>): Promise<Student> {
    const response: AxiosResponse<Student> = await this.api.post('/students/', studentData);
    return response.data;
  }

  async updateStudent(id: number, studentData: Omit<Student, 'id' | 'attendance'>): Promise<Student> {
    const response: AxiosResponse<Student> = await this.api.put(`/students/${id}`, studentData);
    return response.data;
  }

  async deleteStudent(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/students/${id}`);
    return response.data;
  }

  // Courses Management
  async getCourses(): Promise<Course[]> {
    const response: AxiosResponse<Course[]> = await this.api.get('/courses/');
    return response.data;
  }

  async getCourse(id: number): Promise<Course> {
    const response: AxiosResponse<Course> = await this.api.get(`/courses/${id}`);
    return response.data;
  }

  async createCourse(courseData: Omit<Course, 'id'>): Promise<Course> {
    const response: AxiosResponse<Course> = await this.api.post('/courses/', courseData);
    return response.data;
  }

  async updateCourse(id: number, courseData: Omit<Course, 'id'>): Promise<Course> {
    const response: AxiosResponse<Course> = await this.api.put(`/courses/${id}`, courseData);
    return response.data;
  }

  async deleteCourse(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/courses/${id}`);
    return response.data;
  }

  // Attendance Management
  /**
   * Record attendance for a student
   * 
   * Attendance options:
   * - Present (isAbsent=false, charge_money=true): Student attended, money is deducted
   * - Absent Excused (isAbsent=true, charge_money=false): Student absent with valid reason, no money deducted
   * - Absent Unexcused (isAbsent=true, charge_money=true): Student absent, money is still deducted
   */
  async recordAttendance(data: {
    student_id: number;
    course_id: number;
    date: string;
    isAbsent: boolean;
    reason: string;
    charge_money: boolean;
  }): Promise<{ message: string; student_id: number; date: string; isAbsent: boolean }> {
    const response = await this.api.post('/attendance/check', data);
    return response.data;
  }

  /**
   * Update attendance for a student
   * 
   * Attendance options:
   * - Present (isAbsent=false, charge_money=true): Student attended, money is deducted
   * - Absent Excused (isAbsent=true, charge_money=false): Student absent with valid reason, no money deducted
   * - Absent Unexcused (isAbsent=true, charge_money=true): Student absent, money is still deducted
   */
 async updateAttendance(studentId: number, data: {
    date: string;
    course_id: number;
    isAbsent: boolean;
    reason: string;
    charge_money: boolean;
  }): Promise<{ message: string }> {
    // Date and course_id are query parameters, not in the body
    const response = await this.api.put(
      `/attendance/student/${studentId}?date=${data.date}&course_id=${data.course_id}`,
      {
        date: data.date,
        course_id: data.course_id,
        isAbsent: data.isAbsent,
        reason: data.reason,
        charge_money: data.charge_money
      }
    );
    return response.data;
  }

  async getStudentAttendance(studentId: number): Promise<{
    student_id: number;
    student_name: string;
    attendance: AttendanceRecord[];
  }> {
    const response = await this.api.get(`/attendance/${studentId}`);
    return response.data;
  }

  // Payments Management
  async getPayments(): Promise<Payment[]> {
    const response: AxiosResponse<Payment[]> = await this.api.get('/payments/');
    return response.data;
  }

  async createPayment(paymentData: Omit<Payment, 'id'>): Promise<Payment> {
    const response: AxiosResponse<Payment> = await this.api.post('/payments/', paymentData);
    return response.data;
  }

  async updatePayment(id: number, paymentData: Omit<Payment, 'id'>): Promise<Payment> {
    const response: AxiosResponse<Payment> = await this.api.put(`/payments/${id}`, paymentData);
    return response.data;
  }

  async deletePayment(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/payments/${id}`);
    return response.data;
  }

  // Statistics
  async getStats(): Promise<StatsOverview> {
    const response: AxiosResponse<StatsOverview> = await this.api.get('/stats/');
    return response.data;
  }

  async getStatsByCourse(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/stats/by-course');
    return response.data;
  }

  async getMonthlyStats(year: number): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/stats/monthly/${year}`);
    return response.data;
  }
}

export const apiService = new ApiService();