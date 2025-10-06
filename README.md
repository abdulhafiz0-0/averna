# Center Management Mobile App

A mobile-first web application for managing educational centers, built with React, Tailwind CSS, and optimized for Telegram Mini Apps.

## Features

### Role-Based Access Control

- **Teachers**: Can take attendance for their students
- **Admins**: Can manage students, courses, payments, and take attendance
- **Super Admins**: Full system access including user management

### Core Functionality

- **Student Management**: CRUD operations for student records
- **Course Management**: Create and manage courses with scheduling
- **Payment Tracking**: Record and monitor student payments
- **Attendance System**: Mark student attendance with date tracking
- **User Management**: Create and manage system users (Super Admin only)
- **Dashboard**: Role-based overview with statistics

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Mobile Optimization**: Custom utilities for Telegram Mini Apps

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd center-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## API Integration

The app connects to a backend API with the following base URL:
```
http://192.168.1.5:8001
```

### Authentication
- Uses JWT tokens for authentication
- Tokens are stored in localStorage
- Automatic token refresh and logout on expiration

### API Endpoints Used
- `POST /auth/login` - User authentication
- `GET /users/me` - Get current user info
- `GET /students/` - Get all students
- `POST /students/` - Create student
- `PUT /students/{id}` - Update student
- `DELETE /students/{id}` - Delete student
- `GET /courses/` - Get all courses
- `POST /courses/` - Create course
- `PUT /courses/{id}` - Update course
- `DELETE /courses/{id}` - Delete course
- `POST /attendance/` - Record attendance
- `GET /payments/` - Get all payments
- `POST /payments/` - Create payment
- `GET /stats/overview` - Get system statistics
- `GET /users/` - Get all users (Super Admin only)
- `POST /users/` - Create user (Super Admin only)

## Mobile Optimization

### Telegram Mini App Support
- Automatic Telegram WebApp integration
- Mobile viewport height fixes
- Touch-friendly button sizes (44px minimum)
- Responsive design for all screen sizes

### Mobile-First Design
- Optimized for mobile devices
- Touch-friendly interface
- Responsive navigation
- Mobile-optimized modals and forms

## Project Structure

```
src/
├── components/
│   └── Layout.jsx          # Main layout with navigation
├── contexts/
│   └── AuthContext.jsx     # Authentication context
├── pages/
│   ├── LoginPage.jsx       # Login page
│   ├── Dashboard.jsx       # Role-based dashboard
│   ├── StudentsPage.jsx   # Student management
│   ├── CoursesPage.jsx    # Course management
│   ├── PaymentsPage.jsx   # Payment tracking
│   ├── AttendancePage.jsx # Attendance management
│   └── UsersPage.jsx      # User management (Super Admin)
├── services/
│   └── api.ts             # API service layer
├── utils/
│   └── mobileOptimizations.js # Mobile utilities
├── App.jsx                # Main app component
└── index.css             # Global styles with Tailwind
```

## Usage

### For Teachers
1. Login with teacher credentials
2. Navigate to Attendance page
3. Select date and course
4. Mark students as present/absent

### For Admins
1. Login with admin credentials
2. Access all management features:
   - Students: Add, edit, delete students
   - Courses: Manage course information
   - Payments: Record and track payments
   - Attendance: Take attendance for any student

### For Super Admins
1. Login with super admin credentials
2. Access all admin features plus:
   - Users: Create and manage system users
   - Full system statistics and overview

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables
Create a `.env` file in the root directory:
```
VITE_API_BASE_URL=http://192.168.1.5:8001
```

## Deployment

### For Telegram Mini App
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure the Telegram Bot with your web app URL
4. Set up the web app in Telegram Bot settings

### For Regular Web App
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your web server
3. Ensure the API backend is accessible

## Security Considerations

- JWT tokens are stored in localStorage
- All API requests include authentication headers
- Automatic logout on token expiration
- Input validation on all forms
- Role-based access control

## Browser Support

- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Telegram WebApp environment
- Responsive design for all screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.