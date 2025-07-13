import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { projectService, taskService } from '../services/api.service';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    overdueTasks: 0,
    completedTasks: 0
  });
  const [projectStatusData, setProjectStatusData] = useState({
    labels: [],
    datasets: []
  });
  const [taskStatusData, setTaskStatusData] = useState({
    labels: [],
    datasets: []
  });

   
   const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status
      .toString()
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user projects
        const projectResponse = await projectService.getUserProjects();
        const projectData = projectResponse.data;
        setProjects(projectData);
        
        // Fetch assigned tasks
        const taskResponse = await taskService.getAssignedTasks();
        const taskData = taskResponse.data;
        setTasks(taskData);
        
        // Calculate stats
       // Calculate stats
const overdueTasks = taskData.filter(task => {
  // Check both possible formats for overdue status
  const isOverdue = task.isOverdue || task.overdue;
  return isOverdue === true;
}).length;

const completedTasks = taskData.filter(task => {
  // Handle both string and enum status values
  const status = task.status || '';
  return status.toString() === 'DONE' || status.toString() === 'DONE';
}).length;

setStats({
  totalProjects: projectData.length,
  totalTasks: taskData.length,
  overdueTasks,
  completedTasks
});
        
        // Prepare project status chart data
        const projectStatusCounts = {
          'NOT_STARTED': 0,
          'IN_PROGRESS': 0,
          'ON_HOLD': 0,
          'COMPLETED': 0,
          'CANCELLED': 0
        };
        
        projectData.forEach(project => {
          projectStatusCounts[project.status]++;
        });
        
        setProjectStatusData({
          labels: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
          datasets: [
            {
              label: 'Project Status',
              data: [
                projectStatusCounts.NOT_STARTED,
                projectStatusCounts.IN_PROGRESS,
                projectStatusCounts.ON_HOLD,
                projectStatusCounts.COMPLETED,
                projectStatusCounts.CANCELLED
              ],
              backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 99, 132, 0.6)'
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)'
              ],
              borderWidth: 1
            }
          ]
        });
        
        // Prepare task status chart data
        const taskStatusCounts = {
          'TODO': 0,
          'IN_PROGRESS': 0,
          'REVIEW': 0,
          'DONE': 0,
          'BLOCKED': 0
        };
        
        taskData.forEach(task => {
          taskStatusCounts[task.status]++;
        });
        
        setTaskStatusData({
          labels: ['To Do', 'In Progress', 'Review', 'Done', 'Blocked'],
          datasets: [
            {
              label: 'Task Status',
              data: [
                taskStatusCounts.TODO,
                taskStatusCounts.IN_PROGRESS,
                taskStatusCounts.REVIEW,
                taskStatusCounts.DONE,
                taskStatusCounts.BLOCKED
              ],
              backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 99, 132, 0.6)'
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)'
              ],
              borderWidth: 1
            }
          ]
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // You might want to show an error toast/message to the user here
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const renderRecentProjects = () => {
    const recentProjects = [...projects].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 5);
    
    if (recentProjects.length === 0) {
      return <p>No projects found.</p>;
    }
    
    return recentProjects.map(project => (
      <Card key={project.id} className="mb-2">
        <Card.Body>
          <Card.Title>
            <Link to={`/projects/${project.id}`}>{project.name}</Link>
          </Card.Title>
          <Card.Text>
            <small className="text-muted">
              Status: {project.status.replace('_', ' ')}
            </small>
            <br />
            <small className="text-muted">
              Tasks: {project.completedTasks}/{project.totalTasks}
            </small>
          </Card.Text>
        </Card.Body>
      </Card>
    ));
  };

  const renderUpcomingTasks = () => {
    const upcomingTasks = [...tasks]
      .filter(task => task.status !== 'DONE')
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      })
      .slice(0, 5);
    
    if (upcomingTasks.length === 0) {
      return <p>No upcoming tasks found.</p>;
    }
    
    return upcomingTasks.map(task => (
      <Card 
        key={task.id} 
        className={`mb-2 task-card priority-${task.priority} status-${task.status.toLowerCase()}`}
      >
        <Card.Body>
          <Card.Title>
            <Link to={`/projects/${task.projectId}`}>{task.title}</Link>
          </Card.Title>
          <Card.Text>
            <small className={`text-${task.overdue ? 'danger' : 'muted'}`}>
              {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
            </small>
            <br />
            <small className="text-muted">
  Status: {formatStatus(task.status)}
  {task.isOverdue && <span className="text-danger ms-2">(Overdue)</span>}
</small>
            <br />
            
          </Card.Text>
        </Card.Body>
      </Card>
    ));
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <h3>Loading dashboard...</h3>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="my-4">Dashboard</h2>
      
      <div className="dashboard-stats">
        <div className="stat-card projects">
          <h3>Projects</h3>
          <p>{stats.totalProjects}</p>
        </div>
        <div className="stat-card tasks">
          <h3>Tasks</h3>
          <p>{stats.totalTasks}</p>
        </div>
        <div className="stat-card overdue">
          <h3>Overdue</h3>
          <p>{stats.overdueTasks}</p>
        </div>
        <div className="stat-card completed">
          <h3>Completed</h3>
          <p>{stats.completedTasks}</p>
        </div>
      </div>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>Project Status</Card.Header>
            <Card.Body>
              <div style={{ height: '250px' }}>
                <Pie 
                  data={projectStatusData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right'
                      }
                    }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>Task Status</Card.Header>
            <Card.Body>
              <div style={{ height: '250px' }}>
                <Bar 
                  data={taskStatusData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>Recent Projects</Card.Header>
            <Card.Body>
              {renderRecentProjects()}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>Upcoming Tasks</Card.Header>
            <Card.Body>
              {renderUpcomingTasks()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
