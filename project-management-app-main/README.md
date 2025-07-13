# Project Management Application

A full-stack project management application built with Spring Boot and React.

## Features

- User Authentication (Register, Login, JWT)
- Project CRUD operations
- Task CRUD operations inside projects
- Role-based access (Admin, Member)
- Dashboard overview with statistics
- Due dates and progress tracking

## Tech Stack

### Backend
- Spring Boot 3.2.0
- Spring Security with JWT
- Spring Data JPA
- Hibernate
- MySQL Database

### Frontend
- React
- React Router
- Bootstrap
- Axios
- Formik & Yup
- Chart.js

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Node.js and npm
- MySQL Server

### Database Setup
1. Create a MySQL database named `project_management_db` or update the database name in `application.properties`
2. Update the database username and password in `application.properties`

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd project-management-app/backend
   ```

2. Build the project using Maven:
   ```
   mvn clean install
   ```

3. Run the Spring Boot application:
   ```
   mvn spring-boot:run
   ```
   
   The backend server will start on http://localhost:8080

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd project-management-app/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```
   
   The frontend application will start on http://localhost:3000

## API Endpoints

### Authentication
- POST `/api/auth/signin` - Login
- POST `/api/auth/signup` - Register

### Projects
- GET `/api/projects` - Get all projects
- GET `/api/projects/user` - Get user's projects
- GET `/api/projects/{id}` - Get project by ID
- POST `/api/projects` - Create a new project
- PUT `/api/projects/{id}` - Update a project
- DELETE `/api/projects/{id}` - Delete a project
- POST `/api/projects/{projectId}/members/{userId}` - Add member to project
- DELETE `/api/projects/{projectId}/members/{userId}` - Remove member from project

### Tasks
- GET `/api/tasks` - Get all tasks
- GET `/api/tasks/project/{projectId}` - Get tasks by project
- GET `/api/tasks/assigned` - Get tasks assigned to current user
- GET `/api/tasks/{id}` - Get task by ID
- POST `/api/tasks` - Create a new task
- PUT `/api/tasks/{id}` - Update a task
- DELETE `/api/tasks/{id}` - Delete a task
- PATCH `/api/tasks/{id}/status` - Update task status
- PATCH `/api/tasks/{id}/progress` - Update task progress
- PATCH `/api/tasks/{id}/assign/{userId}` - Assign task to user

### Users
- GET `/api/users` - Get all users
- GET `/api/users/{id}` - Get user by ID
- GET `/api/users/me` - Get current user

## Security

The application uses JWT (JSON Web Token) for authentication. When a user logs in, a JWT token is generated and returned to the client. This token must be included in the Authorization header for subsequent API requests.

## License

This project is licensed under the MIT License.
