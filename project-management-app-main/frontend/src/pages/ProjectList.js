import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { projectService } from '../services/api.service';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getUserProjects();
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleShowModal = (project = null) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(projectId);
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const initialValues = {
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'NOT_STARTED'
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Project name is required'),
    description: Yup.string(),
    startDate: Yup.date().required('Start date is required'),
    dueDate: Yup.date().min(
      Yup.ref('startDate'),
      'Due date must be after start date'
    ),
    status: Yup.string().required('Status is required')
  });

  const handleSubmit = async (values) => {
    try {
      const projectData = {
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null
      };

      if (editingProject) {
        await projectService.updateProject(editingProject.id, projectData);
      } else {
        await projectService.createProject(projectData);
      }

      handleCloseModal();
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'primary';
      case 'ON_HOLD':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <h3>Loading projects...</h3>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>My Projects</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          Create New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <p>You don't have any projects yet. Create your first project to get started!</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {projects.map(project => (
            <Col md={6} lg={4} key={project.id} className="mb-4">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <Badge bg={getStatusBadgeVariant(project.status)}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2" 
                      onClick={() => handleShowModal(project)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Card.Title>
                    <Link to={`/projects/${project.id}`}>{project.name}</Link>
                  </Card.Title>
                  <Card.Text>
                    {project.description && project.description.length > 100
                      ? `${project.description.substring(0, 100)}...`
                      : project.description || 'No description provided.'}
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">
                      Start: {formatDate(project.startDate)}
                    </small>
                    <small className="text-muted">
                      Due: {formatDate(project.dueDate)}
                    </small>
                  </div>
                  <div className="mt-2">
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">
                        Progress:
                      </small>
                      <small className="text-muted">
                        {project.totalTasks > 0 
                          ? `${Math.round((project.completedTasks / project.totalTasks) * 100)}%` 
                          : '0%'}
                      </small>
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
                <Card.Footer className="text-muted">
                  <small>
                    Tasks: {project.completedTasks}/{project.totalTasks}
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Project Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProject ? 'Edit Project' : 'Create New Project'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={editingProject || initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.name && errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
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
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={values.startDate ? new Date(values.startDate).toISOString().split('T')[0] : ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.startDate && errors.startDate}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.startDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col>
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
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.status && errors.status}
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.status}
                  </Form.Control.Feedback>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingProject ? 'Update' : 'Create'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </Container>
  );
};

export default ProjectList;
