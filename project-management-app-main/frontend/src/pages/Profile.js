import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge } from 'react-bootstrap';
import { userService, projectService, taskService } from '../services/api.service';
import AuthService from '../services/auth.service';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user details
      const userData = await userService.getCurrentUser();
      setUserProfile(userData.data);
      
      // Get user projects
      const projectsResponse = await projectService.getUserProjects();
      setProjects(projectsResponse.data);
      
      // Get assigned tasks
      const tasksResponse = await taskService.getAssignedTasks();
      setTasks(tasksResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!projects || !tasks) return { totalProjects: 0, totalTasks: 0, completedTasks: 0, overdueTasks: 0 };
    
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'DONE').length;
    const overdueTasks = tasks.filter(task => task.overdue).length;
    
    return {
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <h3>Loading profile...</h3>
        </div>
      </Container>
    );
  }

  const currentUser = AuthService.getCurrentUser();
  const stats = calculateStats();

  return (
    <Container>
      <h2 className="my-4">My Profile</h2>
      
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div className="mb-3">
                <div 
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '50%', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '2.5rem', 
                    margin: '0 auto' 
                  }}
                >
                  {userProfile?.fullName?.charAt(0) || userProfile?.username?.charAt(0) || '?'}
                </div>
              </div>
              <h4>{userProfile?.fullName}</h4>
              <p className="text-muted">@{userProfile?.username}</p>
              <p>{userProfile?.email}</p>
              <div>
                {currentUser?.roles?.map((role, index) => (
                  <Badge 
                    key={index} 
                    bg={role === 'ROLE_ADMIN' ? 'danger' : role === 'ROLE_MEMBER' ? 'info' : 'secondary'}
                    className="me-1"
                  >
                    {role.replace('ROLE_', '')}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>Activity Summary</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <h5>Projects</h5>
                  <p className="h2 text-primary">{stats.totalProjects}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <h5>Tasks</h5>
                  <p className="h2 text-success">{stats.totalTasks}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <h5>Completed Tasks</h5>
                  <p className="h2 text-info">{stats.completedTasks}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <h5>Overdue Tasks</h5>
                  <p className="h2 text-danger">{stats.overdueTasks}</p>
                </Col>
              </Row>
              
              <div className="mt-3">
                <h5>Task Completion Rate</h5>
                <div className="progress" style={{ height: '25px' }}>
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ width: `${stats.completionRate}%` }}
                    aria-valuenow={stats.completionRate} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {stats.completionRate}%
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>Account Information</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Username:</strong> {userProfile?.username}</p>
                  <p><strong>Full Name:</strong> {userProfile?.fullName}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Email:</strong> {userProfile?.email}</p>
                  <p><strong>Role:</strong> {currentUser?.roles?.join(', ').replace(/ROLE_/g, '')}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
