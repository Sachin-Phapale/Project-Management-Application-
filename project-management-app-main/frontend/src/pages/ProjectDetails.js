import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Tab, Tabs, ListGroup } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { projectService, taskService, userService } from '../services/api.service';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchProjectData();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const projectResponse = await projectService.getProjectById(id);
      setProject(projectResponse.data);
      
      const tasksResponse = await taskService.getTasksByProject(id);
      setTasks(tasksResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching project data:", error);
      setLoading(false);
      navigate('/projects');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleShowTaskModal = (task = null) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCloseMemberModal = () => {
    setShowMemberModal(false);
  };

  const handleShowMemberModal = () => {
    setShowMemberModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        fetchProjectData();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await projectService.addMemberToProject(id, userId);
      fetchProjectData();
      handleCloseMemberModal();
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member from the project?')) {
      try {
        await projectService.removeMemberFromProject(id, userId);
        fetchProjectData();
      } catch (error) {
        console.error("Error removing member:", error);
      }
    }
  };

  const taskInitialValues = {
    title: '',
    description: '',
    status: 'TODO',
    priority: 3,
    dueDate: '',
    assigneeId: '',
    projectId: id,
    progressPercentage: 0
  };

  const taskValidationSchema = Yup.object().shape({
    title: Yup.string().required('Task title is required'),
    description: Yup.string(),
    status: Yup.string().required('Status is required'),
    priority: Yup.number().required('Priority is required').min(1).max(5),
    dueDate: Yup.date(),
    assigneeId: Yup.string(),
    progressPercentage: Yup.number().min(0).max(100)
  });

  const handleTaskSubmit = async (values) => {
    try {
      const taskData = {
        ...values,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        assigneeId: values.assigneeId || null
      };

      if (editingTask) {
        await taskService.updateTask(editingTask.id, taskData);
      } else {
        await taskService.createTask(taskData);
      }

      handleCloseTaskModal();
      fetchProjectData();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'NOT_STARTED':
      case 'TODO':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'primary';
      case 'ON_HOLD':
      case 'REVIEW':
        return 'warning';
      case 'COMPLETED':
      case 'DONE':
        return 'success';
      case 'CANCELLED':
      case 'BLOCKED':
        return 'danger';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getNonMembers = () => {
    if (!project || !users) return [];
    
    const memberIds = new Set([
      project.owner.id,
      ...project.members.map(member => member.id)
    ]);
    
    return users.filter(user => !memberIds.has(user.id));
  };

  const filterTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <h3>Loading project...</h3>
        </div>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container>
        <div className="text-center mt-5">
          <h3>Project not found</h3>
          <Button variant="primary" onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>{project.name}</h2>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2" 
            onClick={() => navigate('/projects')}
          >
            Back to Projects
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleShowTaskModal()}
          >
            Add Task
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <Badge bg={getStatusBadgeVariant(project.status)} className="me-2">
                {project.status.replace('_', ' ')}
              </Badge>
              Project Details
            </Card.Header>
            <Card.Body>
              <p>{project.description || 'No description provided.'}</p>
              <Row>
                <Col md={6}>
                  <p><strong>Start Date:</strong> {formatDate(project.startDate)}</p>
                  <p><strong>Due Date:</strong> {formatDate(project.dueDate)}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Owner:</strong> {project.owner.fullName}</p>
                  <p><strong>Created:</strong> {formatDate(project.createdAt)}</p>
                </Col>
              </Row>
              <div>
                <div className="d-flex justify-content-between">
                  <strong>Progress:</strong>
                  <span>
                    {project.totalTasks > 0 
                      ? `${Math.round((project.completedTasks / project.totalTasks) * 100)}%` 
                      : '0%'}
                  </span>
                </div>
                <div className="progress mt-1">
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ 
                      width: `${project.totalTasks > 0 
                        ? Math.round((project.completedTasks / project.totalTasks) * 100) 
                        : 0}%` 
                    }}
                    aria-valuenow={project.totalTasks > 0 
                      ? Math.round((project.completedTasks / project.totalTasks) * 100) 
                      : 0} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Team Members</span>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={handleShowMemberModal}
              >
                Add Member
              </Button>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{project.owner.fullName}</strong> (Owner)
                </div>
              </ListGroup.Item>
              {project.members.map(member => (
                <ListGroup.Item 
                  key={member.id} 
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>{member.fullName}</div>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Remove
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header>
          <h4>Tasks</h4>
        </Card.Header>
        <Card.Body>
          <Tabs defaultActiveKey="all" className="mb-3">
            <Tab eventKey="all" title={`All (${tasks.length})`}>
              {renderTaskList(tasks)}
            </Tab>
            <Tab eventKey="todo" title={`To Do (${filterTasksByStatus('TODO').length})`}>
              {renderTaskList(filterTasksByStatus('TODO'))}
            </Tab>
            <Tab eventKey="inProgress" title={`In Progress (${filterTasksByStatus('IN_PROGRESS').length})`}>
              {renderTaskList(filterTasksByStatus('IN_PROGRESS'))}
            </Tab>
            <Tab eventKey="review" title={`Review (${filterTasksByStatus('REVIEW').length})`}>
              {renderTaskList(filterTasksByStatus('REVIEW'))}
            </Tab>
            <Tab eventKey="done" title={`Done (${filterTasksByStatus('DONE').length})`}>
              {renderTaskList(filterTasksByStatus('DONE'))}
            </Tab>
            <Tab eventKey="blocked" title={`Blocked (${filterTasksByStatus('BLOCKED').length})`}>
              {renderTaskList(filterTasksByStatus('BLOCKED'))}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Task Form Modal */}
      <Modal show={showTaskModal} onHide={handleCloseTaskModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={editingTask || taskInitialValues}
          validationSchema={taskValidationSchema}
          onSubmit={handleTaskSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Task Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.title && errors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={values.description || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={values.status}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.status && errors.status}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="DONE">Done</option>
                        <option value="BLOCKED">Blocked</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.status}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Priority (1-5)</Form.Label>
                      <Form.Select
                        name="priority"
                        value={values.priority}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.priority && errors.priority}
                      >
                        <option value="1">1 - Low</option>
                        <option value="2">2</option>
                        <option value="3">3 - Medium</option>
                        <option value="4">4</option>
                        <option value="5">5 - High</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.priority}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={values.dueDate ? new Date(values.dueDate).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.dueDate && errors.dueDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.dueDate}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Assignee</Form.Label>
                  <Form.Select
                    name="assigneeId"
                    value={values.assigneeId || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="">Select Assignee</option>
                    <option value={project.owner.id}>{project.owner.fullName} (Owner)</option>
                    {project.members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.fullName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Progress ({values.progressPercentage}%)</Form.Label>
                  <Form.Range
                    name="progressPercentage"
                    value={values.progressPercentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="5"
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseTaskModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingTask ? 'Update' : 'Create'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Add Member Modal */}
      <Modal show={showMemberModal} onHide={handleCloseMemberModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Team Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {getNonMembers().length === 0 ? (
              <p>No users available to add as members.</p>
            ) : (
              getNonMembers().map(user => (
                <ListGroup.Item 
                  key={user.id} 
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>{user.fullName} ({user.username})</div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => handleAddMember(user.id)}
                  >
                    Add
                  </Button>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMemberModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );

  function renderTaskList(taskList) {
    if (taskList.length === 0) {
      return <p>No tasks found.</p>;
    }

    return (
      <ListGroup>
        {taskList.map(task => (
          <ListGroup.Item 
            key={task.id} 
            className={`task-card priority-${task.priority} ${task.overdue ? 'border-danger' : ''}`}
          >
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
                  {task.assignee && (
                    <Badge bg="dark">
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
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2" 
                  onClick={() => handleShowTaskModal(task)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  }
};

export default ProjectDetails;
