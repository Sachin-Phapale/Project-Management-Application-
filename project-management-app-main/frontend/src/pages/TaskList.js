import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { taskService } from '../services/api.service';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('assigned');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filter === 'assigned') {
        response = await taskService.getAssignedTasks();
      } else {
        response = await taskService.getAllTasks();
      }
      
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskService.updateTaskStatus(taskId, status);
      fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'TODO':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'primary';
      case 'REVIEW':
        return 'warning';
      case 'DONE':
        return 'success';
      case 'BLOCKED':
        return 'danger';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredTasks = tasks
    .filter(task => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower)) ||
          task.projectName.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(task => {
      // Apply status filter
      if (statusFilter !== 'all') {
        return task.status === statusFilter;
      }
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          return b.priority - a.priority;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'project':
          return a.projectName.localeCompare(b.projectName);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <h3>Loading tasks...</h3>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Tasks</h2>
        <div>
          <Button 
            variant={filter === 'assigned' ? 'primary' : 'outline-primary'} 
            className="me-2"
            onClick={() => setFilter('assigned')}
          >
            My Tasks
          </Button>
          <Button 
            variant={filter === 'all' ? 'primary' : 'outline-primary'}
            onClick={() => setFilter('all')}
          >
            All Tasks
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>Search</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>Status</InputGroup.Text>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                  <option value="BLOCKED">Blocked</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>Sort By</InputGroup.Text>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                  <option value="project">Project</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredTasks.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <p>No tasks found matching your criteria.</p>
          </Card.Body>
        </Card>
      ) : (
        filteredTasks.map(task => (
          <Card 
            key={task.id} 
            className={`mb-3 task-card priority-${task.priority} ${task.overdue ? 'border-danger' : ''}`}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5>{task.title}</h5>
                  <p>{task.description || 'No description provided.'}</p>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    <Badge bg={getStatusBadgeVariant(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Badge bg="secondary">
                      Priority: {task.priority}
                    </Badge>
                    {task.dueDate && (
                      <Badge bg={task.overdue ? 'danger' : 'info'}>
                        Due: {formatDate(task.dueDate)}
                      </Badge>
                    )}
                    <Badge bg="dark">
                      Project: <Link to={`/projects/${task.projectId}`} className="text-white">{task.projectName}</Link>
                    </Badge>
                    {task.assignee && (
                      <Badge bg="light" text="dark">
                        Assignee: {task.assignee.fullName}
                      </Badge>
                    )}
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ width: `${task.progressPercentage}%` }}
                      aria-valuenow={task.progressPercentage} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
                <div>
                  <Form.Select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="mb-2"
                    style={{ width: '150px' }}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                    <option value="BLOCKED">Blocked</option>
                  </Form.Select>
                  <Link to={`/projects/${task.projectId}`} className="btn btn-outline-primary btn-sm">
                    View Project
                  </Link>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default TaskList;
