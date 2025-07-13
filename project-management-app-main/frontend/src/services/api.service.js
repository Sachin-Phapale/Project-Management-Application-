import http from '../http-common';

// All API calls will use the configured http client with interceptors

// Project API calls
const projectService = {
  getAllProjects: () => {
    return http.get("/api/projects");
  },
  
  getUserProjects: () => {
    return http.get("/api/projects/user");
  },
  
  getProjectById: (id) => {
    return http.get(`/api/projects/${id}`);
  },
  
  createProject: (projectData) => {
    return http.post("/api/projects", projectData);
  },
  
  updateProject: (id, projectData) => {
    return http.put(`/api/projects/${id}`, projectData);
  },
  
  deleteProject: (id) => {
    return http.delete(`/api/projects/${id}`);
  },
  
  addMemberToProject: (projectId, userId) => {
    return http.post(`/api/projects/${projectId}/members/${userId}`);
  },
  
  removeMemberFromProject: (projectId, userId) => {
    return http.delete(`/api/projects/${projectId}/members/${userId}`);
  }
};

// Task API calls
const taskService = {
  getAllTasks: () => {
    return http.get("/api/tasks");
  },
  
  getTasksByProject: (projectId) => {
    return http.get(`/api/tasks/project/${projectId}`);
  },
  
  getAssignedTasks: () => {
    return http.get("/api/tasks/assigned");
  },
  
  getTaskById: (id) => {
    return http.get(`/api/tasks/${id}`);
  },
  
  createTask: (taskData) => {
    return http.post("/api/tasks", taskData);
  },
  
  updateTask: (id, taskData) => {
    return http.put(`/api/tasks/${id}`, taskData);
  },
  
  deleteTask: (id) => {
    return http.delete(`/api/tasks/${id}`);
  },
  
  updateTaskStatus: (id, status) => {
    return http.patch(`/api/tasks/${id}/status`, { status });
  },
  
  updateTaskProgress: (id, progress) => {
    return http.patch(`/api/tasks/${id}/progress`, { progress });
  },
  
  assignTask: (id, userId) => {
    return http.post(`/api/tasks/${id}/assign`, { userId });
  }
};

// User API calls
const userService = {
  getAllUsers: () => {
    return http.get("/api/users");
  },
  
  getUserById: (id) => {
    return http.get(`/api/users/${id}`);
  },
  
  getCurrentUser: () => {
    return http.get("/api/users/me");
  }
};

export { projectService, taskService, userService };
